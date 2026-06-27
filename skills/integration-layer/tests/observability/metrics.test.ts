import { InMemoryMetrics, NoopMetrics } from '../../src/observability/metrics';

describe('NoopMetrics', () => {
  const m = new NoopMetrics();

  it('does not throw for any operation', () => {
    expect(() => m.increment('counter')).not.toThrow();
    expect(() => m.gauge('gauge', 3.14)).not.toThrow();
    expect(() => m.histogram('hist', 100)).not.toThrow();
    expect(() => m.reset()).not.toThrow();
  });

  it('snapshot always returns empty array', () => {
    m.increment('x');
    expect(m.snapshot()).toHaveLength(0);
  });
});

describe('InMemoryMetrics', () => {
  describe('increment', () => {
    it('starts counter at 1 and accumulates', () => {
      const m = new InMemoryMetrics();
      m.increment('reqs');
      m.increment('reqs');
      m.increment('reqs');
      const snap = m.snapshot();
      expect(snap).toHaveLength(1);
      expect(snap[0].name).toBe('reqs');
      expect(snap[0].type).toBe('counter');
      expect(snap[0].value).toBe(3);
    });

    it('tracks separate label combinations independently', () => {
      const m = new InMemoryMetrics();
      m.increment('errors', { skill: 'memory-system' });
      m.increment('errors', { skill: 'creative-director' });
      m.increment('errors', { skill: 'memory-system' });
      const snaps = m.snapshot();
      expect(snaps).toHaveLength(2);
      const ms = snaps.find((s) => s.labels['skill'] === 'memory-system');
      expect(ms?.value).toBe(2);
    });
  });

  describe('gauge', () => {
    it('always reflects the latest set value', () => {
      const m = new InMemoryMetrics();
      m.gauge('cpu', 0.5);
      m.gauge('cpu', 0.9);
      const snap = m.snapshot().find((s) => s.name === 'cpu');
      expect(snap?.value).toBe(0.9);
      expect(snap?.type).toBe('gauge');
    });
  });

  describe('histogram', () => {
    it('accumulates observed values', () => {
      const m = new InMemoryMetrics();
      m.histogram('latency_ms', 100);
      m.histogram('latency_ms', 200);
      m.histogram('latency_ms', 50);
      const snap = m.snapshot().find((s) => s.name === 'latency_ms');
      expect(snap?.value).toBe(350);
      expect(snap?.type).toBe('histogram');
    });
  });

  describe('reset', () => {
    it('clears all metrics', () => {
      const m = new InMemoryMetrics();
      m.increment('x');
      m.gauge('y', 1);
      m.reset();
      expect(m.snapshot()).toHaveLength(0);
    });
  });

  describe('snapshot', () => {
    it('returns frozen snapshots', () => {
      const m = new InMemoryMetrics();
      m.increment('n');
      const snap = m.snapshot();
      expect(Object.isFrozen(snap[0].labels)).toBe(true);
    });

    it('includes a timestamp', () => {
      const m = new InMemoryMetrics();
      const before = Date.now();
      m.increment('t');
      const after = Date.now();
      const snap = m.snapshot()[0];
      expect(snap.timestamp).toBeGreaterThanOrEqual(before);
      expect(snap.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('label key sorting', () => {
    it('treats same labels in different order as the same metric', () => {
      const m = new InMemoryMetrics();
      m.increment('c', { b: '2', a: '1' });
      m.increment('c', { a: '1', b: '2' });
      expect(m.snapshot()).toHaveLength(1);
      expect(m.snapshot()[0].value).toBe(2);
    });
  });
});
