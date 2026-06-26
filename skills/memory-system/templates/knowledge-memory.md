# Knowledge Memory Template

Use this template when caching a Knowledge Manager entry in Memory System for fast, session-level access. Remove all placeholder comments before submitting.

---

## Item Metadata

```json
{
  "tier": "long-term",
  "scope": "<!-- global | project -->",
  "key": "<!-- knowledge:<knowledge-manager-id>, e.g., 'knowledge:km-1234567-abcdefg' -->",
  "projectId": "<!-- Required if scope is 'project'; omit if scope is 'global' -->",
  "source": "knowledge-manager",
  "tags": [
    "knowledge",
    "<!-- domain-tag, e.g., 'cinematography' -->",
    "<!-- type-tag, e.g., 'reference' | 'concept' | 'procedure' -->"
  ],
  "metadata": {
    "knowledgeId": "<!-- The Knowledge Manager ID this item mirrors, e.g., 'km-...' -->",
    "knowledgeType": "<!-- concept | procedure | reference | example | decision | glossary | faq | standard -->",
    "knowledgeVersion": "<!-- The version of the Knowledge Manager entry at time of cache -->",
    "cachedAt": "<!-- YYYY-MM-DD -->",
    "qualityScore": "<!-- Quality score from Knowledge Manager, e.g., 0.87 -->"
  }
}
```

---

## Value

```json
<!-- Mirror of the Knowledge Manager entry content.
     Structure:
     {
       "title": "The Knowledge Manager entry title",
       "content": "The full content body of the entry",
       "type": "reference",
       "tags": ["tag1", "tag2"],
       "citations": [{ "source": "...", "accessedAt": "YYYY-MM-DD" }]
     }

     Keep in sync with the Knowledge Manager entry. Stale caches should be pruned
     when the source entry is updated. Never modify the value directly — update the
     Knowledge Manager entry and re-cache.
-->
```

---

## Purpose

<!-- Why is this knowledge entry cached in Memory System?
     - To avoid repeated Knowledge Manager lookups within a session
     - To make it available to Skills that do not integrate with Knowledge Manager directly
     - To enable fast semantic search alongside operational memory items
-->

---

## Sync Policy

<!-- How should this cached entry stay in sync with the Knowledge Manager source?
     Options:
     - On every session start: re-fetch and overwrite if `knowledgeVersion` changed
     - On explicit invalidation: prune when Knowledge Manager fires an update event
     - TTL-based: set `ttlSeconds` to force periodic refresh (e.g., 86400 for daily)
     - Manual: update only when a team member manually triggers re-caching
-->

---

## Checklist

Before submitting this item, confirm:

- [ ] `tier` is `long-term` (knowledge is persistent)
- [ ] Key follows the `knowledge:<knowledge-manager-id>` convention
- [ ] `metadata.knowledgeId` matches the Knowledge Manager entry ID exactly
- [ ] `metadata.knowledgeVersion` is populated for staleness detection
- [ ] `metadata.cachedAt` is set to today's date
- [ ] Tags include `knowledge` plus at least one domain tag
- [ ] Value mirrors the Knowledge Manager entry content accurately
- [ ] `source` is `knowledge-manager`
