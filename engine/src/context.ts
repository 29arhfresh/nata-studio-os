import type { WorkflowError } from './errors';

export interface WorkflowContext {
  runId: string;
  workflowId: string;
  startedAt: Date;
  input: Record<string, unknown>;
  steps: Record<string, StepState>;
  metadata: Record<string, unknown>;
}

export interface StepState {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  output?: unknown;
  error?: WorkflowError;
  retryCount: number;
}

export interface ContextStore {
  get(runId: string): WorkflowContext | null;
  save(ctx: WorkflowContext): void;
  delete(runId: string): void;
}

export class InMemoryContextStore implements ContextStore {
  private readonly store = new Map<string, WorkflowContext>();

  get(runId: string): WorkflowContext | null {
    return this.store.get(runId) ?? null;
  }

  save(ctx: WorkflowContext): void {
    this.store.set(ctx.runId, ctx);
  }

  delete(runId: string): void {
    this.store.delete(runId);
  }
}
