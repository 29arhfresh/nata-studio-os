# Workflow — Memory System

The Memory System workflow runs in six stages. Each stage has defined inputs, outputs, and decision gates.

---

## Stage 1: Intake and Validation

**Input**: Memory write request from any Skill
**Output**: Validated item ready for indexing

### Capture These Elements

Before accepting any write, establish:

| Element | Questions to Answer |
|---|---|
| **Tier** | Is this short-term, long-term, project, or session memory? |
| **Scope** | Is this global, project-scoped, or session-scoped? |
| **Key** | Is the key unique within the scope, ≤256 characters? |
| **Value** | Is the value JSON-serializable and non-empty? |
| **Source** | Which Skill is writing this item? |
| **TTL** | Should this item expire? If so, when? |
| **Tags** | Which lowercase tags make this item discoverable? |
| **Scope IDs** | For project scope: is `projectId` provided? For session scope: is `sessionId` provided? |

### Intake Decision Gate

```
Is the item complete and valid?
  ├── YES → Proceed to Stage 2 (Indexing)
  └── NO  → Return VALIDATION_FAILED with field-level errors → Loop back to Intake
```

---

## Stage 2: Indexing

**Input**: Validated memory item
**Output**: Indexed item with stable ID, quality score, and expiry timestamp

### Indexing Steps

1. **Assign ID** — Generate a unique, stable memory ID prefixed with `ms-`.
2. **Set timestamps** — Record `createdAt` and `updatedAt` in ISO 8601 format.
3. **Compute expiry** — If `ttlSeconds` is set, compute `expiresAt = createdAt + ttlSeconds`.
4. **Score quality** — Run the quality scorer; assign a numeric score (0–1).
5. **Build tag index** — Merge item tags into the global tag index.
6. **Store item** — Write to the appropriate tier and scope store.

### Quality Score Factors

| Factor | Weight | Description |
|---|---|---|
| Tags present | 0.25 | At least one tag earns full weight; zero tags score 0. |
| Value richness | 0.30 | Object values score higher than primitives. |
| Metadata present | 0.15 | At least one metadata key earns full weight. |
| Key specificity | 0.15 | Longer, more specific keys score higher. |
| Source identified | 0.15 | Non-empty source earns full weight. |

### Indexing Decision Gate

```
Does an item with the same key exist in the same scope?
  ├── YES → Overwrite the existing item; record previous value in version history
  └── NO  → Insert new item into the index
```

---

## Stage 3: Retrieval

**Input**: Search query, direct get, or context restoration request
**Output**: Ranked list of items or assembled context block

### Retrieval Strategy Selection

| Strategy | When to Use |
|---|---|
| `exact` | The caller knows the precise key |
| `tag-match` | The caller is browsing a known topic area |
| `semantic` | The caller has a conceptual question |
| `hybrid` | Default — combines term frequency, tag overlap, and quality score |

### Context Restoration Pipeline

1. **Identify scope** — Resolve `sessionId` or `projectId` to the correct store partition.
2. **Collect candidates** — Gather all non-expired items in the requested tiers, up to 5× the limit.
3. **Score and rank** — Apply the retrieval strategy; rank by combined score.
4. **Apply limit** — Return the top `limit` items.
5. **Record restoration** — Log the restoration event with item count and timestamp.

### Retrieval Decision Gate

```
Are results above minimum quality threshold?
  ├── YES → Return ranked items
  └── NO  → Notify caller that no high-quality matches were found
              └── Offer: broaden query | lower quality threshold | check tier/scope
```

---

## Stage 4: Summarization

**Input**: Scope, tier filters, and max item count
**Output**: Structured Markdown summary and token estimate

### Summarization Steps

1. **Retrieve candidates** — Call the retrieval pipeline with `tiers` and `scope` filters.
2. **Group by tier** — Separate items by `short-term`, `long-term`, `project`, `session`.
3. **Sort within groups** — Descending quality score within each group.
4. **Format sections** — One `##` section per tier; one bullet per item with key, value excerpt, and quality score.
5. **Estimate tokens** — Count characters ÷ 4 as a conservative token estimate.
6. **Return summary** — Include `text`, `tokenEstimate`, and `itemCount`.

### Summarization Decision Gate

```
Does the summary exceed the token budget (default 4000)?
  ├── YES → Truncate lowest-scoring items until within budget; note truncation count
  └── NO  → Return full summary
```

---

## Stage 5: Handoff

**Input**: Source Skill, target Skill, session ID, and optional key list
**Output**: Handoff receipt with transferred key count

### Handoff Steps

1. **Resolve keys** — If `keys` is omitted, collect all session-scoped items for `fromSkill`.
2. **Validate keys** — Confirm every key exists and is not expired.
3. **Transfer** — Copy items into the target Skill's namespace within the same session.
4. **Log handoff** — Write a `session` tier audit record with source, target, keys, and timestamp.
5. **Return receipt** — Report `transferred` count and any `failed` keys.

### Handoff Decision Gate

```
Did all keys transfer successfully?
  ├── YES → Return receipt with transferred count
  └── NO  → Roll back all transferred keys → Return HANDOFF_FAILED with per-key errors
```

---

## Stage 6: Pruning

**Input**: Prune options (tier, scope, quality threshold, dry-run flag)
**Output**: Prune report with removed and retained counts

### Pruning Steps

1. **Collect candidates** — Scan the target tier and scope for prune-eligible items.
2. **Apply filters** — Select items that are expired or below `minQualityScore`.
3. **Dry-run gate** — If `dryRun: true`, return the candidate list without deleting.
4. **Check references** — Skip any item referenced by an active handoff or open session.
5. **Delete** — Remove confirmed candidates from the store and index.
6. **Return report** — Report `removed`, `retained`, and `skipped` counts with reasons.

### Pruning Decision Gate

```
Is dryRun enabled?
  ├── YES → Return prune report without making any changes
  └── NO  → Apply deletions → Return final report
```

---

## Cross-Stage Rules

- **Validation blocks every write.** No item enters the index without passing Stage 1.
- **Scope isolation is enforced at every stage.** Items never cross scope boundaries.
- **TTL is evaluated at read time.** An item is expired if `now > expiresAt`, regardless of when it was stored.
- **Quality scores are always current.** Call `reScore()` after bulk imports.
- **Handoffs are atomic.** Partial handoffs are rolled back; no partial state is persisted.
