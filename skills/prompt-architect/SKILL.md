# Prompt Architect

## Overview

Prompt Architect is a TypeScript Skill for production-quality prompt engineering. It converts task requirements into version-controlled, evaluated prompts with measurable quality criteria and known failure modes.

The Skill exposes a typed API (`selectTemplate`, `buildPrompt`, `evaluatePrompt`, `compressPrompt`, `versionPrompt`) importable from `src/index.ts`. The AI-native execution layer (`SYSTEM_PROMPT.md`, `WORKFLOW.md`, and the template library) remains available for AI-session use.

This Skill is for prompts that run in production systems: customer-facing features, internal automation, AI agents, and data pipelines.

## Usage

```typescript
import promptArchitect from './skills/prompt-architect/src/index';

const template = promptArchitect.selectTemplate('structured-output');

const prompt = promptArchitect.buildPrompt({
  taskObjective: 'Given a product review, produce a sentiment classification.',
  taskType: 'structured-output',
  outputFormat: 'json',
  outputSchema: '{ "sentiment": "positive" | "negative" | "neutral", "confidence": number }',
  constraints: ['Output only valid JSON', 'Do not include markdown fences'],
});

console.log(prompt.qualityVerdict); // 'pass' | 'warn' | 'fail'
console.log(prompt.systemPrompt);
```

## Parameters

### `selectTemplate(taskType)`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `taskType` | `TaskType` | Yes | One of the eight supported task types |

Returns a `TemplateDescriptor` with `requiredFields`, `optionalFields`, `structureRules`, and `outputFormats`.

### `buildPrompt(brief)`

| Field | Type | Required | Description |
|---|---|---|---|
| `taskObjective` | string | Yes | One sentence: what input enters the prompt and what output must emerge |
| `taskType` | `TaskType` | Yes | Selects the structural template and rule set |
| `outputFormat` | `OutputFormat` | Yes | `json`, `xml`, `markdown`, `prose`, or `code` |
| `persona` | string | No | AI persona constraining tone and behavior |
| `context` | string | No | Background context injected into the system prompt |
| `constraints` | string[] | No | Hard rules the model must follow without exception |
| `outputSchema` | string | No | Full schema definition for structured output |
| `examples` | `PromptExample[]` | No | Few-shot input/output pairs; ordered from simple to complex |
| `evaluationCriteria` | string[] | No | Pass/fail criteria for output quality assessment |
| `targetModel` | string | No | Target model identifier stored in metadata |
| `maxTokens` | number | No | Token budget; triggers auto-compression if exceeded (default: 4096) |

Returns a `BuiltPrompt` with `systemPrompt`, `userTemplate`, `estimatedTokens`, `qualityScore`, `qualityVerdict`, and `metadata`.

### `evaluatePrompt(prompt, testCases)`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prompt` | `BuiltPrompt` | Yes | Prompt returned by `buildPrompt()` |
| `testCases` | `TestCase[]` | Yes | Array of test cases to run against the prompt text |

Each `TestCase` supports `expectedOutputContains`, `mustNotContain`, and `expectedOutputPattern` (regex).

Returns an `EvaluationReport` with `verdict`, `score`, `testCaseResults`, and `recommendations`.

### `compressPrompt(text, maxTokens)`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Prompt text to compress |
| `maxTokens` | number | Yes | Target token budget |

Returns a `CompressionResult` with `compressed`, `originalTokens`, `compressedTokens`, `reductionPercent`, and `sectionsRemoved`.

### `versionPrompt(current, previous?, changeSummary?)`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `current` | `BuiltPrompt` | Yes | The new prompt to version |
| `previous` | `BuiltPrompt` | No | Previous version for diff-based change type derivation |
| `changeSummary` | string | No | Human-readable changelog entry (auto-generated if omitted) |

Returns a `VersionedPrompt` with a bumped semver `version`, `changeType` (`major`/`minor`/`patch`), `changeSummary`, and `changelog`.

### Template Index

| Template | Use |
|---|---|
| `templates/chain-of-thought.md` | Multi-step reasoning tasks requiring explicit intermediate steps |
| `templates/code-generation.md` | Structured code output with language and style constraints |
| `templates/document-analysis.md` | Extraction, classification, or summarization from long documents |
| `templates/evaluation-judge.md` | LLM-as-judge evaluation harnesses for automated quality scoring |
| `templates/few-shot-classifier.md` | Category classification with in-context examples |
| `templates/multi-agent-orchestrator.md` | System prompts for AI agents coordinating sub-tasks |
| `templates/role-persona.md` | Persona-constrained AI behavior with tone and capability boundaries |
| `templates/structured-output.md` | JSON or XML output with schema enforcement |

