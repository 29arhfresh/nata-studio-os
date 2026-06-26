# Workflow — Knowledge Manager

The Knowledge Manager workflow runs in five stages. Each stage has defined inputs, outputs, and decision gates.

---

## Stage 1: Intake and Validation

**Input**: Raw knowledge (text, structured data, imported document)
**Output**: Validated entry ready for indexing

### Capture These Elements

Before creating any entry, establish:

| Element | Questions to Answer |
|---------|---------------------|
| **Title** | What is the precise, searchable name of this knowledge? |
| **Type** | Is this a concept, procedure, reference, example, decision, glossary term, FAQ, or standard? |
| **Content** | Is the content complete, accurate, and self-contained? |
| **Author** | Who owns this entry? Who should be contacted if it needs revision? |
| **Tags** | Which lowercase tags will make this entry discoverable? |
| **Status** | Should this start as `draft` (needs review) or `active` (production-ready)? |
| **Citations** | Are there external sources that support this content? |
| **Relationships** | Does this entry depend on, extend, or contradict any existing entry? |

### Intake Decision Gate

```
Is the entry complete and valid?
  ├── YES → Proceed to Stage 2 (Indexing)
  └── NO  → Return validation errors to author → Loop back to Intake
```

---

## Stage 2: Indexing

**Input**: Validated entry
**Output**: Indexed entry with ID, quality score, and quality flag

### Indexing Steps

1. **Assign ID** — Generate a unique, stable knowledge ID.
2. **Score quality** — Run the quality scorer; assign a numeric score (0–1).
3. **Set quality flag** — Assign `verified`, `unverified`, `conflicted`, or `outdated` based on score and content analysis.
4. **Detect duplicates** — Run a title similarity check against the active index.
5. **Record timestamps** — Set `createdAt` and `updatedAt`.

### Duplicate Decision Gate

```
Duplicate detected?
  ├── YES → Notify author with the existing entry ID
  │           └── Author chooses: Update existing | Proceed anyway | Abort
  └── NO  → Continue to Stage 3
```

---

## Stage 3: Relationship Mapping

**Input**: Indexed entry, existing index
**Output**: Entry with typed relationships to related entries

### Relationship Types

| Type | When to Use |
|---|---|
| `related-to` | Conceptually linked but independent |
| `depends-on` | This entry requires the target to be understood first |
| `extends` | This entry adds detail to or builds upon the target |
| `contradicts` | This entry conflicts with the target (flag both as `conflicted`) |
| `supersedes` | This entry replaces the target (deprecate the target) |
| `example-of` | This entry is a concrete instance of the target concept |

### Relationship Decision Gate

```
Does this entry have relationships to existing entries?
  ├── YES → Add typed relationships; check for contradiction flags
  │           └── Contradicting entry found? → Flag both as `conflicted`
  └── NO  → Proceed to Stage 4
```

---

## Stage 4: Retrieval

**Input**: Search query or context assembly request
**Output**: Ranked list of entries or assembled context block

### Retrieval Strategy Selection

| Strategy | When to Use |
|---|---|
| `exact` | The user knows the precise entry title |
| `tag-match` | The user is browsing a known topic area |
| `semantic` | The user has a conceptual question (approximate matching) |
| `relationship-traversal` | The user needs connected knowledge around a known entry |
| `hybrid` | Default — combines term frequency, tag overlap, and quality score |

### Context Assembly Pipeline

1. **Execute search** — Run the selected strategy; collect up to 20 candidates.
2. **Rank by combined score** — Relevance × quality weight.
3. **Apply token budget** — Include entries from highest to lowest score until the budget is reached.
4. **Format output** — One `##` section per entry, separated by `---`.
5. **Report token estimate** — Always return the estimated token count alongside the assembled text.

### Retrieval Decision Gate

```
Results above minimum quality threshold?
  ├── YES → Return results / assembled context
  └── NO  → Notify caller that no high-quality matches were found
              └── Offer: broaden query | lower quality threshold | check tag list
```

---

## Stage 5: Maintenance

**Input**: Change request, scheduled re-score trigger, or import batch
**Output**: Updated index with full version history

### Maintenance Operations

| Operation | Trigger | Action |
|---|---|---|
| **Update** | Author submits a patch | Validate patch → write new version → record history snapshot |
| **Deprecate** | Entry superseded by newer content | Set status to `deprecated`; add `supersedes` relationship on replacement |
| **Archive** | Entry no longer relevant | Set status to `archived`; remove from default search results |
| **Re-score** | Scheduled or manual trigger | Re-evaluate all entries; update `qualityScore` and `qualityFlag` |
| **Import** | Bulk ingestion from external source | Validate each entry; skip or fail individually; report summary |
| **Export** | Backup or handoff request | Filter by IDs, tags, or types; serialize to requested format |
| **Rename tag** | Tag taxonomy cleanup | Propagate new tag name across all affected entries; record history |

### Maintenance Decision Gate

```
Is the update a breaking change to the entry's public meaning?
  ├── YES → Increment entry version (patch → minor or minor → major)
  │           └── Update `version` field in the patch
  └── NO  → Keep version; record change summary only
```

---

## Cross-Stage Rules

- **Validation blocks every write.** No entry enters the index without passing validation.
- **History is mandatory.** Every `update` call must include a non-empty `changeSummary` and `changedBy`.
- **Quality scores are always current.** Run `reScore()` after any bulk import to ensure all scores reflect the current scoring rules.
- **Archived entries are invisible by default.** Retrieval, duplicate detection, and tag counts exclude archived entries unless the caller explicitly opts in.
