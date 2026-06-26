# Workflow Engine Architecture — Phase B

**Version:** 1.0.0-draft
**Status:** Draft — Awaiting Approval
**Effective Date:** 2026-06-26
**Extends:** `docs/architecture/workflow-engine-architecture-v2.md` (Phase A)
**Implemented In:** `skills/workflow-engine/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Component Map](#2-component-map)
3. [Shared Types](#3-shared-types)
4. [Component 1 — Asset Manager](#4-component-1--asset-manager)
5. [Component 2 — Plugin System](#5-component-2--plugin-system)
6. [Component 3 — Connector Manager](#6-component-3--connector-manager)
7. [Component 4 — AI Memory](#7-component-4--ai-memory)
8. [Component 5 — Version Graph](#8-component-5--version-graph)
9. [Component 6 — Workflow Visualizer](#9-component-6--workflow-visualizer)
10. [Public API Additions](#10-public-api-additions)
11. [Execution Flow](#11-execution-flow)
12. [Error Codes](#12-error-codes)
13. [Data Flow](#13-data-flow)
14. [Separation Rules](#14-separation-rules)
15. [Known Constraints](#15-known-constraints)
16. [Out of Scope — Phase B](#16-out-of-scope--phase-b)

---

## 1. Overview

Phase B extends the Phase A Workflow Engine with six new components that address the gaps identified in `workflow-engine-architecture-v2.md §15`. All Phase A components are unchanged. Phase B components are additive: they wrap, observe, or extend the execution loop without modifying any Phase A interface.

The six new components are:

| Component | Responsibility |
|---|---|
| **Asset Manager** | Registration, tagging, and retrieval of binary asset references produced by workflow steps. |
| **Plugin System** | Lifecycle hook registry for third-party extensions. Plugins observe before/after events for steps and workflows. |
| **Connector Manager** | Named handle registry for external service connections. Handles are injected into steps that declare a dependency on them. |
| **AI Memory** | Cross-run memory store that persists beyond the ContextStore's per-run lifetime. Bridges workflow execution with the Memory System Skill. |
| **Version Graph** | Immutable append-only graph of serializable workflow definition snapshots with parent-child lineage and diff support. |
| **Workflow Visualizer** | Pure-function graph serializer. Converts a `WorkflowDefinition` — with optional runtime status overlay — into a serializable node-edge graph for UI rendering. |

**Phase B does not change the Phase A execution model.** The sequential step loop, fail-fast semantics, and ContextStore lifecycle are all preserved exactly. Phase B adds pre/post hooks around the loop's internal points without restructuring them.

---

## 2. Component Map

```
               PhaseBWorkflowDefinition
                         │
                         ▼
       ┌─────────────────────────────────┐
       │         run() — Phase B          │
       │                                  │
       │  PluginSystem.runBefore          │
       │    Workflow()                    │
       │  ConnectorManager.resolve()      │
       │  AIMemory.reader()               │
       │  VersionGraph.commit()  [opt]    │
       └──────────────┬──────────────────┘
                      │
                      ▼
      ┌───────────────────────────────────────┐
      │       Phase A Execution Loop           │
      │                                        │
      │  ┌──────────────────────────────────┐  │
      │  │  [B] PluginSystem.runBefore      │  │
      │  │       Step()                     │  │
      │  │  [A] StepRunner.run()            │  │
      │  │  [B] AssetManager.register()     │  │
      │  │       [opt]                      │  │
      │  │  [B] AIMemory.store()  [opt]     │  │
      │  │  [B] PluginSystem.runAfter       │  │
      │  │       Step()                     │  │
      │  └──────────────────────────────────┘  │
      └───────────────────────────────────────┘
                      │
                      ▼
       ┌─────────────────────────────────┐
       │     PhaseBWorkflowResult         │
       │                                  │
       │  + graph        (Visualizer)     │
       │  + versionId    (VersionGraph)   │
       │  + memoryWrites (AIMemory)       │
       │  + assetRefs    (AssetManager)   │
       └─────────────────────────────────┘
```

---

## 3. Shared Types

**File:** `src/phase-b-types.ts`

All Phase B types are defined in a single new file, separate from Phase A's `src/types.ts`. Phase A's `types.ts` is not modified.

### 3.1 Phase B Step Definition Extensions

```typescript
type AssetType = 'image' | 'video' | 'audio' | 'model-3d' | 'document' | 'other';

interface AssetEmission {
  type:  AssetType;
  tags?: string[];
}

interface PhaseBStepDefinition extends StepDefinition {
  requiredConnectors?: string[];
  emitsAsset?:         AssetEmission;
  memoryWrites?:       MemoryWriteSpec[];
}
```

### 3.2 Phase B Workflow Definition

```typescript
interface PhaseBWorkflowDefinition extends WorkflowDefinition {
  steps:            PhaseBStepDefinition[];   // narrows inherited field
  plugins?:         string[];                 // plugin names to activate for this run
  connectors?:      string[];                 // connector names available to all steps
  versionTracking?: boolean;                  // default false
  memoryScope?:     string;                   // scope key for AIMemory isolation
}
```

### 3.3 Phase B Step Input

```typescript
interface PhaseBStepInput extends StepInput {
  connectors: ConnectorMap;
  memory:     MemoryReader;
}
```

`PhaseBStepInput` is a structural superset of `StepInput`. Phase A handlers typed against `StepInput` work unchanged when passed a `PhaseBStepInput`; Phase B handlers may declare `(input: PhaseBStepInput)` to access connectors and memory.

### 3.4 Phase B Workflow Run Options

```typescript
interface PhaseBWorkflowRunOptions extends WorkflowRunOptions {
  memoryContext?: Record<string, unknown>;
}
```

### 3.5 Phase B Workflow Result

```typescript
interface PhaseBWorkflowResult extends WorkflowResult {
  graph?:        VisualizerGraph;
  versionId?:    string;
  memoryWrites?: MemoryRecord[];
  assetRefs?:    AssetRef[];
}
```

### 3.6 Connector Types

```typescript
type ConnectorType = 'http' | 'ai-model' | 'storage' | 'database' | 'custom';

