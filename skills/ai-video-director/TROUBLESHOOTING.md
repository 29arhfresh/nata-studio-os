# Troubleshooting — AI Video Director

Diagnosis and recovery strategies for the most common AI video generation failures.

---

## Generation Failures

### The model produces nothing / errors out

**Likely causes**
- Content policy violation in the prompt
- Parameter conflict (e.g., unsupported duration for the selected model)
- Platform outage or rate limiting
- Image input too large or in unsupported format (for image-to-video)

**Fixes**
1. Check the error message — most platforms return a reason code
2. Review prompt for flaggable content: named real people, violent descriptions, brand logos
3. Verify parameters against the model's supported ranges in `TOOLS.md`
4. Compress or reformat the input image (JPEG, under 4MB, under 4096px on longest side)
5. Wait 5 minutes and retry if the error is server-side

---

## Subject Failures

### Wrong subject appears

**Cause**: The model's first token prediction latched onto a different subject than intended. Common when the subject is mentioned after environmental description.

**Fix**: Move the subject to the very beginning of the prompt.

Before:
```
A dimly lit alley in Tokyo, with neon lights reflecting in puddles, a black cat walks past.
```

After:
```
A black cat walks slowly through a dimly lit Tokyo alley. Neon lights reflect in rain puddles.
```

---

### Subject disappears mid-clip

**Cause**: Low motion intensity combined with a complex scene, or a conflicting action description causes the model to lose track of the subject.

**Fixes**
- Add "throughout the clip" or "continuously visible" to subject description
- Reduce scene complexity — simplify the environment description
- Increase motion intensity slightly (paradoxically helps maintain subject coherence)
- Use a static camera; camera movement can cause subject to exit frame

---

### Duplicate subjects appear

**Cause**: Ambiguous plural language, or the model interprets a description as requiring multiple instances.

**Fixes**
- Use "a single [subject]" explicitly
- Add to negative prompt: "duplicate subject, multiple [subject name], twins"
- Avoid phrases like "surrounded by [same subjects]"

---

### Subject changes appearance mid-clip (character drift)

**Cause**: The model's temporal coherence weakens in longer clips, especially when the character moves significantly.

**Fixes**
- Shorten clip duration (4s instead of 8s) for high-consistency shots
- Use a reference image (Higgsfield) to anchor the character appearance
- Describe the character's appearance at the prompt's start AND add a consistency phrase at the end: "the character's appearance remains consistent throughout"
- Generate shorter clips and concatenate rather than a single long clip

---

## Anatomy and Body Failures

### Incorrect hands

**Cause**: Hands remain one of the hardest anatomical elements for video models.

**Fixes**
- Crop the shot to avoid showing full hands (CU on face; OTS shot where hands are blurred)
- Add to negative prompt: "extra fingers, malformed hands, distorted hands"
- If hands must be visible, describe them explicitly: "right hand with five fingers, natural relaxed grip"
- Use Seedance v2 or Veo 3 (strongest hand generation) rather than other models

---

### Face deformation / uncanny valley

**Cause**: Extreme focal length close-ups, rapid motion, or model defaults for certain ethnicities.

**Fixes**
- Avoid ECU (extreme close-up) shots; use MCU (medium close-up) instead
- Add "natural facial features, photorealistic skin, high-fidelity face" to prompt
- Add to negative prompt: "distorted face, morphed features, uncanny, wax-like skin"
- Use Higgsfield or Seedance v2, which have strongest human face quality
- For portrait work, specify "85mm portrait lens equivalent, shallow depth of field"

---

### Body proportions wrong

**Cause**: Unusual camera angles or lens descriptions confuse the model's body model.

**Fixes**
- Remove extreme angle descriptions unless essential
- Add "natural body proportions, anatomically correct"
- For full-body shots, prefer medium wide or wide shots over extreme wide (which produces perspective distortion)

---

## Camera and Motion Failures

### Camera moves when it should be static

**Cause**: Models tend to add camera movement by default, especially Seedance v2.

**Fix**: State explicitly: "camera holds completely static," "locked-off shot," "no camera movement"

---

### Camera moves in the wrong direction

**Cause**: Ambiguous directional language. "Zoom" is interpreted differently by different models (optical zoom vs. dolly).

**Fixes**
- Replace "zoom in" with "camera slowly dollies in toward the subject"
- Replace "zoom out" with "camera slowly pulls back, revealing the environment"
- Use cardinal directions: "camera pans from left to right"
- For Higgsfield: use camera control presets instead of prompt language

---

### Motion is too fast

