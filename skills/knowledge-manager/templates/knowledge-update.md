# Knowledge Update Template

Use this template when updating an existing knowledge entry. Complete every section before calling `update()`.

---

## Entry to Update

**Entry ID**: `km-` _______________________________________________

**Current Title**: _______________________________________________

**Current Version**: _______________________________________________

**Reason for Update**: _______________________________________________

---

## Change Classification

Determine the version bump required:

| Change Type | Version Bump | Example |
|---|---|---|
| Typo fix, formatting only | Patch (`0.1.0 → 0.1.1`) | Fixed a misspelling |
| New content added, no breaking change | Minor (`0.1.0 → 0.2.0`) | Added a new shot type definition |
| Meaning or interface fundamentally changed | Major (`0.1.0 → 1.0.0`) | Rewrote content to contradict the original |

**New version**: _______________________________________________

---

## Patch Fields

List every field being changed. Leave unchanged fields blank.

```json
{
  "title":         "<!-- new title, or leave empty if unchanged -->",
  "content":       "<!-- full updated content body, or leave empty if unchanged -->",
  "status":        "<!-- draft | active | deprecated | archived, or leave empty -->",
  "tags":          [],
  "version":       "<!-- new semver -->",
  "relationships": [],
  "citations":     [],
  "metadata":      {}
}
```

---

## Change Summary

Write a clear, present-tense summary of what changed and why. This is stored in version history.

**Change summary** (required, ≤ 120 characters):

> _______________________________________________

**Changed by** (author identifier):

> _______________________________________________

---

## Impact Assessment

- [ ] This change affects any entry that has a `depends-on` or `extends` relationship pointing to this entry
- [ ] This change resolves a `conflicted` flag (add `supersedes` or `contradicts` relationships as needed)
- [ ] This change makes a previous relationship obsolete (remove or update relationship entries)
- [ ] This change promotes the entry from `draft` to `active` (quality has been verified)
- [ ] This change deprecates the entry (set `status: 'deprecated'` and link to the replacement)

---

## Pre-Update Checklist

- [ ] Ran `validate()` on the patched object — result is `isValid: true`
- [ ] New version string follows semver and is higher than the current version
- [ ] Change summary is specific and non-empty
- [ ] Related entries have been reviewed for any cascading impact
- [ ] Citations are updated if the factual basis of the content changed
