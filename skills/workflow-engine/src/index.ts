import { EventBus } from './event-bus';
import { ContextStore } from './context-store';
import { DataRouter } from './data-router';
import { resolveDag } from './dag-resolver';
import { Scheduler } from './scheduler';
import { StepRunner } from './step-runner';
import type { WorkflowStatus } from './types';
import type { EventHandler } from './event-bus';
import type { DataRoute } from './data-router';
import type { StepHandler, StepResult } from './step-runner';

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { WorkflowEventType, WorkflowEvent, EventHandler } from './event-bus';
export type { DataRoute } from './data-router';
export type { StepNode, ResolvedDag } from './dag-resolver';
export type { StepHandler, StepInput, StepResult } from './step-runner';
export type { WorkflowStatus, StepStatus } from './types';
export { EventBus } from './event-bus';
export { ContextStore } from './context-store';
export { DataRouter } from './data-router';
export { resolveDag } from './dag-resolver';
export { Scheduler } from './scheduler';
export { StepRunner } from './step-runner';

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface StepDefinition {
  id: string;
  dependsOn: string[];
  handler: StepHandler;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface WorkflowDefinition {
  id: string;
  steps: StepDefinition[];
  routes?: DataRoute[];
}

export interface WorkflowRunOptions {
  context?: Record<string, unknown>;
  onEvent?: EventHandler;
}

export interface WorkflowResult {
  workflowId: string;
  status: WorkflowStatus;
  stepResults: StepResult[];
  startedAt: number;
  completedAt: number;
  error: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_STEP_TIMEOUT_MS = 30_000;

const ALL_EVENT_TYPES = [
  'workflow:started', 'workflow:completed', 'workflow:failed',
  'step:started', 'step:completed', 'step:failed', 'step:skipped',
] as const;

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validates a workflow definition without executing it. */
function validate(definition: WorkflowDefinition): ValidationResult {
  const errors: string[] = [];

  if (!definition.id || typeof definition.id !== 'string') {
    errors.push('Workflow id must be a non-empty string.');
  }
  if (!Array.isArray(definition.steps) || definition.steps.length === 0) {
    errors.push('Workflow must have at least one step.');
    return { valid: false, errors };
  }

  const ids = new Set<string>();
  for (const step of definition.steps) {
    if (!step.id || typeof step.id !== 'string') {
      errors.push('Each step must have a non-empty string id.');
    } else if (ids.has(step.id)) {
      errors.push(`Duplicate step id: "${step.id}".`);
    } else {
      ids.add(step.id);
    }
    if (typeof step.handler !== 'function') {
      errors.push(`Step "${step.id ?? '?'}" must have a handler function.`);
    }
    if (!Array.isArray(step.dependsOn)) {
      errors.push(`Step "${step.id ?? '?'}" must have a dependsOn array.`);
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  try {
    const dag = resolveDag(definition.steps);
    if (dag.hasCycle) {
      errors.push(`Cycle detected involving steps: ${dag.cycleNodes.join(', ')}.`);
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return { valid: errors.length === 0, errors };
}

// ─── Execution ────────────────────────────────────────────────────────────────

/** Executes a workflow definition, wiring all Phase A components together. */
async function run(
  definition: WorkflowDefinition,
  options: WorkflowRunOptions = {},
): Promise<WorkflowResult> {
  const validation = validate(definition);
  if (!validation.valid) {
    throw new Error(`INVALID_WORKFLOW: ${validation.errors.join(' ')}`);
  }

  const bus = new EventBus();
  const store = new ContextStore();
  const router = new DataRouter();
  const runner = new StepRunner();
  const startedAt = Date.now();

  if (options.onEvent) {
    for (const t of ALL_EVENT_TYPES) bus.subscribe(t, options.onEvent);
  }

  for (const [key, value] of Object.entries(options.context ?? {})) {
    store.set(definition.id, key, value);
  }

  for (const route of definition.routes ?? []) {
    router.addRoute(route);
  }

  const dag = resolveDag(definition.steps);
  const scheduler = new Scheduler(definition.steps);
  const stepOutputs = new Map<string, Record<string, unknown>>();
  const stepResults: StepResult[] = [];

  bus.emit({ type: 'workflow:started', workflowId: definition.id, timestamp: Date.now() });

  while (!scheduler.isComplete()) {
    const ready = scheduler.getReadySteps();

    if (ready.length === 0) break;

    for (const stepId of ready) {
      const stepDef = definition.steps.find((s) => s.id === stepId)!;
      const routedData = router.resolveInputs(stepId, stepOutputs);
      const context = store.getAll(definition.id);

      bus.emit({ type: 'step:started', workflowId: definition.id, stepId, timestamp: Date.now() });
      scheduler.markRunning(stepId);

      const result = await runner.run(
        stepId,
        stepDef.handler,
        { stepId, workflowId: definition.id, context, data: routedData },
        {
          timeoutMs: stepDef.timeoutMs ?? DEFAULT_STEP_TIMEOUT_MS,
          maxRetries: stepDef.maxRetries ?? 0,
        },
      );

      stepResults.push(result);

      if (result.status === 'completed') {
        const output =
          result.output !== null && typeof result.output === 'object'
            ? (result.output as Record<string, unknown>)
            : { value: result.output };
        stepOutputs.set(stepId, output);
        scheduler.markCompleted(stepId);
        bus.emit({
          type: 'step:completed',
          workflowId: definition.id,
          stepId,
          payload: result.output,
          timestamp: Date.now(),
        });
      } else {
        scheduler.markFailed(stepId);
        bus.emit({
          type: 'step:failed',
          workflowId: definition.id,
          stepId,
          payload: result.error,
          timestamp: Date.now(),
        });

        const completedAt = Date.now();
        bus.emit({ type: 'workflow:failed', workflowId: definition.id, timestamp: completedAt });
        store.clear(definition.id);

        return {
          workflowId: definition.id,
          status: 'failed',
          stepResults,
          startedAt,
          completedAt,
          error: result.error,
        };
      }
    }
  }

  // Suppress unused variable warning — dag is used for validation above via resolveDag.
  void dag;

  const completedAt = Date.now();
  const finalStatus: WorkflowStatus = scheduler.hasFailed() ? 'failed' : 'completed';

  bus.emit({
    type: finalStatus === 'completed' ? 'workflow:completed' : 'workflow:failed',
    workflowId: definition.id,
    timestamp: completedAt,
  });
  store.clear(definition.id);

  return {
    workflowId: definition.id,
    status: finalStatus,
    stepResults,
    startedAt,
    completedAt,
    error: null,
  };
}

// ─── Default Export ───────────────────────────────────────────────────────────

const workflowEngine = { run, validate };

export default workflowEngine;
