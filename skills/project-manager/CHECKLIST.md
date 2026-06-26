# Checklist — Project Manager

Use these checklists at each phase of a project's lifecycle. Every item must be confirmed before advancing to the next phase.

---

## Pre-Launch Checklist (Before `active`)

Use before calling `setProjectStatus('active')`.

### Project Definition

- [ ] Project name is unique, clear, and action-oriented.
- [ ] Description captures the goal, not just the work.
- [ ] Owner is a named person or role — not a team alias.
- [ ] Priority is set and justified relative to existing projects.
- [ ] Start date and target end date are realistic and approved.
- [ ] At least one tag is applied for filtering.

### Task Planning

- [ ] All known tasks are created with titles, priorities, and assignees.
- [ ] Every task has an `estimatedHours` value greater than zero.
- [ ] Task dependencies are recorded for any task that cannot start independently.
- [ ] No single task exceeds 40 hours. Larger tasks are split.
- [ ] All `backlog` tasks are triaged and moved to `todo` or left intentionally in backlog.

### Milestones

- [ ] At least one milestone is defined.
- [ ] Every milestone has a `dueDate` within the project's `targetEndDate`.
- [ ] Every milestone has at least one item in `successCriteria`.
- [ ] Milestones are linked to the tasks that deliver them.

### Risk Management

- [ ] At least one risk is registered.
- [ ] Every risk has a non-empty `mitigationPlan`.
- [ ] Every risk has an `owner` and a `reviewDate` within 30 days.
- [ ] Any risk with a score ≥ 0.6 has been communicated to the project owner.

### Resources

- [ ] All budget pools are registered with `type: 'budget'` and a `unit`.
- [ ] All time allocations are registered with `type: 'time'` and a `unit`.
- [ ] All tool licenses or seats are registered with `type: 'tool'`.
- [ ] Every resource has a non-zero `allocated` value.

### Baseline

- [ ] `scoreHealth` returns `green` or there is a documented plan to resolve `yellow` / `red` factors.

---

## Weekly Execution Checklist (During `active`)

Use every week during project execution.

### Status

- [ ] All task statuses are accurate and current.
- [ ] Hours logged this week are recorded via `logHours`.
- [ ] Blocked tasks have a written `blockerReason`.
- [ ] No task has been `in-progress` for more than twice its `estimatedHours` without a status update.

### Milestones

- [ ] Upcoming milestones are reviewed for achievability.
- [ ] Milestones past their `dueDate` are marked `missed` or `deferred` with a reason.
- [ ] Achieved milestones are marked `achieved` and their `achievedDate` is set.

### Risks

- [ ] All risks with a `reviewDate` in the past week are reviewed.
- [ ] Risk statuses are updated: `mitigated`, `accepted`, or `closed` where appropriate.
- [ ] No new risks identified this week are left unregistered.
- [ ] `scoreHealth` is called and the result is acknowledged before the week's report.

### Resources

- [ ] Resource consumption is recorded via `consumeResource` for anything consumed this week.
- [ ] Any resource exceeding 80% utilization is flagged for the project owner.

### Reporting

- [ ] `generateStatusReport` is called with the current period label.
- [ ] The report's `issues` list has no unacknowledged items.
- [ ] Next steps from the previous report have been acted upon.

---

## Milestone Completion Checklist

Use before marking a milestone `achieved`.

- [ ] All linked tasks are in `done` or `cancelled` status.
- [ ] Every item in `successCriteria` is verifiably met.
- [ ] Stakeholder sign-off obtained (if required by the milestone definition).
- [ ] `updateMilestone` is called with `{ status: 'achieved' }`.
- [ ] Project health is re-scored after the milestone update.

---

## Project Closure Checklist (Before `completed`)

Use before calling `setProjectStatus('completed')`.

### Task Resolution

- [ ] Zero tasks in `in-progress`, `blocked`, or `in-review` status.
- [ ] All remaining `todo` or `backlog` tasks are cancelled with a reason recorded.
- [ ] Total `loggedHours` across tasks reflects actual effort spent.

### Milestone Resolution

- [ ] All milestones are in `achieved`, `missed`, or `deferred` status.
- [ ] Missed milestones have a documented reason in their `description`.
- [ ] No milestone remains in `upcoming` or `in-progress` status.

### Risk Resolution

- [ ] All risks are `mitigated`, `accepted`, or `closed`.
- [ ] No open critical risks (score ≥ 0.8) remain.

### Final Report

- [ ] `generateStatusReport` is called with the label `Final`.
- [ ] The final report is shared with the project owner.
- [ ] `completionPercent` in the final report matches the expected outcome.

### Archival

- [ ] `setProjectStatus('completed')` is called.
- [ ] `archiveProject` is called after the final report is acknowledged.
- [ ] The project no longer appears in `listProjects()`.

---

## Emergency Escalation Checklist

Use when health score turns `red`.

- [ ] Identify which factor(s) are red: schedule, blockers, or risks.
- [ ] Notify the project owner within 24 hours of the health turning red.
- [ ] Document the root cause in the project's metadata or a status report.
- [ ] Propose at least one remediation action per red factor.
- [ ] Set a re-check date within 5 business days.
- [ ] Call `scoreHealth` again after remediation to confirm recovery.