interface ConnectorConfig {
  name:          string;
  type:          ConnectorType;
  endpoint?:     string;
  credentials?:  Record<string, string>;
  timeoutMs?:    number;
  meta?:         Record<string, unknown>;
}

interface ConnectorHandle {
  name: string;
  type: ConnectorType;
  call(method: string, params: Record<string, unknown>): Promise<unknown>;
}

type ConnectorMap    = Record<string, ConnectorHandle>;
type ConnectorFactory = (config: ConnectorConfig) => ConnectorHandle;
```

### 3.7 AI Memory Types

```typescript
type MemoryTier = 'short-term' | 'long-term' | 'project' | 'session';

interface MemoryRecord {
  id:          string;
  key:         string;
  value:       unknown;
  tier:        MemoryTier;
  tags:        string[];
  ttlMs?:      number;
  workflowId?: string;
  stepId?:     string;
  scope?:      string;
  createdAt:   number;
}

interface MemoryQuery {
  key?:   string;
  tier?:  MemoryTier;
  tags?:  string[];
  scope?: string;
  limit?: number;
}

interface MemoryWriteSpec {
  outputKey: string;
  memoryKey: string;
  tier:      MemoryTier;
  tags?:     string[];
  ttlMs?:    number;
}

interface MemoryReader {
  retrieve(query: MemoryQuery): MemoryRecord[];
  get(key: string): MemoryRecord | undefined;
}
```

### 3.8 Asset Types

```typescript
interface AssetRef {
  assetId:      string;
  type:         AssetType;
  workflowId:   string;
  stepId:       string;
  tags:         string[];
  registeredAt: number;
  meta?:        Record<string, unknown>;
}

interface AssetRecord extends AssetRef {
  value: unknown;
}

interface AssetQuery {
  type?:       AssetType;
  tags?:       string[];
  workflowId?: string;
  stepId?:     string;
}
```

### 3.9 Version Types

```typescript
interface SerializableStepDefinition {
  id:                  string;
  dependsOn:           string[];
  timeoutMs?:          number;
  maxRetries?:         number;
  requiredConnectors?: string[];
  emitsAsset?:         AssetEmission;
  memoryWrites?:       MemoryWriteSpec[];
}

interface SerializableWorkflowDefinition {
  id:               string;
  steps:            SerializableStepDefinition[];
  routes?:          DataRoute[];
  plugins?:         string[];
  connectors?:      string[];
  versionTracking?: boolean;
  memoryScope?:     string;
}

interface VersionNode {
  versionId:        string;
  workflowId:       string;
  snapshot:         SerializableWorkflowDefinition;
  parentVersionId?: string;
  label?:           string;
  tags:             string[];
  committedAt:      number;
}

interface VersionDiff {
  versionIdA:    string;
  versionIdB:    string;
  stepsAdded:    string[];
  stepsRemoved:  string[];
  stepsChanged:  string[];
  routesAdded:   DataRoute[];
  routesRemoved: DataRoute[];
}
```

### 3.10 Visualizer Types

```typescript
type VisualizerNodeStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'unknown';

interface VisualizerNode {
  id:     string;
  label:  string;
  status: VisualizerNodeStatus;
  column: number;   // topological depth (0-indexed)
  row:    number;   // index within column (0-indexed)
}

interface VisualizerEdge {
  from:      string;    // stepId
  to:        string;    // stepId
  routeKeys: string[];  // outputKey values of DataRoutes crossing this edge
}

interface VisualizerGraph {
  workflowId: string;
  nodes:      VisualizerNode[];
  edges:      VisualizerEdge[];
  status:     WorkflowStatus | 'unknown';
}
```

### 3.11 Plugin Types

```typescript
interface PluginManifest {
  name:        string;
  version:     string;
  description: string;
}

interface PluginHookContext {
  workflowId: string;
  stepId?:    string;
  input?:     PhaseBStepInput;
  result?:    StepResult;
}

type PluginHook = (context: PluginHookContext) => Promise<void> | void;

interface Plugin {
  manifest:        PluginManifest;
  beforeWorkflow?: PluginHook;
  afterWorkflow?:  PluginHook;
  beforeStep?:     PluginHook;
  afterStep?:      PluginHook;
}
```

---

## 4. Component 1 — Asset Manager

**File:** `src/asset-manager.ts`

### Purpose

Registers and indexes binary asset references produced by workflow steps. The Asset Manager stores `AssetRecord` objects — metadata plus the raw output value — keyed by a generated `assetId`. It does not persist binary data to disk or external storage; that is the responsibility of the step handler or a Connector.

### Public Interface

```typescript
class AssetManager {
  register(
    value: unknown,
    ref:   Omit<AssetRef, 'assetId' | 'registeredAt'>,
  ): AssetRecord;

