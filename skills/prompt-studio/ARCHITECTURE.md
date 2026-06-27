# Prompt Studio — Architecture Notes

**Version:** 0.1.0  
**Status:** Active

---

## 1. Design Goals

1. All business logic lives in `src/index.ts`. No speculative layering.
2. Data model is clear and stable: five entity types, each with typed IDs.
3. Behaviour is data-driven where practical: variable extraction uses a single regex constant; scoring weights are named constants; history retention is a single constant.
4. The Workflow Engine handles the only genuine multi-step operation (import). Simple CRUD does not use it.
5. All state is in-memory. No I/O, no persistence, no singleton singletons.

---

## 2. Data Model

```
Category ──────────────── Prompt ──────────── PromptVersion
   1                        1..N                   1..N
   │                          │
   └── PromptTemplate         └── HistoryEntry
```

| Entity          | Store key      | Prefix   | Notes                                          |
|-----------------|----------------|----------|------------------------------------------------|
| `Category`      | `CategoryId`   | `cat-`   | Prompts reference by ID; deleting blocked when in use |
| `Prompt`        | `PromptId`     | `prm-`   | Tracks `currentVersionId` and ordered `versionIds` |
| `PromptVersion` | `VersionId`    | `ver-`   | Immutable snapshot of content + variables at a point in time |
| `PromptTemplate`| `TemplateId`   | `tpl-`   | Structure with `{{placeholders}}`; rendered at prompt creation |
| `HistoryEntry`  | `HistoryId`    | `hst-`   | Append-only log; capped at 1000 per prompt      |

IDs are generated as `<prefix>-<Date.now()>-<6 random chars>`, providing collision-resistant uniqueness in a single process.

---

## 3. Module Structure (single file)

`src/index.ts` is divided into named sections with comment banners:

```
ID Types
Domain Types
Input Types
Result Types
Constants
In-Memory Stores (5 Maps)
Private Helpers (_generateId, _nowIso, _extractVariableNames, _addHistory, _createVersion, _renderContent, _scorePrompt)
Category Operations
Prompt Operations
Version Operations
Template Operations
Search
Favorites
Validation
Preview
History
Export / Import (+ WE integration)
Default Export
```

Each public function is ≤ 40 lines. Complex operations delegate to private helpers.

---

## 4. Versioning Strategy

A new `PromptVersion` is created when:
- A prompt is created (`createPrompt` → version 1, changeNote `"Initial version."`)
- Content changes during `updatePrompt` (new version, changeNote supplied by caller or defaulting to `"Content updated."`)
- `restoreVersion` is called (creates a new version recording what was restored; never rewrites history)

Updating metadata, tags, title, or description does **not** create a version. This keeps version history meaningful.

---

## 5. Variable Substitution

Variables use `{{name}}` syntax where `name` matches `/[a-zA-Z_][a-zA-Z0-9_]*/`.

The substitution regex is compiled from the constant `VARIABLE_REGEX_SOURCE` to avoid re-parsing the pattern string at call sites. A single private `_renderContent` function is used by `renderContent` (public), `previewPrompt`, and `createPromptFromTemplate`, preventing divergence.

Unresolved placeholders are left as-is (`{{name}}`), allowing partial rendering when only some variables are provided.

---

## 6. Search Algorithm

Scoring is token-based and additive:

```
score = Σ (for each query token)
          title_match  × SEARCH_TITLE_WEIGHT       (3)
        + desc_match   × SEARCH_DESCRIPTION_WEIGHT  (2)
        + tag_match    × SEARCH_TAG_WEIGHT           (2)
        + content_match × SEARCH_CONTENT_WEIGHT      (1)
```

Results with `score === 0` are excluded. Ties are broken by `updatedAt` descending. An empty query returns all prompts ordered by recency.

Tag normalization (`toLowerCase`) happens at write time in `createPrompt`/`updatePrompt`, so comparisons at search time are direct string equality.

---

## 7. Workflow Engine Integration

`importPrompts` is the only function that uses the Workflow Engine. It does so because import has genuine inter-step dependencies:

1. **validate** — checks bundle shape; no dependencies
2. **import-categories** — depends on validate (won't run if invalid); produces a `categoryMap` (old ID → stored ID)
3. **import-templates** — depends on import-categories; uses `categoryMap` to resolve category references in templates
4. **import-prompts** — depends on import-templates; uses `categoryMap` to resolve category references in prompts; imports matching version records

Data routing:
- `validate.valid` → `import-categories` (guard condition)
- `import-categories.categoryMap` → `import-templates` and `import-prompts` (resolved via `DataRoute`)

The WE's DAG ensures this order even if the WE later gains parallel execution. The handlers close over the module-level store Maps directly; the workflow `context` carries `bundle` and `mode` so handlers remain pure with respect to their step logic.

If the workflow fails at any step, `importPrompts` returns a zero-count `ImportResult` with the error message from `workflowResult.error`.

---

## 8. History Tracking

Every mutating operation records a `HistoryEntry` via `_addHistory`. Actions:

| Action        | Trigger                                           |
|---------------|---------------------------------------------------|
| `created`     | `createPrompt`                                    |
| `updated`     | `updatePrompt` (on every call)                    |
| `versioned`   | `updatePrompt` when content changes               |
| `restored`    | `restoreVersion`                                  |
| `used`        | `previewPrompt`                                   |
| `favorited`   | `toggleFavorite` when turning on                  |
| `unfavorited` | `toggleFavorite` when turning off                 |

History is retained up to `MAX_HISTORY_PER_PROMPT` (1000) entries per prompt. The oldest entry is pruned when the limit is exceeded. History is deleted along with the prompt in `deletePrompt`.

---

## 9. Export/Import Bundle Format

```typescript
interface ExportBundle {
  formatVersion: '1.0.0';  // bumped if schema changes
  exportedAt: string;       // ISO-8601
  categories: Category[];
  templates: PromptTemplate[];
  prompts: Prompt[];
  versions: PromptVersion[];
}
```

Export includes only categories referenced by the exported prompts. Templates are included when their `categoryId` matches an exported category (or when they have no category). Version records are included for all exported prompts.

Import mode `"skip"` preserves existing records with matching IDs. Mode `"overwrite"` replaces them. Neither mode creates history entries for imported prompts; imported prompts carry their original history-free state.

---

## 10. Decisions Not Made

- **Persistence**: No file I/O, database, or serialization. All state resets when the process exits. An adapter layer that wraps the public API with storage calls is a natural extension point.
- **Concurrency**: JavaScript is single-threaded; no locking is needed. Async functions exist only to satisfy the WE's `StepHandler` type.
- **Internationalization**: The standard requires externalisable user-facing strings. This skill emits error messages in English. A future pass should replace them with error-code constants and a separate message catalogue.
- **Fuzzy search**: The current scorer is exact-substring. Fuzzy matching would improve recall but is speculative for v0.1.
