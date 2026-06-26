# Checklist — Memory System

Use these checklists at each stage of memory operations to prevent data loss, scope leakage, and index corruption.

---

## Pre-Write Checklist

Complete before calling `store()` or `update()`.

### Item Completeness
- [ ] `tier` is one of: `short-term`, `long-term`, `project`, `session`
- [ ] `scope` is one of: `global`, `project`, `session`
- [ ] `key` is present, ≤256 characters, and unique within the target scope
- [ ] `value` is JSON-serializable and non-empty
- [ ] `source` is populated with the calling Skill's identifier
- [ ] `projectId` is provided when `scope` is `project`
- [ ] `sessionId` is provided when `scope` is `session`

### TTL and Expiry
- [ ] `ttlSeconds` is set for all `short-term` and `session` tier items
- [ ] `ttlSeconds` is omitted (or explicitly `undefined`) for permanent long-term items
- [ ] The TTL value is appropriate for the data's expected useful lifetime

### Tag Quality
- [ ] At least one tag is present
- [ ] All tags are lowercase and hyphen-separated
- [ ] Tags are specific enough to support filtered retrieval
- [ ] Tags do not duplicate the tier name (e.g., do not tag a `session` item with `session`)

### Value Quality
- [ ] Value contains no hardcoded credentials, secrets, or personal data
- [ ] Value is complete — not a placeholder or partial draft
- [ ] Value is the correct data type for the key's intended use

---

## Pre-Retrieval Checklist

Complete before calling `search()`, `get()`, or `restoreContext()`.

- [ ] Query string is specific enough to narrow results (avoid single-word queries)
- [ ] The correct `tiers` filter is set for the use case
- [ ] `scope`, `sessionId`, and `projectId` match the intended retrieval boundary
- [ ] `minQualityScore` is set when only reliable memory should be returned
- [ ] `limit` is appropriate for the use case
- [ ] `includeExpired: false` unless the caller explicitly needs expired items
- [ ] For context restoration: the token budget is understood before interpreting results

---

## Pre-Handoff Checklist

Complete before calling `handoff()`.

- [ ] `fromSkill` and `toSkill` identifiers are correct
- [ ] `sessionId` matches the active session
- [ ] All keys listed in `keys` exist in the source Skill's namespace
- [ ] Keys are not expired
- [ ] The receiving Skill can interpret the value format of each key
- [ ] A fallback plan exists if the handoff fails

---

## Pre-Prune Checklist

Complete before calling `prune()` with `dryRun: false`.

- [ ] `dryRun: true` has been run first and the candidate list has been reviewed
- [ ] No listed candidates are referenced by active sessions or pending handoffs
- [ ] The `tier` and `scope` filters correctly target the intended data
- [ ] `minQualityScore` threshold is appropriate (default 0.3 is conservative)
- [ ] A backup or export has been taken if the data has recovery value

---

## Post-Write Checklist

Complete after every `store()` or `update()` call.

- [ ] The returned item has a valid `id` starting with `ms-`
- [ ] `qualityScore` is above 0.4 (if below, review the item's tags, value, and metadata)
- [ ] `expiresAt` is set when TTL was specified
- [ ] The item is retrievable via `get(item.id)`
- [ ] Scope isolation is correct: only the intended scope can retrieve the item

---

## Post-Search Checklist

Complete after every `search()` call before using the results.

- [ ] Results have non-zero `relevanceScore` values (zero scores indicate no match)
- [ ] No expired items appear in results (unless `includeExpired` was set)
- [ ] `qualityScore` values are acceptable for the intended use
- [ ] If zero results: check query terms, broaden `tiers`, lower `minQualityScore`
- [ ] For context restoration: `tokenEstimate` is within the model's context window

---

## Post-Prune Checklist

Complete after every `prune()` call with `dryRun: false`.

- [ ] `removed` count matches the expected number from the dry-run report
- [ ] `skipped` count is understood (items that were referenced and protected)
- [ ] No items that should have been retained are missing from the index
- [ ] `stats()` shows the updated item counts per tier and scope

---

## Maintenance Checklist

Run periodically or after any bulk operation.

### After Bulk Import
- [ ] `reScore()` has been called to update quality scores
- [ ] `stats()` shows the expected increase in item counts
- [ ] A search with relevant tags returns the newly imported items
- [ ] No scope isolation violations occurred (items in the wrong scope)

### Scheduled Health Check
- [ ] `stats()` shows no unexpected growth in any single tier
- [ ] Average quality score (`avgQualityScore`) is above 0.5
- [ ] No items have been in `short-term` tier for longer than their stated TTL
- [ ] `prune(expiredOnly: true, dryRun: true)` returns an expected number of candidates
- [ ] Long-term memory items older than 90 days have been reviewed for relevance

### Session Close Checklist
- [ ] `summarize()` has been called to capture the session's key decisions
- [ ] Important session items have been promoted to `long-term` or `project` tier
- [ ] Handoffs to the next Skill have completed without `HANDOFF_FAILED` errors
- [ ] `prune({ expiredOnly: true, scope: 'session', sessionId })` has been run to clean up
