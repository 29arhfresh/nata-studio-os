# Workflow Engine Architecture v2

**Version:** 2.0.0
**Status:** Active
**Effective Date:** 2026-06-26
**Implemented In:** `skills/workflow-engine/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Component Map](#2-component-map)
3. [Shared Types](#3-shared-types)
4. [Component 1 — Event Bus](#4-component-1--event-bus)
5. [Component 2 — Context Store](#5-component-2--context-store)
6. [Component 3 — Data Router](#6-component-3--data-router)
7. [Component 4 — DAG Resolver](#7-component-4--dag-resolver)
8. [Component 5 — Scheduler](#8-component-5--scheduler)
9. [Component 6 — Step Runner](#9-component-6--step-runner)
10. [Component 7 — Public API](#10-component-7--public-api)
11. [Execution Model](#11-execution-model)
12. [Error Codes](#12-error-codes)
13. [Data Flow](#13-data-flow)
14. [Known Constraints](#14-known-constraints)
15. [Out of Scope — Phase A](#15-out-of-scope--phase-a)

---

## 1. Overview

The Workflow Engine is an event-driven, DAG-based step execution runtime. It accepts a declarative workflow definition — a set of typed steps with dependency declarations and optional data routes — validates it, resolves its execution order, and runs each step in dependency order while emitting typed lifecycle events.

Each of the seven components is independently instantiable and testable. The Public API wires them together for the common case.

---

## 2. Component Map

```
WorkflowDefinition
        │
        ▼
  ┌─────────────┐         ┌──────────────┐
  │  DAG         │         │  Context      │
  │  Resolver    │         │  Store        │
  └──────┬──────┘         └──────┬───────┘
         │ order                 │ context snapshot
         ▼                       │
  ┌─────────────┐                │
  │  Scheduler  │◄───────────────┘
  └──────┬──────┘
         │ ready steps
         ▼
  ┌─────────────┐    routes    ┌──────────────┐
  │  Data        │◄────────────│  Data         │
  │  Router      │             │  Router       │
  └──────┬──────┘             └──────────────┘
         │ resolved inputs
         ▼
  ┌─────────────┐
  │  Step        │
  │  Runner      │
  └──────┬──────┘
         │ StepResult
         ▼
  ┌─────────────┐
  │  Event Bus  │  ◄── lifecycle events emitted throughout
  └─────────────┘
```

---

## 3. Shared Types

**File:** `src/types.ts`

```typescript
type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
```

### WorkflowStatus

| Value | Meaning |
|---|---|
| `pending` | Not yet started |
| `running` | Execution in progress |
| `completed` | All steps reached terminal state without failure |
| `failed` | At least one step failed; execution halted |
| `cancelled` | Reserved for future cancellation support |

### StepStatus

| Value | Meaning |
|---|---|
| `pending` | Step is registered but not yet eligible to run |
| `running` | Step handler is currently executing |
| `completed` | Handler returned successfully |
| `failed` | Handler threw, rejected, or timed out after all retries |
| `skipped` | Step was explicitly bypassed (set externally by caller) |

---

## 4. Component 1 — Event Bus

**File:** `src/event-bus.ts`

### Purpose

Typed synchronous pub/sub for workflow lifecycle events. All events are delivered in the same tick as `emit()`.

### Event Types

```typescript
type WorkflowEventType =
  | 'workflow:started'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'step:started'
  | 'step:completed'
  | 'step:failed'
  | 'step:skipped';
```

### Event Shape

```typescript
interface WorkflowEvent {
  type:       WorkflowEventType;
  workflowId: string;
  stepId?:    string;       // present for step:* events
  payload?:   unknown;      // step output or error string
  timestamp:  number;       // Date.now() at emit time
}

