/**
 * Invocation interfaces — adapter, invoker, aggregator, and result types.
 */

import type { IntegrationError } from '../contracts/errors';
import type { SkillRequest, SkillResponse } from '../contracts/request';

// ─── Adapter ──────────────────────────────────────────────────────────────────

export interface ISkillAdapter {
  readonly name: string;
  invoke<TInput, TOutput>(
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>>;
}

// ─── Invoker ──────────────────────────────────────────────────────────────────

export type InvocationMode = 'parallel' | 'sequential';

export interface ISkillInvoker {
  invoke<TInput, TOutput>(
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>>;

  invokeMany<TInput, TOutput>(
    requests: ReadonlyArray<SkillRequest<TInput>>,
    mode: InvocationMode
  ): Promise<SkillResponse<TOutput>[]>;
}

// ─── Aggregator ───────────────────────────────────────────────────────────────

export type MergeStrategy = 'first-wins' | 'last-wins' | 'highest-quality' | 'combine';

export interface AggregationMetadata {
  readonly totalDurationMs: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly averageQualityScore: number;
}

export interface AggregatedResult<TOutput = unknown> {
  readonly responses: ReadonlyArray<SkillResponse<TOutput>>;
  readonly merged: TOutput | null;
  readonly errors: ReadonlyArray<IntegrationError>;
  readonly metadata: AggregationMetadata;
}

export interface IResultAggregator {
  aggregate<TOutput>(
    responses: ReadonlyArray<SkillResponse<TOutput>>
  ): AggregatedResult<TOutput>;

  merge<TOutput>(
    responses: ReadonlyArray<SkillResponse<TOutput>>,
    strategy: MergeStrategy
  ): TOutput | null;
}
