/**
 * Tests for Memory System — covers all public functions with positive,
 * negative, and edge-case scenarios.
 */

import memorySystem, {
  store,
  get,
  update,
  expire,
  importItems,
  search,
  restoreContext,
  summarize,
  handoff,
  prune,
  reScore,
  stats,
  validate,
  type StoreInput,
} from '../src/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<StoreInput> = {}): StoreInput {
  return {
    tier: 'short-term',
    scope: 'global',
    key: 'test:unit:preference',
    value: 'test-value',
    tags: ['test', 'unit'],
    source: 'test-skill',
    metadata: { env: 'test' },
    ...overrides,
  };
}

// ─── validate ─────────────────────────────────────────────────────────────────

describe('validate', () => {
  test('returns valid for a complete input', () => {
    const result = validate(makeInput());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns error when tier is missing', () => {
    const result = validate(makeInput({ tier: undefined as never }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'tier')).toBe(true);
  });

  test('returns error when tier is invalid', () => {
    const result = validate(makeInput({ tier: 'permanent' as never }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_TIER')).toBe(true);
  });

  test('returns error when scope is missing', () => {
    const result = validate(makeInput({ scope: undefined as never }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'scope')).toBe(true);
  });

  test('returns error when key is empty', () => {
    const result = validate(makeInput({ key: '' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'key')).toBe(true);
  });

  test('returns error when key exceeds 256 characters', () => {
    const result = validate(makeInput({ key: 'a'.repeat(257) }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'KEY_TOO_LONG')).toBe(true);
  });

  test('returns error when value is undefined', () => {
    const result = validate(makeInput({ value: undefined as never }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'value')).toBe(true);
  });

  test('returns error when source is empty', () => {
    const result = validate(makeInput({ source: '' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'source')).toBe(true);
  });

  test('returns error when scope is project but projectId is missing', () => {
    const result = validate(makeInput({ scope: 'project' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCOPE_MISMATCH')).toBe(true);
  });

  test('returns error when scope is session but sessionId is missing', () => {
    const result = validate(makeInput({ scope: 'session' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'SCOPE_MISMATCH')).toBe(true);
  });

  test('returns warning when tags are empty', () => {
    const result = validate(makeInput({ tags: [] }));
    expect(result.warnings.some((w) => w.field === 'tags')).toBe(true);
  });
});

// ─── store ────────────────────────────────────────────────────────────────────

describe('store', () => {
  test('stores and returns a valid item', () => {
    const item = store(makeInput());
    expect(item.id).toMatch(/^ms-/);
    expect(item.key).toBe('test:unit:preference');
    expect(item.value).toBe('test-value');
    expect(item.qualityScore).toBeGreaterThan(0);
  });

  test('normalizes tags to lowercase', () => {
    const item = store(makeInput({ tags: ['UPPER', 'Mixed'] }));
    expect(item.tags).toEqual(['upper', 'mixed']);
  });

  test('sets expiresAt when ttlSeconds is provided', () => {
    const item = store(makeInput({ ttlSeconds: 3600 }));
    expect(item.expiresAt).toBeDefined();
    const expiresIn = new Date(item.expiresAt!).getTime() - Date.now();
    expect(expiresIn).toBeGreaterThan(3590 * 1000);
    expect(expiresIn).toBeLessThan(3610 * 1000);
  });

  test('does not set expiresAt when ttlSeconds is not provided', () => {
    const item = store(makeInput({ tier: 'long-term' }));
    expect(item.expiresAt).toBeUndefined();
  });

  test('throws VALIDATION_FAILED for invalid input', () => {
    expect(() => store(makeInput({ key: '' }))).toThrow('VALIDATION_FAILED');
  });

  test('stores an object value', () => {
    const value = { color: '#ff4d00', mood: 'neon' };
    const item = store(makeInput({ value }));
    expect(item.value).toEqual(value);
  });

  test('stores a session-scoped item with sessionId', () => {
    const item = store(makeInput({ scope: 'session', sessionId: 'sess-001' }));
    expect(item.scope).toBe('session');
    expect(item.sessionId).toBe('sess-001');
  });
});

// ─── get ──────────────────────────────────────────────────────────────────────

describe('get', () => {
  test('retrieves a stored item by id', () => {
    const stored = store(makeInput());
    const retrieved = get(stored.id);
    expect(retrieved.id).toBe(stored.id);
    expect(retrieved.value).toBe('test-value');
  });

  test('throws NOT_FOUND for unknown id', () => {
    expect(() => get('ms-nonexistent')).toThrow('NOT_FOUND');
  });

  test('throws EXPIRED for an expired item', () => {
    const item = store(makeInput({ ttlSeconds: -1 }));
    expect(() => get(item.id)).toThrow('EXPIRED');
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('update', () => {
  test('patches value and updates updatedAt', () => {
    const stored = store(makeInput());
    const updated = update(stored.id, { value: 'new-value' });
    expect(updated.value).toBe('new-value');
    expect(updated.updatedAt).not.toBe(stored.updatedAt);
  });

  test('preserves immutable fields', () => {
    const stored = store(makeInput());
    const updated = update(stored.id, { value: 'changed' });
    expect(updated.id).toBe(stored.id);
    expect(updated.tier).toBe(stored.tier);
    expect(updated.scope).toBe(stored.scope);
    expect(updated.createdAt).toBe(stored.createdAt);
  });

  test('normalizes patched tags to lowercase', () => {
    const stored = store(makeInput());
    const updated = update(stored.id, { tags: ['NEWTAG'] });
    expect(updated.tags).toContain('newtag');
  });

  test('throws NOT_FOUND for unknown id', () => {
    expect(() => update('ms-nonexistent', { value: 'x' })).toThrow('NOT_FOUND');
  });
});

// ─── expire ───────────────────────────────────────────────────────────────────

describe('expire', () => {
  test('marks an item as expired immediately', () => {
    const stored = store(makeInput());
    const expired = expire(stored.id);
    expect(expired.expiresAt).toBeDefined();
    expect(new Date(expired.expiresAt!).getTime()).toBeLessThanOrEqual(Date.now());
  });

  test('throws NOT_FOUND for unknown id', () => {
    expect(() => expire('ms-nonexistent')).toThrow('NOT_FOUND');
  });
});

// ─── importItems ──────────────────────────────────────────────────────────────

describe('importItems', () => {
  test('imports a batch of valid items', () => {
    const result = importItems([
      makeInput({ key: 'import:batch:one' }),
      makeInput({ key: 'import:batch:two' }),
    ]);
    expect(result.imported).toBe(2);
    expect(result.failed).toBe(0);
  });

  test('reports per-item errors without aborting the batch', () => {
    const result = importItems([
      makeInput({ key: 'import:valid:item' }),
      makeInput({ key: '' }), // invalid
    ]);
    expect(result.imported).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors[0].index).toBe(1);
  });

  test('handles an empty batch', () => {
    const result = importItems([]);
    expect(result.imported).toBe(0);
    expect(result.failed).toBe(0);
  });
});

// ─── search ───────────────────────────────────────────────────────────────────

describe('search', () => {
  beforeEach(() => {
    store(makeInput({ key: 'search:brand:palette', tags: ['brand', 'color'], value: 'dark neon' }));
    store(makeInput({ key: 'search:brand:mood', tags: ['brand', 'mood'], value: 'cinematic noir' }));
  });

  test('returns matching items for a query', () => {
    const result = search({ query: 'brand palette' });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.totalMatches).toBeGreaterThan(0);
  });

  test('filters by tag', () => {
    const result = search({ query: '', tags: ['color'] });
    expect(result.items.every(({ item }) => item.tags.includes('color'))).toBe(true);
  });

  test('respects limit', () => {
    const result = search({ query: 'brand', limit: 1 });
    expect(result.items.length).toBeLessThanOrEqual(1);
  });

  test('excludes expired items by default', () => {
    const stored = store(makeInput({ key: 'search:expired:item', ttlSeconds: -1 }));
    const result = search({ query: 'expired' });
    expect(result.items.every(({ item }) => item.id !== stored.id)).toBe(true);
  });

  test('includes expired items when requested', () => {
    const stored = store(makeInput({ key: 'search:expired:incl', ttlSeconds: -1 }));
    const result = search({ query: 'expired incl', includeExpired: true });
    expect(result.items.some(({ item }) => item.id === stored.id)).toBe(true);
  });

  test('filters by scope isolation (session)', () => {
    store(makeInput({ scope: 'session', sessionId: 'sess-A', key: 'search:session:a' }));
    store(makeInput({ scope: 'session', sessionId: 'sess-B', key: 'search:session:b' }));
    const result = search({ query: 'search session', scope: 'session', sessionId: 'sess-A' });
    expect(result.items.every(({ item }) => item.sessionId === 'sess-A')).toBe(true);
  });

  test('returns empty results for an unmatched query', () => {
    const result = search({ query: 'zxqwerty12345nonexistent', minQualityScore: 0.9 });
    expect(result.items).toHaveLength(0);
  });
});

// ─── restoreContext ───────────────────────────────────────────────────────────

describe('restoreContext', () => {
  test('restores context for a session scope', () => {
    store(makeInput({ scope: 'session', sessionId: 'restore-sess', key: 'ctx:key:one' }));
    const ctx = restoreContext({ scope: 'session', sessionId: 'restore-sess' });
    expect(ctx.items.length).toBeGreaterThanOrEqual(1);
    expect(ctx.tokenEstimate).toBeGreaterThan(0);
    expect(ctx.restoredAt).toBeTruthy();
  });

  test('returns empty restoration when no items match', () => {
    const ctx = restoreContext({ scope: 'session', sessionId: 'sess-nonexistent' });
    expect(ctx.items).toHaveLength(0);
    expect(ctx.tokenEstimate).toBe(0);
  });
});

// ─── summarize ────────────────────────────────────────────────────────────────

describe('summarize', () => {
  test('returns a non-empty summary for a populated session', () => {
    store(makeInput({ scope: 'session', sessionId: 'sum-sess', key: 'summary:key:one', value: 'important info' }));
    const summary = summarize({ scope: 'session', sessionId: 'sum-sess' });
    expect(summary.text.length).toBeGreaterThan(0);
    expect(summary.itemCount).toBeGreaterThanOrEqual(1);
    expect(summary.tokenEstimate).toBeGreaterThan(0);
  });

  test('returns empty summary for an empty scope', () => {
    const summary = summarize({ scope: 'session', sessionId: 'sess-empty-sum' });
    expect(summary.itemCount).toBe(0);
  });
});

// ─── handoff ──────────────────────────────────────────────────────────────────

describe('handoff', () => {
  test('transfers session memory between skills', () => {
    store(makeInput({ scope: 'session', sessionId: 'h-sess', key: 'handoff:key:a', source: 'skill-a' }));
    const receipt = handoff({ fromSkill: 'skill-a', toSkill: 'skill-b', sessionId: 'h-sess' });
    expect(receipt.transferred).toBeGreaterThan(0);
    expect(receipt.failed).toHaveLength(0);
    expect(receipt.handoffId).toMatch(/^ms-/);
  });

  test('reports failure for a missing key', () => {
    const receipt = handoff({
      fromSkill: 'skill-x',
      toSkill: 'skill-y',
      sessionId: 'h-sess-missing',
      keys: ['nonexistent:key'],
    });
    expect(receipt.transferred).toBe(0);
    expect(receipt.failed).toContain('nonexistent:key');
  });
});

// ─── prune ────────────────────────────────────────────────────────────────────

describe('prune', () => {
  test('dry run reports candidates without removing them', () => {
    store(makeInput({ key: 'prune:expired:dryrun', ttlSeconds: -1 }));
    const sizeBefore = stats().totalItems;
    const report = prune({ expiredOnly: true, dryRun: true });
    expect(report.dryRun).toBe(true);
    expect(report.removed).toBe(0);
    expect(stats().totalItems).toBe(sizeBefore);
    expect(report.candidates.length).toBeGreaterThan(0);
  });

  test('removes expired items in live mode', () => {
    store(makeInput({ key: 'prune:expired:live', ttlSeconds: -1 }));
    const report = prune({ expiredOnly: true, dryRun: false });
    expect(report.dryRun).toBe(false);
    expect(report.removed).toBeGreaterThan(0);
  });

  test('removes below-threshold items when expiredOnly is false', () => {
    store(makeInput({ key: 'prune:lowq:item', tags: [], metadata: {} }));
    const report = prune({ expiredOnly: false, minQualityScore: 0.99, dryRun: false });
    expect(report.removed).toBeGreaterThan(0);
  });
});

// ─── reScore ──────────────────────────────────────────────────────────────────

describe('reScore', () => {
  test('returns the count of rescored items', () => {
    store(makeInput({ key: 'rescore:item:a' }));
    const count = reScore();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── stats ────────────────────────────────────────────────────────────────────

describe('stats', () => {
  test('returns aggregate statistics', () => {
    store(makeInput({ key: 'stats:item:one' }));
    const s = stats();
    expect(s.totalItems).toBeGreaterThan(0);
    expect(s.avgQualityScore).toBeGreaterThanOrEqual(0);
    expect(s.avgQualityScore).toBeLessThanOrEqual(1);
    expect(typeof s.byTier['short-term']).toBe('number');
    expect(typeof s.byScope['global']).toBe('number');
    expect(s.lastIndexedAt).toBeTruthy();
  });
});

// ─── Default export ───────────────────────────────────────────────────────────

describe('default export', () => {
  test('exposes all public functions', () => {
    expect(typeof memorySystem.store).toBe('function');
    expect(typeof memorySystem.get).toBe('function');
    expect(typeof memorySystem.update).toBe('function');
    expect(typeof memorySystem.expire).toBe('function');
    expect(typeof memorySystem.importItems).toBe('function');
    expect(typeof memorySystem.search).toBe('function');
    expect(typeof memorySystem.restoreContext).toBe('function');
    expect(typeof memorySystem.summarize).toBe('function');
    expect(typeof memorySystem.handoff).toBe('function');
    expect(typeof memorySystem.prune).toBe('function');
    expect(typeof memorySystem.reScore).toBe('function');
    expect(typeof memorySystem.stats).toBe('function');
    expect(typeof memorySystem.validate).toBe('function');
  });
});
