# Agent Orchestrator

## Overview

Agent Orchestrator is the central brain of Nata Studio OS. It analyses every incoming request, determines which Skill or combination of Skills to invoke, resolves capability conflicts, constructs a dependency-aware execution plan, enforces quality gates on each output, and hands off shared memory to downstream Skills or sessions. All routing, sequencing, and coordination logic lives here so that individual Skills remain focused on their domain.

## Usage

```typescript
import orchestrator from './src/index';

// Single-skill routing
const routing = orchestrator.route('Generate a product photo for an e-commerce listing');
console.log(routing.primarySkill);     // 'ai-image-director'
console.log(routing.confidence);       // 0.8

// Full orchestration pipeline
const result = orchestrator.orchestrate({
  intent: 'Write an optimized prompt, then generate a product image',
  policy: 'sequential',
  qualityThreshold: 0.75,
});

console.log(result.plan.steps.map((s) => s.skillName));
// ['prompt-architect', 'ai-image-director']

console.log(result.qualityGate.status); // 'pass'
console.log(result.memoryHandoff.exportedKeys);
// ['prompt-architect.lastOutput', 'ai-image-director.lastOutput', ...]
```

## Parameters

### `orchestrate(request)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `intent` | `string` | Yes | — | Plain-language description of what the user wants to accomplish. |
| `context` | `ExecutionContext` | No | Auto-generated | Session ID, previous outputs, shared memory, and iteration count. |
| `policy` | `ExecutionPolicy` | No | `'sequential'` | How steps run: `sequential`, `parallel`, `conditional`, or `fallback-chain`. |
| `allowedSkills` | `SkillName[]` | No | All registered | Restrict routing to this subset of Skills. |
| `forbiddenSkills` | `SkillName[]` | No | None | Exclude these Skills from routing candidates. |
| `qualityThreshold` | `number` | No | `0.7` | Minimum quality score (0–1) each Skill output must achieve to pass the gate. |

### `route(intent, allowedSkills?, forbiddenSkills?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `intent` | `string` | Yes | — | Request text used to detect required capabilities. |
| `allowedSkills` | `SkillName[]` | No | All | Whitelist of Skills available for routing. |
| `forbiddenSkills` | `SkillName[]` | No | None | Blacklist of Skills excluded from routing. |

### `plan(routing, policy?, qualityThreshold?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `routing` | `RoutingDecision` | Yes | — | Output from `route()`. |
| `policy` | `ExecutionPolicy` | No | `'sequential'` | Execution policy for the plan. |
| `qualityThreshold` | `number` | No | `0.7` | Quality threshold propagated to each step's gate. |

### `detectConflicts(skills, strategy?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `skills` | `SkillName[]` | Yes | — | Two or more Skill names to check for capability overlap. |
| `strategy` | `ConflictResolutionStrategy` | No | `'priority'` | How conflicts are resolved: `priority`, `merge`, `abort`, or `user-prompt`. |

### `buildGraph(skills)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `skills` | `SkillName[]` | Yes | — | Ordered or unordered list of Skill names. |

## Examples

### Minimal — single skill, image generation

```typescript
import orchestrator from './src/index';

const result = orchestrator.orchestrate({
  intent: 'Generate a portrait photo for a brand campaign',
});

console.log(result.plan.steps[0].skillName); // 'ai-image-director'
console.log(result.qualityGate.status);      // 'pass'
```

### Realistic — multi-skill pipeline with context handoff

```typescript
import orchestrator from './src/index';

// Step 1: route to understand which skills are needed
const routing = orchestrator.route(
  'Engineer a structured prompt, then generate a cinematic video clip and an image keyframe',
);
// routing.primarySkill     → 'ai-video-director'
// routing.supportingSkills → ['prompt-architect', 'ai-image-director']

// Step 2: build the dependency graph
const graph = orchestrator.buildGraph([
  routing.primarySkill,
  ...routing.supportingSkills,
]);
// graph.executionOrder → ['prompt-architect', 'ai-image-director', 'ai-video-director']

// Step 3: check for conflicts
const conflicts = orchestrator.detectConflicts(
  [routing.primarySkill, ...routing.supportingSkills],
  'priority',
);
console.log(conflicts.explanation); // 'Resolved by priority: ...'

// Step 4: full orchestration with memory handoff
const session1 = orchestrator.orchestrate({
  intent:           'Engineer a prompt, generate a product image, then animate it',
  policy:           'sequential',
  qualityThreshold: 0.75,
  context: {
    sessionId:       'my-session-001',
    previousOutputs: [],
    sharedMemory:    { brandColor: '#FF5733', targetAudience: 'Gen Z' },
    iterationCount:  0,
  },
});

// Pass memory to the next session
const session2 = orchestrator.orchestrate({
  intent:   'Upscale the generated image',
  policy:   'sequential',
  context: {
    sessionId:       'my-session-002',
    previousOutputs: session1.outputs,
    sharedMemory:    session1.memoryHandoff.snapshot,
    iterationCount:  0,
  },
});

console.log(session2.qualityGate.status); // 'pass'
```

## Errors

| Code | Description | Remediation |
|---|---|---|
| `INVALID_INTENT` | The intent is empty, null, or not a string. | Provide a non-empty string describing the user's goal. |
| `NO_MATCHING_SKILL` | No registered Skill matches the detected capabilities. | Broaden the intent, or remove Skills from the `forbiddenSkills` list. |
| `UNKNOWN_SKILL` | A Skill name passed to `describeSkill`, `detectConflicts`, or `buildGraph` is not registered. | Use a name from the `SkillName` union type. |
| `CYCLIC_DEPENDENCY` | The dependency graph contains a cycle; execution order cannot be determined. | Remove the circular Skill relationship from the dependency definitions. |
| `MAX_ITERATIONS_EXCEEDED` | The context `iterationCount` has reached the hard limit of 10. | Start a new session or reduce iteration depth. |
| `CONFLICT_ABORT` | Two or more Skills conflict and the resolution strategy is `abort`. | Change the strategy to `priority` or `merge`, or remove one of the conflicting Skills. |

## Changelog

### [0.1.0] — 2026-06-26

- Initial release of Agent Orchestrator Skill.
- Intent analysis with keyword-to-capability mapping for all registered Skills.
- Routing engine with confidence scoring, allowlist, and blocklist support.
- Dependency graph builder with topological sort (Kahn's algorithm) and cycle detection.
- Execution plan builder supporting `sequential`, `parallel`, `conditional`, and `fallback-chain` policies.
- Conflict resolution strategies: `priority`, `merge`, `abort`, and `user-prompt`.
- Quality gate evaluator with per-output scoring, failed-check reporting, and warning thresholds.
- Memory handoff: snapshots shared memory and exports keys for downstream skills or sessions.
- Fallback execution: automatically promotes a supporting Skill when the primary output fails the quality gate.
- Full public API: `orchestrate`, `route`, `plan`, `describeSkill`, `listSkills`, `detectConflicts`, `buildGraph`.
