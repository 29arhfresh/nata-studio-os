# Troubleshooting — Project Manager

Failure mode diagnosis and recovery strategies for common problems.

---

## Error Reference

### `VALIDATION_FAILED`

**Cause**: A required field is missing, empty, or outside its valid range.

**Common triggers**:
- `createProject` called with an empty `name` or `owner`
- `startDate` is after `targetEndDate`
- `createTask` called with negative `estimatedHours`
- `setTaskStatus` called with `blocked` but no `blockerReason`
- `createRisk` called with `probability` or `impact` outside `[0, 1]`
- `logHours` called with `hours <= 0`
- `consumeResource` called with `amount <= 0`
- `createResource` called with negative `allocated`

**Recovery**:
1. Read the full error message — it names the specific field and constraint that failed.
2. Correct the value and retry.
3. For date range errors, confirm that `startDate ≤ targetEndDate` in ISO 8601 format.

---

### `NOT_FOUND`

**Cause**: An entity ID was provided that does not exist in the in-memory store.

**Common triggers**:
- Using a stale ID from a previous session (in-memory store does not persist across restarts)
- Typo in a hard-coded ID string
- Calling `getProject` for a project that was never created in this session
- Calling `getTask` with a task ID that belongs to a different session

**Recovery**:
1. Call `listProjects()` to see all currently known project IDs.
2. Call `listTasks(projectId)` to see all task IDs for a known project.
3. If the ID should exist but the store is empty, the session was restarted — recreate the entity.
4. For integration tests, ensure the store is populated before asserting on IDs.

---

## Behavioral Issues

### Health score is red but the project looks fine

**Symptom**: `scoreHealth` returns `red` unexpectedly.

**Diagnosis steps**:
1. Inspect the `factors` array in the returned `ProjectHealthResult`.
2. Check the `Schedule` factor: is `targetEndDate` in the past?
3. Check the `Blockers` factor: are 25% or more of tasks in `blocked` status?
4. Check the `Risks` factor: is there an open risk with `probability × impact ≥ 0.8`?

**Recovery**:
- **Schedule red**: Update `targetEndDate` via `updateProject` if the timeline was extended.
- **Blockers red**: Resolve blocked tasks or unblock them via `setTaskStatus`.
- **Risks red**: Update the risk via `updateRisk` with `status: 'mitigated'` or `status: 'accepted'`.

---

### Completion percentage is not updating

**Symptom**: `completionPercent` remains at an unexpected value after marking tasks done.

**Cause**: Completion is computed from non-cancelled tasks only. Cancelled tasks are excluded from both the numerator and denominator.

**Diagnosis**:
1. Check whether tasks are in `done` or `cancelled` status via `listTasks(projectId)`.
2. Confirm that `setTaskStatus(id, 'done')` was called — not just `updateTask` with a status patch (both work, but verify the call succeeded).
3. Check whether `updateProject` was called after the task update — it is called automatically by `updateTask` and `setTaskStatus`.

**Recovery**:
- Call `updateProject(projectId, {})` to force a refresh of `completionPercent` and health.

---

### Roadmap `isOnTrack` is false when all tasks appear done

**Symptom**: A milestone shows `isOnTrack: false` even though all its linked tasks are `done`.

**Diagnosis**:
1. Check `milestone.dueDate` — if the due date is in the past and the milestone status is not `achieved`, the milestone is considered overdue regardless of task status.
2. Check `milestone.status` — it must be `achieved` for a past-due milestone to count as on-track.

**Recovery**:
- Call `updateMilestone(id, { status: 'achieved' })` to mark the milestone achieved.
- The roadmap will then reflect `isOnTrack: true` for that milestone.

---

### Task dependency not enforced at runtime

**Symptom**: A task can be moved to `in-progress` even when its dependencies are not done.

**Explanation**: The current implementation records dependencies in the data model but does not enforce them at the API level. Dependency enforcement is the caller's responsibility.

**Best practice**:
- Check all `task.dependencies` are in `done` status before transitioning a task to `in-progress`.
- The `generateRoadmap` output can guide this: check that all tasks in earlier milestones are done before advancing.

---

### Resource utilization shows 0% despite consumption

**Symptom**: `generateStatusReport` shows 0% utilization for a resource that has been consumed.

**Diagnosis**:
1. Confirm `consumeResource` was called with a positive `amount`.
2. Confirm `consumeResource` received the correct `ResourceId` — not a project or task ID.
3. Check that `resource.allocated > 0`: utilization is `0 / 0 = 0` if allocation is zero.

**Recovery**:
- If the resource was created with `allocated: 0`, update it via `updateProject` to re-register the resource with a correct allocation, then call `consumeResource`.

---

## Performance Guidance

### Large task lists slow down project operations

**Context**: `listTasks`, `listMilestones`, `listRisks`, and internal helpers iterate over the full in-memory store.

**Impact threshold**: Noticeable degradation above approximately 1,000 entities per project in the in-memory store.

**Mitigation**:
- Decompose very large projects into sub-projects with their own project IDs.
- Archive completed projects to reduce the active store size.
- In a production deployment, replace the in-memory `Map` stores with a persistent indexed database and use filtered queries rather than full scans.

---

## Data Persistence

### All data is lost on process restart

**Explanation**: The current implementation uses in-memory `Map` stores. Data does not survive a process restart, session end, or module reload.

**For production use**:
- Integrate with Memory System (`memory-system`) to serialize project state at session end and restore at session start.
- Alternatively, replace the `Map` stores in `src/index.ts` with calls to a persistent store (database, file system, or external API) while preserving the same public interface.
- The public API does not change when the backing store changes; callers are unaffected.
