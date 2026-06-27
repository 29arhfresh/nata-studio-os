import { randomUUID } from 'crypto';
import type { WorkflowDefinition, WorkflowResult } from './types';
import type { WorkflowContext } from './context';
import { InMemoryContextStore } from './context';
import { EventBus } from './events/bus';
import { buildExecutionGraph } from './dag/resolver';
import { schedule } from './dag/scheduler';
import type { ExecutionGraph } from './dag/graph';
import type { Unsubscribe } from './events/types';
import type { WorkflowEventType, EventHandler } from './events/types';

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { WorkflowDefinition, WorkflowResult, StepDefinition, InputMap, InputMapValue, LiteralValue, Adapter, RetryPolicy, ErrorStrategy, ConditionFn } from './types';
export type { WorkflowContext, StepState, ContextStore } from './context';
export type { WorkflowError, WorkflowErrorCode } from './errors';
export type { WorkflowEvent, WorkflowEventType, EventHandler, Unsubscribe } from './events/types';
export { InMemoryContextStore } from './context';
export { EventBus } from './events/bus';
export { buildExecutionGraph } from './dag/resolver';

// ─── Engine ───────────────────────────────────────────────────────────────────

interface RegisteredWorkflow {
  definition: WorkflowDefinition;
  graph: ExecutionGraph;
}

export class WorkflowEngine {
  private readonly registry = new Map<string, RegisteredWorkflow>();
  private readonly store = new InMemoryContextStore();
  readonly bus = new EventBus();

  defineWorkflow(def: WorkflowDefinition): void {
    const graph = buildExecutionGraph(def);
    this.registry.set(def.workflowId, { definition: def, graph });
  }

  async runWorkflow(
    workflowIdOrDef: string | WorkflowDefinition,
    input: Record<string, unknown> = {},
  ): Promise<WorkflowResult> {
    const { definition: def, graph } = this.resolve(workflowIdOrDef);

    const runId = randomUUID();
    const startedAt = new Date();

    const ctx: WorkflowContext = {
      runId,
      workflowId: def.workflowId,
      startedAt,
      input,
      steps: {},
      metadata: {},
    };

    this.store.save(ctx);
    this.bus.publish({ type: 'workflow.started', runId, workflowId: def.workflowId, payload: { input } });

    const error = await schedule(def, graph, ctx, this.bus);
    const completedAt = new Date();

    if (error) {
      this.bus.publish({ type: 'workflow.failed', runId, workflowId: def.workflowId, payload: { error } });
      return { runId, workflowId: def.workflowId, status: 'failed', startedAt, completedAt, context: ctx, error };
    }

    const hasSkipped = Object.values(ctx.steps).some((s) => s.status === 'skipped');
    const status = hasSkipped ? 'partial' : 'completed';
    this.bus.publish({ type: 'workflow.completed', runId, workflowId: def.workflowId, payload: { status } });

    return { runId, workflowId: def.workflowId, status, startedAt, completedAt, context: ctx };
  }

  on<T = unknown>(type: WorkflowEventType | WorkflowEventType[], handler: EventHandler<T>): Unsubscribe {
    return this.bus.subscribe(type, handler);
  }

  private resolve(workflowIdOrDef: string | WorkflowDefinition): RegisteredWorkflow {
    if (typeof workflowIdOrDef === 'string') {
      const entry = this.registry.get(workflowIdOrDef);
      if (!entry) throw new Error(`Workflow "${workflowIdOrDef}" not registered.`);
      return entry;
    }
    // Accept an unregistered definition directly (used in tests and agent calls).
    const graph = buildExecutionGraph(workflowIdOrDef);
    return { definition: workflowIdOrDef, graph };
  }
}

// ─── Default instance ─────────────────────────────────────────────────────────

const engine = new WorkflowEngine();
export default engine;