**Cause**: Default motion intensity is too high, or the action description implies speed.

**Fixes**
- Reduce motion intensity parameter to 0.2–0.4
- Add speed modifiers: "in slow, deliberate motion," "unhurried," "imperceptibly slow"
- For Kling: switch from Standard to Pro mode for more motion control

---

### Motion is too slow / nearly frozen

**Cause**: Motion intensity set too low, or the scene description is overly static.

**Fixes**
- Increase motion intensity to 0.6–0.8
- Add kinetic language: "with purposeful energy," "briskly," "dynamic motion"
- Ensure the action verb is clearly a motion, not a state (not "standing" — "walking forward")

---

### Jittery, unstable footage

**Cause**: High motion intensity combined with detailed environments; model struggles to maintain spatial consistency.

**Fixes**
- Reduce motion intensity
- Simplify the background description
- Add to negative prompt: "jittery camera, unstable footage, shaky cam, hand-held jitter"
- Specify "steadicam shot" or "smooth dolly movement"

---

## Lighting and Color Failures

### Lighting changes mid-clip (light flicker)

**Cause**: The model doesn't fully lock the lighting state at frame 0, so it drifts over the clip duration.

**Fixes**
- State "lighting remains consistent throughout"
- Use motivated practical lighting (describe a specific light source that would remain static)
- Add to negative prompt: "flickering light, changing illumination, inconsistent lighting"

---

### Overexposed / washed-out image

**Cause**: Outdoor daylight prompts often default to blown highlights; "bright" is over-interpreted.

**Fixes**
- Replace "bright" with "well-exposed," "balanced exposure," or specific lighting type
- Add to negative prompt: "overexposed, blown highlights, washed out"
- Specify time of day precisely: "early afternoon, soft directional sun, white clouds diffusing light"

---

### Wrong color temperature

**Cause**: Model defaulted to a different time-of-day assumption than intended.

**Fixes**
- Specify Kelvin value or standard reference: "warm 3200K tungsten light," "cool 5600K daylight," "golden hour 2700K"
- Name the time of day explicitly and describe sky conditions
- Use color grade descriptors: "warm amber tones," "cool blue-hour palette"

---

## Consistency Failures (Multi-Shot)

### Character looks different across shots

**Cause**: Without a reference image or precise re-description, the model re-interprets the character each generation.

**Fixes**
- Write a character "seed description" (a paragraph that captures all appearance details) and paste it at the start of every shot prompt
- Use Higgsfield with a reference image — this is the most reliable fix
- Generate all shots at the same seed value and select from variations
- Avoid changing any aspect of the character description between shots

---

### Environment is inconsistent across cuts

**Cause**: Different prompts use slightly different environment descriptions, and the model interprets them differently.

**Fixes**
- Write an "environment anchor" paragraph and paste it verbatim into all shots from the same scene
- Use consistent time-of-day, weather, and lighting terms across all shots
- Note specific architectural details and repeat them: "exposed brick wall, arched wooden door on the right"

---

### Color grade doesn't match between shots

**Cause**: Different models (or even different seeds on the same model) have slightly different color signatures.

**Fixes**
- Apply a color LUT in post-production to unify the grade
- Specify the same precise color language in every prompt ("muted earth tones, teal shadows")
- Generate all shots on the same model — avoid mixing models within a scene

---

## Platform-Specific Issues

### Seedance v2: Commercial content flagged

**Cause**: The platform detects brand-adjacent content and holds it for review.

**Fix**: Avoid generic brand names; use descriptive terms instead ("a polished watch" not "a Rolex").

---

### Veo 3: Output resolution lower than expected

**Cause**: 4K generation requires explicit request and is throttled by API tier.

**Fix**: Check API access tier; request 4K explicitly in the parameters; use Magnific upscale as a fallback.

---

### Kling: Motion brush not applying correctly

**Cause**: The mask regions are too small or the motion vectors conflict with the model's scene understanding.

**Fix**: Draw broader, more generous masks; use motion vectors aligned with natural physics (gravity, expected object momentum).

---

### Higgsfield: Reference image not respected

**Cause**: Reference image is too different from the scene context (e.g., a studio headshot used as reference for an outdoor action scene).

**Fix**: Use a reference image that matches the lighting and angle of the target shot; crop tightly to the character's face for maximum influence.

---

### Sora: Storyboard mode shots not connecting

**Cause**: Scene descriptions are too different between storyboard frames, breaking the model's spatial model.

**Fix**: Keep environment descriptions identical between frames; change only the subject position and camera angle.
