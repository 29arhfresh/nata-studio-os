# Creative Director

## Overview

Creative Director is the strategic and aesthetic intelligence of Nata Studio OS. It translates brand values, business objectives, and creative intent into actionable visual decisions across images, video, copy, and prompts. The Skill owns creative strategy, visual direction, brand consistency, concept development, storytelling, moodboard creation, color strategy, typography guidance, composition rules, and quality scoring. It functions as the single source of creative truth for all Nata Studio OS output.

## Usage

```typescript
import director from './src/index';

const brief = director.buildCreativeBrief({
  brand: 'Maison Éclat',
  objective: 'Launch campaign for a new fragrance targeting urban women aged 25–40.',
  tone: ['sophisticated', 'sensual', 'minimal'],
  references: ['Celine SS23', 'Bottega Veneta campaign 2022'],
  deliverables: ['hero-image', 'social-reels', 'copy'],
});

console.log(brief.colorStrategy);
// → { primary: '#1A1A1A', accent: '#C9A96E', neutral: '#F5F0EB', rationale: '...' }

const score = director.scoreCreative({
  deliverable: 'hero-image',
  brandAlignment: 9,
  compositionQuality: 8,
  colorConsistency: 9,
  storytellingClarity: 7,
  technicalExecution: 8,
});

console.log(score.total);
// → 82
```

## Parameters

### `buildCreativeBrief`

| Name           | Type                    | Required | Default     | Description                                               |
|----------------|-------------------------|----------|-------------|-----------------------------------------------------------|
| `brand`        | `string`                | Yes      | —           | Brand name (max 80 characters)                            |
| `objective`    | `string`                | Yes      | —           | Campaign or project objective (max 300 characters)        |
| `tone`         | `string[]`              | Yes      | —           | At least one tone descriptor; all lowercase               |
| `references`   | `string[]`              | No       | `[]`        | Visual reference labels (directors, campaigns, aesthetics)|
| `deliverables` | `Deliverable[]`         | Yes      | —           | Output types: `hero-image`, `social-reels`, `copy`, `video`, `moodboard` |
| `audience`     | `AudienceConfig`        | No       | `undefined` | Target audience descriptor                                |
| `constraints`  | `CreativeConstraints`   | No       | `undefined` | Brand constraints (mandatory colours, forbidden elements) |

### `scoreCreative`

| Name                   | Type          | Required | Default | Description                                           |
|------------------------|---------------|----------|---------|-------------------------------------------------------|
| `deliverable`          | `Deliverable` | Yes      | —       | Type of creative output being scored                  |
| `brandAlignment`       | `Score`       | Yes      | —       | 1–10: How well it expresses the brand                 |
| `compositionQuality`   | `Score`       | Yes      | —       | 1–10: Visual balance, hierarchy, rule adherence       |
| `colorConsistency`     | `Score`       | Yes      | —       | 1–10: Palette adherence and color harmony             |
| `storytellingClarity`  | `Score`       | Yes      | —       | 1–10: Narrative clarity and emotional resonance       |
| `technicalExecution`   | `Score`       | Yes      | —       | 1–10: Sharpness, craft, and production quality        |

### `buildMoodboard`

| Name          | Type             | Required | Default     | Description                                         |
|---------------|------------------|----------|-------------|-----------------------------------------------------|
| `concept`     | `string`         | Yes      | —           | Central creative concept (max 200 characters)       |
| `palette`     | `ColorPalette`   | No       | `undefined` | Explicit hex values to anchor the moodboard         |
| `typography`  | `TypographyGuide`| No       | `undefined` | Primary and secondary typeface descriptors          |
| `mood`        | `string[]`       | Yes      | —           | Mood keywords (min 2, max 8)                        |
| `format`      | `MoodboardFormat`| No       | `'digital'` | `digital` or `print`                                |

### `buildArtDirection`

| Name              | Type              | Required | Default | Description                                              |
|-------------------|-------------------|----------|---------|----------------------------------------------------------|
| `brief`           | `CreativeBrief`   | Yes      | —       | Completed brief from `buildCreativeBrief`                |
| `deliverableType` | `Deliverable`     | Yes      | —       | The specific output being art-directed                   |
| `compositionRule` | `CompositionRule` | No       | `'rule-of-thirds'` | Governing composition principle             |
| `lightingStyle`   | `string`          | No       | `''`    | Lighting descriptor appended to art direction            |

