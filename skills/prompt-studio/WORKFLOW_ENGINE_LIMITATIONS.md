# Workflow Engine Limitations — Prompt Studio Notes

**Recorded by:** Prompt Studio v0.1.0  
**Engine version:** workflow-engine v0.1.0  
**Date:** 2026-06-27

These observations were made while integrating the Workflow Engine into `importPrompts`. They describe current constraints in Phase A of the engine. **No engine code was modified.**

---

## L-01 Sequential Step Execution

**Constraint:** Ready steps execute one at a time, even when they have no data dependency on each other.

**Impact on Prompt Studio:** The `import-templates` step depends on `import-categories` for its `categoryMap`, so the sequential order is correct. However, future import workflows with independent parallel branches (e.g., importing tags and users simultaneously) cannot benefit from parallelism.

**Workaround:** Structure workflows so data dependencies are explicit. Independent work that must run faster should be done outside the WE until parallel execution lands.

---

## L-02 Fail-Fast with No Partial Rollback

**Constraint:** When a step fails, the workflow terminates immediately. There is no compensation or rollback of work completed by earlier steps.

**Impact on Prompt Studio:** If `import-categories` succeeds but `import-templates` throws, the categories have already been written to the store. The caller receives a failed `ImportResult` with zero import counts. The partially imported categories remain.

**Workaround:** Validate the full bundle in the `validate` step before any mutations. The `_validateBundle` check catches structural issues early so mutations only begin with a confirmed-valid bundle. True rollback would require storing pre-import snapshots, which is deferred.

---

## L-03 Context Type Erasure

**Constraint:** `WorkflowRunOptions.context` is typed as `Record<string, unknown>`. Handlers receive the same type for both the `context` (shared workflow state) and `data` (routed step outputs). Every handler must narrow types with explicit casts.

**Impact on Prompt Studio:** All four import handlers contain `context['bundle'] as ExportBundle` and `context['mode'] as 'skip' | 'overwrite'` casts. A type-safe context is not possible without engine changes.

**Workaround:** Narrow only at the call site inside handlers. Do not propagate `unknown` further; assign to a typed local variable immediately.

---

## L-04 No Cancellation Mechanism

**Constraint:** Once `workflowEngine.run()` is called, there is no way to cancel it from outside. The only timeout mechanism is per-step (`timeoutMs`), not per-workflow.

**Impact on Prompt Studio:** A large bundle import cannot be cancelled mid-flight. The caller must await the full result or let the process exit.

**Workaround:** For now, import is fast enough (in-memory only) that cancellation is not needed. Future file-based or network-based imports should set a conservative `timeoutMs` per step.

---

## L-05 Step Output Wrapping for Primitive Values

**Constraint:** When a handler returns a non-object value (e.g., a number or string), the engine wraps it as `{ value: result }` before routing. Handlers that return plain objects are unaffected.

**Impact on Prompt Studio:** All four import handlers return plain objects (`{ valid, errors }`, `{ categoryMap, imported, skipped }`, etc.), so no wrapping occurs. This is by design but requires knowing the rule when writing handlers.

**Workaround:** Always return a plain object from handlers, even for single values (e.g., `{ count: 5 }` instead of `5`).

---

## L-06 No Persistent State or Resume

**Constraint:** All workflow state is in-memory and lost if the process exits mid-run. There is no checkpoint/resume capability.

**Impact on Prompt Studio:** Import of very large bundles in a production environment with crash recovery requirements cannot use the current engine. All data is in-memory anyway, so a crash loses both the import progress and the store state.

**Workaround:** Not applicable for the current in-memory-only implementation. Document as a known limitation and revisit when persistence is added.
