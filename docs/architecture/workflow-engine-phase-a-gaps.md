# Workflow Engine v1.0 — Phase A Gaps

Observed while building AI Creative Director (Milestone 2). These are real limitations encountered during production skill development, not theoretical concerns.

---

## 1. Sequential execution only

**Impact:** Unverified — hypothesis only, not observed in this Skill.

All ready steps execute one after another even when they have no data dependency. This is a real architectural constraint, but it did not affect AI Creative Director because the brief workflow is a strict linear chain with genuine data dependencies at every step:

```
validate-brief → develop-concept → select-tool → generate-prompts → plan-production
```

Every step requires the previous step's output. No two steps in this workflow could run in parallel even if the engine supported it. The sequential constraint did not cause any slowdown or force any design compromise here.

The impact becomes real when a workflow has genuinely independent branches — for example, two parallel concept-exploration paths that both feed a final synthesis step. No such workflow exists in the codebase yet.

**Workaround used:** None required. The workflow is linear because its data dependencies are linear.

**Evidence from this Skill:** Insufficient. This gap is a hypothesis about future workflow shapes, not a measured impact from current usage.

**Needed for Phase B:** Parallel step execution for steps with independent `dependsOn` lists. Priority should be re-evaluated when a Skill requires a workflow with provably independent branches.

---

## 2. No context mutation from steps

**Impact:** Medium

`StepInput.context` is a read-only snapshot seeded at workflow start. Steps cannot write back to the shared context store. All inter-step data must travel via DataRouter routes.

**Workaround used:** Used DataRouter with explicit fan-out routes to pass `brief`, `concept`, and `toolSelection` to all downstream steps that need them. This produces 10 routes for a 5-step workflow.

**Needed for Phase B:** A `context.set(key, value)` method available to step handlers, or a scoped output-aggregation mechanism that reduces route boilerplate.

---

## 3. No conditional branching

**Impact:** Medium

All steps in a workflow definition are always executed (or the whole workflow fails). There is no way to route execution based on a step's output value — for example, skip `plan-production` if `select-tool` returns no viable tool, or take a different code path based on `mediaType`.

**Workaround used:** Moved branching logic inside step handlers using regular TypeScript `if` statements. The workflow structure itself is always the same shape.

**Needed for Phase B:** A `condition` field on `StepDefinition` that evaluates against step outputs before running the step.

---

## 4. No workflow-level input type safety

**Impact:** Low–Medium

`StepInput.context` and `StepInput.data` are both typed `Record<string, unknown>`. Steps must cast incoming data with `as MyType`, which is unsafe and produces TypeScript branch warnings in coverage reports (the `59-61,109` etc. lines flagged as uncovered branches are all `as` cast sites).

**Workaround used:** Accepted the casts as a known limitation. Validation steps (e.g. `validate-brief`) check the data before it enters the workflow engine and throw typed errors if inputs are malformed.

**Needed for Phase B:** A generic `WorkflowDefinition<TContext, TStepOutputs>` that propagates types through the step chain, or a `zod`-based schema validation layer at the engine boundary.

---

## 5. Fail-fast with no partial recovery

**Impact:** Low (acceptable for current use cases)

One step failure terminates the entire workflow and discards all partial outputs. In a production pipeline where `generate-prompts` fails for one deliverable but succeeds for others, the caller gets nothing.

**Workaround used:** Wrapped prompt generation and tool selection in defensive handlers that throw typed errors early, making failure predictable.

**Needed for Phase B:** A `continueOnStepFailure` option that marks steps as failed but allows the workflow to continue so partial results are still returned.

---

## 6. No built-in retry-with-backoff strategy

**Impact:** Low

`maxRetries` retries immediately with no delay between attempts. For steps that call external AI APIs, immediate retry on rate-limit errors will produce the same failure.

**Workaround used:** Not triggered in this skill (all logic is in-process).

**Needed for Phase B:** A `retryDelayMs` or `backoffStrategy` field on `StepDefinition`.

---

## Summary table

| Gap                         | Phase B Priority | Workaround Available |
|-----------------------------|------------------|----------------------|
| Sequential execution        | Unverified       | N/A — not triggered  |
| No context mutation         | Medium           | Yes — fan-out routes |
| No conditional branching    | Medium           | Yes — in-handler if  |
| Weak input typing           | Medium           | Yes — cast + validate |
| Fail-fast / no partial result | Low            | Yes — early validation |
| No retry backoff            | Low              | Yes — not needed yet |

**Overall verdict:** Workflow Engine v1.0 is capable of supporting real production workflows. None of the gaps above blocked delivery of AI Creative Director. The engine's event system, DataRouter, and retry primitives provide a solid foundation.

Of the gaps above, only gaps 2–4 were directly observed during implementation. Gaps 1 and 6 are hypotheses about future usage patterns and require evidence from a second Skill before a Phase B priority can be assigned. Gap 2 (no context mutation, 10 routes for 5 steps) is the most clearly evidenced friction from this Skill.
