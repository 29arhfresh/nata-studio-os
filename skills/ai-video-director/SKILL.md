# AI Video Director

## Overview

AI Video Director is a prompt-engineering and production-planning Skill for generating cinematic video content across multiple AI video models. It encodes camera language, shot grammar, lighting theory, and model-specific prompt syntax into reusable, composable templates. The Skill supports Seedance 2, Veo, Kling, Sora, Higgsfield, and Runway with per-model optimisation rules. It covers every production format: social reels, commercials, music videos, product videos, and cinematic sequences.

## Usage

```typescript
import director from './src/index.ts';

const shot = director.buildShot({
  model: 'seedance',
  format: 'cinematic',
  scene: 'A lone astronaut walks across a red Martian plain at golden hour.',
  camera: { movement: 'dolly-in', lens: '35mm', angle: 'eye-level' },
  lighting: 'golden hour backlight, long shadow, warm orange haze',
  duration: 8,
});

console.log(shot.prompt);
// → "Cinematic dolly-in shot, 35mm lens, eye-level angle. A lone astronaut..."
```

## Parameters

| Name              | Type                  | Required | Default       | Description                                                  |
|-------------------|-----------------------|----------|---------------|--------------------------------------------------------------|
| `model`           | `VideoModel`          | Yes      | —             | Target AI model: `seedance`, `veo`, `kling`, `sora`, `higgsfield`, `runway` |
| `format`          | `ProductionFormat`    | Yes      | —             | Output format: `cinematic`, `reels`, `commercial`, `product-video`, `music-video` |
| `scene`           | `string`              | Yes      | —             | Scene description in plain language (max 500 characters)     |
| `camera`          | `CameraConfig`        | No       | `{}`          | Camera movement, lens, and angle configuration               |
| `lighting`        | `string`              | No       | `''`          | Lighting description appended to prompt                      |
| `duration`        | `number`              | No       | `5`           | Clip duration in seconds                                     |
| `character`       | `CharacterConfig`     | No       | `undefined`   | Character consistency seed, appearance, and reference image  |
| `style`           | `StyleConfig`         | No       | `undefined`   | Visual style: colour grade, film stock, aspect ratio         |
| `negativePrompt`  | `string`              | No       | `''`          | Elements to suppress (model-dependent support)               |

### CameraConfig

| Name        | Type             | Required | Default        | Description                          |
|-------------|------------------|----------|----------------|--------------------------------------|
| `movement`  | `CameraMovement` | No       | `'static'`     | dolly-in, dolly-out, pan, tilt, orbit, handheld, tracking, crane |
| `lens`      | `string`         | No       | `'50mm'`       | Lens focal length or type (e.g. `'24mm wide'`, `'85mm portrait'`) |
| `angle`     | `CameraAngle`    | No       | `'eye-level'`  | eye-level, low-angle, high-angle, bird's-eye, dutch-angle |

### CharacterConfig

| Name         | Type     | Required | Default | Description                                    |
|--------------|----------|----------|---------|------------------------------------------------|
| `description`| `string` | Yes      | —       | Full appearance description                    |
| `seed`       | `number` | No       | —       | Consistency seed (model-dependent)             |
| `referenceId`| `string` | No       | —       | Asset ID of reference image for IP-adapter use |

## Examples

### Minimal — static product shot

```typescript
const shot = director.buildShot({
  model: 'runway',
  format: 'product-video',
  scene: 'A glass perfume bottle sits on a white marble surface with soft studio light.',
  duration: 5,
});
```

### Realistic — multi-shot music video sequence

```typescript
const sequence = director.buildSequence({
  model: 'kling',
  format: 'music-video',
  bpm: 128,
  beats: 32,
  shots: [
    {
      scene: 'Singer performs on a rain-soaked rooftop at night, neon reflections below.',
      camera: { movement: 'dolly-in', lens: '35mm', angle: 'eye-level' },
      lighting: 'practical neon lights, rain backlight, high contrast',
      duration: 4,
    },
    {
      scene: 'Close-up of hands playing a synthesizer, blue and purple light pulses.',
      camera: { movement: 'static', lens: '100mm macro', angle: 'low-angle' },
      lighting: 'coloured gels, hard light, rim light from behind',
      duration: 2,
    },
  ],
  character: {
    description: 'Woman, mid-30s, short black hair, silver jacket, intense expression.',
    seed: 42,
  },
});
```

## Errors

| Code                        | Description                                              | Remediation                                          |
|-----------------------------|----------------------------------------------------------|------------------------------------------------------|
| `INVALID_MODEL`             | The specified model is not supported.                    | Use one of: `seedance`, `veo`, `kling`, `sora`, `higgsfield`, `runway`. |
| `INVALID_FORMAT`            | The production format is not recognised.                 | Use one of: `cinematic`, `reels`, `commercial`, `product-video`, `music-video`. |
| `SCENE_TOO_LONG`            | Scene description exceeds 500 characters.                | Shorten or split the description across multiple shots. |
| `DURATION_OUT_OF_RANGE`     | Duration is outside the model's supported range.         | Check `MODEL_LIMITS` for min/max duration per model. |
| `SEQUENCE_MISMATCH`         | Shot count and beat count are inconsistent.              | Ensure total shot duration equals the music segment length. |
| `CHARACTER_SEED_UNSUPPORTED`| The target model does not support character seeds.       | Use a reference image via `character.referenceId` instead. |

## Changelog

### [0.1.0] — 2026-06-26

- Initial release of AI Video Director Skill.
- Support for Seedance 2, Veo, Kling, Sora, Higgsfield, and Runway.
- `buildShot`, `buildSequence`, `optimisePrompt`, `compareModels` public API.
- Templates for cinematic, reels, commercial, product video, and music video formats.
- Character consistency, image-to-video, and video-to-video workflows.
- Troubleshooting guide for common prompt and model failures.
