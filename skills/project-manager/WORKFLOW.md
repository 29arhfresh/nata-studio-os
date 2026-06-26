# Workflow — Project Manager

The Project Manager workflow runs in six stages. Each stage has defined inputs, outputs, and decision gates that must pass before the project advances.

---

## Stage 1: Project Initiation

**Input**: Project brief, stakeholder request, or strategic goal
**Output**: A validated project in `planning` status

### Capture These Elements

Before calling `createProject`, establish:

| Element | Questions to Answer |
|---|---|
| **Name** | What is the precise, unambiguous name of this project? |
| **Goal** | What does success look like at the end? |
| **Owner** | Who is accountable for delivery? Who makes final decisions? |
| **Priority** | How does this rank against existing projects? |
| **Dates** | What is the realistic start date and target end date? |
| **Tags** | Which labels will make this project discoverable in lists? |

### Initiation Decision Gate

```
Is the project brief complete and approved?
  ├── YES → Call createProject → proceed to Stage 2
  └── NO  → Return to requester with missing fields → loop back to Initiation
```

---

## Stage 2: Planning

**Input**: Project in `planning` status
**Output**: Tasks, milestones, risks, and resources registered against the project

### Planning Steps

1. **Decompose the goal** — Break the project goal into tasks of ≤ 40 hours each.
2. **Assign owners** — Every task must have an assignee before it leaves planning.
3. **Map dependencies** — Record `dependencies` on tasks that cannot start until another is done.
4. **Define milestones** — Group related tasks under milestones with explicit `successCriteria`.
5. **Identify risks** — Log at least one risk. Assign an owner and a review date.
6. **Allocate resources** — Register every budget pool, time allocation, or tool license.
7. **Baseline health** — Call `scoreHealth` to confirm the project starts green.

### Planning Decision Gate

```
Does the plan have:
  - At least one task?          ├── NO → Add tasks before advancing
  - At least one milestone?     ├── NO → Define milestones before advancing
  - At least one risk?          ├── NO → Identify at least one risk before advancing
  - All resources allocated?    ├── NO → Register resource pools before advancing
  └── ALL YES → Call setProjectStatus('active') → proceed to Stage 3
```

---

## Stage 3: Execution

**Input**: Project in `active` status, planned tasks and milestones
**Output**: Progressing tasks, logged hours, updated health score

### Execution Rhythm

| Cadence | Action |
|---|---|
| Daily | Review blocked tasks; update task statuses; log hours |
| Weekly | Call `generateStatusReport`; review open risks; update milestone progress |
| Per sprint | Review dependency chains; update estimates if work reveals new complexity |
| On event | Log a blocker reason immediately when a task transitions to `blocked` |

### Task Status Flow

```
backlog → todo → in-progress → in-review → done
                    ↕
                 blocked
                    ↓
              (unblocked) → in-progress
```

Cancelled tasks exit the flow at any point. They are excluded from completion percentage calculations.

### Execution Decision Gate

```
Is any task blocked?
  ├── YES → Capture blocker reason → notify assignee and project owner
  └── NO  → Continue execution

Is any milestone past its due date?
  ├── YES → Mark as 'missed'; document reason; consider deferral
  └── NO  → Continue

Is health score red?
  ├── YES → Escalate to project owner immediately → remediate before next report
  └── NO  → Continue
```

---

## Stage 4: Risk Monitoring

**Input**: Active project with registered risks
**Output**: Risk statuses updated; health re-scored

### Risk Review Process

1. **Review open risks** on the scheduled `reviewDate` for each risk.
2. **Update status** — set `mitigated`, `accepted`, or `closed` when appropriate.
3. **Re-score health** — call `scoreHealth` after any risk status change.
4. **Escalate** — any risk with `probability × impact ≥ 0.8` must be escalated to the project owner.

### Risk Score Interpretation

| Risk Score | Meaning | Action |
|---|---|---|
| ≥ 0.80 | Critical — likely to derail the project | Escalate immediately; update mitigation plan |
| 0.60–0.79 | High — significant threat to schedule or quality | Owner review within 7 days |
| 0.30–0.59 | Medium — monitor closely | Review on next scheduled date |
| < 0.30 | Low — unlikely and manageable | Standard review cadence |

### Risk Decision Gate

```
Is there an open risk with score ≥ 0.8?
  ├── YES → Health is forced to RED → escalate to owner
  └── NO

Is there an open risk with score ≥ 0.6?
  ├── YES → Health is at least YELLOW → note in next report
  └── NO  → Risk factor is GREEN
```

---

## Stage 5: Reporting

**Input**: Project data at any point in time
**Output**: Status report, roadmap, or health summary

### Status Report Components

Every report generated by `generateStatusReport` contains:

1. **Health color** — derived from current schedule, blockers, and risk factors
2. **Completion percentage** — `done tasks / non-cancelled tasks × 100`
3. **Milestone progress** — `achieved / total`
4. **Task progress** — `done / total`
5. **Open risks** — count of open risks; count of critical risks
6. **Blocked tasks** — count and list of blockers with reasons
7. **Resource utilization** — per-resource `consumed / allocated` percentage
8. **Recent accomplishments** — achieved milestones
9. **Next steps** — next three upcoming or in-progress milestones
10. **Issues** — blocked tasks and critical risk descriptions

### Roadmap Interpretation

The roadmap returned by `generateRoadmap` shows milestones in due-date order. Each entry includes:

- The milestone details
- All linked tasks with their current statuses
- The number of open risks due before the milestone date
- `isOnTrack` flag: `true` when all linked tasks are `done` and the milestone is not overdue

### Reporting Decision Gate

```
Is health RED in the report?
  ├── YES → Do not present the report without a remediation comment
  └── NO  → Present report as generated

Are there unresolved blockers listed?
  ├── YES → Include blocker owners and escalation paths in next steps
  └── NO  → Present normally
```

---

## Stage 6: Closure and Archival

**Input**: Project approaching completion or cancellation
**Output**: Project in `completed` or `cancelled` status, then `archived`

### Closure Checklist

Before calling `setProjectStatus('completed')`:

1. All tasks are `done` or `cancelled`. No task is `in-progress`, `blocked`, or `in-review`.
2. All milestones are `achieved`, `missed`, or `deferred`. Missed milestones have documented reasons.
3. All risks are `mitigated`, `accepted`, or `closed`. No open critical risks remain.
4. A final status report has been generated and acknowledged.
5. All resource utilization figures are up to date.

### Closure Decision Gate

```
Are any tasks still active (not done / cancelled)?
  ├── YES → Resolve or cancel all active tasks first
  └── NO

Are any risks still open?
  ├── YES → Close, accept, or mitigate all risks first
  └── NO

→ Call setProjectStatus('completed')
→ Generate final report
→ Call archiveProject
```

---

## Cross-Stage Rules

- **Health is always computed, never assumed.** Call `scoreHealth` before any report or status transition.
- **Blockers require reasons.** The API enforces this at the data layer; never bypass it.
- **Completion percentage is automatic.** Do not manually set `completionPercent`; it is derived from task statuses.
- **Archived projects are invisible by default.** `listProjects` excludes archived projects; access them by ID if needed.
- **Resources are non-negative.** Allocation and consumption must always be ≥ 0.
