# Tools Reference — Knowledge Manager

Integration reference for every tool, API, and system that Knowledge Manager interacts with.

---

## Core API Surface

### Entry Operations

| Function | Signature | Description |
|---|---|---|
| `create` | `(input) → KnowledgeEntry` | Create and index a new entry. Validates before writing. |
| `get` | `(id) → KnowledgeEntry` | Retrieve a single entry by its stable ID. |
| `update` | `(id, patch, summary, author) → KnowledgeEntry` | Patch fields and record a version snapshot. |
| `archive` | `(id, archivedBy) → KnowledgeEntry` | Soft-delete by setting status to `archived`. |

### Search and Retrieval

| Function | Signature | Description |
|---|---|---|
| `search` | `(query) → SearchResult` | Full-text and tag-filtered search with configurable strategy. |
| `assembleContext` | `(query, strategy?) → ContextAssembly` | Return a token-budgeted Markdown context block. |

### Quality and Validation

| Function | Signature | Description |
|---|---|---|
| `validate` | `(entry) → ValidationResult` | Run field and heuristic validation without writing. |
| `reScore` | `() → number` | Re-evaluate quality scores across all active entries. |
| `detectDuplicates` | `() → DuplicateReport` | Scan for near-duplicate titles using Jaccard similarity. |

### Tag Management

| Function | Signature | Description |
|---|---|---|
| `listTags` | `() → Record<string, number>` | Return all tags with usage counts. |
| `renameTag` | `(old, new, author) → number` | Propagate a tag rename across all entries. |

### Version Tracking

| Function | Signature | Description |
|---|---|---|
| `getHistory` | `(id) → VersionHistory` | Return all version snapshots for an entry. |

### Index Operations

| Function | Signature | Description |
|---|---|---|
| `stats` | `() → IndexStats` | Return aggregate statistics about the index. |
| `importEntries` | `(request) → ImportResult` | Bulk-import entries from a JSON payload. |
| `exportEntries` | `(request) → ExportResult` | Export filtered entries as a JSON payload. |

---

## Retrieval Strategies

| Strategy | Algorithm | Best For |
|---|---|---|
| `exact` | Title equality check | Known entry lookups |
| `tag-match` | Tag set intersection ratio | Topic browsing |
| `semantic` | Term frequency against title + content + tags | Conceptual questions |
| `relationship-traversal` | Graph walk from a seed entry | Connected knowledge discovery |
| `hybrid` | Weighted combination: 70% relevance + 30% quality | Default; balanced precision and recall |

---

## Relationship Types

| Type | Meaning | Effect on Flags |
|---|---|---|
| `related-to` | Conceptually associated | None |
| `depends-on` | Requires target to be understood first | None |
| `extends` | Adds detail to or builds on target | None |
| `contradicts` | Conflicts with target content | Both entries flagged `conflicted` |
| `supersedes` | Replaces the target | Target should be set to `deprecated` |
| `example-of` | Concrete instance of the target concept | None |

---

## Knowledge Types

| Type | When to Use | Citation Required |
|---|---|---|
| `concept` | Abstract ideas, principles, definitions | Recommended |
| `procedure` | Step-by-step instructions or processes | Optional |
| `reference` | Factual data, tables, specifications | Strongly recommended |
| `example` | Concrete demonstrations of a concept | No |
| `decision` | Architectural or strategic decisions with rationale | Recommended |
| `glossary` | Single-term definitions | Optional |
| `faq` | Question-and-answer format | Optional |
| `standard` | Rules, conventions, or requirements | Recommended |

---

## Quality Score Interpretation

| Score Range | Flag | Meaning |
|---|---|---|
| 0.90 – 1.00 | `verified` | Complete, cited, reviewed by a human |
| 0.60 – 0.89 | `unverified` | Structurally valid but not yet reviewed |
| 0.30 – 0.59 | `outdated` | Partial fields or stale content |
| 0.00 – 0.29 | `conflicted` | Significant structural or content issues |

---

## Upstream Integrations

### Agent Orchestrator

The Agent Orchestrator calls Knowledge Manager to:
- Retrieve capability descriptions for all registered Skills.
- Assemble context for routing decisions.
- Log execution decisions as `decision`-type entries for audit trails.

**Integration point**: `assembleContext()` and `create()` with `type: 'decision'`.

### Prompt Architect

Prompt Architect calls Knowledge Manager to:
- Retrieve reference entries about prompt structure and model-specific syntax.
- Store approved prompt templates as `example`-type entries.

**Integration point**: `search()` with `types: ['reference', 'example']`.

### AI Video Director

AI Video Director calls Knowledge Manager to:
- Retrieve cinematographic reference entries before generating prompts.
- Store generation parameter sets as `procedure`-type entries.

**Integration point**: `search()` with `tags: ['cinematography']`.

### AI Image Director

AI Image Director calls Knowledge Manager to:
- Retrieve style reference entries.
- Store approved style presets as `reference`-type entries.

**Integration point**: `search()` with `types: ['reference']` and `tags: ['style']`.

---

## Downstream Consumers

| Consumer | What They Read | Format |
|---|---|---|
| LLM prompt builder | `assembleContext()` output | Markdown |
| Skill router | `search()` results | `SearchResult` JSON |
| Audit log | `getHistory()` output | `VersionHistory` JSON |
| Backup system | `exportEntries()` output | JSON |
| Analytics dashboard | `stats()` output | `IndexStats` JSON |

---

## Persistence Layer Notes

The current implementation uses an in-memory `Map` store. For production deployment:

1. Replace `_store` and `_versionHistory` with a persistent database adapter.
2. The adapter must implement the same `get`/`set`/`values` interface as `Map`.
3. Recommended persistent stores: SQLite (local), PostgreSQL (cloud), or a vector database for semantic search (e.g., pgvector, Chroma, Pinecone).
4. Vector embeddings for true semantic search should be generated on `create()` and stored alongside the entry.
5. The `search()` function's `semantic` strategy currently falls back to term frequency — wire it to an embedding similarity API in production.

---

## Token Budget Reference

| Scenario | Recommended `limit` | Expected `tokenEstimate` |
|---|---|---|
| Single-fact lookup | 1–2 | 50–200 tokens |
| Topic overview | 3–5 | 200–800 tokens |
| Full context assembly | 10–20 | 800–4000 tokens |
| Model context window (safe) | — | ≤ 4000 tokens |

The `assembleContext()` function enforces a hard ceiling of 4000 estimated tokens by default.