  get(assetId: string): AssetRecord | undefined;
  query(query: AssetQuery): AssetRecord[];
  tag(assetId: string, tags: string[]): void;
  archive(assetId: string): void;
  getAll(): AssetRecord[];
  clear(): void;
}
```

### Behaviour Contract

- `register` generates a unique `assetId` (format: `asset-<uuid-v4>`) and sets `registeredAt` to `Date.now()`. Returns the completed `AssetRecord`.
- `get` returns `undefined` for an unknown `assetId`.
- `query` matches records against all supplied filter fields. Multiple filter fields are ANDed. A missing filter field matches all records. Tag matching is intersection: all supplied tags must be present on the record.
- `tag` appends new tags to an existing asset. Duplicate tags are silently ignored. Throws `ASSET_NOT_FOUND` if the `assetId` is unknown.
- `archive` removes the record from the registry. Once archived, `get` returns `undefined`. Throws `ASSET_NOT_FOUND` if the `assetId` is unknown.
- `getAll` returns all non-archived records in registration order.
- `clear` removes all records including archived ones.
- Asset registration is opt-in at the step level. A step's output is passed to `register` only when `PhaseBStepDefinition.emitsAsset` is set.
- The `value` field stores the raw step output by reference. The Asset Manager does not deep-clone.

### Asset ID Format

```
asset-<uuid-v4>
```

Example: `asset-f47ac10b-58cc-4372-a567-0e02b2c3d479`

### Error Format

```
ASSET_NOT_FOUND: Asset "<assetId>" is not registered.
```

---

## 5. Component 2 — Plugin System

**File:** `src/plugin-system.ts`

### Purpose

Lifecycle hook registry for third-party extensions. Plugins observe `beforeWorkflow`, `afterWorkflow`, `beforeStep`, and `afterStep` events. They cannot modify the DAG, step definitions, or step inputs — they are observers, not mutators.

### Public Interface

```typescript
class PluginSystem {
  install(plugin: Plugin): void;
  uninstall(pluginName: string): void;
  enable(pluginName: string): void;
  disable(pluginName: string): void;
  isEnabled(pluginName: string): boolean;
  getManifest(pluginName: string): PluginManifest | undefined;
  listPlugins(): PluginManifest[];

  runBeforeWorkflow(context: PluginHookContext): Promise<void>;
  runAfterWorkflow(context: PluginHookContext): Promise<void>;
  runBeforeStep(context: PluginHookContext): Promise<void>;
  runAfterStep(context: PluginHookContext): Promise<void>;
}
```

### Behaviour Contract

- `install` registers a plugin. Throws `PLUGIN_ALREADY_INSTALLED` if a plugin with the same `manifest.name` is already registered.
- `uninstall` removes a plugin. Throws `PLUGIN_NOT_FOUND` if no plugin with that name exists.
- Plugins are enabled by default on installation. `disable` suspends hook execution without removing the plugin. `enable` restores it. `enable`/`disable` throw `PLUGIN_NOT_FOUND` if the name is unknown.
- `runBeforeStep` and `runAfterStep` iterate all **enabled** installed plugins in installation order and call each plugin's matching hook, awaiting each one sequentially. Plugins with no hook for that event are skipped silently.
- Plugin hooks are async. A hook that throws causes the `run*` call to reject; the execution loop treats this as a fatal error and fails the workflow with `PLUGIN_HOOK_ERROR`.
- `runBeforeWorkflow` passes `{ workflowId }`. `runAfterWorkflow` passes `{ workflowId }`. `runBeforeStep` passes `{ workflowId, stepId, input }`. `runAfterStep` passes `{ workflowId, stepId, result }`.
- Plugin hooks cannot cancel or skip a step. They have no return value.
- Only plugins listed in `PhaseBWorkflowDefinition.plugins` are activated during a `run()` call. Installed plugins not listed in the workflow definition are skipped for that run even if enabled.

### Plugin Activation Scope

Plugins listed in `definition.plugins` must be installed in the `PluginSystem` instance at call time. If a workflow references a plugin name that is not installed or is disabled, `validate()` returns a validation error before `run()` is entered.

### Error Formats

```
PLUGIN_ALREADY_INSTALLED: Plugin "<name>" is already installed.
PLUGIN_NOT_FOUND: Plugin "<name>" is not installed.
PLUGIN_HOOK_ERROR: Plugin "<name>" hook "<hookName>" threw: <message>
```

---

## 6. Component 3 — Connector Manager

**File:** `src/connector-manager.ts`

### Purpose

Named handle registry for external service connections. Connectors are registered once at the runtime level and referenced by name in workflow and step definitions. At step execution time, the Connector Manager assembles a `ConnectorMap` containing only the handles declared in a step's `requiredConnectors` list.

### Public Interface

```typescript
class ConnectorManager {
  register(config: ConnectorConfig, factory: ConnectorFactory): void;
  unregister(name: string): void;
  has(name: string): boolean;
  getConfig(name: string): ConnectorConfig | undefined;
  resolve(names: string[]): ConnectorMap;
  listNames(): string[];
}
```

### Behaviour Contract

- `register` stores the config and factory together under `config.name`. Throws `CONNECTOR_ALREADY_REGISTERED` if that name is taken.
- `unregister` removes the registration. Throws `CONNECTOR_NOT_FOUND` if the name is unknown. Does not terminate in-flight handles.
- `has` returns `true` if a connector with that name is registered.
- `getConfig` returns the stored `ConnectorConfig` for that name, or `undefined` if unknown.
- `resolve(names)` calls each name's factory with its stored config and returns a `ConnectorMap`. Each key is the connector name; each value is a freshly-created `ConnectorHandle`. Throws `CONNECTOR_NOT_FOUND` for any unknown name.
- `resolve([])` returns `{}`.
- Connector handles are created fresh per `resolve` call via the factory. They are not cached across calls.
- The `ConnectorHandle.call(method, params)` contract is defined by the factory implementation. The Connector Manager does not validate method names or params.
- Credentials stored in `ConnectorConfig.credentials` are passed to the factory. The Connector Manager does not encrypt or mask them.

### Error Formats

```
CONNECTOR_ALREADY_REGISTERED: Connector "<name>" is already registered.
CONNECTOR_NOT_FOUND: Connector "<name>" is not registered.
```

---

## 7. Component 4 — AI Memory

**File:** `src/ai-memory.ts`

### Purpose

Cross-run persistent memory store that survives beyond the ContextStore's per-run lifetime. Stores `MemoryRecord` objects with tier classification, optional TTL expiry, and optional scope isolation. Provides a read-only `MemoryReader` that is injected into `PhaseBStepInput` so handlers can query memory without direct write access to the store.

AI Memory is distinct from the ContextStore:

| | ContextStore | AIMemory |
|---|---|---|
| Lifetime | Per workflow run — cleared on completion | Persists across runs |
| Scope | Per `workflowId` | Global or isolated by `memoryScope` |
| Primary consumer | DataRouter input resolution | Step handlers (read); run() (write) |
| Data type | Step pipeline data | Learned context, preferences, project facts |

### Public Interface

```typescript
class AIMemory {
  store(record: Omit<MemoryRecord, 'id' | 'createdAt'>): MemoryRecord;
  retrieve(query: MemoryQuery): MemoryRecord[];
  get(key: string, scope?: string): MemoryRecord | undefined;
  delete(id: string): void;
  prune(): number;
  reader(scope?: string): MemoryReader;
  clear(scope?: string): void;
  clearAll(): void;
}
```

### Behaviour Contract

- `store` generates a unique `id` (format: `mem-<uuid-v4>`) and sets `createdAt` to `Date.now()`. Returns the completed record. Values are stored by reference.
- `retrieve` matches records against all fields present in the query. Missing query fields match all records. Tag matching is intersection: all supplied tags must be present. Returns results in `createdAt` ascending order, capped at `query.limit` if supplied.
- `get(key, scope?)` returns the most recently created `MemoryRecord` with the given `key` and matching `scope`. Returns `undefined` if none exists.
- `delete` removes a record by `id`. Throws `MEMORY_RECORD_NOT_FOUND` if the id is unknown.
- `prune` removes all records whose `ttlMs` has elapsed (`createdAt + ttlMs < Date.now()`). Returns the count of pruned records. Records without `ttlMs` are never pruned by this call.
- `reader(scope?)` returns a `MemoryReader` that delegates to `retrieve` and `get` with the given scope pre-bound. This object is injected into `PhaseBStepInput.memory`. It exposes no write operations.
- `clear(scope)` deletes all records whose `scope` matches the argument. `clear(undefined)` deletes all records with no `scope` set. `clearAll` deletes all records regardless of scope.

### Tier Semantics

| Tier | Intended Lifetime | Notes |
|---|---|---|
| `short-term` | Current session | Pair with `ttlMs` for automatic expiry |
| `session` | Current session | Alias for `short-term`; provided for symmetry with the Memory System Skill |
| `long-term` | Indefinite | No TTL; manually pruned or `delete`d |
| `project` | Project lifetime | Isolate with `scope` set to a project id |

Phase B AIMemory stores records in-process. Persistence adapters are out of scope for Phase B.

### Automatic Memory Writes from Steps

When `PhaseBStepDefinition.memoryWrites` is set on a completing step, the Phase B execution loop writes each declared output field to AIMemory after the step is marked `completed`:

```
for each spec in stepDef.memoryWrites:
  value = stepOutput[spec.outputKey]
  if value !== undefined:
    aiMemory.store({
      key:        spec.memoryKey,
      value,
      tier:       spec.tier,
      tags:       spec.tags ?? [],
      ttlMs:      spec.ttlMs,
      workflowId: definition.id,
      stepId,
      scope:      definition.memoryScope,
    })
