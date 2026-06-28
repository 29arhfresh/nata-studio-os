# Agent Orchestrator 2.0

**Version:** 2.0.0
**Type:** TypeScript
**Status:** Active

## Overview

Agent Orchestrator 2.0 is the intelligent runtime coordinator of Nata Studio OS. It replaces the prototype in `skills/agent-orchestrator/` with three structural improvements:

1. **Registry**: reads skill metadata from `CapabilityRegistry` (Integration Layer), not from a hardcoded constant inside the orchestrator.
2. **Execution**: routes all skill calls through `SkillInvoker`, not a synchronous simulation.
3. **Planning**: detects *capabilities* in the intent and resolves them to registered skills at planning time — skill names never appear in routing logic.

The orchestrator is not a standalone execution engine. Its job is to decide *what* to run (capability planning), *in what order* (capability dependency graph), and *whether the output is acceptable* (quality gate). The *how* is delegated: `WorkflowEngine` owns DAG execution and step scheduling; `SkillInvoker` owns skill dispatch; `CapabilityRegistry` owns capability metadata.

---

## Architecture

```
User Intent
    │
    ▼
AgentOrchestratorV2.orchestrate()
    │
    ├─► detectCapabilities()         — keyword scan against CAPABILITY_KEYWORDS
    │         │
    │         ▼
    ├─► resolveCapabilitiesToSkills() — queries CapabilityRegistry.resolve() per cap
    │         │
    │         ▼
    ├─► topoSortSkills()              — orders skills by CAPABILITY_DEPS rules
    │         │
    │         ▼
    ├─► executePlan()                 — builds WorkflowDefinition, each step handler
    │         │                         calls SkillInvoker.invoke()
    │         ▼
    │   WorkflowEngine.run()          — DAG validation, scheduling, timeout, events
    │         │
    │         ▼
    ├─► evaluateQualityGate()         — threshold check on InvocationResult scores
    │         │
    │         ▼
    └─► buildMemoryHandoff()          — snapshot of outputs for downstream sessions
```

---

## Architectural Decisions

### AD-1: CapabilityRegistry as Single Source of Truth (Req 3)

**Decision:** Capability metadata (which skill can do what) is stored in `CapabilityRegistry` (Integration Layer), not in a hardcoded constant inside the orchestrator.

**Evidence from prototype:** `SKILL_REGISTRY` constant at `skills/agent-orchestrator/src/index.ts:159–235` hardcoded all eight skill descriptors directly in the orchestrator file. Adding a new skill required editing the orchestrator.

**Why:** The registry is queryable by any consumer (tests, tooling, other orchestrators). New skills self-register without touching orchestrator code. The `DEFAULT_REGISTRATIONS` seed in `integration/src/seed.ts` is the single place to update when a new skill ships.

---

### AD-2: SkillInvoker as Execution Boundary (Req 4)

**Decision:** All skill execution goes through `SkillInvoker.invoke()`. The orchestrator never imports or calls skill modules directly.

**Evidence from prototype:** `executeStep()` at `skills/agent-orchestrator/src/index.ts:639–671` returned a hardcoded mock (`qualityScore: 0.9`, `result: { skill, stepIndex, input, contextKeys }`) regardless of what the skill would actually produce.

**Why:** The invoker provides a single seam for cross-cutting concerns (timeout enforcement, error normalisation). Handlers are registered at the composition root (bootstrap code), keeping the invoker testable with stubs and decoupled from skill implementations.

**Error model:** `SkillInvoker.invoke()` never throws. It returns `InvocationResult` with `error` set and `qualityScore=0` on failure, putting retry/fallback decisions in the orchestrator where control-flow policy belongs.

---

### AD-3: Capability-Based Planning (Req 5)

**Decision:** The orchestrator detects *capabilities* in the intent (via `CAPABILITY_KEYWORDS`), resolves each to the best registered skill, and orders skills by *capability dependency rules* (`CAPABILITY_DEPS`). Skill names never appear in routing or dependency logic.

**Evidence from prototype:** `buildDependencyGraph()` at `skills/agent-orchestrator/src/index.ts:365–426` contained a series of `if (skills.includes('ai-video-director') && skills.includes('ai-image-director'))` blocks hardcoding edges between specific skill names.

