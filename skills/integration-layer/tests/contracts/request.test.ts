import { createContext } from '../../src/contracts/context';
import { createRequest, createResponse } from '../../src/contracts/request';

const ctx = createContext({ sessionId: 'sess-test', traceId: 'tr-1', spanId: 'sp-1' });

describe('createRequest', () => {
  it('requires skillName', () => {
    expect(() =>
      createRequest({ skillName: '', operation: 'op', input: {}, context: ctx })
    ).toThrow(TypeError);
  });

  it('requires operation', () => {
    expect(() =>
      createRequest({ skillName: 'skill', operation: '', input: {}, context: ctx })
    ).toThrow(TypeError);
  });

  it('returns a SkillRequest with generated requestId', () => {
    const req = createRequest({ skillName: 'memory-system', operation: 'store', input: { key: 'v' }, context: ctx });
    expect(req.requestId).toMatch(/^req-/);
    expect(req.skillName).toBe('memory-system');
    expect(req.operation).toBe('store');
    expect(req.input).toEqual({ key: 'v' });
    expect(req.context).toBe(ctx);
  });

  it('generates unique requestIds', () => {
    const a = createRequest({ skillName: 's', operation: 'o', input: null, context: ctx });
    const b = createRequest({ skillName: 's', operation: 'o', input: null, context: ctx });
    expect(a.requestId).not.toBe(b.requestId);
  });

  it('stores options when provided', () => {
    const req = createRequest({
      skillName: 's', operation: 'o', input: null, context: ctx,
      options: { timeoutMs: 5000, maxRetries: 2 },
    });
    expect(req.options?.timeoutMs).toBe(5000);
    expect(req.options?.maxRetries).toBe(2);
  });

  it('returns frozen object', () => {
    const req = createRequest({ skillName: 's', operation: 'o', input: {}, context: ctx });
    expect(Object.isFrozen(req)).toBe(true);
  });
});

describe('createResponse', () => {
  it('mirrors requestId, skillName, operation from the request', () => {
    const req = createRequest({ skillName: 'creative-director', operation: 'build-brief', input: {}, context: ctx });
    const res = createResponse({ request: req, output: { result: 'ok' }, context: ctx, durationMs: 42 });
    expect(res.requestId).toBe(req.requestId);
    expect(res.skillName).toBe('creative-director');
    expect(res.operation).toBe('build-brief');
  });

  it('records durationMs and defaults', () => {
    const req = createRequest({ skillName: 's', operation: 'o', input: {}, context: ctx });
    const res = createResponse({ request: req, output: 'result', context: ctx, durationMs: 123 });
    expect(res.metadata.durationMs).toBe(123);
    expect(res.metadata.attempt).toBe(1);
    expect(res.metadata.warnings).toHaveLength(0);
    expect(res.metadata.qualityScore).toBeUndefined();
  });

  it('records qualityScore and warnings', () => {
    const req = createRequest({ skillName: 's', operation: 'o', input: {}, context: ctx });
    const res = createResponse({
      request: req, output: 'ok', context: ctx, durationMs: 10,
      qualityScore: 0.9, warnings: ['minor issue'],
    });
    expect(res.metadata.qualityScore).toBe(0.9);
    expect(res.metadata.warnings).toEqual(['minor issue']);
  });

  it('returns frozen object', () => {
    const req = createRequest({ skillName: 's', operation: 'o', input: {}, context: ctx });
    const res = createResponse({ request: req, output: {}, context: ctx, durationMs: 0 });
    expect(Object.isFrozen(res)).toBe(true);
  });
});