```

All writes from a run are collected and returned in `PhaseBWorkflowResult.memoryWrites`.

### Error Format

```
MEMORY_RECORD_NOT_FOUND: Memory record "<id>" does not exist.
```

---

## 8. Component 5 — Version Graph

**File:** `src/version-graph.ts`

### Purpose

Immutable append-only graph of serializable workflow definition snapshots. Each `commit` adds a `VersionNode` linked to its predecessor. The graph supports history traversal, label tagging, and structural diffs between any two versions.

Step `handler` functions cannot be serialized. The Version Graph stores a `SerializableWorkflowDefinition` — all fields of `PhaseBWorkflowDefinition` except the per-step `handler` references. This is enforced by the `SerializableStepDefinition` type, which has no `handler` field.

### Public Interface

```typescript
class VersionGraph {
  commit(
    definition: PhaseBWorkflowDefinition,
    options?:   { label?: string; tags?: string[] },
  ): VersionNode;

  getVersion(versionId: string): VersionNode | undefined;
  getHistory(workflowId: string): VersionNode[];
  getLatest(workflowId: string): VersionNode | undefined;
  tag(versionId: string, label: string): void;
  diff(versionIdA: string, versionIdB: string): VersionDiff;
  listWorkflows(): string[];
  clear(workflowId?: string): void;
}
```

### Behaviour Contract

- `commit` generates a `versionId` (format: `ver-<uuid-v4>`), sets `committedAt` to `Date.now()`, serializes the definition (omitting `handler` from each step), and appends the node. If a prior version exists for the same `workflowId`, the new node's `parentVersionId` is set to the most recently committed version's `versionId`. The first commit for a `workflowId` has no `parentVersionId`.
- `getVersion` returns `undefined` for an unknown `versionId`.
- `getHistory` returns all `VersionNode` objects for a `workflowId` in commit order (oldest first). Returns `[]` for an unknown `workflowId`.
- `getLatest` returns the most recently committed node for a `workflowId`, or `undefined` if none exists.
- `tag(versionId, label)` sets the `label` field on an existing node in place. Throws `VERSION_NOT_FOUND` if the `versionId` is unknown. This is the only mutation permitted after commit.
- `diff(versionIdA, versionIdB)` compares the two snapshots and returns a `VersionDiff`. Throws `VERSION_NOT_FOUND` if either id is unknown. The two versions may belong to different `workflowId` values.
- `VersionDiff.stepsChanged` lists step ids whose `dependsOn`, `timeoutMs`, `maxRetries`, `requiredConnectors`, `emitsAsset`, or `memoryWrites` differ between the two snapshots. Step ids present in both versions but with no field changes are not listed.
- `listWorkflows` returns all `workflowId` values with at least one committed version, in first-commit order.
- `clear(workflowId)` removes all versions for that workflow. `clear()` (no argument) removes all versions for all workflows.

### Version ID Format

```
ver-<uuid-v4>
```

Example: `ver-a3bb189e-8bf9-3888-9912-ace4e6543002`

### Error Format

```
VERSION_NOT_FOUND: Version "<versionId>" does not exist.
```

---

## 9. Component 6 — Workflow Visualizer

**File:** `src/workflow-visualizer.ts`

### Purpose

Pure-function graph serializer. Converts a `PhaseBWorkflowDefinition` into a `VisualizerGraph` — a serializable node-edge representation suitable for UI rendering. Optionally overlays runtime status from a `PhaseBWorkflowResult`.

The Visualizer has no state, no side effects, and no dependency on any other Phase B component instance.

### Public Interface

```typescript
function visualize(
  definition: PhaseBWorkflowDefinition,
  result?:    PhaseBWorkflowResult,
): VisualizerGraph;
```

### Behaviour Contract

- `visualize` calls `resolveDag` on the definition's steps to compute topological depth for column assignment. If the DAG has a cycle, the function still returns a graph — nodes that could not be resolved are placed in the rightmost column (`maxResolvedDepth + 1`).
- **Node layout — column:** Equals the topological depth of the step (0 for steps with no dependencies).
- **Node layout — row:** Equals the index of the step within its column, ordered by insertion order in `definition.steps`.
- **Edges:** One `VisualizerEdge` per unique `(from, to)` dependency pair derived from `dependsOn` arrays. `routeKeys` contains the union of all `DataRoute.outputKey` values for routes where `fromStep === from` and `toStep === to`. If no routes connect that pair, `routeKeys` is `[]`.
- **Status overlay — nodes:** If `result` is provided, each node's `status` is set from the matching `StepResult.status` in `result.stepResults`. Steps with no matching `StepResult` (never reached) receive `status: 'pending'`. If `result` is not provided, all nodes receive `status: 'unknown'`.
- **Status overlay — graph:** `VisualizerGraph.status` is set from `result.status` when `result` is provided, otherwise `'unknown'`.
- `visualize` does not throw. Input errors (cycle, unknown deps) produce a best-effort graph with `status: 'unknown'`.

### Layout Example

For steps `A`, `B (dependsOn: [A])`, `C (dependsOn: [A])`, `D (dependsOn: [B, C])`:

```
column 0    column 1    column 2
   A    ──►    B    ──►    D
         ──►   C    ──►
