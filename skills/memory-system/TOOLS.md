# Tools Reference — Memory System

Integration reference for every function, type, and downstream system the Memory System exposes.

---

## Core API Surface

### Write Operations

| Function | Signature | Description |
|---|---|---|
| `store` | `(input) → MemoryItem` | Validate and write a new memory item. Overwrites if key exists in the same scope. |
| `update` | `(id, patch) → MemoryItem` | Patch fields on an existing item. Immutable fields: `id`, `createdAt`, `tier`, `scope`. |
| `expire` | `(id) → MemoryItem` | Immediately mark an item as expired without deleting it. |
| `importItems` | `(items[]) → ImportResult` | Bulk-write a list of items. Validates each individually; reports per-item errors. |

### Read Operations

| Function | Signature | Description |
|---|---|---|
| `get` | `(id) → MemoryItem` | Retrieve a single item by stable ID. Throws `NOT_FOUND` if absent or expired. |
| `search` | `(query) → SearchResult` | Full-text, tag-filtered, and semantic search across the index. |
| `restoreContext` | `(options) → ContextRestoration` | Reconstruct session or project context for injection into an LLM prompt. |

### Summary and Handoff

| Function | Signature | Description |
|---|---|---|
| `summarize` | `(options) → MemorySummary` | Condense memory items into a structured Markdown summary. |
| `handoff` | `(options) → HandoffReceipt` | Transfer selected memory keys from one Skill to another in the same session. |

### Maintenance

| Function | Signature | Description |
|---|---|---|
| `prune` | `(options) → PruneReport` | Remove expired or low-quality items. Supports dry-run mode. |
| `reScore` | `() → number` | Re-evaluate quality scores for all active items. Returns items rescored. |
| `stats` | `() → MemoryStats` | Return aggregate index statistics. |

---

## Memory Tiers

| Tier | Lifetime | Default TTL | Scope Options | Typical Content |
|---|---|---|---|---|
| `short-term` | Session or TTL | 3600 s | `session`, `global` | Active preferences, intermediate results, current task state |
| `long-term` | Permanent | None | `global`, `project` | Approved brand decisions, learned preferences, finalized outputs |
| `project` | Project lifetime | None | `project` | Project settings, equipment decisions, creative briefs |
| `session` | Single session | Session end | `session` | Reasoning steps, transient user input, handoff buffers |

---

## Memory Scopes

| Scope | Isolation Boundary | Required ID Field |
|---|---|---|
| `global` | None — visible to all Skills and sessions | — |
| `project` | Isolated per project | `projectId` |
| `session` | Isolated per session | `sessionId` |

---

## Retrieval Strategies

| Strategy | Algorithm | Best For |
|---|---|---|
| `exact` | Key equality check | Known key lookups |
| `tag-match` | Tag set intersection ratio | Topic browsing within a tier |
| `semantic` | Term frequency against key + value + tags | Conceptual queries |
| `hybrid` | 70% relevance + 30% quality weight | Default; balanced precision and recall |

---

## Quality Score Interpretation

| Score Range | Label | Meaning |
|---|---|---|
| 0.80 – 1.00 | High | Rich tags, detailed value, full metadata, identified source |
| 0.50 – 0.79 | Medium | Most fields populated; minor gaps in metadata or tags |
| 0.30 – 0.49 | Low | Minimal tags or metadata; usable but should be enriched |
| 0.00 – 0.29 | Poor | Missing critical fields; prune candidate |

---

## Key Return Types

### `MemoryItem`

```typescript
interface MemoryItem {
  id: MemoryId;           // Stable ID, e.g., 'ms-1234567-abcdefg'
  tier: MemoryTier;
  scope: MemoryScope;
  key: string;
  value: MemoryValue;
  ttlSeconds?: number;
  expiresAt?: string;     // ISO 8601; absent if no TTL
  tags: string[];
  source: string;
  projectId?: string;
  sessionId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
  qualityScore: number;   // 0–1
}
```

### `SearchResult`

```typescript
interface SearchResult {
  items: Array<{ item: MemoryItem; relevanceScore: number }>;
  totalMatches: number;
  durationMs: number;
}
```

