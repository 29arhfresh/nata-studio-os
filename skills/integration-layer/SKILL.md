# Integration Layer

## Overview

The Integration Layer is the connective tissue of Nata Studio OS. It transforms independent Skills into one coherent operating system by defining the contracts, machinery, and observability interfaces through which all Skills communicate.

The Integration Layer **composes** existing Skills — it does not duplicate their logic. Every cross-Skill interaction passes through the shared request/response contracts, the capability registry, and the Skill invocation API defined here.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Integration Layer                               │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  contracts/ │  │  registry/   │  │ invocation/ │  │observability│  │
│  │             │  │              │  │             │  │             │  │
│  │ SharedContext│  │CapabilityReg │  │SkillInvoker │  │  ILogger    │  │
│  │ SkillRequest│  │SkillManifest │  │ResultAgg.   │  │  ITracer    │  │
│  │SkillResponse│  │DiscoveryQuery│  │ISkillAdapter│  │  IMetrics   │  │
│  │ Error types │  │              │  │             │  │             │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         adapters/                                │   │
│  │   MemorySystemAdapter  CreativeDirectorAdapter  PromptArchitect  │   │
│  │          ↓                      ↓                    Adapter ↓   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│         │                         │                        │            │
│  ┌──────▼───────┐   ┌─────────────▼────────┐   ┌─────────▼────────┐   │
│  │ Memory System│   │  Creative Director   │   │ Prompt Architect  │   │
│  └──────────────┘   └──────────────────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

| Module | Responsibility |
|---|---|
| `contracts/` | Canonical types for context, requests, responses, and errors |
| `registry/` | Runtime registration and discovery of Skills by capability |
| `invocation/` | Adapter interface, invoker with timeout/retry, result aggregator |
| `adapters/` | Bridges to Memory System, Creative Director, Prompt Architect |
| `observability/` | Logger, tracer, and metrics interfaces with default implementations |

---

## Usage

### 1. Create a shared context

```typescript
import { createContext, patchContext } from 'integration-layer';

const ctx = createContext({
  sessionId: 'sess-abc123',
  projectId: 'proj-nata',
});

// Enrich context as it travels through Skills
const enriched = patchContext(ctx, {
  memory: { brandTone: ['bold', 'minimal'] },
  spanId: 'sp-next',
});
```

### 2. Register Skills in the capability registry

```typescript
import { CapabilityRegistry, MemorySystemAdapter, CreativeDirectorAdapter } from 'integration-layer';
import * as memorySystem from '../memory-system/src/index';
import * as creativeDirector from '../creative-director/src/index';

const registry = new CapabilityRegistry();

registry.register(
  {
    name: 'memory-system',
    version: '0.1.0',
    description: 'Four-tier memory management with semantic search',
    capabilities: ['memory-management', 'semantic-search', 'context-handoff'],
    operations: [
      { name: 'store', description: 'Write a value to memory' },
      { name: 'search', description: 'Semantic memory search' },
      { name: 'restore-context', description: 'Reconstruct session context' },
      { name: 'handoff', description: 'Transfer memory between Skills' },
    ],
    priority: 80,
    maxConcurrency: 4,
    timeoutMs: 30_000,
    tags: ['core', 'memory'],
  },
  new MemorySystemAdapter(memorySystem)
);

registry.register(
  {
    name: 'creative-director',
    version: '0.1.0',
    description: 'Brand strategy, visual direction, and creative scoring',
    capabilities: ['brand-strategy', 'visual-direction', 'creative-scoring'],
    operations: [
      { name: 'build-brief', description: 'Generate a creative brief' },
      { name: 'build-moodboard', description: 'Compose a visual moodboard' },
      { name: 'build-art-direction', description: 'Produce art direction' },
      { name: 'score-creative', description: 'Score creative output' },
    ],
    priority: 90,
    maxConcurrency: 2,
    timeoutMs: 60_000,
    tags: ['creative', 'brand'],
  },
  new CreativeDirectorAdapter(creativeDirector)
);
```

### 3. Discover Skills

