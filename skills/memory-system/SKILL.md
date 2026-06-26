# Memory System

## Overview

Memory System is the unified memory layer for Nata Studio OS. It manages four memory tiers — short-term, long-term, project, and session — and exposes a single, consistent API for every Skill that needs to store, retrieve, summarize, or prune memory. All context handoffs between Skills, semantic memory searches, memory quality scoring, and scheduled pruning run through this Skill.

## Usage

```typescript
import memorySystem from './src/index';

// Store a short-term memory item
const item = memorySystem.store({
  tier: 'short-term',
  scope: 'session',
  key: 'last-image-style',
  value: 'cinematic neon noir',
  ttlSeconds: 3600,
  tags: ['style', 'image'],
  source: 'ai-image-director',
});

// Retrieve with semantic search
const results = memorySystem.search({
  query: 'image style preference',
  tiers: ['short-term', 'long-term'],
  limit: 5,
});

// Restore context for a new session
const context = memorySystem.restoreContext({
  scope: 'session',
  sessionId: 'sess-abc123',
  limit: 20,
});
console.log(context.items.length);
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
| `scope` | `MemoryScope` | No | `'global'` | Restrict results to this scope. |
| `tags` | `string[]` | No | `[]` | Restrict results to items with at least one matching tag. |
| `limit` | `number` | No | `10` | Maximum items to return. |
| `minQualityScore` | `number` | No | `0` | Minimum quality score (0–1) for inclusion. |
| `includeExpired` | `boolean` | No | `false` | When true, expired items are included in results. |
| `projectId` | `string` | No | `undefined` | Restrict to a specific project scope. |
| `sessionId` | `string` | No | `undefined` | Restrict to a specific session scope. |

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

### `prune(options)`

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

### Minimal — store and retrieve a session preference

```typescript
import memorySystem from './src/index';

// Store a user preference in session memory
const item = memorySystem.store({
  tier: 'short-term',
  scope: 'session',
  key: 'preferred-aspect-ratio',
  value: '16:9',
  ttlSeconds: 7200,
  tags: ['preference', 'video'],
  source: 'ai-video-director',
  sessionId: 'sess-001',
  metadata: {},
});

// Retrieve it directly
const retrieved = memorySystem.get(item.id);
console.log(retrieved.value); // '16:9'
```

### Realistic — cross-skill context handoff with semantic search and pruning

```typescript
import memorySystem from './src/index';

// 1. AI Image Director stores style decisions made during a session
memorySystem.store({
  tier: 'long-term',
  scope: 'project',
  key: 'brand-style-v2',
  value: {
    palette: ['#0a0a0a', '#ff4d00', '#f5f5f5'],
    mood: 'cinematic neon noir',
    referenceImages: ['img-001', 'img-002'],
  },
  tags: ['brand', 'style', 'image', 'approved'],
  source: 'ai-image-director',
  projectId: 'proj-nata-rebrand',
  metadata: { approvedBy: 'creative-director', approvedAt: '2026-06-26' },
});

// 2. AI Video Director retrieves the brand style via semantic search
const styleResults = memorySystem.search({
  query: 'brand style palette mood',
  tiers: ['long-term'],
  scope: 'project',
  tags: ['brand'],
  limit: 3,
  projectId: 'proj-nata-rebrand',
});
console.log(styleResults.items[0].item.key); // 'brand-style-v2'

// 3. Restore full project context at session start
const context = memorySystem.restoreContext({
  scope: 'project',
  projectId: 'proj-nata-rebrand',
  tiers: ['long-term', 'project'],
  limit: 30,
});
console.log(`Restored ${context.items.length} memory items`);

// 4. Summarize the session before it ends
const summary = memorySystem.summarize({
  scope: 'session',
  sessionId: 'sess-001',
  maxItems: 50,
});
console.log(summary.text);

// 5. Hand off context to Prompt Architect
const handoffResult = memorySystem.handoff({
  fromSkill: 'ai-image-director',
  toSkill: 'prompt-architect',
  sessionId: 'sess-001',
  keys: ['brand-style-v2', 'preferred-aspect-ratio'],
});
console.log(`Handed off ${handoffResult.transferred} items`);

// 6. Prune expired and low-quality items
const pruneResult = memorySystem.prune({
  expiredOnly: false,
  tier: 'short-term',
  minQualityScore: 0.3,
  dryRun: false,
});
console.log(`Pruned ${pruneResult.removed} items`);
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
| `HANDOFF_FAILED` | One or more keys could not be transferred during a handoff. | Check that all specified keys exist in the source session. |

## Changelog

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
- Memory indexing with `stats()` and `index()`.
- TTL-based automatic expiry.