type EventHandler = (event: WorkflowEvent) => void;
```

### Public Interface

```typescript
class EventBus {
  subscribe(eventType: WorkflowEventType, handler: EventHandler): () => void;
  once(eventType: WorkflowEventType, handler: EventHandler): void;
  unsubscribe(eventType: WorkflowEventType, handler: EventHandler): void;
  emit(event: WorkflowEvent): void;
  clear(): void;
}
```

### Behaviour Contract

- `subscribe` returns an unsubscribe function. Calling it is equivalent to calling `unsubscribe` with the same handler reference.
- `once` installs a wrapper that self-removes after the first delivery.
- `emit` iterates the handler set synchronously. Handler exceptions propagate to the caller of `emit`.
- `clear` removes all subscriptions across all event types.
- Emitting to an event type with no subscribers is a no-op.

---

## 5. Component 2 — Context Store

**File:** `src/context-store.ts`

### Purpose

Per-workflow namespaced key-value store. All context is scoped to a `workflowId` string so multiple concurrent workflows share one instance without cross-contamination.

### Public Interface

```typescript
class ContextStore {
  set(workflowId: string, key: string, value: unknown): void;
  get(workflowId: string, key: string): unknown;
  has(workflowId: string, key: string): boolean;
  getAll(workflowId: string): Record<string, unknown>;
  clear(workflowId: string): void;
  clearAll(): void;
}
```

### Behaviour Contract

- `get` returns `undefined` for absent workflows and absent keys.
- `has` returns `false` for absent workflows.
- `getAll` returns an empty plain object (`{}`) for absent workflows.
- `set` creates the namespace lazily on first write.
- `clear` deletes the entire namespace for that `workflowId`.
- `clearAll` deletes all namespaces.
- Values are stored by reference. The store does not deep-clone.

### Lifecycle

The Public API calls `store.clear(workflowId)` at the end of every `run()` call — whether the workflow completed or failed — so memory does not accumulate between runs.

---

## 6. Component 3 — Data Router

**File:** `src/data-router.ts`

### Purpose

Declarative mapping from step outputs to downstream step inputs. Each `DataRoute` names a source step, source output key, destination step, and destination input key.

### Types

```typescript
interface DataRoute {
  fromStep:  string;   // id of the producing step
  toStep:    string;   // id of the consuming step
  outputKey: string;   // key in the source step's output object
  inputKey:  string;   // key injected into the consuming step's input.data
}
```

### Public Interface

```typescript
class DataRouter {
  addRoute(route: DataRoute): void;
  removeRoutesFrom(stepId: string): void;
  resolveInputs(toStep: string, stepOutputs: Map<string, Record<string, unknown>>): Record<string, unknown>;
  getRoutesTo(stepId: string): DataRoute[];
  getRoutesFrom(stepId: string): DataRoute[];
}
```

### Behaviour Contract

- `addRoute` stores a shallow copy of the route. Mutating the caller's object after the call has no effect.
- `resolveInputs` scans all registered routes whose `toStep` matches, looks up each source step's output in the provided map, and assembles the combined input object. Keys absent from the source output are silently skipped.
- `resolveInputs` returns `{}` when no routes target the requested step.
- Multiple routes targeting the same `toStep` from different `fromStep` values are all applied. If two routes write to the same `inputKey`, the last route wins (iteration order equals insertion order).
- `removeRoutesFrom` is a bulk delete — all routes where `fromStep` matches are removed.

### Non-object Step Outputs

When a step returns a non-object value (e.g. a string or number), the Public API wraps it as `{ value: <output> }` before inserting into `stepOutputs`. Routes must use `outputKey: 'value'` to address this wrapped form.

---

## 7. Component 4 — DAG Resolver

**File:** `src/dag-resolver.ts`

### Purpose

Converts an unordered set of step nodes into a validated topological execution order. Uses Kahn's algorithm.

### Types

```typescript
interface StepNode {
  id:        string;
  dependsOn: string[];
}

