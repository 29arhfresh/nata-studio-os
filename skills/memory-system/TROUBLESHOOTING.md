# Troubleshooting — Memory System

Failure mode diagnosis and recovery strategies for every common problem.

---

## Write Failures

### `VALIDATION_FAILED`

**Symptom**: `store()` or `update()` throws `Error: VALIDATION_FAILED: <field messages>`.

**Causes**:
- Required field (`tier`, `scope`, `key`, `value`, `source`) is empty or missing.
- `tier` is not one of the allowed `MemoryTier` values.
- `scope` is not one of the allowed `MemoryScope` values.
- `key` exceeds 256 characters.
- `projectId` is absent when `scope` is `project`.
- `sessionId` is absent when `scope` is `session`.

**Diagnosis**:
```typescript
const result = memorySystem.validate(yourInput);
console.log(result.errors);   // which fields failed
console.log(result.warnings); // advisory issues
```

**Recovery**:
1. Read each error's `field` and `message`.
2. Correct the failing field.
3. Re-run `validate()` until `result.isValid === true`, then call `store()`.

---

### `SCOPE_MISMATCH`

**Symptom**: `store()` throws `Error: SCOPE_MISMATCH: projectId required for project scope`.

**Cause**: `scope: 'project'` was set but `projectId` was omitted (or vice versa for `session`).

**Recovery**:
```typescript
memorySystem.store({
  ...input,
  scope: 'project',
  projectId: 'proj-your-project-id', // add the missing ID
});
```

---

### `KEY_TOO_LONG`

**Symptom**: `store()` throws `Error: KEY_TOO_LONG: key must be ≤256 characters`.

**Recovery**: Shorten the key. Use a structured format such as `domain:entity:attribute` (e.g., `brand:palette:v2`).

---

## Read Failures

### `NOT_FOUND`

**Symptom**: `get()` throws `Error: NOT_FOUND: No item with id "ms-..."`.

**Causes**:
- The item was never stored (a previous `store()` call failed).
- The item expired (TTL elapsed) and has been pruned.
- The ID was miscopied or truncated.
- The in-memory store was reset between sessions.

**Diagnosis**:
```typescript
// Search by key to find the correct ID
const results = memorySystem.search({
  query: 'your-expected-key',
  includeExpired: true,
  limit: 5,
});
console.log(results.items.map((r) => ({ id: r.item.id, key: r.item.key, expired: !!r.item.expiresAt })));
```

**Recovery**:
- If found with `includeExpired: true`, the item expired. Recreate it with `store()`.
- If not found at all, the store was reset. Re-store the item from its source.

---

### `EXPIRED`

**Symptom**: `get()` throws `Error: EXPIRED: Item "ms-..." expired at <timestamp>`.

**Cause**: The item's `ttlSeconds` elapsed and the item is no longer active.

**Recovery**:
```typescript
// To access an expired item (read-only):
const result = memorySystem.search({
  query: 'your-key',
  includeExpired: true,
});

// To recreate it with a fresh TTL:
memorySystem.store({ ...originalInput, ttlSeconds: 7200 });
```

---

## Search Failures

### Empty Results When Items Exist

**Symptom**: `search()` returns `items: []` and `totalMatches: 0`, but the item was stored successfully.

**Causes**:
- Item is expired and `includeExpired` is false (default).
- Scope filters (`sessionId`, `projectId`) do not match the stored item.
- Tags filter is too restrictive.
- `minQualityScore` is too high.

**Diagnosis**:
```typescript
// Broadest possible search — no filters, include expired
const broad = memorySystem.search({
  query: 'your-key',
  includeExpired: true,
  minQualityScore: 0,
  limit: 20,
});
console.log(broad.items.map((r) => ({
  id: r.item.id,
  key: r.item.key,
  scope: r.item.scope,
  sessionId: r.item.sessionId,
  expired: !!r.item.expiresAt,
})));
```

**Recovery**:
1. If items appear with `includeExpired: true`: the item has expired — recreate it.
2. If items appear in a different scope: check that `sessionId` or `projectId` matches.
3. If no items appear at all: confirm the original `store()` call succeeded and the returned `id` was non-empty.