## Examples

### Minimal — quick creative brief

```typescript
const brief = director.buildCreativeBrief({
  brand: 'NOVA Skincare',
  objective: 'Introduce a new vitamin C serum to a global digital-first audience.',
  tone: ['clean', 'scientific', 'optimistic'],
  deliverables: ['hero-image', 'copy'],
});
```

### Realistic — full luxury fashion campaign

```typescript
const brief = director.buildCreativeBrief({
  brand: 'Maison Éclat',
  objective: 'Global fragrance launch targeting urban women 25–40. Emphasis on heritage and modernity.',
  tone: ['sophisticated', 'sensual', 'minimal', 'poetic'],
  references: ['Celine SS23', 'Bottega Veneta 2022', 'Peter Lindbergh monochrome'],
  deliverables: ['hero-image', 'social-reels', 'moodboard', 'copy', 'video'],
  audience: {
    ageRange: '25–40',
    geography: 'Global urban',
    interests: ['fashion', 'culture', 'wellness'],
    income: 'high',
  },
  constraints: {
    mandatoryColors: ['#1A1A1A', '#C9A96E'],
    forbiddenElements: ['fast fashion aesthetics', 'busy backgrounds', 'warm filters'],
  },
});

const moodboard = director.buildMoodboard({
  concept: 'Memory of light — the scent of a city at dusk',
  palette: brief.colorStrategy,
  typography: { primary: 'Didot', secondary: 'Helvetica Neue Light' },
  mood: ['golden', 'quiet', 'architectural', 'intimate'],
});

const artDir = director.buildArtDirection({
  brief,
  deliverableType: 'hero-image',
  compositionRule: 'negative-space',
  lightingStyle: 'soft directional window light from camera left, 5500K, shadow gradient',
});

const score = director.scoreCreative({
  deliverable: 'hero-image',
  brandAlignment: 9,
  compositionQuality: 8,
  colorConsistency: 9,
  storytellingClarity: 8,
  technicalExecution: 9,
});
```

## Errors

| Code                          | Description                                                      | Remediation                                                        |
|-------------------------------|------------------------------------------------------------------|--------------------------------------------------------------------|
| `INVALID_TONE`                | A tone descriptor exceeds 40 characters or contains a number.   | Use concise, lowercase single-word or hyphenated descriptors.      |
| `MISSING_DELIVERABLE`         | No deliverables specified in the brief.                          | Provide at least one value from the `Deliverable` type.            |
| `INVALID_SCORE`               | A score value is outside the 1–10 range.                        | Pass an integer between 1 and 10 inclusive.                        |
| `OBJECTIVE_TOO_LONG`          | Objective string exceeds 300 characters.                        | Shorten to a single clear strategic sentence.                      |
| `INVALID_DELIVERABLE`         | A deliverable type is not recognised.                           | Use one of: `hero-image`, `social-reels`, `copy`, `video`, `moodboard`. |
| `MOOD_COUNT_OUT_OF_RANGE`     | Moodboard mood array has fewer than 2 or more than 8 entries.  | Provide between 2 and 8 mood keywords.                             |
| `INVALID_COMPOSITION_RULE`    | Composition rule is not in the supported set.                   | Use one of: `rule-of-thirds`, `golden-ratio`, `symmetry`, `negative-space`, `leading-lines`, `layered-depth`. |
| `MANDATORY_COLOR_INVALID`     | A mandatory color is not a valid 6-digit hex code.             | Use the format `#RRGGBB`.                                          |

## Changelog

### [0.1.0] — 2026-06-26

- Initial release of Creative Director Skill.
- `buildCreativeBrief`, `buildMoodboard`, `buildArtDirection`, `scoreCreative` public API.
- Color strategy engine with contrast and harmony validation.
- Typography guidance system (primary/secondary/tertiary typeface roles).
- Composition rule library: rule of thirds, golden ratio, symmetry, negative space, leading lines, layered depth.
- Creative quality scoring across five dimensions with weighted total.
- Full template set: creative-brief, concept, moodboard, art-direction, visual-style, creative-review.