```

Node positions:

| id | column | row |
|---|---|---|
| `A` | 0 | 0 |
| `B` | 1 | 0 |
| `C` | 1 | 1 |
| `D` | 2 | 0 |

---

## 10. Public API Additions

**File:** `src/index.ts`

Phase B extends the `workflowEngine` default export and adds new named exports. Phase A's full export surface is unchanged.

### Extended Default Export

```typescript
const workflowEngine: {
  // Phase A (unchanged)
  run(definition: WorkflowDefinition, options?: WorkflowRunOptions): Promise<WorkflowResult>;
  validate(definition: WorkflowDefinition): ValidationResult;

  // Phase B additions
  run(definition: PhaseBWorkflowDefinition, options?: PhaseBWorkflowRunOptions): Promise<PhaseBWorkflowResult>;
  registerPlugin(plugin: Plugin): void;
  unregisterPlugin(pluginName: string): void;
  registerConnector(config: ConnectorConfig, factory: ConnectorFactory): void;
  unregisterConnector(name: string): void;
  visualize(definition: PhaseBWorkflowDefinition, result?: PhaseBWorkflowResult): VisualizerGraph;
  commitVersion(definition: PhaseBWorkflowDefinition, options?: { label?: string; tags?: string[] }): VersionNode;
  getVersion(versionId: string): VersionNode | undefined;
  getHistory(workflowId: string): VersionNode[];
  diffVersions(versionIdA: string, versionIdB: string): VersionDiff;
};

