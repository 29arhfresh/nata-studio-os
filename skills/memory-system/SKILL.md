# Memory System

## Overview

Memory System is the unified memory layer for Nata Studio OS. It manages four memory tiers — short-term, long-term, project, and session — and exposes a single, consistent API for every Skill that needs to store, retrieve, summarize, or prune memory. All context handoffs between Skills, semantic memory searches, memory quality scoring, memory aging, conversation history, and related-memory retrieval run through this Skill. Business logic is fully independent of the storage layer, making it straightforward to swap the in-memory store for a durable backend.

## Usage

```typescript
import memorySystem from './src/index';

// Store a long-term memory item
const item = memorySystem.store({
  tier: 'long-term',
  scope: 'project',
  key: 'brand:palette:v2',
  value: { colors: ['#0a0a0a', '#ff4d00'], mood: 'neon noir' },
  tags: ['brand', 'color', 'approved'],
  source: 'creative-director',
  projectId: 'proj-001',
  metadata: { approvedAt: '2026-06-27' },
});

// Retrieve with semantic search
const results = memorySystem.search({
  query: 'brand color palette',
  tiers: ['long-term'],
  limit: 5,
});

// Find related memories
const related = memorySystem.findRelated(item.id, { limit: 3 });

// Record and retrieve conversation history
memorySystem.recordTurn({ sessionId: 'sess-001', role: 'user', content: 'What is the brand palette?' });
const history = memorySystem.getHistory({ sessionId: 'sess-001' });

// Assemble a token-budgeted context block for LLM injection
const ctx = memorySystem.assembleContext({
  sessionId: 'sess-001',
  projectId: 'proj-001',
  tokenBudget: 2000,
  query: 'brand style',
});

// Apply time-based aging to quality scores
memorySystem.applyAging({ tiers: ['short-term'] });
```

## Parameters

### `store(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `tier` | `MemoryTier` | Yes | — | Memory tier: `short-term`, `long-term`, `project`, or `session`. |
| `scope` | `MemoryScope` | Yes | — | Isolation scope: `global`, `project`, or `session`. |
| `key` | `string` | Yes | — | Unique key within the scope. Max 256 characters. |
| `value` | `MemoryValue` | Yes | — | The data to store. Any JSON-serializable value. |
| `ttlSeconds` | `number` | No | `undefined` | Seconds until expiry. Omit for permanent storage. |
| `tags` | `string[]` | No | `[]` | Lowercase tags for indexing and filtered retrieval. |
| `source` | `string` | Yes | — | Skill or system that wrote this memory item. |
| `projectId` | `string` | No | `undefined` | Project identifier for `project`-scoped memories. |
| `sessionId` | `string` | No | `undefined` | Session identifier for `session`-scoped memories. |
| `metadata` | `Record<string, unknown>` | No | `{}` | Arbitrary key-value metadata for consumers. |

### `get(id)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `MemoryId` | Yes | — | Stable memory item ID returned by `store()`. |

### `search(query)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | `string` | Yes | — | Plain-language or keyword search string. |
| `tiers` | `MemoryTier[]` | No | all tiers | Restrict results to these memory tiers. |
| `scope` | `MemoryScope` | No | all scopes | Restrict results to this scope. |
| `tags` | `string[]` | No | `[]` | Restrict results to items with at least one matching tag. |
| `limit` | `number` | No | `10` | Maximum items to return. |
| `minQualityScore` | `number` | No | `0` | Minimum quality score (0–1) for inclusion. |
| `includeExpired` | `boolean` | No | `false` | When true, expired items are included in results. |
| `projectId` | `string` | No | `undefined` | Restrict to a specific project. |
| `sessionId` | `string` | No | `undefined` | Restrict to a specific session. |
| `strategy` | `RetrievalStrategy` | No | `'hybrid'` | `exact`, `semantic`, `tag-match`, or `hybrid`. |

### `findRelated(id, options?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `MemoryId` | Yes | — | Anchor item ID to find relatives for. |
| `limit` | `number` | No | `5` | Maximum items to return. |
| `minScore` | `number` | No | `0.1` | Minimum composite similarity score. |
| `tiers` | `MemoryTier[]` | No | all tiers | Restrict to these tiers. |
| `scope` | `MemoryScope` | No | all scopes | Restrict to this scope. |

### `recordTurn(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `sessionId` | `string` | Yes | — | The session this turn belongs to. |
| `role` | `ConversationRole` | Yes | — | `user`, `assistant`, or `system`. |
| `content` | `string` | Yes | — | The turn's text content. |
| `metadata` | `Record<string, unknown>` | No | `{}` | Additional turn metadata. |

### `getHistory(options)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `sessionId` | `string` | Yes | — | The session to retrieve history for. |
| `limit` | `number` | No | `50` | Maximum number of turns to return (most recent). |
| `includeSystem` | `boolean` | No | `true` | When false, system turns are excluded. |

