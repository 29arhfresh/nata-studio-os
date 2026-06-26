# Checklist — Knowledge Manager

Use these checklists at each stage of knowledge operations to catch issues before they corrupt the index or produce poor retrieval results.

---

## Pre-Write Checklist

Complete before calling `create()` or `update()`.

### Entry Completeness
- [ ] Title is present, concise, and unique (not a duplicate of an existing entry)
- [ ] Content is complete and self-contained (a reader unfamiliar with context can understand it)
- [ ] Type is correctly chosen from the allowed list
- [ ] Status reflects the current lifecycle stage (`draft` if unreviewed, `active` if production-ready)
- [ ] Author is populated with the correct identifier
- [ ] Version follows semver format (`MAJOR.MINOR.PATCH`)

### Tag Quality
- [ ] At least one tag is present
- [ ] All tags are lowercase and hyphen-separated (no spaces, no uppercase)
- [ ] Tags are specific enough to narrow search results (avoid overly generic terms like `info`)
- [ ] The tag set does not duplicate the entry type (e.g., do not tag a `glossary` entry with `glossary`)

### Content Quality
- [ ] Content contains no hardcoded credentials, secrets, or personal data
- [ ] Content is factually accurate and does not contradict verified entries
- [ ] Content length is appropriate (not a one-liner; not a raw data dump)
- [ ] External claims are supported by citations

### Relationships
- [ ] Existing related entries have been searched before adding this one
- [ ] Relationship types are correctly chosen (not all relationships are `related-to`)
- [ ] If this entry supersedes another, the target is scheduled for deprecation
- [ ] If this entry contradicts another, both entries will be flagged as `conflicted`

### Citations
- [ ] Reference-type entries have at least one citation
- [ ] Each citation includes the source name and access date
- [ ] URLs in citations are stable (prefer DOIs, archived links, or internal references)

---

## Pre-Search Checklist

Complete before calling `search()` or `assembleContext()`.

- [ ] Query is specific enough to narrow results (avoid single-word queries like `video`)
- [ ] The correct retrieval strategy is selected for the use case
- [ ] Tags are specified when the topic domain is known (improves precision)
- [ ] A `minQualityScore` is set when only verified content should appear
- [ ] `limit` is appropriate for the use case (higher for exploration, lower for focused retrieval)
- [ ] For context assembly, the token budget is understood before interpreting the result

---

## Post-Write Checklist

Complete after every `create()` or `update()` call.

- [ ] The returned entry has a valid `id` starting with `km-`
- [ ] `qualityScore` is above 0.5 (if below, review warnings from `validate()`)
- [ ] `qualityFlag` is appropriate for the content maturity level
- [ ] Relationships are correctly stored on the returned entry
- [ ] Version history records the change for `update()` calls
- [ ] Duplicate detection has been run if this is a new entry in a crowded tag space

---

## Post-Search Checklist

Complete after every `search()` call before using the results.

- [ ] Results have non-zero `relevanceScore` values (zero scores indicate no match)
- [ ] The top result's `matchedTerms` include the key concepts from the query
- [ ] Result `qualityScore` values are acceptable for the intended use
- [ ] If zero results returned: check query spelling, broaden tags, lower `minQualityScore`
- [ ] For context assembly: verify `tokenEstimate` is within the model's context window

---

## Maintenance Checklist

Run periodically or after any bulk operation.

### After Import
- [ ] `importEntries()` result shows zero or an acceptable number of `failed` entries
- [ ] All error messages from `failed` entries have been reviewed and resolved
- [ ] `reScore()` has been called to update quality scores for newly imported entries
- [ ] Duplicate detection has been run to catch near-duplicates from the import batch

### After Tag Rename
- [ ] `renameTag()` returned the expected number of affected entries
- [ ] A search using the new tag returns the expected results
- [ ] A search using the old tag returns zero results
- [ ] Version history on affected entries records the rename operation

### After Bulk Archive
- [ ] Archived entries no longer appear in default search results
- [ ] Entries that depended on archived entries have had their relationships reviewed
- [ ] Stats confirm the `byStatus.archived` count is as expected

### Scheduled Health Check
- [ ] `stats()` shows no unexpected spikes in `byStatus.deprecated` or `byStatus.draft`
- [ ] Average quality score (`avgQualityScore`) is above 0.6
- [ ] `detectDuplicates()` returns no new duplicate groups
- [ ] Tag list has no orphaned or misspelled tags
- [ ] No entries have been in `draft` status for more than 30 days without update

---

## Knowledge Review Checklist

For periodic human review of active knowledge.

- [ ] Entry content is still accurate and current
- [ ] No newer entries contradict this one without a `contradicts` relationship being declared
- [ ] All citations are still accessible and have not been retracted
- [ ] Tags still reflect the current taxonomy (no tags that were renamed and not updated here)
- [ ] Quality flag matches the current state of the entry (`verified` entries have been reviewed by a human)
- [ ] If the entry is `deprecated`, a replacement entry exists and is `active`