export default workflowEngine;
```

The `run` overload is resolved by TypeScript via structural typing: `PhaseBWorkflowDefinition` is a superset of `WorkflowDefinition`. A Phase A definition passed to the Phase B `run` is valid and behaves identically to Phase A (no plugins activated, no connectors resolved, no memory written, no version committed, no assets registered).

### Phase B `validate(definition)`

Phase B appends the following checks to Phase A's eight validation checks:

| Check | Condition |
|---|---|
| 9 | Each step's `requiredConnectors` entries are registered in the `ConnectorManager`. |
| 10 | Each step's `emitsAsset.type` is a valid `AssetType` value. |
| 11 | Each `memoryWriteSpec.tier` is a valid `MemoryTier` value. |
| 12 | All plugin names in `definition.plugins` are installed and enabled in the `PluginSystem`. |

Validation errors from Phase B checks are appended to the same `errors` array as Phase A checks. The return type is unchanged: `ValidationResult`.

### Phase B `run(definition, options?)`

Extends the Phase A execution sequence with Phase B steps at well-defined insertion points. Phase A steps are listed in normal text; Phase B insertions are marked `[B]`:

1. Calls `validate`. Throws `INVALID_WORKFLOW` if invalid.
2. `[B]` Calls `PluginSystem.runBeforeWorkflow({ workflowId })`.
3. `[B]` Calls `ConnectorManager.resolve(definition.connectors ?? [])` to build the run-scoped `ConnectorMap`.
4. `[B]` Calls `AIMemory.reader(definition.memoryScope)` to build the `MemoryReader` for step injection.
5. Instantiates `EventBus`, `ContextStore`, `DataRouter`, `StepRunner`.
6. Seeds the `ContextStore` with `options.context`. `[B]` Also seeds with `options.memoryContext`.
7. Registers all `definition.routes` with the `DataRouter`.
8. Calls `resolveDag`. Instantiates `Scheduler` with all steps.
9. `[B]` If `definition.versionTracking === true`, calls `VersionGraph.commit(definition)` and records `versionId`.
10. Emits `workflow:started`.
11. Enters the Phase B execution loop (see §11).
12. `[B]` Calls `PluginSystem.runAfterWorkflow({ workflowId })`.
13. `[B]` Calls `visualize(definition, result)` and attaches the returned `VisualizerGraph` to `result.graph`.
14. Emits `workflow:completed` or `workflow:failed`, clears the `ContextStore`, and returns `PhaseBWorkflowResult`.

### Named Exports — Phase B Additions

```typescript
export {
  AssetManager,
  PluginSystem,
  ConnectorManager,
  AIMemory,
  VersionGraph,
  visualize,
};

export type {
  AssetType, AssetEmission, AssetRef, AssetRecord, AssetQuery,
  PluginManifest, PluginHookContext, PluginHook, Plugin,
  ConnectorType, ConnectorConfig, ConnectorHandle, ConnectorMap, ConnectorFactory,
  MemoryTier, MemoryRecord, MemoryQuery, MemoryWriteSpec, MemoryReader,
  VersionNode, VersionDiff, SerializableStepDefinition, SerializableWorkflowDefinition,
  VisualizerNodeStatus, VisualizerNode, VisualizerEdge, VisualizerGraph,
  PhaseBStepDefinition, PhaseBWorkflowDefinition,
  PhaseBStepInput, PhaseBWorkflowRunOptions, PhaseBWorkflowResult,
};
```

---

## 11. Execution Flow

### Phase B Augmented Loop

```
run(definition: PhaseBWorkflowDefinition, options?):

  validate(definition)                         ← Phase B checks included
  [B] PluginSystem.runBeforeWorkflow({ workflowId })
  [B] connectorMap  = ConnectorManager.resolve(definition.connectors ?? [])
  [B] memoryReader  = AIMemory.reader(definition.memoryScope)
  [B] collectedAssetRefs    = []
  [B] collectedMemoryWrites = []

  instantiate bus, store, router, runner
  seed ContextStore from options.context
  [B] seed ContextStore from options.memoryContext
  register definition.routes in DataRouter
  resolveDag(definition.steps)
  instantiate Scheduler(definition.steps)

  [B] if definition.versionTracking:
        versionId = VersionGraph.commit(definition).versionId

  emit workflow:started

  while scheduler not complete:
    ready = scheduler.getReadySteps()
    if ready is empty: break   ← deadlock guard (Phase A)

    for each stepId in ready (sequential):
      stepDef = definition.steps[stepId]
      data    = router.resolveInputs(stepId, stepOutputs)
      context = store.getAll(workflowId)

      [B] stepConnectors = subset of connectorMap for stepDef.requiredConnectors ?? []
      [B] input = { stepId, workflowId, context, data,
                    connectors: stepConnectors, memory: memoryReader }

      [B] PluginSystem.runBeforeStep({ workflowId, stepId, input })
      emit step:started
      scheduler.markRunning(stepId)

      result = await runner.run(stepId, stepDef.handler, input, ...)

      if result.status === 'completed':
        wrap output if non-object → { value: <output> }
        stepOutputs.set(stepId, wrappedOutput)
        scheduler.markCompleted(stepId)
        emit step:completed

        [B] if stepDef.emitsAsset:
              rec = AssetManager.register(result.output, {
                type: stepDef.emitsAsset.type, tags: stepDef.emitsAsset.tags ?? [],
                workflowId, stepId,
              })
              collectedAssetRefs.push(rec)

        [B] for each spec in stepDef.memoryWrites ?? []:
              value = wrappedOutput[spec.outputKey]
              if value !== undefined:
                rec = AIMemory.store({ key: spec.memoryKey, value,
                                       tier: spec.tier, tags: spec.tags ?? [],
                                       ttlMs: spec.ttlMs, workflowId, stepId,
                                       scope: definition.memoryScope })
                collectedMemoryWrites.push(rec)

        [B] PluginSystem.runAfterStep({ workflowId, stepId, result })

      else:
        scheduler.markFailed(stepId)
        emit step:failed
        [B] PluginSystem.runAfterStep({ workflowId, stepId, result })
        emit workflow:failed
        store.clear(workflowId)

        [B] PluginSystem.runAfterWorkflow({ workflowId })
        [B] partialResult = { workflowId, status: 'failed', ... }
        [B] graph = visualize(definition, partialResult)

        return PhaseBWorkflowResult {
          status: 'failed', graph, versionId,
          memoryWrites: collectedMemoryWrites,
          assetRefs:    collectedAssetRefs,
          ...
        }

  emit workflow:completed or workflow:failed
  store.clear(workflowId)

  [B] PluginSystem.runAfterWorkflow({ workflowId })
  [B] graph = visualize(definition, finalResult)

  return PhaseBWorkflowResult {
    status, graph, versionId,
    memoryWrites: collectedMemoryWrites,
    assetRefs:    collectedAssetRefs,
    ...
  }
