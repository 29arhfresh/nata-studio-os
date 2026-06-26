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
