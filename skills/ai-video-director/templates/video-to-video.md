# Video-to-Video — Workflow Template

**Supported Models:** Kling · Runway · Higgsfield
**Use Case:** Style transfer, environment replacement, character remap, motion transfer

---

## Overview

Video-to-video (V2V) takes existing footage as input and produces a transformed output. The source footage defines motion, timing, and spatial structure. The prompt defines the target visual style. Getting this balance right is the core skill of V2V work.

---

## Model Comparison

| Capability | Kling | Runway | Higgsfield |
|---|---|---|---|
| Style transfer | Partial | Full | Limited |
| Environment swap | Yes | Yes | No |
| Character remap | Yes | Yes | Yes |
| Motion transfer | Yes | Yes (Act-One) | Yes |
| Voice/dialogue transfer | No | Yes (Act-One) | Yes |
| Max input length | 10s | 16s | 8s |
| Negative prompt | Yes | Yes | No |

---

## Pre-Production Requirements

### Source Video Preparation

- [ ] Export as MP4, H.264, 1080p minimum.
- [ ] Clip to model's maximum input duration.
- [ ] Ensure stable, well-lit source for best motion extraction.
- [ ] Remove audio (unless model uses it for sync).
- [ ] Check for source artifacts that will transfer to output.

### Creative Brief

- [ ] Define: what should change (style, environment, character)?
- [ ] Define: what should stay the same (motion paths, timing, spatial structure)?
- [ ] Select target visual style with specific references.
- [ ] Determine motion strength setting.

---

## Core Prompt Structure

```
[TARGET STYLE DESCRIPTION].
Target environment: [ENVIRONMENT DESCRIPTION — not the source environment].
Preserve: [MOTION, CHARACTER SILHOUETTE, CAMERA PATH].
[TARGET COLOUR GRADE OR FILM STOCK].
Motion strength: [LOW | MEDIUM | HIGH].
```

**Critical rule:** Describe the TARGET, not the source. The model knows the source from the input video.

---

## Motion Strength Guide

| Setting | Effect | Best For |
|---|---|---|
| Low (0.1–0.3) | Source structure heavily preserved, minimal style change | Subtle restyling, colour grade change |
| Medium (0.4–0.6) | Balanced style change with motion preserved | Standard style transfer, environment swap |
| High (0.7–1.0) | Maximum creative freedom, motion loosely preserved | Dramatic transformation, abstract styles |

---

## Use Case Templates

### 1. Style Transfer (Same Scene, New Look)

Transform the visual style while preserving all motion and scene structure.

```
Restyle in the visual language of [STYLE REFERENCE — director, film, art movement].
Preserve: all character motion, camera movement, and spatial layout.
Target colour grade: [GRADE DESCRIPTION].
[FILM STOCK REFERENCE if applicable].
Motion strength: medium.
```

**Example:**
```
Restyle in the visual language of a 1970s Italian giallo thriller.
Preserve: all character motion, camera movement, and spatial layout.
Target colour grade: high contrast, warm amber highlights, deep blue shadows.
Kodak 5247 film stock.
Motion strength: medium.
```

### 2. Environment Replacement (Character + Motion Preserved)

Keep the character and their motion; replace the environment entirely.

```
Replace the background environment with: [NEW ENVIRONMENT DESCRIPTION].
Preserve: the character's appearance, motion, and the camera movement.
New lighting: [LIGHTING TO MATCH NEW ENVIRONMENT].
[ATMOSPHERIC ELEMENTS — weather, time of day, particles].
Motion strength: medium.
```

**Example:**
```
Replace the background environment with a vast Martian canyon at sunset.
Preserve: the astronaut's appearance, motion, and the camera movement.
New lighting: warm orange sunset, long shadows, thin atmospheric haze.
Red dust drifts through the air.
Motion strength: medium.
```

### 3. Character Remap (New Character, Same Motion)

Replace the character's appearance while preserving their movement exactly.

```
Replace the character with: [NEW CHARACTER DESCRIPTION — full physical detail].
Preserve: all motion, body language, and camera movement from the source.
Maintain: the original environment, lighting, and camera angle.
Motion strength: low.
```

**Example (Kling):**
```
Replace the character with a medieval knight in polished full plate armour, visor open.
Preserve: all motion, body language, and camera movement from the source.
Maintain: the original environment, lighting, and camera angle.
Motion strength: low.
```

Negative prompt:
```
identity drift, face morphing, armour inconsistency, floating elements, distortion
```

### 4. Motion Transfer / Puppeteering (Higgsfield)

Use source video body motion to drive a target character.

```
Apply the motion from the source video to: [TARGET CHARACTER DESCRIPTION].
Character: [FULL PHYSICAL DESCRIPTION].
Environment: [TARGET ENVIRONMENT].
Maintain: exact body movement timing and camera perspective.
```

**Example:**
```
Apply the motion from the source video to a female dancer in a white flowing dress.
Character: Woman, late 20s, long auburn hair, graceful build.
Environment: classical stage with soft spotlight, dark background.
Maintain: exact body movement timing and camera perspective.
```

### 5. Act-One Lip Sync (Runway)

Drive facial animation from audio input.

```
Apply lip sync to the character in this video from the provided audio.
Preserve: all body movement, head motion, and background.
Sync accuracy: prioritise mouth movement over head motion.
Natural expression: match spoken emotion to facial expression.
```

**Steps:**
1. Prepare source video with clearly visible face.
2. Prepare audio file (clean, no music, clear phonemes).
3. Upload both to Runway Act-One.
4. Write the prompt above.
5. Verify first 3 seconds for sync accuracy before processing full clip.

---

## Chaining V2V Clips

When source footage exceeds model's maximum input duration:

1. **Segment the source** at natural cut points (scene changes, pauses in motion).
2. **Process each segment** independently with identical prompt settings.
3. **Note the style seed** from the first successful segment.
4. **Apply same seed** to all subsequent segments for visual consistency.
5. **Assemble in editing software** with cross-dissolve if colour grade drifts between segments.

---

## Quality Gates

Before delivery:

- [ ] Character identity is consistent throughout (no morphing or drift).
- [ ] Background/environment is stable (no flickering or structural inconsistency).
- [ ] Camera motion is preserved from source.
- [ ] Colour grade is consistent across all processed segments.
- [ ] No temporal artifacts (flickering, ghosting, smearing).
- [ ] Motion timing matches source (no unexpected speed changes).

---

## Negative Prompts

### Kling V2V
```
face morphing, character drift, blurry, temporal artifacts, inconsistent costume, 
background flickering, extra limbs, distorted proportions
```

### Runway V2V
```
flickering, temporal artifacts, morphing environment, colour shifting, 
motion blur, stuttering, background inconsistency, clipping
```

---

## Common Failures

| Failure | Likely Cause | Fix |
|---|---|---|
| Character morphs mid-clip | Motion strength too high | Lower to 0.3–0.5 |
| Environment flickers | Conflicting source and target descriptions | Simplify the target environment description |
| Source motion lost | Motion strength too low | Raise to 0.6–0.8 |
| Wrong character appearance | Vague description | Add full physical detail, use reference image |
| Inconsistent style between segments | Different seeds used | Lock seed across all segments |
| Poor lip sync | Long words or fast speech in audio | Trim to shorter lines; process one line at a time |