```

### Connector Scoping

The full `connectorMap` is resolved once at the start of the run. Each step receives only the subset of handles keyed by its `requiredConnectors` list. A step with no `requiredConnectors` receives `{}`. This makes step-level connector dependencies explicit and auditable without re-invoking the factory per step.

### Plugin Hook Failure

If any plugin hook throws, the `run*` call rejects with `PLUGIN_HOOK_ERROR`. The execution loop treats this as a fatal error and returns `PhaseBWorkflowResult` with `status: 'failed'`. No further steps or hooks are invoked. `runAfterWorkflow` and `visualize` are not called on hook failure; `graph` is absent from the returned result.

### Memory Write Ordering

Memory writes for a step are flushed after the step is marked `completed` and before `runAfterStep` is called. Plugin `afterStep` hooks can therefore observe that memory writes have already been committed.

### Visualizer on the Failure Path

`visualize` is called on both the success and failure paths. On the failure path, the result passed to `visualize` contains only step results for steps that ran before the failure. Steps that never ran are treated as `'pending'` by the Visualizer.

---

## 12. Error Codes

Phase B appends the following codes to Phase A's error table. Phase A codes are reproduced for completeness.

| Code | Thrown By | Sync/Async | Description |
|---|---|---|---|
| `INVALID_WORKFLOW` | `run()` | sync (throw) | Phase A: Workflow definition failed validation |
| `UNKNOWN_DEPENDENCY` | `resolveDag()` | sync (throw) | Phase A: A step references a dep id not in the step list |
| `STEP_TIMEOUT` | `StepRunner` | async (reject) | Phase A: Handler did not resolve within `timeoutMs` |
| `UNKNOWN_STEP` | `Scheduler` | sync (throw) | Phase A: State transition called with an unregistered step id |
| `ASSET_NOT_FOUND` | `AssetManager` | sync (throw) | Phase B: `tag` or `archive` called with unknown `assetId` |
| `PLUGIN_ALREADY_INSTALLED` | `PluginSystem` | sync (throw) | Phase B: Duplicate plugin name on `install` |
| `PLUGIN_NOT_FOUND` | `PluginSystem` | sync (throw) | Phase B: `uninstall`, `enable`, or `disable` called for unknown plugin |
| `PLUGIN_HOOK_ERROR` | `PluginSystem` | async (reject) | Phase B: A plugin lifecycle hook threw |
| `CONNECTOR_ALREADY_REGISTERED` | `ConnectorManager` | sync (throw) | Phase B: Duplicate connector name on `register` |
| `CONNECTOR_NOT_FOUND` | `ConnectorManager` | sync (throw) | Phase B: `resolve` or `unregister` called with unknown name |
| `MEMORY_RECORD_NOT_FOUND` | `AIMemory` | sync (throw) | Phase B: `delete` called with unknown record id |
| `VERSION_NOT_FOUND` | `VersionGraph` | sync (throw) | Phase B: `tag` or `diff` called with unknown `versionId` |

---

## 13. Data Flow

```
Caller supplies:
  PhaseBWorkflowDefinition { id, steps[], routes[],
                             plugins?, connectors?,
                             versionTracking?, memoryScope? }
  PhaseBWorkflowRunOptions  { context?, onEvent?, memoryContext? }

              ┌────────────────────────────────────────────────────┐
              │                     run()                           │
              │                                                     │
  plugins ───►│ PluginSystem.runBeforeWorkflow()                   │
  connectors ►│ ConnectorManager.resolve()   → connectorMap        │
  memoryScope►│ AIMemory.reader()            → memoryReader        │
  steps ─────►│ VersionGraph.commit()  [opt] → versionId          │
              │                                                     │
              │  options.context ────► ContextStore.set()          │
              │  options.memoryContext► ContextStore.set()         │
              │  definition.routes ──► DataRouter.addRoute()       │
              │  definition.steps ───► Scheduler(steps)            │
              │                                                     │
              │  ┌── execution loop ──────────────────────────┐    │
              │  │                                            │    │
              │  │ PluginSystem.runBeforeStep()               │    │
              │  │ Scheduler.getReadySteps()                  │    │
              │  │ DataRouter.resolveInputs()                 │    │
              │  │ ContextStore.getAll()                      │    │
              │  │   + connectorMap subset                    │    │
              │  │   + memoryReader                           │    │
              │  │            │                               │    │
              │  │            ▼                               │    │
              │  │ StepRunner.run()                           │    │
              │  │            │                               │    │
              │  │            ▼                               │    │
              │  │ AssetManager.register()    [opt]           │    │
              │  │ AIMemory.store()           [opt]           │    │
              │  │ PluginSystem.runAfterStep()                │    │
              │  │ EventBus.emit()                            │    │
              │  │ Scheduler.mark*()                          │    │
              │  │ stepOutputs.set()                          │    │
              │  └────────────────────────────────────────────┘    │
              │                                                     │
              │ PluginSystem.runAfterWorkflow()                     │
              │ visualize(definition, result)  → graph              │
              │ ContextStore.clear(workflowId)                      │
              └─────────────────────────────────────────────────────┘
                                    │
                                    ▼
                   PhaseBWorkflowResult {
                     workflowId, status,
                     stepResults[], startedAt, completedAt, error,
                     graph, versionId, memoryWrites[], assetRefs[]
                   }
