# Knowledge Review Template

Use this template when conducting a scheduled or triggered review of an existing knowledge entry. Complete every section and record your decision at the end.

---

## Entry Under Review

**Entry ID**: `km-` _______________________________________________

**Title**: _______________________________________________

**Type**: _______________________________________________

**Current Status**: _______________________________________________

**Current Version**: _______________________________________________

**Current Quality Score**: _______________________________________________

**Current Quality Flag**: _______________________________________________

**Last Updated**: _______________________________________________

**Last Updated By**: _______________________________________________

---

## Review Trigger

- [ ] Scheduled periodic review (30-day cycle)
- [ ] Flagged as `conflicted` or `outdated`
- [ ] Dependent entry was updated
- [ ] Citation source has been retracted or updated
- [ ] Tag taxonomy cleanup triggered review
- [ ] User-reported inaccuracy

---

## Accuracy Assessment

Answer each question with **Yes**, **No**, or **Partial**.

| Question | Answer | Notes |
|---|---|---|
| Is the content still factually accurate? | | |
| Does the content reflect the current state of the system or domain? | | |
| Are all citations still accessible and valid? | | |
| Does the content contradict any other `active` entry without a declared `contradicts` relationship? | | |
| Are all declared `relationships` still accurate and correctly typed? | | |

---

## Quality Assessment

| Criterion | Score (0–1) | Notes |
|---|---|---|
| Completeness (nothing important is missing) | | |
| Clarity (a new reader can understand without prior context) | | |
| Accuracy (all claims are correct) | | |
| Usefulness (this entry improves retrieval and context quality) | | |

**Estimated overall quality score after changes**: _______________________________________________

---

## Required Actions

Based on the assessment above, select one:

- [ ] **No changes needed** — entry is accurate and complete; promote quality flag to `verified`
- [ ] **Minor update** — fix typos, refresh citations, add missing tags (patch version bump)
- [ ] **Significant update** — content needs substantive revision (minor version bump)
- [ ] **Deprecate** — entry has been superseded; link to replacement entry
- [ ] **Archive** — entry is no longer relevant; no replacement needed

---

## Update Plan

If an update is needed, describe the changes required:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Assigned to**: _______________________________________________

**Due date**: _______________________________________________

---

## Review Sign-Off

**Reviewed by**: _______________________________________________

**Review date**: _______________________________________________

**Decision**: _______________________________________________

---

## Post-Review Checklist

- [ ] `update()` called with correct patch and change summary (if changes were made)
- [ ] Quality flag updated to `verified` (if entry was confirmed accurate)
- [ ] Replacement entry created or linked (if entry was deprecated)
- [ ] `reScore()` called after any content changes
- [ ] Review outcome recorded in the entry's `metadata` field