interface ResolvedDag {
  order:      string[];   // topological order; partial if hasCycle
  hasCycle:   boolean;
  cycleNodes: string[];   // ids of steps involved in the cycle
}
```

### Public Interface

```typescript
function resolveDag(steps: StepNode[]): ResolvedDag;
```

### Behaviour Contract

- Throws `UNKNOWN_DEPENDENCY` synchronously if any `dependsOn` entry references a step id not present in the input array.
- Returns `{ hasCycle: true, cycleNodes: [...] }` when a cycle exists. `order` contains the steps that were resolved before the cycle was detected. `cycleNodes` contains all ids that could not be ordered.
- Returns `{ hasCycle: false, cycleNodes: [] }` on success.
- An empty input array returns `{ order: [], hasCycle: false, cycleNodes: [] }`.
- Steps with no dependencies are eligible to appear first in `order`. Their relative order among themselves is insertion order (stable).

### Error Format

```
UNKNOWN_DEPENDENCY: Step "<id>" depends on unknown step "<depId>".
```

---

## 8. Component 5 — Scheduler

**File:** `src/scheduler.ts`

### Purpose

Tracks the execution state of each step in a workflow and answers the question: "which steps are ready to run right now?" A step is ready when it is in `pending` state and all of its declared dependencies are in `completed` state.

### Public Interface

```typescript
class Scheduler {
  constructor(steps: ReadonlyArray<{ id: string; dependsOn: string[] }>);

  getReadySteps(): string[];
  markRunning(stepId: string): void;
  markCompleted(stepId: string): void;
  markFailed(stepId: string): void;
  markSkipped(stepId: string): void;
  getStatus(stepId: string): StepStatus;
  isComplete(): boolean;
  hasFailed(): boolean;
}
```

### State Machine

```
          markRunning()
pending ─────────────────► running
                              │
              markCompleted() │
              ───────────────►│──► completed
                              │
              markFailed()    │
              ───────────────►│──► failed
                              │
pending ──────────────────────► skipped   (markSkipped, bypasses running)
```

### Behaviour Contract

- All step ids passed to the constructor are registered with `pending` status.
- `getReadySteps` returns ids in the insertion order of `steps`.
- A `running` step is never returned by `getReadySteps`.
- `isComplete` returns `true` when every step is in `completed`, `failed`, or `skipped`.
- `hasFailed` returns `true` when at least one step is `failed`.
- All state-mutation methods throw `UNKNOWN_STEP` if the `stepId` was not registered in the constructor.
- The Scheduler does not enforce legal state transitions. Callers are responsible for valid sequencing.

### Error Format

```
UNKNOWN_STEP: Step "<id>" is not registered in the scheduler.
```

---

## 9. Component 6 — Step Runner

**File:** `src/step-runner.ts`

### Purpose

Executes a single step handler with configurable timeout and retry logic. Isolates the execution contract from the scheduler and event system.

### Types

```typescript
interface StepInput {
  stepId:     string;
  workflowId: string;
  context:    Record<string, unknown>;   // snapshot from ContextStore
  data:       Record<string, unknown>;   // resolved by DataRouter
}

interface StepResult {
  stepId:    string;
  status:    'completed' | 'failed';
  output:    unknown;          // null on failure
  error:     string | null;    // null on success
  durationMs: number;
  attempt:   number;           // 1-based; equals maxRetries + 1 on exhaustion
}

type StepHandler = (input: StepInput) => Promise<unknown> | unknown;
```

### Public Interface

```typescript
class StepRunner {
  run(
    stepId:  string,
    handler: StepHandler,
    input:   StepInput,
    options?: { timeoutMs?: number; maxRetries?: number },
  ): Promise<StepResult>;
}
```

### Defaults

| Option | Default |
|---|---|
| `timeoutMs` | `30000` |
| `maxRetries` | `0` |

### Behaviour Contract

- Accepts sync and async handlers uniformly. The return value is always awaited via `Promise.resolve()`.
- On success: returns `status: 'completed'`, `output` set to handler return value, `error: null`.
- On failure: returns `status: 'failed'`, `output: null`, `error` set to `err.message` if an `Error`, otherwise `String(err)`.
- Timeout is implemented with `setTimeout`. When the timeout fires, the promise rejects with `STEP_TIMEOUT`. The handler may still be executing in the background; there is no forceful termination.
- Retry loop: `attempt` increments from 1. The handler is called up to `maxRetries + 1` times total. On the final attempt's failure, the result is returned immediately with the last error.
- `durationMs` measures wall-clock time from the start of each attempt. On exhausted retries, it reflects the duration of the final attempt.

### Timeout Error Format

```
STEP_TIMEOUT: Step "<id>" exceeded <timeoutMs>ms.
```

---

## 10. Component 7 — Public API

**File:** `src/index.ts`

### Purpose

Single entry point. Re-exports all components and types, and exposes the two top-level functions `run` and `validate` as a default export object.

### Public Types

```typescript
interface StepDefinition {
  id:          string;
  dependsOn:   string[];
  handler:     StepHandler;
  timeoutMs?:  number;    // default 30000
  maxRetries?: number;    // default 0
}

