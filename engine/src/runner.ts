import type { WorkflowContext, StepState } from './context';
import type { StepDefinition, RetryPolicy } from './types';
import type { WorkflowError } from './errors';
import { makeError } from './errors';
import { DEFAULT_RETRY_POLICY, shouldRetry, backoffDelay, sleep, maxRetriesExceededError } from './retry';
import { resolveInputMap } from './router';
import type { EventBus } from './events/bus';

export async function executeStep(
  step: StepDefinition,
  ctx: WorkflowContext,
  policy: RetryPolicy,
  bus: EventBus,
): Promise<StepState> {
  const started = new Date();

  // Evaluate condition — skip if it returns false.
  if (step.condition) {
    let condResult: boolean;
    try {
      condResult = step.condition(ctx);
    } catch (err) {
      const error = makeError(
        'CONDITION_EVALUATION_FAILED',
        step.stepId,
        `Condition for step "${step.stepId}" threw: ${String(err)}`,
        { cause: err, retryable: false },
      );
      return applyErrorStrategy(step, started, error, ctx, bus);
    }

    if (!condResult) {
      bus.publish({ type: 'step.skipped', runId: ctx.runId, workflowId: ctx.workflowId, stepId: step.stepId, payload: {} });
      const state: StepState = { stepId: step.stepId, status: 'skipped', startedAt: started, completedAt: new Date(), retryCount: 0 };
      ctx.steps[step.stepId] = state;
      return state;
    }
  }

  bus.publish({ type: 'step.started', runId: ctx.runId, workflowId: ctx.workflowId, stepId: step.stepId, payload: {} });
  ctx.steps[step.stepId] = { stepId: step.stepId, status: 'running', startedAt: started, retryCount: 0 };

  let lastError: WorkflowError | undefined;
  let attempt = 0;

  while (attempt < policy.maxAttempts) {
    attempt++;
    try {
      const input = resolveInputMap(step.inputMap, ctx, step.stepId);
      const output = await step.adapter(input);

      const state: StepState = {
        stepId: step.stepId,
        status: 'completed',
        startedAt: started,
        completedAt: new Date(),
        output,
        retryCount: attempt - 1,
      };
      ctx.steps[step.stepId] = state;
      bus.publish({ type: 'step.completed', runId: ctx.runId, workflowId: ctx.workflowId, stepId: step.stepId, payload: { output } });
      return state;

    } catch (err) {
      // MISSING_CONTEXT_PATH is never retryable — bail immediately.
      if (err && typeof err === 'object' && 'code' in err && (err as WorkflowError).code === 'MISSING_CONTEXT_PATH') {
        return applyErrorStrategy(step, started, err as WorkflowError, ctx, bus);
      }

      lastError = makeError(
        'ADAPTER_ERROR',
        step.stepId,
        `Step "${step.stepId}" adapter threw on attempt ${attempt}: ${String(err)}`,
        { cause: err, retryable: true },
      );

      const hasMore = attempt < policy.maxAttempts;
      if (hasMore && shouldRetry(lastError, policy)) {
        const delay = backoffDelay(attempt, policy.backoffMs);
        bus.publish({ type: 'step.retrying', runId: ctx.runId, workflowId: ctx.workflowId, stepId: step.stepId, payload: { attempt, delay } });
        ctx.steps[step.stepId] = { ...ctx.steps[step.stepId], retryCount: attempt };
        await sleep(delay);
      } else {
        break;
      }
    }
  }

  // MAX_RETRIES_EXCEEDED only when at least one retry actually occurred.
  const terminalError = attempt > 1 && lastError
    ? maxRetriesExceededError(step.stepId, lastError)
    : lastError ?? makeError('ADAPTER_ERROR', step.stepId, `Step "${step.stepId}" failed.`);

  return applyErrorStrategy(step, started, terminalError, ctx, bus);
}

function applyErrorStrategy(
  step: StepDefinition,
  started: Date,
  error: WorkflowError,
  ctx: WorkflowContext,
  bus: EventBus,
): StepState {
  const strategy = step.onError ?? 'abort';

  if (strategy === 'skip') {
    bus.publish({ type: 'step.skipped', runId: ctx.runId, workflowId: ctx.workflowId, stepId: step.stepId, payload: { error } });
    const state: StepState = { stepId: step.stepId, status: 'skipped', startedAt: started, completedAt: new Date(), error, retryCount: 0 };
    ctx.steps[step.stepId] = state;
    return state;
  }

  // 'abort' (default)
  bus.publish({ type: 'step.failed', runId: ctx.runId, workflowId: ctx.workflowId, stepId: step.stepId, payload: { error } });
  const state: StepState = { stepId: step.stepId, status: 'failed', startedAt: started, completedAt: new Date(), error, retryCount: 0 };
  ctx.steps[step.stepId] = state;
  return state;
}
