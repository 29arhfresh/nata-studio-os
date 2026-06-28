# Workflow Engine

## Overview

Workflow Engine is the event-driven DAG execution runtime for Nata Studio OS.
It orchestrates multi-step workflows defined as directed acyclic graphs.
Each component is independently usable: EventBus, ContextStore, DataRouter, DagResolver, Scheduler, and StepRunner.
The public API wires all components together behind `workflowEngine.run()` and `workflowEngine.validate()`.

## Usage

```typescript
import workflowEngine from './src/index';
import type { WorkflowDefinition } from './src/index';

const definition: WorkflowDefinition = {
  id: 'my-workflow',
  steps: [
    {
      id: 'fetch',
      dependsOn: [],
      handler: async () => ({ data: [1, 2, 3] }),
    },
    {
      id: 'process',
      dependsOn: ['fetch'],
      handler: async (input) => {
        const items = input.data['items'] as number[];
        return { sum: items.reduce((a, b) => a + b, 0) };
      },
    },
  ],
  routes: [
    { fromStep: 'fetch', toStep: 'process', outputKey: 'data', inputKey: 'items' },
  ],
};

const result = await workflowEngine.run(definition, {
  context: { tenantId: 'tenant-1' },
  onEvent: (event) => console.log(event.type, event.stepId),
});

console.log(result.status);        // 'completed'
console.log(result.stepResults);   // StepResult[]
```

## Parameters

### `workflowEngine.run(definition, options?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `definition.id` | `string` | Yes | — | Unique workflow identifier |
| `definition.steps` | `StepDefinition[]` | Yes | — | Ordered or unordered step definitions |
| `definition.routes` | `DataRoute[]` | No | `[]` | Data mappings from step outputs to step inputs |
| `options.context` | `Record<string, unknown>` | No | `{}` | Initial key-value context seeded into the ContextStore |
| `options.onEvent` | `EventHandler` | No | — | Subscriber called for every lifecycle event |

### `StepDefinition`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | Yes | — | Unique step identifier within the workflow |
| `dependsOn` | `string[]` | Yes | — | Ids of steps that must complete before this one runs |
| `handler` | `StepHandler` | Yes | — | Sync or async function that executes the step |
| `timeoutMs` | `number` | No | `30000` | Maximum execution time before the step fails |
| `maxRetries` | `number` | No | `0` | Number of additional attempts after first failure |

### `DataRoute`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `fromStep` | `string` | Yes | — | Source step id |
| `toStep` | `string` | Yes | — | Destination step id |
| `outputKey` | `string` | Yes | — | Key in the source step's output object |
| `inputKey` | `string` | Yes | — | Key injected into the destination step's `input.data` |

### `workflowEngine.validate(definition)`

Returns `ValidationResult` (`{ valid: boolean; errors: string[] }`) without executing.

## Examples

### Minimal — single step

```typescript
const result = await workflowEngine.run({
  id: 'ping',
  steps: [{ id: 'ping', dependsOn: [], handler: () => 'pong' }],
});
// result.status === 'completed'
// result.stepResults[0].output === 'pong'
```

### Multi-step pipeline with data routing and event subscription

```typescript
const events: string[] = [];

const result = await workflowEngine.run(
  {
    id: 'image-pipeline',
    steps: [
      { id: 'prompt',  dependsOn: [],         handler: () => ({ text: 'A sunset over mountains' }) },
      { id: 'image',   dependsOn: ['prompt'],  handler: (inp) => ({ url: `generated:${inp.data['promptText']}` }) },
      { id: 'upscale', dependsOn: ['image'],   handler: (inp) => ({ url: `upscaled:${inp.data['imageUrl']}` }) },
    ],
    routes: [
      { fromStep: 'prompt',  toStep: 'image',   outputKey: 'text', inputKey: 'promptText' },
      { fromStep: 'image',   toStep: 'upscale', outputKey: 'url',  inputKey: 'imageUrl' },
    ],
  },
  { onEvent: (e) => events.push(e.type) },
);
// events: ['workflow:started', 'step:started', 'step:completed', ...]
```

## Errors

| Code | Thrown by | Description | Remediation |
|---|---|---|---|
| `INVALID_WORKFLOW` | `run()` | Definition fails validation | Call `validate()` first and fix reported errors |
| `UNKNOWN_DEPENDENCY` | `resolveDag()` | A step references an unknown dependency id | Ensure all `dependsOn` ids match a defined step id |
| `STEP_TIMEOUT` | `StepRunner` | A handler did not resolve within `timeoutMs` | Increase `timeoutMs` or reduce handler work |
| `UNKNOWN_STEP` | `Scheduler` | An operation references an unregistered step id | Only use step ids that exist in the workflow definition |

## Changelog

### [0.1.0] — 2026-06-26

- Initial Phase A implementation: EventBus, ContextStore, DataRouter, DagResolver, Scheduler, StepRunner, and public API.
- 79 tests, 98.1% line coverage, 83.6% branch coverage.

