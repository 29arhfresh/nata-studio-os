# AI Creative Director

## Overview

AI Creative Director is the first production Skill built on Workflow Engine v1.0. It orchestrates the full AI creative production lifecycle — from strategic brief through visual concept, prompt engineering, AI tool selection, production planning, and output quality review — using the engine's DAG execution model.

It validates that Workflow Engine v1.0 supports real production workloads and establishes the modular pattern all future Skills should follow.

**Capabilities:**

- Creative brief generation and validation
- Visual concept development from brand strategy
- Multi-step prompt generation and refinement
- AI tool selection across nine tools (Seedance, Veo, Higgsfield, Nano Banana, Magnific, Midjourney, Flux, Runway, Kling)
- Production workflow planning with phase breakdown
- Output quality review with weighted scoring

---

## Usage

### Brief Workflow

Run the full creative pipeline — brief → concept → tool → prompts → production plan — as a single workflow.

```typescript
import aiCreativeDirector from './src/index';

const result = await aiCreativeDirector.runBriefWorkflow({
  brand:          'Nata Studio',
  objective:      'Launch spring collection with editorial campaign.',
  targetAudience: 'Fashion-forward millennials, urban markets',
  deliverables:   ['hero-image', 'social-reel'],
  tone:           ['cinematic', 'minimal'],
  mediaType:      'video',
  budgetTier:     'standard',
});

console.log(result.toolSelection.primary);    // e.g. 'higgsfield'
console.log(result.prompts[0].refinedPrompt); // ready-to-use prompt
console.log(result.productionPlan.phases);    // Pre-Production, Generation, Review
```

### Prompt Workflow

Generate and refine a prompt for a specific tool.

```typescript
const result = await aiCreativeDirector.runPromptWorkflow({
  concept:    'A lone figure walks through a rain-soaked city at night.',
  subject:    'Person in trench coat, neon reflections on wet pavement',
  mood:       ['moody', 'cinematic', 'atmospheric'],
  style:      'cinematic',
  targetTool: 'runway',
  tone:       ['dark', 'elegant'],
  refinementFeedback: 'add volumetric fog',
});

console.log(result.generated.refinedPrompt);
console.log(result.generated.technicalParams); // { duration: '5s', resolution: '1080p' }
```

### Tool Selection

Select the best AI tool for a given set of requirements.

```typescript
const selection = aiCreativeDirector.selectTool({
  mediaType:    'image',
  style:        'photorealistic',
  outputFormat: 'landscape',
  budgetTier:   'standard',
  priority:     'quality',
  needsUpscaling: true,
});

console.log(selection.primary);     // 'magnific'
console.log(selection.promptTips);  // tool-specific prompt advice
```

### Output Quality Review

Score a creative output across five quality dimensions.

```typescript
const report = aiCreativeDirector.reviewOutput({
  deliverable:      'hero-image',
  mediaType:        'image',
  brandAlignment:   9,
  technicalQuality: 8,
  conceptAdherence: 8,
  aestheticScore:   7,
  promptFidelity:   9,
});

console.log(report.grade);          // 'Strong'
console.log(report.recommendation); // 'Approve for production use.'
```

### Production Planning

Build a phased production plan from a processed brief.

```typescript
const plan = aiCreativeDirector.planProduction({
  brief:         processedBrief,
  concept:       visualConcept,
  toolSelection: toolSelection,
});

console.log(plan.totalEstimatedDurationMin); // e.g. 140
console.log(plan.phases.map(p => p.name));   // ['Pre-Production', 'Generation', 'Review']
```

---

## Parameters

### `runBriefWorkflow(spec, options?)`

| Parameter          | Type                              | Required | Description                                         |
|--------------------|-----------------------------------|----------|-----------------------------------------------------|
| `brand`            | `string`                          | Yes      | Brand name, used in concept and prompts             |
| `objective`        | `string`                          | Yes      | Campaign objective (max ~300 chars recommended)     |
| `targetAudience`   | `string`                          | Yes      | Audience description                                |
| `deliverables`     | `string[]`                        | Yes      | List of deliverable names, at least one             |
| `tone`             | `string[]`                        | Yes      | Tone keywords, at least one                         |
| `mediaType`        | `'image' \| 'video'`             | Yes      | Output media type                                   |
| `budgetTier`       | `'economy' \| 'standard' \| 'premium'` | Yes | Tool tier budget                                |
| `references`       | `string[]`                        | No       | Optional creative references                        |
| `options.onEvent`  | `EventHandler`                    | No       | Receives workflow lifecycle events                  |
| `options.context`  | `Record<string, unknown>`         | No       | Additional context seeded into the workflow         |

### `runPromptWorkflow(spec, options?)`

| Parameter             | Type            | Required | Description                                   |
|-----------------------|-----------------|----------|-----------------------------------------------|
| `concept`             | `string`        | Yes      | High-level visual concept                     |
| `subject`             | `string`        | Yes      | Subject description                           |
| `mood`                | `string[]`      | Yes      | Mood keywords, at least one                   |
| `style`               | `StyleCategory` | Yes      | Visual style                                  |
| `targetTool`          | `AITool`        | Yes      | Target AI generation tool                     |
| `tone`                | `string[]`      | Yes      | Tone modifiers                                |
| `negatives`           | `string[]`      | No       | Terms to exclude from negative prompt         |
| `refinementFeedback`  | `string`        | No       | Feedback to incorporate into refined prompt   |