```typescript
// Find Skills with a specific capability
const memorySkills = registry.discover({ capability: 'semantic-search' });

// Find by minimum priority
const highPriority = registry.discover({ minPriority: 85 });

// Check capability availability
if (registry.hasCapability('brand-strategy')) { /* ... */ }
```

### 4. Invoke a Skill

```typescript
import { SkillInvoker, createRequest } from 'integration-layer';

const invoker = new SkillInvoker(registry);

const request = createRequest({
  skillName: 'memory-system',
  operation: 'search',
  input: { query: 'brand tone for luxury campaign', limit: 5, scope: 'session', sessionId: ctx.sessionId },
  context: ctx,
  options: { timeoutMs: 10_000, maxRetries: 2 },
});

const response = await invoker.invoke(request);
console.log(response.output);
```

### 5. Invoke multiple Skills and aggregate

```typescript
import { ResultAggregator } from 'integration-layer';

const [briefRes, promptRes] = await invoker.invokeMany(
  [briefRequest, promptRequest],
  'sequential'   // or 'parallel'
);

const aggregator = new ResultAggregator();
const result = aggregator.aggregate([briefRes, promptRes]);

console.log(result.metadata.successCount);   // 2
console.log(result.metadata.averageQualityScore);
console.log(result.merged);                  // shallow-merged output object
```

### 6. Observability

```typescript
import { ConsoleLogger, NoopTracer, InMemoryMetrics } from 'integration-layer';

const logger = new ConsoleLogger('info', { skillName: 'integration-layer' });
const tracer = new NoopTracer();
const metrics = new InMemoryMetrics();

logger.info('Invoking skill', { requestId: request.requestId, traceId: ctx.traceId });

const span = tracer.startSpan('skill.invoke', { traceId: ctx.traceId, spanId: ctx.spanId });
metrics.increment('skill.invocations', { skillName: request.skillName });

// After invocation:
metrics.histogram('skill.latency_ms', response.metadata.durationMs, { skillName: request.skillName });
span.finish();
```

---

## Parameters

### createContext(params)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sessionId` | `string` | Yes | Unique session identifier |
| `projectId` | `string` | No | Optional project scope |
| `traceId` | `string` | No | Distributed trace ID (auto-generated if omitted) |
| `spanId` | `string` | No | Span ID (auto-generated if omitted) |
| `metadata` | `Record<string, unknown>` | No | Initial context metadata |

### createRequest(params)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skillName` | `string` | Yes | Target Skill name (must match registry) |
| `operation` | `string` | Yes | Operation name within the Skill |
| `input` | `TInput` | Yes | Operation-specific input payload |
| `context` | `SharedContext` | Yes | Shared context object |
| `options` | `InvocationOptions` | No | Timeout and retry configuration |

### InvocationOptions

| Field | Type | Default | Description |
|---|---|---|---|
| `timeoutMs` | `number` | `30_000` | Per-invocation timeout |
| `maxRetries` | `number` | `0` | Retry count on transient failure |
| `retryDelayMs` | `number` | `250` | Base delay between retries (linear backoff) |

### CapabilityRegistry.register(manifest, adapter)

| Field | Type | Required | Description |
|---|---|---|---|
| `manifest.name` | `string` | Yes | Unique Skill name |
| `manifest.capabilities` | `string[]` | Yes | Semantic capability identifiers |
| `manifest.operations` | `OperationDescriptor[]` | Yes | Named operations the Skill exposes |
| `manifest.priority` | `number` | Yes | Resolution priority (higher wins) |
| `manifest.timeoutMs` | `number` | Yes | Default timeout for discovery metadata |
| `adapter` | `ISkillAdapter` | Yes | Implementation that satisfies the Skill's contract |

---

## Errors

All errors extend `IntegrationError` and carry a typed `code`.

