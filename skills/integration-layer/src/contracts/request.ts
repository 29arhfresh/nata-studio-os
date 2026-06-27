/**
 * Shared request / response contracts for Skill invocation.
 * Every Skill communication passes through SkillRequest → SkillResponse.
 */

import type { SharedContext } from './context';

// ─── Options ─────────────────────────────────────────────────────────────────

export interface InvocationOptions {
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
}

// ─── Request ──────────────────────────────────────────────────────────────────

export interface SkillRequest<TInput = unknown> {
  readonly requestId: string;
  readonly skillName: string;
  readonly operation: string;
  readonly input: TInput;
  readonly context: SharedContext;
  readonly options?: InvocationOptions;
}

// ─── Response ────────────────────────────────────────────────────────────────

export interface ResponseMetadata {
  readonly durationMs: number;
  readonly attempt: number;
  readonly qualityScore?: number;
  readonly warnings: readonly string[];
}

export interface SkillResponse<TOutput = unknown> {
  readonly requestId: string;
  readonly skillName: string;
  readonly operation: string;
  readonly output: TOutput;
  readonly context: SharedContext;
  readonly metadata: ResponseMetadata;
}

// ─── Factories ────────────────────────────────────────────────────────────────

let _reqCounter = 0;

function _nextId(): string {
  _reqCounter += 1;
  return `req-${Date.now().toString(36)}-${_reqCounter.toString(16).padStart(6, '0')}`;
}

export function createRequest<TInput>(params: {
  skillName: string;
  operation: string;
  input: TInput;
  context: SharedContext;
  options?: InvocationOptions;
}): SkillRequest<TInput> {
  if (!params.skillName) {
    throw new TypeError('skillName is required');
  }
  if (!params.operation) {
    throw new TypeError('operation is required');
  }
  return Object.freeze({
    requestId: _nextId(),
    skillName: params.skillName,
    operation: params.operation,
    input: params.input,
    context: params.context,
    options: params.options,
  });
}

export function createResponse<TOutput>(params: {
  request: SkillRequest<unknown>;
  output: TOutput;
  context: SharedContext;
  durationMs: number;
  attempt?: number;
  qualityScore?: number;
  warnings?: string[];
}): SkillResponse<TOutput> {
  return Object.freeze({
    requestId: params.request.requestId,
    skillName: params.request.skillName,
    operation: params.request.operation,
    output: params.output,
    context: params.context,
    metadata: Object.freeze({
      durationMs: params.durationMs,
      attempt: params.attempt ?? 1,
      qualityScore: params.qualityScore,
      warnings: Object.freeze(params.warnings ?? []) as readonly string[],
    }),
  });
}
