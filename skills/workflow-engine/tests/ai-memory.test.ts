import { AIMemory } from '../src/ai-memory';
import type { MemoryRecord } from '../src/phase-b-types';

describe('AIMemory', () => {
  let mem: AIMemory;

  beforeEach(() => {
    mem = new AIMemory();
  });

  const base: Omit<MemoryRecord, 'id' | 'createdAt'> = {
    key: 'myKey',
    value: 'myValue',
    tier: 'short-term',
    tags: [],
  };

  it('store generates a unique id with prefix mem-', () => {
    const rec = mem.store(base);
    expect(rec.id).toMatch(/^mem-[0-9a-f-]{36}$/);
  });

  it('store sets createdAt to a recent timestamp', () => {
    const before = Date.now();
    const rec = mem.store(base);
    expect(rec.createdAt).toBeGreaterThanOrEqual(before);
    expect(rec.createdAt).toBeLessThanOrEqual(Date.now());
  });

  it('store returns the completed record including id and createdAt', () => {
    const rec = mem.store(base);
    expect(rec.id).toBeDefined();
    expect(rec.createdAt).toBeDefined();
    expect(rec.key).toBe('myKey');
    expect(rec.value).toBe('myValue');
  });

  it('retrieve with no query returns all records', () => {
    mem.store(base);
    mem.store({ ...base, key: 'other' });
    expect(mem.retrieve({})).toHaveLength(2);
  });

  it('retrieve with key filter returns only matching records', () => {
    mem.store(base);
    mem.store({ ...base, key: 'other' });
    expect(mem.retrieve({ key: 'myKey' })).toHaveLength(1);
  });

  it('retrieve with tier filter returns only matching records', () => {
    mem.store({ ...base, tier: 'short-term' });
    mem.store({ ...base, tier: 'long-term' });
    const results = mem.retrieve({ tier: 'long-term' });
    expect(results).toHaveLength(1);
    expect(results[0].tier).toBe('long-term');
  });

  it('retrieve with tags filter uses intersection matching', () => {
    mem.store({ ...base, tags: ['a', 'b'] });
    mem.store({ ...base, tags: ['a'] });
    mem.store({ ...base, tags: ['c'] });
    expect(mem.retrieve({ tags: ['a', 'b'] })).toHaveLength(1);
  });

  it('retrieve with scope filter returns only records with that scope', () => {
    mem.store({ ...base, scope: 'proj-1' });
    mem.store({ ...base, scope: 'proj-2' });
    const results = mem.retrieve({ scope: 'proj-1' });
    expect(results).toHaveLength(1);
    expect(results[0].scope).toBe('proj-1');
  });

  it('retrieve with limit caps the result count', () => {
    mem.store(base);
    mem.store(base);
    mem.store(base);
    expect(mem.retrieve({ limit: 2 })).toHaveLength(2);
  });

  it('retrieve returns records in createdAt ascending order', () => {
    const r1 = mem.store({ ...base, key: 'first' });
    const r2 = mem.store({ ...base, key: 'second' });
    const results = mem.retrieve({});
    expect(results[0].id).toBe(r1.id);
    expect(results[1].id).toBe(r2.id);
  });

  it('get(key) returns the most recently created record for that key', () => {
    mem.store({ ...base, key: 'k', value: 'old' });
    mem.store({ ...base, key: 'k', value: 'new' });
    expect(mem.get('k')?.value).toBe('new');
  });

  it('get(key, scope) returns the most recently created record for that key and scope', () => {
    mem.store({ ...base, key: 'k', scope: 'proj-1', value: 'p1' });
    mem.store({ ...base, key: 'k', scope: 'proj-2', value: 'p2' });
    expect(mem.get('k', 'proj-1')?.value).toBe('p1');
  });

  it('get returns undefined for an unknown key', () => {
    expect(mem.get('ghost')).toBeUndefined();
  });

  it('delete removes the record by id', () => {
    const rec = mem.store(base);
    mem.delete(rec.id);
    expect(mem.retrieve({})).toHaveLength(0);
  });

  it('delete throws MEMORY_RECORD_NOT_FOUND for an unknown id', () => {
    expect(() => mem.delete('mem-ghost')).toThrow('MEMORY_RECORD_NOT_FOUND');
  });

  it('prune removes records whose ttlMs has elapsed', async () => {
    mem.store({ ...base, ttlMs: 1 });
    await new Promise((r) => setTimeout(r, 5));
    const pruned = mem.prune();
    expect(pruned).toBe(1);
    expect(mem.retrieve({})).toHaveLength(0);
  });

  it('prune does not remove records without ttlMs', () => {
    mem.store(base);
    mem.prune();
    expect(mem.retrieve({})).toHaveLength(1);
  });

  it('prune returns the count of removed records', async () => {
    mem.store({ ...base, ttlMs: 1 });
    mem.store({ ...base, ttlMs: 1 });
    mem.store(base);
    await new Promise((r) => setTimeout(r, 5));
    expect(mem.prune()).toBe(2);
  });

  it('reader(scope) returns a MemoryReader scoped to that scope', () => {
    mem.store({ ...base, key: 'k', scope: 'proj-1' });
    mem.store({ ...base, key: 'k', scope: 'proj-2' });
    const reader = mem.reader('proj-1');
    expect(reader.retrieve({})).toHaveLength(1);
  });

  it('MemoryReader.retrieve delegates to AIMemory.retrieve with the pre-bound scope', () => {
    mem.store({ ...base, key: 'k', scope: 'proj-1' });
    mem.store({ ...base, key: 'k', scope: 'proj-2' });
    const reader = mem.reader('proj-1');
    const results = reader.retrieve({ key: 'k' });
    expect(results).toHaveLength(1);
    expect(results[0].scope).toBe('proj-1');
  });

  it('MemoryReader.get delegates to AIMemory.get with the pre-bound scope', () => {
    mem.store({ ...base, key: 'k', scope: 'proj-1', value: 'val1' });
    mem.store({ ...base, key: 'k', scope: 'proj-2', value: 'val2' });
    const reader = mem.reader('proj-1');
    expect(reader.get('k')?.value).toBe('val1');
  });

  it('MemoryReader exposes no store, delete, prune, clear, or clearAll methods', () => {
    const reader = mem.reader('proj-1');
    expect((reader as unknown as Record<string, unknown>)['store']).toBeUndefined();
    expect((reader as unknown as Record<string, unknown>)['delete']).toBeUndefined();
    expect((reader as unknown as Record<string, unknown>)['prune']).toBeUndefined();
    expect((reader as unknown as Record<string, unknown>)['clear']).toBeUndefined();
    expect((reader as unknown as Record<string, unknown>)['clearAll']).toBeUndefined();
  });

  it('clear(scope) removes all records with that scope', () => {
    mem.store({ ...base, scope: 'proj-1' });
    mem.store({ ...base, scope: 'proj-1' });
    mem.store({ ...base, scope: 'proj-2' });
    mem.clear('proj-1');
    expect(mem.retrieve({})).toHaveLength(1);
    expect(mem.retrieve({})[0].scope).toBe('proj-2');
  });

  it('clear(undefined) removes all records with no scope set', () => {
    mem.store(base);
    mem.store({ ...base, scope: 'proj-1' });
    mem.clear(undefined);
    expect(mem.retrieve({})).toHaveLength(1);
    expect(mem.retrieve({})[0].scope).toBe('proj-1');
  });

  it('clearAll removes all records regardless of scope', () => {
    mem.store(base);
    mem.store({ ...base, scope: 'proj-1' });
    mem.clearAll();
    expect(mem.retrieve({})).toHaveLength(0);
  });
});
