import {
  buildSnapshot,
  createContext,
  patchContext,
} from '../../src/contracts/context';

describe('createContext', () => {
  it('requires sessionId', () => {
    expect(() => createContext({ sessionId: '' })).toThrow(TypeError);
  });

  it('returns a frozen SharedContext with defaults', () => {
    const ctx = createContext({ sessionId: 'sess-1' });
    expect(ctx.sessionId).toBe('sess-1');
    expect(ctx.projectId).toBeUndefined();
    expect(typeof ctx.traceId).toBe('string');
    expect(typeof ctx.spanId).toBe('string');
    expect(ctx.traceId.length).toBeGreaterThan(0);
    expect(ctx.memory.version).toBe(0);
    expect(ctx.memory.keys).toHaveLength(0);
    expect(typeof ctx.timestamp).toBe('number');
    expect(Object.isFrozen(ctx)).toBe(true);
  });

  it('accepts explicit traceId and spanId', () => {
    const ctx = createContext({ sessionId: 's', traceId: 'tr-1', spanId: 'sp-1' });
    expect(ctx.traceId).toBe('tr-1');
    expect(ctx.spanId).toBe('sp-1');
  });

  it('sets projectId when provided', () => {
    const ctx = createContext({ sessionId: 's', projectId: 'proj-42' });
    expect(ctx.projectId).toBe('proj-42');
  });

  it('accepts initial metadata', () => {
    const ctx = createContext({ sessionId: 's', metadata: { env: 'test' } });
    expect(ctx.metadata['env']).toBe('test');
  });

  it('generates different traceIds for each call', () => {
    const a = createContext({ sessionId: 's' });
    const b = createContext({ sessionId: 's' });
    expect(a.traceId).not.toBe(b.traceId);
  });
});

describe('patchContext', () => {
  it('returns a new context with updated spanId', () => {
    const ctx = createContext({ sessionId: 's', traceId: 'tr', spanId: 'sp-1' });
    const next = patchContext(ctx, { spanId: 'sp-2' });
    expect(next.spanId).toBe('sp-2');
    expect(next.traceId).toBe('tr');
    expect(next.sessionId).toBe('s');
  });

  it('sets parentSpanId', () => {
    const ctx = createContext({ sessionId: 's' });
    const next = patchContext(ctx, { parentSpanId: 'parent-1' });
    expect(next.parentSpanId).toBe('parent-1');
  });

  it('merges memory values and increments version', () => {
    const ctx = createContext({ sessionId: 's' });
    const next = patchContext(ctx, { memory: { key1: 'value1' } });
    expect(next.memory.values['key1']).toBe('value1');
    expect(next.memory.version).toBe(1);
    expect(next.memory.keys).toContain('key1');
  });

  it('accumulates memory across patches', () => {
    const ctx = createContext({ sessionId: 's' });
    const a = patchContext(ctx, { memory: { x: 1 } });
    const b = patchContext(a, { memory: { y: 2 } });
    expect(b.memory.values['x']).toBe(1);
    expect(b.memory.values['y']).toBe(2);
    expect(b.memory.version).toBe(2);
  });

  it('later patch overwrites earlier key', () => {
    const ctx = createContext({ sessionId: 's' });
    const a = patchContext(ctx, { memory: { x: 'old' } });
    const b = patchContext(a, { memory: { x: 'new' } });
    expect(b.memory.values['x']).toBe('new');
  });

  it('merges metadata', () => {
    const ctx = createContext({ sessionId: 's', metadata: { a: 1 } });
    const next = patchContext(ctx, { metadata: { b: 2 } });
    expect(next.metadata['a']).toBe(1);
    expect(next.metadata['b']).toBe(2);
  });

  it('preserves original context (immutability)', () => {
    const ctx = createContext({ sessionId: 's', spanId: 'sp-original' });
    patchContext(ctx, { spanId: 'sp-changed' });
    expect(ctx.spanId).toBe('sp-original');
  });
});

describe('buildSnapshot', () => {
  it('creates a sorted-key snapshot', () => {
    const snap = buildSnapshot({ b: 2, a: 1 });
    expect(snap.keys).toEqual(['a', 'b']);
    expect(snap.values['a']).toBe(1);
    expect(snap.values['b']).toBe(2);
    expect(snap.version).toBe(0);
  });

  it('accepts explicit version', () => {
    const snap = buildSnapshot({ x: 'y' }, 7);
    expect(snap.version).toBe(7);
  });

  it('returns frozen objects', () => {
    const snap = buildSnapshot({ k: 'v' });
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.values)).toBe(true);
  });
});
