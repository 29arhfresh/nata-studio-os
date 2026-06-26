# AI Image Director

## Overview

AI Image Director is an AI-native Skill. It has no TypeScript entrypoint. Execution is driven by the AI model using `SYSTEM_PROMPT.md`, `WORKFLOW.md`, and the template library in `templates/`. The Skill operates as a virtual art director and visual strategist — transforming creative briefs into model-specific, production-ready image prompts with full composition, lighting, and character-consistency decisions applied.

Supported models: Flux, Midjourney, Ideogram, Google Imagen, Nano Banana, Magnific.

A typed TypeScript API (`buildPrompt`, `optimiseForModel`, `anchorCharacter`) is planned for v1.x.

## Usage

Load `SYSTEM_PROMPT.md` as the system instruction for an AI session, then follow the production pipeline in `WORKFLOW.md`.

```
1. Load SYSTEM_PROMPT.md as the system instruction.
2. Select a template from templates/ based on use case or target model.
3. Fill every template field — do not leave placeholders.
4. Run the generation and evaluate against CHECKLIST.md.
5. Iterate until all gate criteria pass.
6. Apply post-processing (upscale, inpaint, outpaint) using templates/magnific.md.
```

## Parameters

Parameters are defined per template. The table below covers the common fields shared across all templates.

> **Note:** This table describes template fields, not a TypeScript function signature. A typed API is planned for v1.x.

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | string | Yes | Primary visual subject with full descriptors (age, appearance, posture, expression) |
| `environment` | string | Yes | Location, setting, and background conditions |
| `lighting` | string | Yes | Lighting setup: direction, quality, colour temperature, shadow behaviour |
| `camera` | string | Yes | Lens focal length, angle, depth of field |
| `model` | string | Yes | Target model: `flux`, `midjourney`, `ideogram`, `imagen`, `nano-banana`, `magnific` |
| `style` | string | No | Visual style, colour grade, film stock reference |
| `character` | string | No | Character descriptor for consistency anchoring across generations |
| `negative` | string | No | Elements to suppress (model-dependent support) |

### Template Index

**Use-case templates** — select by content type:

| Template | Use |
|---|---|
| `templates/portrait.md` | Headshots, character portraits, beauty, lifestyle |
| `templates/product.md` | E-commerce, packshot, hero product |
| `templates/fashion.md` | Editorial fashion, lookbook, campaign |
| `templates/advertising.md` | Brand campaigns, hero ads, OOH, digital banners |
| `templates/cinematic.md` | Cinematic stills, narrative scenes, atmosphere |
| `templates/character.md` | Character design, concept art |
| `templates/consistent-character.md` | Multi-image sequences with recurring characters |

**Model-specific templates** — select by target platform:

| Template | Use |
|---|---|
| `templates/flux.md` | Generating on Flux (any variant) |
| `templates/midjourney.md` | Generating on Midjourney |
| `templates/ideogram.md` | Generating on Ideogram |
| `templates/imagen.md` | Generating on Google Imagen |
| `templates/nano-banana.md` | Generating on Nano Banana |
| `templates/magnific.md` | Upscaling, inpainting, or outpainting on Magnific |

## Examples

### Minimal — portrait prompt using `templates/portrait.md`

```
Template: templates/portrait.md

Subject: Young woman, late 20s, natural hair, direct gaze, slight smile
Environment: Interior — open window, soft diffused daylight from camera left
Lighting: Rembrandt setup, 5200K, deep shadow on right side, gentle fill reflector
Camera: 85mm, f/1.8, eye-level, shallow depth of field
Style: Muted earth tones, desaturated, subtle film grain
Model: flux
```

### Realistic — luxury product campaign using `templates/advertising.md` on Midjourney

```
Template: templates/advertising.md

Subject: Luxury perfume bottle, cylindrical, faceted crystal glass, gold cap
Environment: Abstract white marble surface, shallow fog layer at base
Lighting: Three-point: key from top-right at 45°, rim light from back-left, no fill shadow
Camera: 50mm macro, low angle, product fills 60% of frame, f/5.6
Style: High fashion editorial, desaturated except warm gold tones
Model: midjourney
Model parameters: --ar 4:5 --stylize 750 --v 6.1
```

## Errors

| Issue | Remediation |
|---|---|
| Subject descriptor too vague | Specify concrete visual attributes: age, physical features, clothing, posture, expression |
| Wrong model syntax | Use the model-specific template for the target platform — syntax is non-transferable |
| Unresolved placeholder | Fill every template field before generation; never submit placeholder text |
| Low character consistency | Add seed, reference image, or IP-Adapter anchor per `templates/consistent-character.md` |
| Prompt too long | Reduce to the most critical descriptors; use `templates/magnific.md` for post-processing detail |

## Changelog

### [0.1.0] — 2026-06-26

- AI Image Director established as an AI-native Skill.
- `SYSTEM_PROMPT.md`: Full art director persona with compositional, lighting, and technical guidelines.
- `WORKFLOW.md`: End-to-end production pipeline from brief intake to final asset delivery.
- `CHECKLIST.md`: Pre-generation and post-review quality gates.
- `EXAMPLES.md`: Annotated production examples by content type.
- Template library: 7 use-case templates and 6 model-specific templates.
- Typed TypeScript API (`buildPrompt`, `optimiseForModel`, `anchorCharacter`) planned for v1.x.