```

---

## 14. Separation Rules

These rules govern what each Phase B component may import and access. Violations indicate an architecture defect.

### Import Boundaries

| Component | May Import | Must Not Import |
|---|---|---|
| `asset-manager.ts` | `phase-b-types.ts` | Any Phase A source; PluginSystem; ConnectorManager; AIMemory; VersionGraph; WorkflowVisualizer |
| `plugin-system.ts` | `phase-b-types.ts`, `step-runner.ts` (types only) | AssetManager; ConnectorManager; AIMemory; VersionGraph; WorkflowVisualizer |
| `connector-manager.ts` | `phase-b-types.ts` | Any other Phase B component |
| `ai-memory.ts` | `phase-b-types.ts` | Any Phase A source; Any other Phase B component |
| `version-graph.ts` | `phase-b-types.ts`, `dag-resolver.ts` | AssetManager; PluginSystem; ConnectorManager; AIMemory; WorkflowVisualizer |
| `workflow-visualizer.ts` | `phase-b-types.ts`, `dag-resolver.ts`, `types.ts` | AssetManager; PluginSystem; ConnectorManager; AIMemory; VersionGraph |
| `index.ts` | All Phase A sources; All Phase B sources | Nothing beyond the `skills/workflow-engine/` directory |

### Phase A Immutability

No Phase A source file (`event-bus.ts`, `context-store.ts`, `data-router.ts`, `dag-resolver.ts`, `scheduler.ts`, `step-runner.ts`, `types.ts`) is modified in Phase B. All Phase A component interfaces are unchanged and all Phase A tests continue to pass without modification.

### StepInput Extension Rule

`PhaseBStepInput` extends `StepInput` additively with two optional-equivalent fields (`connectors`, `memory`). The Phase B execution loop constructs and passes `PhaseBStepInput` where `StepInput` is expected. Because `PhaseBStepInput` is structurally assignable to `StepInput`, Phase A handlers typed as `(input: StepInput)` compile and run correctly against the extended object and ignore unknown fields.

### ContextStore vs. AIMemory Rule

`ContextStore` is not replaced or shadowed. Both coexist:

- `ContextStore` is used for per-run pipeline data (step routing inputs, context snapshots).
- `AIMemory` is used for cross-run learned context and project facts.
- `memoryContext` from `PhaseBWorkflowRunOptions` is seeded into `ContextStore` at run start, making pre-loaded memory values available to steps via the existing `StepInput.context` field without requiring AIMemory access.

### Connector Injection Rule

Connectors are not injected globally into all steps. Each step receives only the subset of handles declared in its `requiredConnectors` list. Steps with no `requiredConnectors` receive an empty `ConnectorMap`. This makes step-level external dependencies explicit and auditable.

### Plugin Scope Rule

Plugin hooks run only for plugins explicitly listed in `PhaseBWorkflowDefinition.plugins`. Globally installed plugins not listed in the workflow definition are skipped for that run, even if enabled. This prevents implicit side effects from globally-installed plugins on workflows that do not expect them.

### Visualizer Purity Rule

`visualize` is a pure function. It does not access `AssetManager`, `AIMemory`, `VersionGraph`, `PluginSystem`, `ConnectorManager`, `ContextStore`, or `EventBus`. Its only inputs are `PhaseBWorkflowDefinition` and optional `PhaseBWorkflowResult`. It may call `resolveDag` for layout computation.

### VersionGraph Snapshot Rule

`VersionGraph.commit` strips `handler` from each step before storing the snapshot. This is enforced by the `SerializableStepDefinition` type, which has no `handler` field. No function references are stored in the Version Graph. Handler logic changes between versions are not visible in `VersionDiff`.

---

## 15. Known Constraints

| Constraint | Detail |
|---|---|
| **In-process state only** | All Phase B components store state in-process. `AssetManager`, `AIMemory`, `VersionGraph`, and `PluginSystem` are in-memory only. State is lost on process restart. |
| **Sequential plugin hooks** | Plugin hooks are awaited sequentially in installation order. Multiple plugins do not parallelize their hook execution. |
| **No hook cancellation** | Plugin hooks cannot cancel a step, modify step inputs, or skip execution. They are observers only. |
| **No connector pooling** | Connector handles are created fresh per `ConnectorManager.resolve` call. Connection pooling must be implemented inside the `ConnectorFactory`. |
| **Handler not serialized** | `VersionGraph` snapshots exclude step `handler` references. `VersionDiff` reflects structural changes only; handler logic changes are invisible. |
| **Memory not encrypted** | `AIMemory` stores values in plain objects. Secrets must not be stored through this component. |
| **Visualizer layout is topological only** | Node positions are column (depth) and row (insertion order within column). No force-directed or Sugiyama layout is applied. |
| **Sequential execution inherited** | Phase B does not introduce parallel step execution. The Phase A sequential loop is preserved. |
| **Cyclic DAG in Visualizer** | If `visualize` is called on a definition with a cycle, cyclic nodes are placed in the last column on a best-effort basis. No error is thrown. |
| **Hook failure skips afterWorkflow and visualize** | If a plugin hook throws `PLUGIN_HOOK_ERROR`, `runAfterWorkflow` and `visualize` are not called. The returned result has no `graph` field. |
| **`cancelled` status unused** | `WorkflowStatus` includes `'cancelled'` (inherited from Phase A). No Phase B code path sets this value. |

---

## 16. Out of Scope — Phase B

The following systems are explicitly excluded from this architecture version and must not be added until a subsequent phase is specified:

- Parallel step execution engine
- Workflow cancellation
- Dead-letter / retry queues
- Cross-workflow context sharing
- Persistent storage adapters for AssetManager, AIMemory, or VersionGraph
- Agent Runtime
- Asset binary upload or download (AssetManager stores references and values by reference only)
- UI rendering components (WorkflowVisualizer produces data, not rendered output)
- Plugin sandboxing or security isolation
- Connector credential encryption or secret management
- AI model inference (ConnectorType describes the interface shape, not any implementation)
- Workflow branching or conditional step execution
- Version graph merge or rebase strategies
- VersionGraph persistence or replication
- PluginSystem version conflict resolution
- AIMemory replication or cross-process sharing
- `memoryContext` persistence beyond the current run's ContextStore seeding
