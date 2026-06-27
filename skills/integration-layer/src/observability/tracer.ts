/**
 * Distributed tracing interfaces (ITracer, ISpan, SpanContext).
 * Ships with NoopTracer for environments that don't need trace export.
 * Wire a real OpenTelemetry implementation by satisfying ITracer at the call site.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpanContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
}

export interface ISpan {
  context(): SpanContext;
  setTag(key: string, value: string | number | boolean): void;
  setError(error: Error): void;
  finish(endTimeMs?: number): void;
}

export interface ITracer {
  startSpan(name: string, parent?: SpanContext): ISpan;
  inject(span: ISpan): Record<string, string>;
  extract(carrier: Record<string, string>): SpanContext | undefined;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _makeId(): string {
  const r = (): string => Math.trunc(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${r()}${r()}`;
}

// ─── NoopSpan ────────────────────────────────────────────────────────────────

export class NoopSpan implements ISpan {
  private readonly _ctx: SpanContext;

  constructor(traceId: string, spanId: string, parentSpanId?: string) {
    this._ctx = Object.freeze({ traceId, spanId, parentSpanId });
  }

  context(): SpanContext { return this._ctx; }
  setTag(_key: string, _value: string | number | boolean): void { /* no-op */ }
  setError(_error: Error): void { /* no-op */ }
  finish(_endTimeMs?: number): void { /* no-op */ }
}

// ─── NoopTracer ───────────────────────────────────────────────────────────────

export class NoopTracer implements ITracer {
  startSpan(name: string, parent?: SpanContext): ISpan {
    const traceId = parent?.traceId ?? _makeId();
    const spanId = _makeId();
    return new NoopSpan(traceId, spanId, parent?.spanId);
  }

  inject(span: ISpan): Record<string, string> {
    const ctx = span.context();
    const carrier: Record<string, string> = {
      'x-trace-id': ctx.traceId,
      'x-span-id': ctx.spanId,
    };
    if (ctx.parentSpanId) {
      carrier['x-parent-span-id'] = ctx.parentSpanId;
    }
    return carrier;
  }

  extract(carrier: Record<string, string>): SpanContext | undefined {
    const traceId = carrier['x-trace-id'];
    const spanId = carrier['x-span-id'];
    if (!traceId || !spanId) return undefined;
    return Object.freeze({
      traceId,
      spanId,
      parentSpanId: carrier['x-parent-span-id'],
    });
  }
}
