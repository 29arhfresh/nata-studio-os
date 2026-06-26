# Knowledge Search Template

Use this template to plan and execute a knowledge search. Fill in each section before calling `search()` or `assembleContext()`.

---

## Search Intent

<!-- Describe what you are trying to find and why you need it.
     Example: "I need the cinematographic rules for framing a medium close-up shot
               to include in a video prompt for the AI Video Director Skill."
-->

**Goal**: _______________________________________________

**Consumer**: <!-- Which Skill or process will use the results? -->

---

## Query Design

```
Primary query: "<!-- The main search string — specific, 3–10 words -->"

Fallback query: "<!-- If primary returns zero results, try this broader version -->"
```

**Tip**: Use concrete nouns and adjectives from the domain, not meta-words like "information" or "data".

---

## Search Parameters

```json
{
  "query": "<!-- your primary query -->",
  "strategy": "<!-- hybrid (default) | exact | tag-match | semantic | relationship-traversal -->",
  "tags": ["<!-- optional: narrow to known tags -->"],
  "types": ["<!-- optional: concept | procedure | reference | example | decision | glossary | faq | standard -->"],
  "limit": 5,
  "minQualityScore": 0.5,
  "includeArchived": false
}
```

---

## Strategy Selection Guide

| If you need... | Use strategy |
|---|---|
| The exact entry whose title you already know | `exact` |
| All entries on a known topic tag | `tag-match` |
| Entries that conceptually match a question | `semantic` |
| Entries connected to a known seed entry | `relationship-traversal` |
| Balanced recall and precision (default) | `hybrid` |

---

## Context Assembly (if building an LLM prompt)

```json
{
  "query": "<!-- same as above -->",
  "strategy": "hybrid",
  "tokenBudget": 4000
}
```

**Token guidance**:
- Single-fact lookup: `limit: 1–2`, expect ≈ 50–200 tokens
- Topic overview: `limit: 3–5`, expect ≈ 200–800 tokens
- Full context assembly: `limit: 10–20`, expect ≈ 800–4000 tokens

---

## Expected Results

<!-- Describe what a successful result looks like.
     Example: "At least 2 entries about shot types with qualityScore ≥ 0.6"
-->

**Minimum acceptable**: _______________________________________________

---

## Result Evaluation

After running the search, fill in:

| # | Entry Title | Relevance Score | Quality Score | Useful? |
|---|---|---|---|---|
| 1 | | | | Yes / No |
| 2 | | | | Yes / No |
| 3 | | | | Yes / No |

**If useful results were not found**:
- [ ] Tried fallback query
- [ ] Removed tag filters
- [ ] Lowered `minQualityScore` to `0`
- [ ] Ran `listTags()` to verify correct tag names
- [ ] Confirmed entries exist with `stats()`