---

## Architectural Decisions

### ADR-1: DataRouter Fan-In Semantics (Phase A)

**Status:** Accepted — limitation acknowledged, resolution deferred to Phase B.

**Context:**

`DataRouter.resolveInputs()` assembles a step's `data` object from all routes whose `toStep` matches the current step. Each route writes one value:

```typescript
inputs[route.inputKey] = output[route.outputKey];
```

In a fan-in topology — where two or more upstream steps route output to the **same `inputKey`** of a single downstream step — the last route processed overwrites all previous ones. The downstream step receives only one upstream value; the rest are silently discarded.

**Example:**

```
brand-strategy  ──┐
                  ├──▶  image-generation  (inputKey: 'input')
prompt-architect ─┘
```

Both routes target `inputKey: 'input'`. Only the output of whichever route is processed last is available to the `image-generation` handler as `stepInput.data.input`. The other upstream output is lost.

**Why this is acceptable for Phase A:**

Phase A executes steps sequentially and targets linear or tree-shaped pipelines. In the default skill set registered by the Integration Layer, each step in a typical plan has at most one direct data predecessor (the primary upstream skill). The fan-in topology only arises when multiple capabilities resolve to different skills that all feed the same downstream skill — a case that is uncommon in Phase A workloads.

Callers can work around the limitation today by using **distinct `inputKey` names** per route (`input.data.fromBrandStrategy`, `input.data.fromPromptArchitect`) and having the downstream handler read each key explicitly. This requires the handler to know which predecessors to expect, which is acceptable when the workflow definition is fully controlled by the caller.

**Why this becomes a limitation for richer DAGs:**

As orchestration expands to richer multi-skill pipelines — parallel branches, conditional splits, and merge nodes — fan-in becomes structurally necessary. Examples:

- A video generation step that needs both a brand brief (from `creative-director`) and an optimised prompt (from `prompt-architect`) as independent inputs.
- A scoring step that aggregates outputs from three parallel image generation attempts.
- An error-recovery branch that merges a fallback result with the partial output of a failed primary branch.

In all of these cases, requiring distinct `inputKey` names shifts the routing contract into the handler's implementation, defeating the purpose of a declarative DataRouter.

**Candidate designs for Phase B:**

| Design | Mechanism | Trade-offs |
|--------|-----------|------------|
| **Named inputs** | Each route declares a unique `inputKey`. Downstream handler reads `stepInput.data['fromBrandStrategy']`, `stepInput.data['fromPromptArchitect']`, etc. | Handlers must know predecessor names. Tight coupling between route definitions and handler logic. Works today without engine changes. |
| **Input arrays** | When multiple routes target the same `inputKey`, DataRouter collects values into an array rather than overwriting. Downstream handler receives `stepInput.data.input: unknown[]`. | Simple to implement in DataRouter. Handler must handle both scalar and array cases, or always expect an array. Breaks existing single-predecessor handlers unless array-wrapping is opt-in (e.g., `mergeStrategy: 'array'` on the route). |
| **Merge strategies** | Each route (or the `toStep` definition) declares a `mergeStrategy`: `'last-wins'` (current), `'array'`, `'object-spread'`, or `'first-wins'`. DataRouter executes the declared strategy. | Expressive. `'object-spread'` covers the case where upstream steps produce disjoint key sets that should be merged into one object. Requires a new optional field on `DataRoute` and strategy dispatch in `resolveInputs()`. |
| **Reducer functions** | `DataRoute` accepts an optional `reducer: (accumulated: unknown, next: unknown) => unknown`. DataRouter folds each matching route's value through the reducer, starting from `undefined`. | Maximum flexibility. Keeps DataRouter logic simple (one loop, one function call per route). Reducers are caller-defined, so no engine changes needed for new merge semantics. The reducer must be a pure function; serialisation across process boundaries (e.g., distributed execution) would require a registered reducer registry rather than inline functions. |

**Recommendation for Phase B:** Implement merge strategies as an optional `mergeStrategy` field on `DataRoute` with values `'last-wins'` (default, preserving current behaviour), `'array'`, and `'object-spread'`. This is additive, non-breaking, and covers the majority of real fan-in cases without introducing the serialisation complexity of reducer functions. Reducer functions can be added as a separate extension point if needed.

**Effect on Agent Orchestrator:**

This is a DataRouter constraint, not an orchestrator defect. Agent Orchestrator v2 derives routes from `CAPABILITY_DEPS` edges and uses `inputKey: 'input'` for all routes. In fan-in cases, the last-processed predecessor's output reaches the downstream handler. The orchestrator's route-building logic is correct; the handler receives less data than it ideally would. When Phase B merge strategies land, the orchestrator can opt in by setting `mergeStrategy: 'array'` or `'object-spread'` on routes without any structural change to its planning or execution logic.
