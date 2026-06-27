import { NoopSpan, NoopTracer } from '../../src/observability/tracer';

describe('NoopSpan', () => {
  it('returns its SpanContext', () => {
    const span = new NoopSpan('trace-1', 'span-1', 'parent-1');
    const ctx = span.context();
    expect(ctx.traceId).toBe('trace-1');
    expect(ctx.spanId).toBe('span-1');
    expect(ctx.parentSpanId).toBe('parent-1');
  });

  it('context is frozen', () => {
    const span = new NoopSpan('t', 's');
    expect(Object.isFrozen(span.context())).toBe(true);
  });

  it('setTag and setError do not throw', () => {
    const span = new NoopSpan('t', 's');
    expect(() => span.setTag('key', 'value')).not.toThrow();
    expect(() => span.setTag('num', 42)).not.toThrow();
    expect(() => span.setError(new Error('oops'))).not.toThrow();
  });

  it('finish does not throw', () => {
    const span = new NoopSpan('t', 's');
    expect(() => span.finish()).not.toThrow();
    expect(() => span.finish(Date.now())).not.toThrow();
  });
});

describe('NoopTracer', () => {
  const tracer = new NoopTracer();

  it('startSpan returns a NoopSpan', () => {
    const span = tracer.startSpan('test-operation');
    expect(span).toBeInstanceOf(NoopSpan);
    expect(span.context().traceId.length).toBeGreaterThan(0);
    expect(span.context().spanId.length).toBeGreaterThan(0);
  });

  it('child span inherits parent traceId', () => {
    const root = tracer.startSpan('root');
    const child = tracer.startSpan('child', root.context());
    expect(child.context().traceId).toBe(root.context().traceId);
    expect(child.context().parentSpanId).toBe(root.context().spanId);
  });

  it('different spans get different spanIds', () => {
    const a = tracer.startSpan('a');
    const b = tracer.startSpan('b');
    expect(a.context().spanId).not.toBe(b.context().spanId);
  });

  it('inject creates carrier with trace/span headers', () => {
    const span = tracer.startSpan('op');
    const carrier = tracer.inject(span);
    expect(carrier['x-trace-id']).toBe(span.context().traceId);
    expect(carrier['x-span-id']).toBe(span.context().spanId);
  });

  it('inject includes parentSpanId when present', () => {
    const root = tracer.startSpan('root');
    const child = tracer.startSpan('child', root.context());
    const carrier = tracer.inject(child);
    expect(carrier['x-parent-span-id']).toBe(root.context().spanId);
  });

  it('extract reconstructs SpanContext from carrier', () => {
    const span = tracer.startSpan('op');
    const carrier = tracer.inject(span);
    const extracted = tracer.extract(carrier);
    expect(extracted).toBeDefined();
    expect(extracted?.traceId).toBe(span.context().traceId);
    expect(extracted?.spanId).toBe(span.context().spanId);
  });

  it('extract returns undefined for incomplete carrier', () => {
    expect(tracer.extract({})).toBeUndefined();
    expect(tracer.extract({ 'x-trace-id': 'tr' })).toBeUndefined();
  });
});