### `assembleContext(options)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `sessionId` | `string` | Yes | — | Session to assemble context for. |
| `projectId` | `string` | No | `undefined` | Include project-scoped memories when provided. |
| `tokenBudget` | `number` | No | `4000` | Maximum token budget across all sections. |
| `includeHistory` | `boolean` | No | `true` | Include conversation history as a section. |
| `historyLimit` | `number` | No | `10` | Maximum history turns to include. |
| `memoryTiers` | `MemoryTier[]` | No | `['long-term']` | Tiers to search for the long-term memory section. |
| `query` | `string` | No | `''` | Search query to rank memory sections. |

### `applyAging(options?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `tiers` | `MemoryTier[]` | No | all tiers | Restrict aging to these tiers. |
| `scope` | `MemoryScope` | No | all scopes | Restrict aging to this scope. |
| `projectId` | `string` | No | `undefined` | Restrict to a specific project. |
| `sessionId` | `string` | No | `undefined` | Restrict to a specific session. |

### `restoreContext(options)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `scope` | `MemoryScope` | Yes | — | The scope to restore context from. |
| `sessionId` | `string` | No | `undefined` | Session ID for session-scoped restoration. |
| `projectId` | `string` | No | `undefined` | Project ID for project-scoped restoration. |
| `limit` | `number` | No | `20` | Maximum items to include in the restored context. |
| `tiers` | `MemoryTier[]` | No | all tiers | Tiers to include during restoration. |

### `summarize(options)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `scope` | `MemoryScope` | Yes | — | The scope to summarize. |
| `sessionId` | `string` | No | `undefined` | Session ID for session-scoped summaries. |
| `projectId` | `string` | No | `undefined` | Project ID for project-scoped summaries. |
| `maxItems` | `number` | No | `50` | Maximum items to include in the summary. |
| `tiers` | `MemoryTier[]` | No | all tiers | Tiers to include. |

### `prune(options?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `expiredOnly` | `boolean` | No | `true` | When true, only removes expired items. |
| `tier` | `MemoryTier` | No | `undefined` | Restrict pruning to this tier. |
| `scope` | `MemoryScope` | No | `undefined` | Restrict pruning to this scope. |
| `minQualityScore` | `number` | No | `undefined` | Remove all items below this quality score. |
| `dryRun` | `boolean` | No | `false` | When true, report what would be pruned without deleting. |

### `handoff(options)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `fromSkill` | `string` | Yes | — | The skill handing off context. |
| `toSkill` | `string` | Yes | — | The skill receiving context. |
| `sessionId` | `string` | Yes | — | Session in which the handoff occurs. |
| `keys` | `string[]` | No | all | Specific memory keys to transfer. |

## Examples

### Minimal — record a conversation and restore context

```typescript
import memorySystem from './src/index';

memorySystem.recordTurn({ sessionId: 'sess-01', role: 'user', content: 'Show me cinematic references.' });
memorySystem.recordTurn({ sessionId: 'sess-01', role: 'assistant', content: 'Here are five references...' });

const history = memorySystem.getHistory({ sessionId: 'sess-01' });
console.log(history.turns.length); // 2

const ctx = memorySystem.assembleContext({ sessionId: 'sess-01', tokenBudget: 1000 });
console.log(ctx.sections[0].label); // 'Conversation History'
```

### Realistic — full cross-skill workflow with aging and related memory

```typescript
import memorySystem from './src/index';

// 1. Store brand style in long-term project memory
const brandItem = memorySystem.store({
  tier: 'long-term',
  scope: 'project',
  key: 'brand:style:v2',
  value: { palette: ['#0a0a0a', '#ff4d00'], mood: 'cinematic neon noir' },
  tags: ['brand', 'style', 'approved'],
  source: 'creative-director',
  projectId: 'proj-nata',
  metadata: { approvedBy: 'art-director', version: 2 },
});

// 2. Find related memories (similar tags / key segments)
const related = memorySystem.findRelated(brandItem.id, { limit: 5 });
console.log(related.items.length); // related items by tag/key/value similarity

// 3. Assemble context for a new LLM call
const ctx = memorySystem.assembleContext({
  sessionId: 'sess-002',
  projectId: 'proj-nata',
  tokenBudget: 2000,
  query: 'brand style palette',
});
// ctx.sections: ['Conversation History', 'Project Context', 'Long-Term Memory']

// 4. Apply aging to short-term items (decays quality scores over time)
const aged = memorySystem.applyAging({ tiers: ['short-term', 'session'] });
console.log(`Aged ${aged} items`);

// 5. Prune expired and stale items
const pruneReport = memorySystem.prune({ expiredOnly: false, minQualityScore: 0.1 });
console.log(`Pruned ${pruneReport.removed} items`);

// 6. Generate a Markdown summary for the session
const summary = memorySystem.summarize({ scope: 'session', sessionId: 'sess-002' });
console.log(summary.text);
```

