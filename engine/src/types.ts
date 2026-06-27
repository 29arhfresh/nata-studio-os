import type { WorkflowContext } from './context';
import type { WorkflowError } from './errors';

// ─── Adapter ─────────────────────────────────────────────────────────────────

export type Adapter<TIn = unknown, TOut = unknown> = (input: TIn) => TOut | Promise<TOut>;

// ─── Input Map ────────────────────────────────────────────────────────────────

/** A dot-path into WorkflowContext, e.g. "steps.brief.output.tone" */
export type ContextPath = string;

/** A static value embedded in the workflow definition. */
export type LiteralValue = { readonly $literal: unknown };

export type InputMapValue = ContextPath | LiteralValue;

/** Maps adapter input field names to context paths or literal values. */
export type InputMap = Record<string, InputMapValue>;

export function isLiteral(v: InputMapValue): v is LiteralValue {
  return typeof v === 'object' && v !== null && '$literal' in v;
}

// ─── Error Strategy ───────────────────────────────────────────────────────────

/** 'compensate' is reserved for Phase B. */
export type ErrorStrategy = 'abort' | 'skip';

// ─── Retry ───────────────────────────────────────────────────────────────────

export interface RetryPolicy {
  /** Total attempts including the first. Default: 1 (no retry). */
  maxAttempts: number;
  /** Base delay in ms for exponential backoff. */
  backoffMs: number;
  /** If omitted, any retryable error is retried. */
  retryOn?: (error: WorkflowError) => boolean;
}

// ─── Step Definition ─────────────────────────────────────────────────────────

export type ConditionFn = (ctx: Readonly<WorkflowContext>) => boolean;

export interface StepDefinition {
  stepId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: Adapter<any, any>;
  inputMap: InputMap;
  /** Key written to context.steps[stepId].output. */
  outputKey: string;
  /** If returns false the step is skipped. Evaluated after all dependencies complete. */
  condition?: ConditionFn;
  retryPolicy?: RetryPolicy;
  /** Default: 'abort'. */
  onError?: ErrorStrategy;
  /** Explicit DAG edges. If omitted, edges are inferred from inputMap paths. */
  dependsOn?: string[];
  /** Metadata for the Visualizer (Phase E). No scheduling effect in Phase A. */
  parallelGroup?: string;
}

// ─── Workflow Definition ──────────────────────────────────────────────────────

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  version: string;
  steps: StepDefinition[];
  defaultRetryPolicy?: RetryPolicy;
  onError?: ErrorStrategy;
}

// ─── Workflow Result ──────────────────────────────────────────────────────────

export interface WorkflowResult {
  runId: string;
  workflowId: string;
  status: 'completed' | 'failed' | 'partial';
  startedAt: Date;
  completedAt: Date;
  context: Readonly<WorkflowContext>;
  error?: WorkflowError;
}
