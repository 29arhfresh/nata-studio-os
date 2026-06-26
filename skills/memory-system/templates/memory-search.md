# Memory Search Template

Use this template to document and plan a memory search query before executing it. Remove all placeholder comments before submitting.

---

## Search Intent

<!-- One sentence describing what you are trying to find and why. -->

---

## Query Parameters

```json
{
  "query": "<!-- Plain-language query string. Use multiple keywords for better recall. -->",
  "strategy": "<!-- exact | tag-match | semantic | hybrid (default: hybrid) -->",
  "tiers": ["<!-- short-term | long-term | project | session — list all that apply -->"],
  "scope": "<!-- global | project | session -->",
  "projectId": "<!-- Required if scope is 'project' -->",
  "sessionId": "<!-- Required if scope is 'session' -->",
  "tags": ["<!-- optional: restrict to items with at least one of these tags -->"],
  "limit": 10,
  "minQualityScore": 0.5,
  "includeExpired": false
}
```

---

## Expected Results

<!-- What items do you expect to find? List their keys or describe them.
     This helps verify the search returns the right results. -->

| Expected Key | Tier | Tags | Why It Should Match |
|---|---|---|---|
| `<!-- key -->` | `<!-- tier -->` | `<!-- tags -->` | `<!-- reason -->` |

---

## Fallback Strategy

<!-- If the primary query returns no results or low-relevance results, what is the fallback?

     Option A — Broaden query:
       Loosen `minQualityScore` to 0 and remove tag filters.

     Option B — Alternative query terms:
       Try: "<!-- alternative query string -->"

     Option C — Expand tiers:
       Add: ["<!-- additional tier -->"]

     Option D — Lower quality threshold:
       Set `minQualityScore: 0.2`
-->

---

## Post-Search Plan

<!-- What will you do with the retrieved items?
     - Inject into LLM prompt context via `restoreContext()`
     - Pass to another Skill via `handoff()`
     - Summarize via `summarize()`
     - Display directly to the user
-->

---

## Checklist

Before executing this search, confirm:

- [ ] Query is specific enough to narrow results (not a single generic word)
- [ ] Correct `tiers` are selected for the data being searched
- [ ] `scope`, `sessionId`, and `projectId` match the intended data boundary
- [ ] `minQualityScore` is appropriate for the use case
- [ ] `limit` matches the downstream consumer's needs
- [ ] A fallback strategy is defined if results are empty or low-relevance
