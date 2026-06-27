import type { WorkflowDefinition, RetryPolicy } from '../types';
import type { WorkflowContext } from '../context';
import type { WorkflowError } from '../errors';
import type { ExecutionGraph } from './graph';
import type { EventBus } from '../events/bus';
import { DEFAULT_RETRY_POLICY } from '../retry';
import { executeStep } from '../runner';

export async function schedule(
  def: WorkflowDefinition,
  graph: ExecutionGraph,
  ctx: WorkflowContext,
  bus: EventBus,
): Promise<WorkflowError | null> {
  if (def.steps.length === 0) return null;

  const defaultPolicy: RetryPolicy = def.defaultRetryPolicy ?? DEFAULT_RETRY_POLICY;

  // Group steps by topological level.
  const byLevel = new Map<number, string[]>();
  for (const [stepId, level] of graph.levels) {
    const group = byLevel.get(level) ?? [];
    group.push(stepId);
    byLevel.set(level, group);
  }

  const stepById = new Map(def.steps.map((s) => [s.stepId, s]));
  const maxLevel = graph.levels.size > 0 ? Math.max(...graph.levels.values()) : -1;

  for (let level = 0; level <= maxLevel; level++) {
    const stepIds = byLevel.get(level) ?? [];
    const steps = stepIds.map((id) => stepById.get(id)!);

    // All steps at this level run concurrently.
    const results = await Promise.all(
      steps.map((step) => executeStep(step, ctx, step.retryPolicy ?? defaultPolicy, bus)),
    );

    // If any step failed (not skipped), stop scheduling further levels.
    const failure = results.find((r) => r.status === 'failed');
    if (failure?.error) return failure.error;
  }

  return null;
}