**Why:** Capability-level rules survive skill changes. If a new skill provides `brand-strategy` at higher priority, it automatically runs before `image-generation` without any orchestrator edit. The `CAPABILITY_DEPS` map is the only place that defines semantic ordering constraints.

---

### AD-4: WorkflowEngine as Execution Runtime (Req 1)

**Decision:** `executePlan()` builds a `WorkflowDefinition` and calls `workflowEngine.run()`. WorkflowEngine owns DAG validation, sequential scheduling, timeout enforcement, and step event emission. The orchestrator does not reimplement any of these. `workflowResult.stepResults` is the single source of execution state — no parallel tracking structure exists alongside it.

**Evidence from prototype:** `runPlan()` at `skills/agent-orchestrator/src/index.ts:673–709` contained its own step scheduling loop with a custom `completedIndices` set and `MAX_PARALLEL_SKILLS` cap, duplicating responsibility with WorkflowEngine.

**Why:** WorkflowEngine was designed precisely for orchestrated step execution. Using it here removes duplication and gives the orchestrator WorkflowEngine's battle-tested DAG resolver and scheduler for free. WorkflowEngine is not modified (Req 1 satisfied).

**Implementation details:**

- `step.dependsOn[]` and DataRouter `routes[]` are derived from the same `CAPABILITY_DEPS` edge computation in a single pass over `plan.skillSequence`. The `WorkflowDefinition`'s DAG accurately represents the capability dependency structure, not an arbitrary sequential chain.
- Each DataRouter route uses `outputKey: 'output'` (reads `InvocationResult.output` — the skill's actual output value from the upstream step) and `inputKey: 'input'` (delivers it as `stepInput.data.input` to the downstream handler). Root steps (no predecessors) fall back to `stepInput.context.intent`.
- The user's intent string is seeded into the workflow context under the key `intent`, making it accessible to every step via `stepInput.context.intent`.
- Each step handler returns the full `InvocationResult` from `SkillInvoker.invoke()`. WorkflowEngine stores this as the step's output in `stepResults`. SkillInvoker never throws — all errors are returned as `InvocationResult.error` fields — so every step always "completes" from WorkflowEngine's perspective and produces a non-null `StepResult.output`.
- After `workflowEngine.run()` returns, `invocationResults` is built as `workflowResult.stepResults.map(sr => sr.output as InvocationResult)`. This makes `workflowResult` the authoritative execution record.

---

### AD-5: Dependency Injection for Testability (Req 6)

**Decision:** `AgentOrchestratorV2` is a class whose constructor accepts `CapabilityRegistry` and `SkillInvoker`. Tests inject mocks; production code uses the pair returned by `createIntegrationLayer()`.

**Evidence from prototype:** The prototype exported a module-level singleton object `orchestrator` with all dependencies hardcoded at module scope, making isolation testing impossible without module mocking.

**Why:** Constructor injection enables complete test isolation (each test gets a fresh registry), explicit dependency tracking, and the ability to run multiple orchestrator instances with different skill sets in the same process.

---

### AD-6: Integration Layer at Repository Root (Not in skills/)

**Decision:** The integration layer lives at `integration/` (repository root level), not inside `skills/`.

**Why:** Skills are domain units with entrypoints and manifests. The integration layer is infrastructure shared across skills and orchestrators. Placing it at the root makes the dependency direction explicit: `skills/agent-orchestrator-v2 → integration → (never) → orchestrator`. A skill in `skills/` depending on another skill in `skills/` would imply peer coupling; infrastructure should flow upward.

---

### AD-7: Async orchestrate() (Behavioural Change from v1)

**Decision:** `orchestrate()` is `async` and returns `Promise<OrchestratorV2Result>`.

**Evidence from prototype:** `orchestrate()` at `skills/agent-orchestrator/src/index.ts:737` was synchronous because `executeStep()` was synchronous (it only manipulated in-memory objects).

**Why:** Real skill invocation (network calls, AI model APIs) is inherently async. Making `orchestrate()` async is the correct contract for production use. All internal scheduling is still sequential (WorkflowEngine Phase A) so concurrency is predictable.

---

### AD-8: Prototype Preserved Unmodified

**Decision:** `skills/agent-orchestrator/src/index.ts` is not modified.

**Why:** Requirements 1–2 prohibit modifying the Workflow Engine and existing Skills. The agent-orchestrator v1 is an existing skill. v2 is additive alongside it. Teams can migrate callers to v2 incrementally; v1 remains operational as a fallback.

---

## Parameters

### `orchestrate(request)`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intent` | `string` | ✅ | Natural-language description of what to accomplish |
| `context.sessionId` | `string` | — | Session identifier; auto-generated if absent |
| `context.previousOutputs` | `InvocationResult[]` | — | Outputs from prior sessions |
| `context.sharedMemory` | `Record<string, unknown>` | — | Cross-skill shared state |
| `context.iterationCount` | `number` | — | Guard against infinite loops (max 10) |
| `allowedSkills` | `string[]` | — | Whitelist of skill names to consider |
| `forbiddenSkills` | `string[]` | — | Blocklist of skill names to exclude |
| `qualityThreshold` | `number` | — | Minimum acceptable quality score (default 0.7) |
| `policy` | `ExecutionPolicy` | — | Reserved; WorkflowEngine currently executes sequentially |

### `planByCapability(intent, allowedSkills?, forbiddenSkills?)`

Synchronous planning step. Returns `CapabilityPlan` with detected capabilities, skill assignments, ordered sequence, confidence score, and reasoning string. Does not execute anything.

---

## Error Codes

| Code | Thrown by | Meaning |
|------|-----------|---------|
| `INVALID_INTENT` | `orchestrate`, `planByCapability` | Intent is empty or not a string |
| `MAX_ITERATIONS_EXCEEDED` | `orchestrate` | `context.iterationCount` ≥ 10 |
| `NO_CAPABILITIES_DETECTED` | `planByCapability` | Intent matched no capability keywords |
| `NO_MATCHING_SKILL` | `planByCapability` | Capabilities detected but no registered skill (after filters) covers any |
| `CYCLIC_CAPABILITY_DEPS` | `planByCapability` | Static bug in `CAPABILITY_DEPS` (should never occur) |
| `REGISTRY_INVALID` | `CapabilityRegistry.register` | Invalid skill registration metadata |
| `UNKNOWN_SKILL` | `SkillInvoker.invoke` | Skill not in registry (returned in result, not thrown) |
| `NO_HANDLER` | `SkillInvoker.invoke` | Skill registered but no handler registered (returned in result) |
| `SKILL_TIMEOUT` | `SkillInvoker.invoke` | Handler exceeded timeout (returned in result) |
| `NO_CAPABLE_SKILL` | `SkillInvoker.invokeByCapability` | No handler-registered skill covers the capability (returned in result) |

---

## Usage

```typescript
import AgentOrchestratorV2 from './skills/agent-orchestrator-v2/src/index';
import { createIntegrationLayer } from './integration/src/index';

const { registry, invoker } = createIntegrationLayer();

// Register handlers for skills you want to make callable.
invoker.registerHandler('ai-image-director', async (input, ctx) => {
  const result = await aiImageDirector.buildShot(input as ShotConfig);
  return { output: result, qualityScore: 0.95 };
});

const orchestrator = new AgentOrchestratorV2(registry, invoker);

// Preview what the orchestrator would plan without executing.
const plan = orchestrator.planByCapability('Generate product images for our brand campaign');
console.log(plan.skillSequence.map(s => s.name)); // ["creative-director", "ai-image-director"]

// Execute the full pipeline.
const result = await orchestrator.orchestrate({
  intent: 'Generate product images for our brand campaign',
  qualityThreshold: 0.75,
});

console.log(result.qualityGate.status);    // 'pass' | 'warn' | 'fail'
console.log(result.finalOutput);           // output from the last skill in the sequence
console.log(result.memoryHandoff.snapshot); // context to pass to the next session
```

---

## Changelog

### 2.0.0 — Milestone 7

- **New:** `AgentOrchestratorV2` class with injected `CapabilityRegistry` and `SkillInvoker`
- **New:** `planByCapability()` — synchronous planning without execution
- **New:** `orchestrate()` — async full pipeline through WorkflowEngine
- **New:** Capability-based dependency ordering via `CAPABILITY_DEPS`
- **New:** Integration Layer (`integration/`) with `CapabilityRegistry`, `SkillInvoker`, and seed module
- **Changed:** `orchestrate()` is now `async` (was synchronous in v1)
- **Changed:** Quality gate evaluates real `InvocationResult.qualityScore` values (v1 always used mocked 0.9)
- **Preserved:** v1 (`skills/agent-orchestrator/`) is unchanged