---

### Low-Relevance Results

**Symptom**: `search()` returns items with near-zero `relevanceScore` that are not useful.

**Causes**:
- Query terms do not appear in the item's `key`, `value`, or `tags`.
- Query is too short or generic.

**Recovery**:
1. Use longer, more specific queries: `'brand color palette dark neon approved'` instead of `'palette'`.
2. Switch to `strategy: 'tag-match'` and supply the exact tags.
3. Add more descriptive tags to the stored items, then call `reScore()`.

---

## Handoff Failures

### `HANDOFF_FAILED`

**Symptom**: `handoff()` returns `result.failed` containing one or more key names.

**Causes**:
- The listed key does not exist in the source Skill's namespace.
- The key exists but is expired.
- The target Skill namespace is locked (active write in progress).

**Diagnosis**:
```typescript
// Confirm all keys exist in the source session
const check = memorySystem.search({
  query: '',
  scope: 'session',
  sessionId: 'sess-your-id',
  limit: 100,
});
const existingKeys = new Set(check.items.map((r) => r.item.key));
const missingKeys = ['key1', 'key2'].filter((k) => !existingKeys.has(k));
console.log('Missing keys:', missingKeys);
```

**Recovery**:
- Re-store any missing keys in the source session, then retry `handoff()`.
- If the key exists but is expired, recreate it with a fresh TTL before handing off.

---

## Prune Failures

### Unexpected Items Removed

**Symptom**: After `prune()`, items that should have been retained are missing.

**Prevention**: Always run `prune({ dryRun: true })` first and review the candidate list before applying.

**Recovery**:
1. Check `prune()` report: was the item in `skipped` or `removed`?
2. If it was in `removed` and should not have been, recreate it from its source.
3. Reduce `minQualityScore` threshold in future prune calls to protect more items.

---

### Prune Returns 0 Removed

**Symptom**: `prune()` returns `removed: 0` but you expect items to be eligible.

**Causes**:
- All eligible items are still referenced by an active session or pending handoff.
- `expiredOnly: true` is set but no items have passed their TTL yet.
- The `tier` and `scope` filters are too narrow.

**Diagnosis**:
```typescript
const dryRun = memorySystem.prune({
  expiredOnly: false,
  minQualityScore: 0.3,
  dryRun: true,
});
console.log(`Candidates: ${dryRun.candidates.length}`);
dryRun.candidates.forEach((c) => console.log(`  ${c.key} — ${c.reason}`));
```

---

## Summarization Issues

### Empty `summarize()` Output

**Symptom**: `summarize()` returns `text: ''` and `itemCount: 0`.

**Cause**: `search()` returned no results for the specified scope, session, or project.

**Recovery**:
1. Run `search()` directly with the same scope parameters to confirm items exist.
2. Check that `sessionId` or `projectId` is correct.
3. Verify the store has not been reset (in-memory mode loses state between process restarts).

---

### `tokenEstimate` Exceeds Budget

**Symptom**: `summarize()` returns a `tokenEstimate` above 4000.

**Cause**: The scope contains many large items that together exceed the token ceiling.

**Recovery**:
- Reduce `maxItems` in the `summarize()` call.
- Apply tag filters in the underlying search to narrow the result set.
- Promote only the most critical items to long-term memory; prune low-quality session items before summarizing.

---

## Quality and Scoring

### All Items Show Low `qualityScore`

**Symptom**: `stats()` shows `avgQualityScore` below 0.4.

**Cause**: Items were stored without tags, metadata, or detailed values.

**Recovery**:
```typescript
// Update items with richer metadata and tags, then re-score
memorySystem.update(item.id, {
  tags: ['brand', 'approved', 'color'],
  metadata: { approvedBy: 'creative-director', approvedAt: '2026-06-26' },
});
const rescored = memorySystem.reScore();
console.log(`Re-scored ${rescored} items`);
const updated = memorySystem.stats();
console.log(updated.avgQualityScore);
```