### `selectTool(requirements)`

| Parameter             | Type            | Required | Description                                   |
|-----------------------|-----------------|----------|-----------------------------------------------|
| `mediaType`           | `MediaType`     | Yes      | `'image'` or `'video'`                        |
| `style`               | `StyleCategory` | Yes      | Visual style category                         |
| `outputFormat`        | `OutputFormat`  | Yes      | `'square'`, `'portrait'`, `'landscape'`, `'vertical'` |
| `budgetTier`          | `BudgetTier`    | Yes      | `'economy'`, `'standard'`, or `'premium'`     |
| `priority`            | `PriorityMode`  | Yes      | `'quality'`, `'speed'`, or `'cost'`           |
| `needsUpscaling`      | `boolean`       | No       | Boosts Magnific in scoring                    |
| `needsVideoFromImage` | `boolean`       | No       | Boosts Runway, Kling, Higgsfield in scoring   |

### `reviewOutput(input)`

| Parameter           | Type          | Required | Description                        |
|---------------------|---------------|----------|------------------------------------|
| `deliverable`       | `string`      | Yes      | Deliverable name for the report    |
| `mediaType`         | `MediaType`   | Yes      | Media type of the output           |
| `brandAlignment`    | `ReviewScore` | Yes      | Integer 1–10                       |
| `technicalQuality`  | `ReviewScore` | Yes      | Integer 1–10                       |
| `conceptAdherence`  | `ReviewScore` | Yes      | Integer 1–10                       |
| `aestheticScore`    | `ReviewScore` | Yes      | Integer 1–10                       |
| `promptFidelity`    | `ReviewScore` | Yes      | Integer 1–10                       |

**Scoring weights:** brandAlignment (30%), technicalQuality (25%), conceptAdherence (20%), aestheticScore (15%), promptFidelity (10%).

**Grade thresholds:** Exceptional (90–100), Strong (75–89), Acceptable (60–74), Needs Revision (45–59), Reject (0–44).

---

## Examples

### End-to-end campaign

```typescript
// 1. Run the full brief workflow
const result = await aiCreativeDirector.runBriefWorkflow({
  brand: 'Mara Collective',
  objective: 'Introduce the SS26 collection to a luxury audience.',
  targetAudience: 'High-net-worth women, 28–45, global fashion capitals',
  deliverables: ['hero-film', 'editorial-stills', 'reels-cut'],
  tone: ['cinematic', 'sophisticated', 'minimal'],
  mediaType: 'video',
  budgetTier: 'premium',
});

// 2. Review the first output
const report = aiCreativeDirector.reviewOutput({
  deliverable:      'hero-film',
  mediaType:        'video',
  brandAlignment:   9,
  technicalQuality: 8,
  conceptAdherence: 9,
  aestheticScore:   8,
  promptFidelity:   7,
});

// 3. Refine prompt based on review
const refined = await aiCreativeDirector.runPromptWorkflow({
  concept:           result.concept.description,
  subject:           'Mara Collective model, SS26 hero look',
  mood:              result.concept.moodKeywords,
  style:             result.concept.styleReference,
  targetTool:        result.toolSelection.primary,
  tone:              result.brief.tone,
  refinementFeedback: report.improvementNotes[0] ?? '',
});
```

---

## Errors

| Code               | Thrown by            | Cause                                                 |
|--------------------|----------------------|-------------------------------------------------------|
| `INVALID_BRIEF`    | `runBriefWorkflow`   | Missing brand, objective, deliverables, or tone       |
| `INVALID_SPEC`     | `runPromptWorkflow`  | Empty concept, subject, or mood array                 |
| `WORKFLOW_FAILED`  | Both workflows       | Wraps any step error; includes original message       |
| `TOOL_NOT_FOUND`   | `selectTool`         | No tool supports the requested mediaType + style      |
| `INVALID_SCORE`    | `reviewOutput`       | Score value is not an integer in 1–10 range           |
| `INVALID_WORKFLOW` | Workflow Engine      | Malformed workflow definition (should not occur)      |

---

## Changelog

### 0.1.0 — 2026-06-27

- Initial release.
- `runBriefWorkflow`: 5-step DAG workflow (validate-brief → develop-concept → select-tool → generate-prompts → plan-production).
- `runPromptWorkflow`: 2-step workflow (analyze-concept → generate-prompt).
- `selectTool`: nine-tool catalog with scored selection (Seedance, Veo, Higgsfield, Nano Banana, Magnific, Midjourney, Flux, Runway, Kling).
- `reviewOutput`: five-dimension quality scoring with grade and improvement notes.
- `planProduction`: phased production plan (Pre-Production, Generation, Review).
- 62 tests, 100% line coverage, 85.7% branch coverage.
