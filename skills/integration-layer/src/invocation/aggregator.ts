/**
 * ResultAggregator — collects multiple SkillResponse objects and produces
 * a unified AggregatedResult with error tracking and merge strategies.
 */

import { AggregationError, IntegrationError, isIntegrationError } from '../contracts/errors';
import type { SkillResponse } from '../contracts/request';
import type { AggregatedResult, IResultAggregator, MergeStrategy } from './types';

export class ResultAggregator implements IResultAggregator {
  aggregate<TOutput>(
    responses: ReadonlyArray<SkillResponse<TOutput>>
  ): AggregatedResult<TOutput> {
    const errors: IntegrationError[] = [];
    const valid: SkillResponse<TOutput>[] = [];

    for (const r of responses) {
      if (r.output === undefined || r.output === null) {
        errors.push(
          new AggregationError(
            `Skill "${r.skillName}" returned null/undefined output for operation "${r.operation}"`
          )
        );
      } else {
        valid.push(r);
      }
    }

    const totalDurationMs = responses.reduce((sum, r) => sum + r.metadata.durationMs, 0);
    const qualityScores = responses
      .map((r) => r.metadata.qualityScore)
      .filter((s): s is number => s !== undefined);
    const averageQualityScore =
      qualityScores.length > 0
        ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
        : 0;

    return Object.freeze({
      responses,
      merged: this.merge(valid, 'combine'),
      errors: Object.freeze(errors) as ReadonlyArray<IntegrationError>,
      metadata: Object.freeze({
        totalDurationMs,
        successCount: valid.length,
        errorCount: errors.length,
        averageQualityScore,
      }),
    });
  }

  merge<TOutput>(
    responses: ReadonlyArray<SkillResponse<TOutput>>,
    strategy: MergeStrategy
  ): TOutput | null {
    if (responses.length === 0) return null;

    switch (strategy) {
      case 'first-wins':
        return responses[0].output;

      case 'last-wins':
        return responses[responses.length - 1].output;

      case 'highest-quality': {
        let best = responses[0];
        for (const r of responses) {
          const rScore = r.metadata.qualityScore ?? 0;
          const bestScore = best.metadata.qualityScore ?? 0;
          if (rScore > bestScore) best = r;
        }
        return best.output;
      }

      case 'combine':
        return _combineOutputs(responses.map((r) => r.output));
    }
  }
}

function _combineOutputs<TOutput>(outputs: TOutput[]): TOutput | null {
  if (outputs.length === 0) return null;
  if (outputs.length === 1) return outputs[0];

  const first = outputs[0];
  if (!_isPlainObject(first)) {
    return outputs[outputs.length - 1];
  }

  let merged: Record<string, unknown> = {};
  for (const output of outputs) {
    if (_isPlainObject(output)) {
      merged = { ...merged, ...output };
    }
  }
  return merged as TOutput;
}

function _isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function wrapError(err: unknown, context: string): IntegrationError {
  if (isIntegrationError(err)) return err;
  return new AggregationError(
    `${context}: ${err instanceof Error ? err.message : String(err)}`,
    err instanceof Error ? err : undefined
  );
}