interface WorkflowDefinition {
  id:      string;
  steps:   StepDefinition[];
  routes?: DataRoute[];    // default []
}

interface WorkflowRunOptions {
  context?:  Record<string, unknown>;
  onEvent?:  EventHandler;
}

interface WorkflowResult {
  workflowId:  string;
  status:      WorkflowStatus;
  stepResults: StepResult[];
  startedAt:   number;       // Date.now() before first step
  completedAt: number;       // Date.now() after last step or on failure
  error:       string | null;
}

interface ValidationResult {
  valid:  boolean;
  errors: string[];
}
```

### Default Export

```typescript
const workflowEngine: {
  run(definition: WorkflowDefinition, options?: WorkflowRunOptions): Promise<WorkflowResult>;
  validate(definition: WorkflowDefinition): ValidationResult;
};

export default workflowEngine;
```

### `validate(definition)`

Synchronously checks:

1. `definition.id` is a non-empty string.
2. `definition.steps` is a non-empty array.
3. Each step has a non-empty string `id`.
4. No duplicate step ids.
5. Each step has a `handler` of type `function`.
6. Each step has a `dependsOn` array.
7. `resolveDag` does not throw (`UNKNOWN_DEPENDENCY`).
8. The resolved DAG has no cycle.

Returns `{ valid: true, errors: [] }` on success. Returns `{ valid: false, errors: [...] }` with one message per violation on failure. Does not throw.

### `run(definition, options?)`

1. Calls `validate`. Throws `INVALID_WORKFLOW` if invalid.
2. Instantiates `EventBus`, `ContextStore`, `DataRouter`, `StepRunner`.
3. Seeds the `ContextStore` with `options.context`.
4. Registers all `definition.routes` with the `DataRouter`.
5. Calls `resolveDag` (cycle check; result unused for ordering — see §11).
6. Instantiates `Scheduler` with all steps.
7. Emits `workflow:started`.
8. Enters the execution loop (see §11).
9. On completion, emits `workflow:completed` or `workflow:failed`, clears the `ContextStore`, and returns `WorkflowResult`.

### Error Format

```
INVALID_WORKFLOW: <validation error messages joined by space>
```

### Named Exports

Every component class and type is also exported by name, allowing consumers to use components individually:

```typescript
export { EventBus, ContextStore, DataRouter, resolveDag, Scheduler, StepRunner };
export type {
  WorkflowEventType, WorkflowEvent, EventHandler,
  DataRoute,
  StepNode, ResolvedDag,
  StepHandler, StepInput, StepResult,
  WorkflowStatus, StepStatus,
  StepDefinition, WorkflowDefinition, WorkflowRunOptions,
  WorkflowResult, ValidationResult,
};
```

---

## 11. Execution Model

### Loop

```
while scheduler is not complete:
  ready = scheduler.getReadySteps()
  if ready is empty: break           ← deadlock guard

  for each stepId in ready (sequential):
    data    = router.resolveInputs(stepId, stepOutputs)
    context = store.getAll(workflowId)

    emit step:started
    scheduler.markRunning(stepId)

    result = await runner.run(stepId, handler, { stepId, workflowId, context, data })

    if result.status === 'completed':
      wrap output if non-object → { value: <output> }
      stepOutputs.set(stepId, wrappedOutput)
      scheduler.markCompleted(stepId)
      emit step:completed

    else:
      scheduler.markFailed(stepId)
      emit step:failed
      emit workflow:failed
      store.clear(workflowId)
      return WorkflowResult { status: 'failed' }

