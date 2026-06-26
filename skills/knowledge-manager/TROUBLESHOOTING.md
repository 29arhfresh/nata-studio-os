# Troubleshooting — Knowledge Manager

Failure mode diagnosis and recovery strategies for every common problem.

---

## Write Failures

### `VALIDATION_FAILED`

**Symptom**: `create()` or `update()` throws `Error: VALIDATION_FAILED: <field messages>`.

**Causes**:
- Required field (`title`, `content`, `type`, `author`) is empty or missing.
- Content is an empty string or whitespace only.
- Type is not one of the allowed `KnowledgeType` values.

**Diagnosis**:
```typescript
const result = knowledgeManager.validate(yourEntry);
console.log(result.errors);   // see exactly which fields failed
console.log(result.warnings); // see advisory issues
```

**Recovery**:
1. Read each error's `field` and `message`.
2. Correct the corresponding field in the input.
3. Re-run `validate()` until `result.isValid === true`, then call `create()` or `update()`.

---

### `NOT_FOUND`

**Symptom**: `get()`, `update()`, `archive()`, or `getHistory()` throws `Error: NOT_FOUND: No entry with id "..."`.

**Causes**:
- The ID was generated in a previous session but the store was reset (in-memory store).
- The ID was miscopied or truncated.
- The entry was never created (a previous `create()` call failed silently).

**Diagnosis**:
```typescript
const s = knowledgeManager.stats();
console.log(s.totalEntries); // confirm entries exist

// Search by title to find the correct ID
const results = knowledgeManager.search({ query: 'Expected Entry Title' });
console.log(results.entries.map((r) => r.entry.id));
```

**Recovery**:
- Use the correct ID returned by `search()`.
- If the store was reset (in-memory), re-import the data or rebuild from source.

---

## Search Failures

### Empty Results When Entries Exist

**Symptom**: `search()` returns `entries: []` and `totalMatches: 0`, but you know matching entries exist.

**Causes**:
- Query terms do not appear in the entry's `title`, `content`, or `tags`.
- Entries are in `archived` status and `includeArchived` is not set.
- `minQualityScore` is too high and filtering out all candidates.
- Tag filters are too restrictive.

**Diagnosis**:
```typescript
// Broaden the search: no tag filter, no quality floor, include archived
const broad = knowledgeManager.search({
  query: 'your query',
  includeArchived: true,
  minQualityScore: 0,
  limit: 20,
});
console.log(broad.entries.map((r) => ({ id: r.entry.id, score: r.relevanceScore, title: r.entry.title })));
```

**Recovery**:
1. If results appear with `includeArchived: true`, the entry is archived. Archive status is intentional — restore by calling `update()` to set `status: 'active'`.
2. If results appear with `minQualityScore: 0`, raise the entry's quality by adding tags, content, and citations, then call `reScore()`.
3. If no results in any configuration, check that the entry's content actually contains the query terms.

---

### Low-Relevance Results

**Symptom**: `search()` returns entries, but their `relevanceScore` values are near zero and the content is not useful.

**Causes**:
- Query is too short or too generic (e.g., `"video"`).
- The correct entries exist but use different terminology than the query.

**Recovery**:
1. Use longer, more specific queries: `"camera shot framing close-up portrait"` instead of `"shots"`.
2. Add tags to the target entries that match the vocabulary you query with.
3. Switch to `strategy: 'tag-match'` if the topic domain is well-tagged.

---

## Import Failures

### `PARSE_ERROR`

**Symptom**: `importEntries()` throws `Error: PARSE_ERROR: Content is not valid JSON`.

**Causes**:
- The content string contains trailing commas, comments, or other non-standard JSON.
- The file was read with incorrect encoding (e.g., UTF-16 instead of UTF-8).
- The content is YAML or CSV passed as `format: 'json'`.

**Recovery**:
```typescript
try {
  JSON.parse(yourContent);
} catch (err) {
  console.error('JSON parse error:', err.message); // shows exact position
}
```
Correct the JSON syntax, then retry.

---

### `PARSE_ERROR: JSON content must be an array`

**Symptom**: `importEntries()` throws this error even though the content is valid JSON.

**Cause**: The JSON root is an object `{}` instead of an array `[]`.

**Recovery**: Wrap the object in an array:
```typescript
const fixed = JSON.stringify([JSON.parse(yourContent)]);
```

---

### High `failed` Count After Import

**Symptom**: `importEntries()` returns `failed > 0` and the error list shows validation failures.

**Causes**:
- Source data is missing required fields (`title`, `content`, `type`, `author`).
- Source data uses type values not in the allowed `KnowledgeType` enum.

**Recovery**:
```typescript
result.errors.forEach(({ line, message }) => {
  console.log(`Fix line ${line}: ${message}`);
});
```
Correct the source data at each reported line, then re-import.

---

## Duplicate Detection

### False Positives in `detectDuplicates()`

**Symptom**: `detectDuplicates()` flags entries as duplicates that are actually distinct.

**Cause**: Entry titles share too many words (Jaccard threshold is 0.85). Example: `"Video Prompt Best Practices"` and `"Image Prompt Best Practices"`.

**Recovery**:
- These are not true duplicates — no action is required.
- Differentiate the titles further to reduce overlap: `"Video Generation Prompt Best Practices"` vs. `"Image Generation Prompt Best Practices"`.

---

### Duplicates Not Detected

**Symptom**: Visually identical entries exist but `detectDuplicates()` returns `hasDuplicates: false`.

**Cause**: Jaccard similarity operates on word sets, not character sequences. Entries with identical meaning but different wording (synonyms) will not be flagged.

**Recovery**: Use `search()` to manually verify before creating a new entry:
```typescript
const results = knowledgeManager.search({ query: 'the entry title you plan to create', limit: 3 });
```
If a near-match appears, update the existing entry instead of creating a new one.

---

## Quality and Scoring

### All Entries Show Low `qualityScore`

**Symptom**: `stats()` shows `avgQualityScore` below 0.5.

**Cause**: Entries were imported without required fields, have no tags, or have very short content.

**Recovery**:
```typescript
// Re-score after enriching entries
knowledgeManager.reScore();
const updated = knowledgeManager.stats();
console.log(updated.avgQualityScore);
```
If the score does not improve, run `validate()` on individual entries to see which fields are triggering warnings.

---

## Tag Management

### `renameTag` Returns 0

**Symptom**: `renameTag('old-tag', 'new-tag', 'author')` returns `0`.

**Cause**: No active entries carry the `old-tag` tag. The tag may already have been renamed, or it was only on archived entries.

**Diagnosis**:
```typescript
const tags = knowledgeManager.listTags(); // only counts active entries
console.log(tags['old-tag']); // undefined = no active entries have this tag
```

**Recovery**: Confirm the exact tag string by inspecting `listTags()`. Tags are case-sensitive and must be lowercase.

---

## Context Assembly

### `assembledText` Is Empty

**Symptom**: `assembleContext()` returns an empty `assembledText` string.

**Cause**: `search()` returned no results for the query.

**Recovery**:
1. Run `search()` directly with the same query to diagnose the search failure (see Search Failures above).
2. Verify the knowledge base has active entries relevant to the topic.

---

### `tokenEstimate` Exceeds Model Context Window

**Symptom**: The assembled context is too large for the target LLM.

**Cause**: The query matched many large entries that together exceed 4000 estimated tokens.

**Recovery**:
- The assembler enforces a 4000-token ceiling and stops adding entries when the budget is reached. If the budget is still exceeded, reduce the `limit` in the underlying `search()` call.
- Add more specific tags to the target entries and use tag filters in the search to narrow the result set.