## Errors

| Code | Description | Remediation |
|---|---|---|
| `VALIDATION_FAILED` | One or more required fields are missing or invalid. | Check the error message for which fields failed and supply correct values. |
| `NOT_FOUND` | No memory item exists with the given ID. | Verify the ID is correct; use `search()` to locate the item by key or tag. |
| `INVALID_TIER` | The specified memory tier is not one of the allowed values. | Use one of: `short-term`, `long-term`, `project`, `session`. |
| `INVALID_SCOPE` | The specified scope is not one of the allowed values. | Use one of: `global`, `project`, `session`. |
| `KEY_TOO_LONG` | The memory key exceeds 256 characters. | Shorten the key to 256 characters or fewer. |
| `SCOPE_MISMATCH` | `projectId` or `sessionId` required for the given scope but not provided. | Supply the matching ID for `project` or `session` scopes. |
| `EXPIRED` | The requested memory item has expired. | Set `includeExpired: true` in `search()` to access expired items, or recreate the item. |
| `REQUIRED` | A required field for `recordTurn()` is missing. | Supply `sessionId` and `content` as non-empty strings. |
| `INVALID_ROLE` | The conversation role is not one of the allowed values. | Use one of: `user`, `assistant`, `system`. |

## Architectural Limitations

**In-memory storage only.** The `_store` Map lives in the process. All data is lost when the process restarts. Introducing a durable backend (e.g., Redis, SQLite, or a vector DB) does not require changing the public API, but does require editing all `_store` call sites throughout `src/index.ts` because there is no storage-adapter interface. Concentrating storage access behind a `MemoryStore` interface is the correct upgrade path.

**Semantic search is approximated by term frequency.** `findRelated` and the `semantic` strategy use tokenised keyword overlap rather than embedding-based cosine similarity. Retrieval quality degrades for queries whose intent diverges from the literal key/value text. Integrating an embedding model would be the natural upgrade path.

**Aging requires an external scheduler.** `applyAging()` must be called explicitly. The Workflow Engine is a one-shot DAG executor — it can run a step that calls `applyAging()`, but it cannot trigger that execution on a recurring schedule. Recurrence must come from an external trigger: an OS cron job, a `setInterval` loop in the host process, or a dedicated scheduler service.

**Scoring weights are compile-time constants.** Quality score weights, relevance weights, and `findRelated` weights are hardcoded literals in `_scoreQuality`, `_relevanceScore`, and `findRelated`. They cannot be tuned at runtime without modifying source.

## Changelog

### [0.2.1] — 2026-06-27

- Fixed `_agingFactor()` to use `createdAt` instead of `updatedAt` — administrative calls to `applyAging()` and `reScore()` were resetting the age clock on every invocation, making subsequent aging passes compute age ≈ 0 and return factor ≈ 1.0.
- Fixed `applyAging()` and `reScore()` to not mutate `updatedAt` when writing a new quality score — scoring is not a user-visible update.
- Corrected `store()` docstring: each call produces a new item with a distinct ID; there is no upsert-by-key behaviour.
- Corrected scheduling limitation: the Workflow Engine is a one-shot executor and cannot schedule recurring calls to `applyAging()`; an external trigger is required.
- Added compile-time scoring weights as a documented limitation.

### [0.2.0] — 2026-06-27

- Added `findRelated()`: finds related items by tag Jaccard similarity, key-segment overlap, and value token similarity weighted by aging factor.
- Added `recordTurn()` and `getHistory()`: conversation history storage and retrieval with chronological ordering, role filtering, and token estimation.
- Added `assembleContext()`: token-budgeted context assembly combining conversation history, project memory, and long-term memory for LLM injection.
- Added `applyAging()`: applies per-tier exponential decay to stored quality scores (`short-term` half-life 1 h, `session` 30 min, `project` 14 d, `long-term` 90 d).
- Enhanced hybrid search relevance: incorporates aging factor alongside term frequency and quality score.
- `_now()` supplemented by `_nowAfter()` to guarantee strictly increasing `updatedAt` timestamps within the same millisecond.
- 92 tests, 97.39% line coverage, 80.85% branch coverage.

### [0.1.0] — 2026-06-26

- Initial release of Memory System Skill.
- Four-tier memory model: `short-term`, `long-term`, `project`, `session`.
- Three isolation scopes: `global`, `project`, `session`.
- Core CRUD: `store`, `get`, `update`, `expire`.
- Semantic search with `exact`, `tag-match`, `semantic`, and `hybrid` strategies.
- Context restoration via `restoreContext()`.
- Cross-skill context handoff via `handoff()`.
- Memory summarization via `summarize()`.
- Scheduled and on-demand pruning via `prune()`.
- Quality scoring and re-scoring via `reScore()`.
- TTL-based automatic expiry.