### `ContextRestoration`

```typescript
interface ContextRestoration {
  items: Array<{ item: MemoryItem; relevanceScore: number }>;
  tokenEstimate: number;
  restoredAt: string;
}
```

### `MemorySummary`

```typescript
interface MemorySummary {
  text: string;
  tokenEstimate: number;
  itemCount: number;
  generatedAt: string;
}
```

### `HandoffReceipt`

```typescript
interface HandoffReceipt {
  transferred: number;
  failed: string[];       // Keys that could not be transferred
  handoffId: string;
  handedOffAt: string;
}
```

### `PruneReport`

```typescript
interface PruneReport {
  removed: number;
  retained: number;
  skipped: number;
  candidates: Array<{ key: string; reason: string }>;
  dryRun: boolean;
  prunedAt: string;
}
```

### `MemoryStats`

```typescript
interface MemoryStats {
  totalItems: number;
  expiredItems: number;
  avgQualityScore: number;
  totalTags: number;
  byTier: Record<MemoryTier, number>;
  byScope: Record<MemoryScope, number>;
  lastIndexedAt: string;
}
```

---

## Upstream Integrations

### Agent Orchestrator

The Agent Orchestrator calls Memory System to:
- Restore session context at the start of each routing decision.
- Record routing decisions as `session`-tier audit items.

**Integration point**: `restoreContext()` and `store()` with `tier: 'session'`.

### Knowledge Manager

Knowledge Manager writes to Memory System when:
- An approved knowledge entry should be cached for fast access.
- A knowledge search result should be held in session memory for re-use.

**Integration point**: `store()` with `tier: 'long-term'` and `tags: ['knowledge']`.

### Prompt Architect

Prompt Architect calls Memory System to:
- Read style and brand preferences before generating prompts.
- Receive context handed off from AI Image Director or AI Video Director.

**Integration point**: `search()` with `tags: ['brand', 'style']` and `restoreContext()`.

### AI Image Director

AI Image Director calls Memory System to:
- Store approved style presets as long-term project memory.
- Read back preferences at the start of a generation session.
- Hand off active style context to Prompt Architect after generation.

**Integration point**: `store()`, `restoreContext()`, `handoff()`.

### AI Video Director

AI Video Director calls Memory System to:
- Read cinematography preferences from project memory.
- Store scene composition decisions for continuity.

**Integration point**: `search()` with `tags: ['cinematography', 'composition']`.

---

## Downstream Consumers

| Consumer | What They Read | Format |
|---|---|---|
| LLM prompt builder | `restoreContext()` and `summarize()` output | Markdown |
| Skill router | `search()` results | `SearchResult` JSON |
| Audit log | `stats()` and handoff receipts | JSON |
| Session close hook | `summarize()` output | Markdown |
| Maintenance scheduler | `prune()` reports | `PruneReport` JSON |

---

## Persistence Layer Notes

The current implementation uses an in-memory `Map` store. For production deployment:

1. Replace the in-memory store with a persistent adapter (SQLite, PostgreSQL, Redis).
2. The adapter must implement the same `get`/`set`/`delete`/`values` interface as `Map`.
3. For semantic search, wire the `semantic` strategy to an embedding similarity API (e.g., pgvector, Pinecone, Chroma).
4. Generate embeddings on `store()` and store them alongside the item for fast vector lookup.
5. For TTL-based expiry at scale, use the database's native TTL feature (e.g., Redis `EXPIRE`, PostgreSQL partial indexes).

---

## Token Budget Reference

| Scenario | Recommended `limit` | Expected `tokenEstimate` |
|---|---|---|
| Single key lookup | 1 | 10–100 tokens |
| Active preferences | 3–5 | 100–400 tokens |
| Full session context | 10–20 | 400–2000 tokens |
| Project memory dump | 20–50 | 2000–4000 tokens |
| Model context ceiling | — | ≤ 4000 tokens |

The `restoreContext()` and `summarize()` functions enforce a hard ceiling of 4000 estimated tokens by default.
