import { ResultAggregator, wrapError } from '../../src/invocation/aggregator';
import { AggregationError, IntegrationError } from '../../src/contracts/errors';
import { createContext } from '../../src/contracts/context';
import { createRequest, createResponse } from '../../src/contracts/request';
import type { SkillResponse } from '../../src/contracts/request';

const ctx = createContext({ sessionId: 'agg-test', traceId: 'tr', spanId: 'sp' });

function makeResponse<TOutput>(
  output: TOutput,
  skillName = 'skill',
  qualityScore?: number,
  durationMs = 10
): SkillResponse<TOutput> {
  const req = createRequest({ skillName, operation: 'op', input: {}, context: ctx });
  return createResponse({ request: req, output, context: ctx, durationMs, qualityScore });
}

describe('ResultAggregator.aggregate', () => {
  const agg = new ResultAggregator();

  it('counts successes correctly', () => {
    const result = agg.aggregate<Record<string, unknown>>([makeResponse({ a: 1 }), makeResponse({ b: 2 })]);
    expect(result.metadata.successCount).toBe(2);
    expect(result.metadata.errorCount).toBe(0);
  });

  it('flags null output as an error', () => {
    const result = agg.aggregate([makeResponse(null)]);
    expect(result.metadata.errorCount).toBe(1);
    expect(result.errors[0]).toBeInstanceOf(IntegrationError);
  });

  it('computes totalDurationMs as sum', () => {
    const result = agg.aggregate([makeResponse('a', 'sk', undefined, 30), makeResponse('b', 'sk', undefined, 20)]);
    expect(result.metadata.totalDurationMs).toBe(50);
  });

  it('computes averageQualityScore', () => {
    const result = agg.aggregate([makeResponse('x', 'sk', 0.8), makeResponse('y', 'sk', 0.6)]);
    expect(result.metadata.averageQualityScore).toBeCloseTo(0.7);
  });

  it('averageQualityScore is 0 when no scores are present', () => {
    const result = agg.aggregate([makeResponse('x')]);
    expect(result.metadata.averageQualityScore).toBe(0);
  });

  it('returns all responses in the result', () => {
    const responses = [makeResponse('a'), makeResponse('b')];
    const result = agg.aggregate(responses);
    expect(result.responses).toHaveLength(2);
  });

  it('returns empty aggregate for empty input', () => {
    const result = agg.aggregate([]);
    expect(result.merged).toBeNull();
    expect(result.responses).toHaveLength(0);
    expect(result.metadata.successCount).toBe(0);
  });
});

describe('ResultAggregator.merge — first-wins', () => {
  const agg = new ResultAggregator();

  it('returns the first response output', () => {
    const responses = [makeResponse('first'), makeResponse('second')];
    expect(agg.merge(responses, 'first-wins')).toBe('first');
  });
});

describe('ResultAggregator.merge — last-wins', () => {
  const agg = new ResultAggregator();

  it('returns the last response output', () => {
    const responses = [makeResponse('first'), makeResponse('second'), makeResponse('last')];
    expect(agg.merge(responses, 'last-wins')).toBe('last');
  });
});

describe('ResultAggregator.merge — highest-quality', () => {
  const agg = new ResultAggregator();

  it('returns output with highest qualityScore', () => {
    const responses = [
      makeResponse({ val: 'low' }, 'sk', 0.3),
      makeResponse({ val: 'high' }, 'sk', 0.9),
      makeResponse({ val: 'mid' }, 'sk', 0.6),
    ];
    const merged = agg.merge(responses, 'highest-quality') as { val: string };
    expect(merged.val).toBe('high');
  });

  it('falls back to first when no qualityScores', () => {
    const responses = [makeResponse('alpha'), makeResponse('beta')];
    expect(agg.merge(responses, 'highest-quality')).toBe('alpha');
  });
});

describe('ResultAggregator.merge — combine', () => {
  const agg = new ResultAggregator();

  it('merges plain objects', () => {
    const responses: SkillResponse<Record<string, unknown>>[] = [
      makeResponse({ a: 1, shared: 'first' }),
      makeResponse({ b: 2, shared: 'second' }),
    ];
    const merged = agg.merge(responses, 'combine') as Record<string, unknown>;
    expect(merged['a']).toBe(1);
    expect(merged['b']).toBe(2);
    expect(merged['shared']).toBe('second');
  });

  it('falls back to last-wins for non-objects', () => {
    const responses = [makeResponse('alpha'), makeResponse('beta')];
    expect(agg.merge(responses, 'combine')).toBe('beta');
  });

  it('returns null for empty input', () => {
    expect(agg.merge([], 'combine')).toBeNull();
  });

  it('returns single item without merging', () => {
    const responses = [makeResponse({ only: true })];
    expect(agg.merge(responses, 'combine')).toEqual({ only: true });
  });
});

describe('wrapError', () => {
  it('returns IntegrationError as-is', () => {
    const err = new AggregationError('original');
    expect(wrapError(err, 'ctx')).toBe(err);
  });

  it('wraps plain Error in AggregationError', () => {
    const plain = new Error('plain');
    const wrapped = wrapError(plain, 'aggregation step');
    expect(wrapped).toBeInstanceOf(AggregationError);
    expect(wrapped.message).toContain('plain');
    expect(wrapped.cause).toBe(plain);
  });

  it('wraps string in AggregationError', () => {
    const wrapped = wrapError('string error', 'ctx');
    expect(wrapped).toBeInstanceOf(AggregationError);
    expect(wrapped.message).toContain('string error');
  });
});