emit workflow:completed or workflow:failed
store.clear(workflowId)
return WorkflowResult
```

### Concurrency

Phase A executes ready steps **sequentially** within each loop iteration. When `getReadySteps()` returns multiple ids, they are processed one after another with `await`. This is correct and safe; it does not exploit available parallelism.

The Scheduler correctly identifies all concurrently-runnable steps. Parallel execution is an additive change that does not require modifications to the Scheduler, DAG Resolver, or Data Router interfaces.

### Failure Semantics

A single step failure terminates the entire workflow immediately. Remaining steps — including those with no dependency on the failed step — are not executed. There is no partial-completion mode, dead-letter queue, or branch isolation in Phase A.

### Output Wrapping

Step outputs that are `null`, primitive values, or non-objects are wrapped as `{ value: <output> }` before being stored in `stepOutputs`. This ensures `DataRoute.outputKey` always addresses a plain object. Routes targeting a primitive output must use `outputKey: 'value'`.

---

## 12. Error Codes

| Code | Thrown by | Sync/Async | Description |
|---|---|---|---|
| `INVALID_WORKFLOW` | `run()` | sync (throw) | Workflow definition failed validation |
| `UNKNOWN_DEPENDENCY` | `resolveDag()` | sync (throw) | A step references a dep id not in the step list |
| `STEP_TIMEOUT` | `StepRunner` | async (reject) | Handler did not resolve within `timeoutMs` |
| `UNKNOWN_STEP` | `Scheduler` | sync (throw) | State transition called with an unregistered step id |

---

## 13. Data Flow

```
Caller supplies:
  WorkflowDefinition { id, steps[], routes[] }
  WorkflowRunOptions { context?, onEvent? }

                          ┌──────────────────────────────────┐
                          │           run()                  │
                          │                                  │
  options.context ───────►│ ContextStore.set(wfId, key, val) │
  definition.routes ─────►│ DataRouter.addRoute(route)       │
  definition.steps ──────►│ resolveDag()     [validation]    │
  definition.steps ──────►│ Scheduler(steps)                 │
                          │                                  │
                          │  ┌── execution loop ──────────┐  │
                          │  │                            │  │
                          │  │ Scheduler.getReadySteps()  │  │
                          │  │         │                  │  │
                          │  │         ▼                  │  │
                          │  │ DataRouter.resolveInputs() │  │
                          │  │ ContextStore.getAll()      │  │
                          │  │         │                  │  │
                          │  │         ▼                  │  │
                          │  │ StepRunner.run()           │  │
                          │  │         │                  │  │
                          │  │         ▼                  │  │
                          │  │ EventBus.emit()            │  │
                          │  │ Scheduler.mark*()          │  │
                          │  │ stepOutputs.set()          │  │
                          │  └────────────────────────────┘  │
                          │                                  │
                          │ ContextStore.clear(wfId)         │
                          └──────────────────────────────────┘
                                        │
                                        ▼
                             WorkflowResult { workflowId, status,
                               stepResults[], startedAt,
                               completedAt, error }
```

---

## 14. Known Constraints

These are properties of the current implementation, not bugs. They are documented here to inform Phase B design decisions.

| Constraint | Detail |
|---|---|
| **Sequential execution** | Ready steps are awaited one at a time. Independent parallel branches do not execute concurrently. |
| **In-process state only** | `ContextStore` and `stepOutputs` are in-process Maps. No persistence, no crash recovery, no resume. |
| **Fail-fast** | The first step failure terminates the entire workflow. No partial completion or isolated branch failure. |
| **No cancellation** | There is no mechanism to cancel an in-flight `run()` call. A slow handler runs until it either resolves or times out. |
| **Timeout is promise-level only** | `setTimeout`-based timeout rejects the promise but cannot terminate a synchronously-blocking handler. |
| **Non-object output wrapping** | Primitive or null step outputs are wrapped as `{ value }`. Routes must use `outputKey: 'value'` to consume them. |
| **`cancelled` status unused** | `WorkflowStatus` includes `'cancelled'` for forward compatibility. No code path sets this value in Phase A. |

---

## 15. Out of Scope — Phase A

The following systems are explicitly excluded from this architecture version and must not be added until a subsequent phase is specified:

- Asset Manager
- Plugin System
- Connector Manager
- AI Memory integration
- Version Graph
- Workflow Visualizer
- Agent Runtime
- Persistent storage adapters
- Parallel step execution engine
- Workflow cancellation
- Dead-letter / retry queues
- Cross-workflow context sharing