| Error Class | Code | When |
|---|---|---|
| `SkillNotFoundError` | `SKILL_NOT_FOUND` | Invoker cannot find a registered adapter for `skillName` |
| `SkillInvocationError` | `SKILL_INVOCATION_FAILED` | Adapter threw after exhausting retries |
| `SkillTimeoutError` | `SKILL_TIMEOUT` | Adapter did not resolve within `timeoutMs` |
| `AggregationError` | `AGGREGATION_FAILED` | Aggregator encountered a null/undefined output |
| `CapabilityNotAvailableError` | `CAPABILITY_NOT_AVAILABLE` | `requireCapability()` found no registered Skill with the requested capability |
| `ContextInvalidError` | `CONTEXT_INVALID` | SharedContext validation failed |
| `RegistryError` | `REGISTRY_ERROR` | Duplicate registration or unregister of unknown Skill |
| `AdapterError` | `ADAPTER_ERROR` | Adapter-level dispatch error (unknown operation or Skill throws) |

Use the `isIntegrationError(err)` guard to narrow errors in catch blocks:

```typescript
import { isIntegrationError, SkillTimeoutError } from 'integration-layer';

try {
  await invoker.invoke(request);
} catch (err) {
  if (err instanceof SkillTimeoutError) {
    console.warn(`Skill "${request.skillName}" timed out after ${err.timeoutMs}ms`);
  } else if (isIntegrationError(err)) {
    console.error(`Integration error [${err.code}]: ${err.message}`);
  }
}
```

---

## Architectural Limitations

These are proven constraints of the current implementation, not theoretical concerns.

**1. Linear retry backoff**
`SkillInvoker` uses `retryDelayMs × attempt` (linear). Under high contention this may cause thundering-herd retry bursts. An exponential backoff with jitter would be safer in production; the `InvocationOptions` interface already exposes `retryDelayMs` so callers can work around this by setting it large.

**2. InMemoryMetrics histograms track sums, not distributions**
`InMemoryMetrics.histogram(name, value)` accumulates observed values into a running total. It cannot produce p50/p95/p99 percentiles. Wire a real observability backend (Prometheus, StatsD) through `IMetricsCollector` for percentile histograms.

**3. NoopTracer uses `Math.random()` for IDs**
`NoopTracer.startSpan()` generates span/trace IDs with `Math.random()`, which is not cryptographically random. Collision probability is negligible at Nata's current scale, but a production tracer backed by OpenTelemetry should replace it and generate compliant 128-bit W3C trace IDs.

**4. CapabilityRegistry holds adapters in memory with no eviction**
Adapters registered at startup remain in memory for the process lifetime. Hot-reloading a Skill at runtime requires `unregister()` followed by `register()` — there is no automatic reload mechanism.

**5. `ResponseMetadata.warnings` is always an empty array**
`createResponse` accepts a `warnings` parameter and `ResponseMetadata` exposes the field, but no current adapter populates it. Callers can check `response.metadata.warnings`, but they will always receive `[]` until adapters are updated to emit warnings.

**6. `ResponseMetadata.attempt` is always `1`**
Each adapter constructs the response itself via `createResponse`, so `attempt` is always the default of `1` regardless of how many retries `SkillInvoker` performed. The `attempt` count is known to the invoker but is not threaded through to the adapter's `createResponse` call.

**7. `SharedContext` is shallow-frozen, not deeply immutable**
`createContext` and `patchContext` call `Object.freeze()` on the top-level context object, but nested objects inside `memory.values` and `metadata` are not automatically frozen. Callers who mutate nested values bypass the readonly type signature at runtime.

---

## Changelog

### v0.1.0 (2026-06-27)

- **feat**: `contracts/` — `SharedContext`, `SkillRequest`, `SkillResponse`, `IntegrationError` hierarchy
- **feat**: `registry/` — `CapabilityRegistry` with priority-sorted discovery
- **feat**: `invocation/` — `SkillInvoker` with timeout and retry; `ResultAggregator` with four merge strategies
- **feat**: `adapters/` — `MemorySystemAdapter`, `CreativeDirectorAdapter`, `PromptArchitectAdapter`
- **feat**: `observability/` — `ILogger` / `ConsoleLogger` / `NoopLogger`; `ITracer` / `NoopTracer`; `IMetricsCollector` / `InMemoryMetrics` / `NoopMetrics`
- **test**: 139 tests, 86.6% line coverage
