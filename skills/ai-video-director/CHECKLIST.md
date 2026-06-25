# Checklist — AI Video Director

Use these checklists at each stage of production to catch issues before they cost generation credits or time.

---

## Pre-Generation Checklist

Complete before submitting any prompt to a model.

### Creative Foundation
- [ ] The creative brief has a clearly defined subject (who/what)
- [ ] The action or state of the subject is unambiguous
- [ ] The setting is spatially specific (not just "outdoors")
- [ ] The emotional tone is defined by at least one concrete reference
- [ ] The purpose of the clip is clear (how will it be used?)

### Prompt Quality
- [ ] Prompt opens with camera framing or subject — not abstract description
- [ ] Camera movement is named explicitly (dolly, pan, static, etc.)
- [ ] Lighting is described in terms of direction, quality, and color temperature
- [ ] Subject action uses active verbs, not passive constructions
- [ ] No conflicting instructions (e.g., "static shot" + "camera slowly moves")
- [ ] No brand names, real people's names, or protected content
- [ ] Prompt length is appropriate for the model (Nano Banana: short; Veo/Sora: longer)

### Model-Specific Checks
- [ ] Aspect ratio is set to match delivery format
- [ ] Duration is set (starting short — 4s — for first iterations)
- [ ] Negative prompt is included (if model supports it)
- [ ] Motion intensity parameter is set to appropriate level
- [ ] Seed is noted if this is a variation of a known-good generation

### Multi-Shot Sequence Checks
- [ ] Shot list is finalized and numbered
- [ ] Consistency anchors are documented (character, environment, palette)
- [ ] Each shot has its own distinct camera move (avoid repeating moves)
- [ ] Transition logic is planned (match cut, cut on action, L-cut, etc.)

---

## During Generation Checklist

Monitor while clips are rendering or processing.

- [ ] Confirm the model accepted all parameters without error
- [ ] Note generation time (unusually long may indicate server issues)
- [ ] Track which generation number each clip is (for seed reference)
- [ ] Save all generation parameters alongside the output file

---

## Post-Generation Evaluation Checklist

Review each clip against these criteria before accepting it.

### Composition
- [ ] Subject is within the frame and properly positioned
- [ ] Headroom and leadroom are natural (not cropped or overly padded)
- [ ] Horizon line is level (unless intentional Dutch angle)
- [ ] Rule-of-thirds or golden ratio honored if compositionally appropriate
- [ ] No unintended objects or elements competing with the subject

### Subject Integrity
- [ ] Human faces are anatomically correct
- [ ] Hands are correct (five fingers, natural pose)
- [ ] Body proportions are natural throughout the clip
- [ ] Clothing/wardrobe is consistent from start to end of clip
- [ ] No duplication of subject within frame (common hallucination)
- [ ] Eyes are open and directed appropriately (if portrait)

### Motion and Camera
- [ ] Camera movement matches what was specified
- [ ] Motion has appropriate weight and inertia (not floaty, not jerky)
- [ ] No unintended camera shake or jitter
- [ ] Slow motion or speed effect is clearly evident (if specified)
- [ ] Subject motion is believable and physically plausible

### Lighting and Color
- [ ] Key light direction is consistent throughout clip
- [ ] Color temperature matches the brief (warm, neutral, cool)
- [ ] Exposure is correct — no blown highlights, no crushed shadows
- [ ] Shadows fall in the correct direction and feel three-dimensional
- [ ] Color palette is consistent with other clips in the sequence

### Technical Quality
- [ ] No visible compression artifacts
- [ ] No strobing or flickering in static areas
- [ ] No temporal aliasing (swimmy edges on moving objects)
- [ ] No watermarks, text overlays, or model-injected labels
- [ ] Resolution is sufficient for intended delivery format
- [ ] Frame rate is smooth and consistent

---

## Multi-Shot Consistency Checklist

Run after generating all clips in a sequence, before editing.

### Character Consistency
- [ ] Skin tone matches across all shots
- [ ] Hair color, style, and length are consistent
- [ ] Wardrobe items are identical (color, style, fit)
- [ ] Facial features are recognizably the same person
- [ ] Age appearance is consistent

### Environment Consistency
- [ ] Location architecture and layout are coherent
- [ ] Props and set dressing are in the same positions
- [ ] Lighting direction matches across all shots from same scene
- [ ] Time of day indicators (sun angle, sky) are consistent within a scene
- [ ] Color palette and grade are matched across cuts

### Continuity
- [ ] Action at the end of one shot logically continues at the start of the next
- [ ] Subject position in frame allows for natural cut (eyeline match, position match)
- [ ] No impossible spatial jumps between shots

---

## Delivery Readiness Checklist

Before handing off or publishing.

- [ ] All clips are exported at correct resolution and codec
- [ ] Frame rate is consistent across all clips (or intentional variation is noted)
- [ ] Color grade has been applied and matched across cuts
- [ ] Audio sync is confirmed if dialogue or music is present
- [ ] Aspect ratio matches delivery spec (16:9 for YouTube, 9:16 for Reels, etc.)
- [ ] File names follow naming convention
- [ ] Seed numbers are archived for all clips (for re-generation if needed)
- [ ] Generation prompts are archived alongside the final files
