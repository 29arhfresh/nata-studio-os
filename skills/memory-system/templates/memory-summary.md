# Memory Summary Template

Use this template to document and review a memory summary before using it in an LLM prompt or session handoff. Remove all placeholder comments before submitting.

---

## Summary Request

```json
{
  "scope": "<!-- global | project | session -->",
  "sessionId": "<!-- Required if scope is 'session' -->",
  "projectId": "<!-- Required if scope is 'project' -->",
  "tiers": ["<!-- short-term | long-term | project | session — tiers to include -->"],
  "maxItems": 50
}
```

---

## Generated Summary

<!-- Paste the `text` output from `memorySystem.summarize()` here after generation.
     The summary should follow this structure:

## Short-Term Memory
- **key-name** (score: 0.87): value excerpt
- **key-name** (score: 0.75): value excerpt

---

## Long-Term Memory
- **key-name** (score: 0.95): value excerpt

---

## Project Memory
- **key-name** (score: 0.91): value excerpt
-->

---

## Summary Metrics

| Metric | Value |
|---|---|
| Item count | `<!-- itemCount from API response -->` |
| Token estimate | `<!-- tokenEstimate from API response -->` |
| Generated at | `<!-- generatedAt from API response -->` |
| Tiers included | `<!-- list -->` |
| Scope | `<!-- scope -->` |

---

## Quality Assessment

<!-- Review the generated summary before using it. -->

### Coverage
- [ ] All high-priority memory items are represented
- [ ] Low-quality items (score < 0.4) were excluded
- [ ] No expired items appear in the summary

### Size
- [ ] Token estimate is within the target model's context budget (≤4000 tokens)
- [ ] If token estimate exceeds budget, `maxItems` was reduced and summary regenerated

### Accuracy
- [ ] Summary accurately reflects the current state of the project / session
- [ ] No outdated or superseded items appear

---

## Usage Plan

<!-- Where will this summary be injected?

     Option A — LLM system prompt:
       Prepend to the system prompt as a "Current Context" section.

     Option B — Long-term memory cache:
       Store as a `long-term` item with key `session-summary:<date>`.

     Option C — Handoff payload:
       Pass as the context block in a `handoff()` call.

     Option D — Human review:
       Present to the creative director as a session recap before sign-off.
-->

---

## Checklist

Before using this summary, confirm:

- [ ] Summary was generated with the correct `scope`, `sessionId`/`projectId`
- [ ] Token estimate is within budget
- [ ] Coverage is complete for the intended use case
- [ ] Summary has been stored in long-term memory if it needs to persist beyond the session