## Examples

### Minimal — structured output

```typescript
import promptArchitect from './skills/prompt-architect/src/index';

const prompt = promptArchitect.buildPrompt({
  taskObjective: 'Classify the sentiment of a product review as positive, negative, or neutral.',
  taskType: 'structured-output',
  outputFormat: 'json',
  outputSchema: '{ "sentiment": "positive" | "negative" | "neutral", "confidence": 0.0–1.0, "rationale": string }',
  constraints: ['Output only valid JSON', 'Do not include any text outside the JSON object'],
});

console.log(prompt.qualityScore);  // 0.72
console.log(prompt.systemPrompt);
```

### Full pipeline — build, evaluate, version

```typescript
import promptArchitect from './skills/prompt-architect/src/index';

const v1 = promptArchitect.buildPrompt({
  taskObjective: 'Given a creative brief, identify the three most critical visual risks.',
  taskType: 'chain-of-thought',
  persona: 'Senior brand strategist with 15 years of luxury fashion experience.',
  context: 'The brand is Maison Éclat — minimalist, European heritage, ultra-luxury positioning.',
  constraints: [
    'Reason step-by-step before writing any risk',
    'Cite the specific brief element that creates each risk',
    'Output exactly three risks, ordered by severity (highest first)',
  ],
  outputFormat: 'markdown',
  evaluationCriteria: ['Each risk must reference a specific brief element', 'Risks must be brand-specific'],
});

const report = promptArchitect.evaluatePrompt(v1, [
  { id: 'tc1', input: '', description: 'Contains persona', expectedOutputContains: ['brand strategist'] },
  { id: 'tc2', input: '', description: 'Contains reasoning instruction', expectedOutputContains: ['step'] },
]);

console.log(report.verdict);        // 'pass'
console.log(report.recommendations);

const v2 = promptArchitect.versionPrompt(v1, undefined, 'Initial production deployment');
console.log(v2.version);    // '2.0.0'
console.log(v2.changelog);
```

## Errors

| Issue | Remediation |
|---|---|
| `buildPrompt` returns `qualityVerdict: 'fail'` | Inspect `qualityScore` and add required fields for the task type; call `selectTemplate(taskType).requiredFields` to see what is missing |
| Ambiguous task contract | Write one sentence: "Given [X], produce [Y]" before writing any prompt token |
| Missing output schema | Add `outputSchema` with a concrete schema; structured-output and code-generation tasks require it |
| Token budget exceeded | Pass `maxTokens` to `buildPrompt`; auto-compression triggers and reports `sectionsRemoved` |
| Schema hallucination | Add field-by-field constraints; validate output at the application layer |
| Prompt injection risk | Add explicit injection-resistance instructions in `constraints`; apply output filtering server-side |

## Changelog

### [0.2.0] — 2026-06-26

- `src/index.ts`: TypeScript engine implemented with five public functions: `selectTemplate`, `buildPrompt`, `evaluatePrompt`, `compressPrompt`, `versionPrompt`.
- `buildPrompt()`: Assembles system prompt and user template from a `PromptBrief`; applies auto-compression when token budget is exceeded; scores quality across five dimensions.
- `selectTemplate()`: Returns a `TemplateDescriptor` with structure rules and required fields for all eight task types.
- `evaluatePrompt()`: Static analysis against `TestCase` array; supports `expectedOutputContains`, `mustNotContain`, and `expectedOutputPattern` (regex); returns `EvaluationReport` with verdict, score, and recommendations.
- `compressPrompt()`: Removes optional sections (Quality Criteria, Examples) and truncates to token budget; reports `sectionsRemoved` and `reductionPercent`.
- `versionPrompt()`: Derives `major`/`minor`/`patch` change type by diffing two prompts; bumps semver version; appends changelog entry.
- `skill.json`: Updated to `type: typescript`, `entrypoint: src/index.ts`, version `0.2.0`.

### [0.1.0] — 2026-06-26

- Prompt Architect established as an AI-native Skill.
- `SYSTEM_PROMPT.md`: Systematic prompt engineering persona with production-grade guidelines.
- `WORKFLOW.md`: End-to-end process from requirements intake to production deployment.
- `CHECKLIST.md`: Pre-deployment quality gate with pass/fail criteria for every item.
- `EXAMPLES.md`: 12 annotated production patterns with design rationale and failure modes.
- Template library: 8 structural templates covering the most common prompt engineering patterns.
