# Memory Cleanup Template

Use this template to plan and document a memory pruning operation before execution. Remove all placeholder comments before submitting.

---

## Cleanup Scope

```json
{
  "tier": "<!-- short-term | long-term | project | session | undefined (all tiers) -->",
  "scope": "<!-- global | project | session | undefined (all scopes) -->",
  "projectId": "<!-- Required if scope is 'project' -->",
  "sessionId": "<!-- Required if scope is 'session' -->",
  "expiredOnly": true,
  "minQualityScore": 0.3,
  "dryRun": true
}
```

---

## Trigger

<!-- Why is this cleanup being run now?
     - Scheduled maintenance (weekly/monthly)
     - Session close hook
     - Pre-export cleanup
     - Post-import quality enforcement
     - Manual request from team member
-->

---

## Dry-Run Report

<!-- Paste the `candidates` output from `memorySystem.prune({ dryRun: true })` here.
     Review every candidate before approving the live run.

| Key | Tier | Scope | Reason | Quality Score | Expires At |
|---|---|---|---|---|---|
| `<!-- key -->` | `<!-- tier -->` | `<!-- scope -->` | `<!-- expired | below-threshold -->` | `<!-- score -->` | `<!-- date or N/A -->` |
-->

---

## Candidate Review

For each candidate in the dry-run report:

- [ ] Item is genuinely stale or expired (not prematurely flagged)
- [ ] Item is not referenced by an active session or pending handoff
- [ ] Item is not the only copy of data that cannot be recreated
- [ ] Removing this item will not break any downstream Skill's expected context

---

## Items to Protect

<!-- List any items that appeared in the dry-run candidates but must NOT be pruned.
     Document the reason so they can be re-tagged or rescheduled.

| Key | Reason to Retain |
|---|---|
| `<!-- key -->` | `<!-- reason -->` |
-->

---

## Pre-Prune Actions

<!-- Complete these steps before running the live prune. -->

- [ ] Export a backup of the target tier/scope: `memorySystem.exportItems(...)` (if applicable)
- [ ] Confirm no active sessions are using the target items
- [ ] Review dry-run report with a second team member (for production environments)
- [ ] Remove protected items from the prune scope (adjust filters or add exclusions)

---

## Live Prune Configuration

```json
{
  "tier": "<!-- same as dry-run -->",
  "scope": "<!-- same as dry-run -->",
  "projectId": "<!-- same as dry-run -->",
  "sessionId": "<!-- same as dry-run -->",
  "expiredOnly": "<!-- same as dry-run -->",
  "minQualityScore": "<!-- same as dry-run -->",
  "dryRun": false
}
```

---

## Post-Prune Verification

After running the live prune, confirm:

- [ ] `removed` count matches the expected count from the dry-run (minus protected items)
- [ ] `skipped` count is understood (referenced or protected items)
- [ ] No items that should have been retained are missing: run targeted `search()` checks
- [ ] `stats()` shows updated item counts per tier
- [ ] `avgQualityScore` has increased or remained stable

---

## Cleanup Summary

| Metric | Value |
|---|---|
| Removed | `<!-- count -->` |
| Retained | `<!-- count -->` |
| Skipped (protected) | `<!-- count -->` |
| Pruned at | `<!-- ISO 8601 timestamp -->` |
| Next scheduled cleanup | `<!-- date -->` |

---

## Checklist

Before finalizing, confirm:

- [ ] Dry-run was completed and reviewed before the live run
- [ ] No critical items were removed unintentionally
- [ ] Post-prune verification checks all passed
- [ ] This cleanup record has been stored as a `session`-tier audit item
