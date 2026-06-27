/**
 * IMetricsCollector — counter, gauge, and histogram interfaces.
 * Ships with InMemoryMetrics (tests / dev) and NoopMetrics (silent contexts).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface MetricSnapshot {
  readonly name: string;
  readonly type: MetricType;
  readonly value: number;
  readonly labels: Readonly<Record<string, string>>;
  readonly timestamp: number;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMetricsCollector {
  increment(name: string, labels?: Record<string, string>): void;
  gauge(name: string, value: number, labels?: Record<string, string>): void;
  histogram(name: string, value: number, labels?: Record<string, string>): void;
  snapshot(): MetricSnapshot[];
  reset(): void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _key(name: string, labels: Record<string, string>): string {
  const sorted = Object.keys(labels)
    .sort()
    .map((k) => `${k}=${labels[k]}`)
    .join(',');
  return sorted ? `${name}{${sorted}}` : name;
}

// ─── InMemoryMetrics ─────────────────────────────────────────────────────────

interface _Entry {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  updatedAt: number;
}

export class InMemoryMetrics implements IMetricsCollector {
  private readonly _store = new Map<string, _Entry>();

  increment(name: string, labels: Record<string, string> = {}): void {
    this._mutate(name, 'counter', labels, (prev) => prev + 1, 1);
  }

  gauge(name: string, value: number, labels: Record<string, string> = {}): void {
    this._mutate(name, 'gauge', labels, () => value, value);
  }

  histogram(name: string, value: number, labels: Record<string, string> = {}): void {
    this._mutate(name, 'histogram', labels, (prev) => prev + value, value);
  }

  snapshot(): MetricSnapshot[] {
    return [...this._store.values()].map((e) => ({
      name: e.name,
      type: e.type,
      value: e.value,
      labels: Object.freeze({ ...e.labels }),
      timestamp: e.updatedAt,
    }));
  }

  reset(): void {
    this._store.clear();
  }

  private _mutate(
    name: string,
    type: MetricType,
    labels: Record<string, string>,
    update: (prev: number) => number,
    initial: number
  ): void {
    const k = _key(name, labels);
    const existing = this._store.get(k);
    this._store.set(k, {
      name,
      type,
      value: existing !== undefined ? update(existing.value) : initial,
      labels,
      updatedAt: Date.now(),
    });
  }
}

// ─── NoopMetrics ─────────────────────────────────────────────────────────────

export class NoopMetrics implements IMetricsCollector {
  increment(_name: string, _labels?: Record<string, string>): void { /* no-op */ }
  gauge(_name: string, _value: number, _labels?: Record<string, string>): void { /* no-op */ }
  histogram(_name: string, _value: number, _labels?: Record<string, string>): void { /* no-op */ }
  snapshot(): MetricSnapshot[] { return []; }
  reset(): void { /* no-op */ }
}
