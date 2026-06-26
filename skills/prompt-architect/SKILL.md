# Prompt Architect

## Overview

Prompt Architect is an AI-native Skill. It has no TypeScript entrypoint. Execution is driven by the AI model using `SYSTEM_PROMPT.md`, `WORKFLOW.md`, and the template library in `templates/`. The Skill operates as a systematic prompt engineering discipline — converting task requirements into production-deployed prompts with measurable quality criteria, known failure modes, and version-controlled changelogs.

This Skill is for prompts that run in production systems: customer-facing features, internal automation, AI agents, and data pipelines. If a prompt runs once, a template may be sufficient. If it runs thousands of times per day and must be maintained, Prompt Architect applies.

A typed TypeScript API (`buildPrompt`, `evaluatePrompt`, `selectTemplate`) is planned for v1.x.

## Usage

Load `SYSTEM_PROMPT.md` as the system instruction for an AI session, then follow the engineering workflow in `WORKFLOW.md`.

```
1. Load SYSTEM_PROMPT.md as the system instruction.
2. Define the task contract: what input enters the prompt and what output must emerge.
3. Select a structural template from templates/ that matches the task type.
4. Fill every template field with task-specific content.
5. Stress-test on empty, malformed, and adversarial inputs before refining for quality.
6. Gate every item in CHECKLIST.md before deployment.
7. Version the prompt with a changelog entry on every modification.
```

## Parameters

Parameters are defined per template. The table below covers common fields shared across all templates.

> **Note:** This table describes template fields, not a TypeScript function signature. A typed API is planned for v1.x.

| Field | Type | Required | Description |
|---|---|---|---|
| `task_objective` | string | Yes | One sentence: what input enters the prompt and what output must emerge |
| `persona` | string | No | AI persona constraining tone and behavior (omit for no persona) |
| `context` | string | No | Background context injected into the system prompt |
| `constraints` | string | No | Hard rules the model must follow without exception |
| `output_format` | string | Yes | Exact output structure: JSON schema, Markdown layout, or prose template |
| `examples` | array | No | Few-shot input/output pairs; ordered from simple to complex |
| `evaluation_criteria` | string | No | Pass/fail criteria for output quality assessment |

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

### Minimal — structured output classifier using `templates/structured-output.md`

```
Template: templates/structured-output.md

task_objective: Classify the sentiment of a product review as positive, negative, or neutral.

output_format: |
  {
    "sentiment": "positive" | "negative" | "neutral",
    "confidence": 0.0–1.0,
    "rationale": "<one sentence>"
  }

constraints: Output only valid JSON. Do not include any text outside the JSON object.
```

### Realistic — chain-of-thought reasoning using `templates/chain-of-thought.md`

```
Template: templates/chain-of-thought.md

task_objective: Given a creative brief, identify the three most critical visual risks
  that could compromise the campaign's brand alignment.

persona: Senior brand strategist with 15 years of luxury fashion experience.

context: The brand is Maison Éclat — minimalist, European heritage, ultra-luxury positioning.

constraints:
  - Reason step-by-step before writing any risk.
  - Cite the specific brief element that creates each risk.
  - Output exactly three risks, ordered by severity (highest first).
  - Do not output generic risks that apply to any brand.

output_format: |
  Risk 1: [Risk title]
  Basis: [Specific brief element]
  Impact: [One sentence]

  Risk 2: ...
  Risk 3: ...

evaluation_criteria: Each risk must reference a specific brief element. Risks must be brand-specific.
```

## Errors

| Issue | Remediation |
|---|---|
| Ambiguous task contract | Write one sentence: "Given [X], produce [Y]" before writing any prompt token |
| Missing output schema | Add `output_format` with a concrete schema; never describe format in prose alone |
| No stress-test coverage | Test on empty, malformed, and adversarial inputs before any quality refinement |
| Schema hallucination | Add field-by-field constraints; validate output at the application layer, never trust raw model output |
| Prompt injection risk | Add explicit injection-resistance instructions; apply output filtering and schema validation server-side |
| Silent context truncation | Budget tokens explicitly: system prompt + context + input + expected output must fit the context window |

## Changelog

### [0.1.0] — 2026-06-26

- Prompt Architect established as an AI-native Skill.
- `SYSTEM_PROMPT.md`: Systematic prompt engineering persona with production-grade guidelines.
- `WORKFLOW.md`: End-to-end process from requirements intake to production deployment.
- `CHECKLIST.md`: Pre-deployment quality gate with pass/fail criteria for every item.
- `EXAMPLES.md`: 12 annotated production patterns with design rationale and failure modes.
- Template library: 8 structural templates covering the most common prompt engineering patterns.
- Typed TypeScript API (`buildPrompt`, `evaluatePrompt`, `selectTemplate`) planned for v1.x.
