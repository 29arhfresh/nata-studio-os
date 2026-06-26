# Troubleshooting — AI Video Director

This template is the diagnostic guide for failed or poor-quality AI video generations. Work through each section to identify the failure category and apply the recommended fix.

---

## Diagnostic Process

```
1. Identify the failure category (Section 1)
2. Find the specific symptom (Sections 2–10)
3. Apply the recommended fix
4. Change only ONE variable per iteration
5. Regenerate and compare
6. Escalate to model change if the failure is a model limitation
```

---

## 1. Failure Categories

| Category | Symptom Examples |
|---|---|
| **Prompt — Subject** | Wrong character, missing element, extra elements |
| **Prompt — Camera** | Wrong angle, wrong movement, wrong framing |
| **Prompt — Lighting** | Wrong light direction, wrong colour temp, wrong quality |
| **Prompt — Motion** | No motion, wrong motion, wrong motion direction |
| **Prompt — Style** | Wrong look, wrong period, wrong mood |
| **Character — Identity** | Character changes between frames or shots |
| **Character — Anatomy** | Extra limbs, distorted face, wrong hands |
| **Technical — Temporal** | Flickering, ghosting, smearing, stuttering |
| **Technical — Resolution** | Blurry, pixelated, low detail |
| **Model Limitation** | Fundamental capability the model cannot perform |

---

## 2. Subject Failures

### Wrong Character Appears

**Symptom:** The generated character does not match the described character.

**Diagnosis:** Character description is too brief, too abstract, or conflicts with the model's training.

**Fix:**
1. Add specific physical detail: exact hair colour, length, style, face shape, age, ethnicity.
2. Remove any ambiguous descriptors ("attractive", "stylish") that the model interprets differently.
3. Add: "consistent appearance throughout the clip."
4. Use a reference image (IP-adapter / image-to-video with face reference).
5. If using Kling, set the character seed.

### Missing Element

**Symptom:** A specified object, prop, or character is not in the output.

**Diagnosis:** The element was described too late in the prompt, or was competing with other strong visual signals.

**Fix:**
1. Move the missing element to the beginning of the scene description.
2. Make it the grammatical subject of the opening sentence.
3. Add emphasis: "prominently", "clearly visible", "in the foreground".

### Extra/Unwanted Element

**Symptom:** The output contains an element not specified in the prompt.

**Diagnosis:** The scene description contains adjacent concepts that triggered the unwanted element via association.

**Fix:**
1. Add the unwanted element to the negative prompt (if supported).
2. Rewrite the scene description to avoid the associated concept.
3. Add: "only [ELEMENTS YOU WANT], nothing else in frame."

---

## 3. Camera Failures

### Wrong Angle

**Symptom:** Camera angle is different from the specified angle.

**Diagnosis:** Angle description was too brief or was overwhelmed by scene description.

**Fix:**
- Use precise language: "camera positioned at knee height, looking up at the subject" instead of "low angle".
- Add the angle at the very beginning of the camera clause.
- Specify physical camera position: "camera at floor level", "overhead drone perspective".

### Wrong Movement

**Symptom:** Camera moves incorrectly or does not move as specified.

**Diagnosis:** Movement direction was ambiguous or contradicts the scene layout.

**Fix:**
- Specify direction of movement: "dolly-in, moving toward the subject's face" not just "dolly-in".
- Add speed qualifier: "slow dolly-in", "rapid pan right".
- Specify what the camera passes or reveals: "crane up to reveal the full cityscape".

### Framing Error

**Symptom:** Subject is off-centre, cut off, or at the wrong size in frame.

**Diagnosis:** Shot size was not specified, or was specified after competing position information.

**Fix:**
- Specify shot size explicitly: "medium shot — subject from waist up, centred in frame."
- Add composition instruction: "rule of thirds, subject on left third."
- For close-ups: "face fills frame, eyes at upper third."

---

## 4. Lighting Failures

### Wrong Light Direction

**Symptom:** Shadows fall in the wrong direction, or the light appears to come from an unexpected angle.

**Diagnosis:** Light direction was described without spatial reference to the camera or subject position.

**Fix:**
- Use camera-relative descriptions: "key light from camera left" not "light from the left."
- Add physical spatial reference: "sunlight enters from frame right, casting shadows to frame left."
- Specify shadow direction explicitly: "long shadows falling away from the camera."

### Wrong Colour Temperature

**Symptom:** Light is the wrong colour — too warm, too cool, or an unexpected colour cast.

**Diagnosis:** Colour temperature was not specified or was specified only descriptively ("warm") without a value.

**Fix:**
- Include Kelvin value: "3200K tungsten", "5500K daylight", "7000K overcast blue".
- Specify the light source: "candlelight" (1800K), "sunrise" (2000K), "noon sun" (5500K), "overcast" (7000K).

### Hard / Soft Mismatch

**Symptom:** Light quality is different from the intended look — too harsh or too flat.

**Diagnosis:** Light quality was assumed rather than specified.

**Fix:**
- Add quality explicitly: "hard directional light, sharp-edged shadows" or "soft wrap light, no hard shadows."
- Describe the size of the light source: "large soft box" (soft), "bare bulb" (hard), "through a frosted window" (soft).

### No Visible Light Change in Atmospheric Prompts

**Symptom:** "Golden hour" or "blue hour" prompt generates wrong time of day.

**Fix:**
- Add colour temperature: "golden hour, 2800K, orange-amber sky."
- Add shadow characteristics: "long golden shadows, sun near horizon."
- Add atmospheric elements: "warm orange haze on the horizon."

---

## 5. Motion Failures

### No Motion (Static When Motion Expected)

**Symptom:** The clip is nearly static despite motion instructions.

**Diagnosis:** Motion phrase was not specific enough, or the model defaulted to a static interpretation.

**Fix:**
1. Lead the scene description with an action verb: "A wolf SPRINTS" not "A wolf".
2. Use physics trigger keywords (Seedance 2): "fabric billows", "water splashes", "sparks fly".
3. Add motion intensity: "rapid movement", "vigorous action", "dramatic motion".

### Wrong Motion Direction

**Symptom:** Subject or camera moves in the wrong direction.

**Fix:**
- Add compass direction: "runs from left to right across the frame."
- Add spatial anchor: "camera pans right, following the car as it drives away."
- Add screen direction: "moving toward camera", "moving away from camera", "from frame left to frame right."

### Unintended Camera Motion

**Symptom:** Camera shakes, drifts, or moves when "static" was specified.

**Fix:**
- Replace "static" with "completely stationary camera, locked-off."
- Add: "no camera movement, tripod-locked."
- For subtle drift issues: "perfectly stable frame, no drift."

### Too Much Camera Motion

**Symptom:** Handheld or tracked shots are too aggressive/shaky.

**Fix:**
- Add qualifier: "subtle handheld", "gentle handheld", "barely perceptible handheld."
- Switch to "steady tracking" for parallel subject movement.
- Use "Steadicam" as a reference for fluid stabilised movement.

---

## 6. Style Failures

### Wrong Visual Style

**Symptom:** The output looks generic or like a different aesthetic.

**Diagnosis:** Style description was too abstract.

**Fix:**
- Use specific film/photographer references: "Roger Deakins cinematography" not "cinematic."
- Name the film stock: "Kodak Vision3 500T" not "film look."
- Describe the colour grade precisely: "teal shadows, warm orange highlights, high contrast" not "moody."

### Style Drift Mid-Clip

**Symptom:** The visual style changes or becomes inconsistent within a single clip.

**Fix:**
- Add style anchors at the end of the prompt: "Consistent visual style throughout. [GRADE] colour grade maintained."
- Use Runway for style-critical work — it handles style consistency better than most models.
- Negative prompt: "colour shift, style change, inconsistent grade."

---

## 7. Character Identity Failures

### Face Changes / Morphs Within a Clip

**Symptom:** The character's face changes shape, age, or features during the clip.

**Diagnosis:** No identity anchor was provided.

**Fix:**
1. Add the full character description including distinctive features.
2. Use character seed (Kling, Higgsfield).
3. Add: "consistent face and identity throughout. Character does not change."
4. Negative prompt (Kling): "face morphing, identity drift, changing features."

### Character Drift Between Shots

**Symptom:** Character looks different in sequential shots.

**Fix:**
1. Use IDENTICAL character clause in every prompt — do not paraphrase.
2. Use the same character seed across all shots.
3. Provide the same reference image in every shot's image-to-video input.
4. Generate all shots as a batch before reviewing to catch drift early.

---

## 8. Anatomy Failures

### Extra Fingers / Distorted Hands

**Symptom:** Hands have wrong number of fingers, wrong proportions, or unnatural positions.

**Fix:**
- Negative prompt: "extra fingers, distorted hands, blurry hands, unnatural hands."
- Avoid prompting hands explicitly when not necessary — the model hallucinates them.
- For essential hand shots, use image-to-video with a reference of the correct hand position.
- Camera angle: a high-angle or framing that shows fewer fingers is more reliable.

### Extra Limbs / Wrong Body Parts

**Symptom:** Additional arms, legs, or other body parts appear.

**Fix:**
- Negative prompt: "extra limbs, duplicate body parts, distorted anatomy."
- Use a full-body reference image.
- Describe the pose explicitly: "standing, arms at sides, facing camera."

---

## 9. Technical Failures

### Flickering

**Symptom:** Bright/dark alternation within the clip, especially in backgrounds or hair.

**Cause:** High-frequency detail in areas of motion creates temporal instability.

**Fix:**
1. Negative prompt: "flickering, temporal artifacts, strobing."
2. Reduce motion in the scene (less movement = less flicker risk).
3. Simplify the background (fewer high-frequency details).
4. Use Runway — it handles temporal stability better than most models.

### Ghosting / Smearing

**Symptom:** Motion leaves ghost trails or smears across the frame.

**Fix:**
1. Negative prompt: "ghosting, motion smear, trails."
2. Reduce motion speed: "slow", "deliberate", "measured."
3. Increase the model's motion strength setting to mid-range.

### Low Resolution / Blurry Output

**Symptom:** Output lacks sharpness and detail.

**Fix:**
1. Add to prompt: "sharp, high resolution, detailed."
2. Add negative prompt: "blurry, soft focus, low resolution, pixelated."
3. Check model resolution settings — ensure output resolution matches intended use.
4. For close-ups, explicitly state "tack sharp, in-focus" with the correct lens.

---

## 10. Model Limitations (Escalation)

Some failures cannot be fixed with prompt changes. Know when to change models.

| Requirement | Best Model | Don't Use |
|---|---|---|
| Lip sync / dialogue | Higgsfield | Seedance 2, Veo |
| Character seed | Kling, Higgsfield | Runway, Seedance 2, Veo, Sora |
| Negative prompt | Kling, Runway | Seedance 2, Veo, Higgsfield, Sora |
| Video-to-video | Runway, Kling, Higgsfield | Seedance 2, Veo, Sora |
| Duration > 10s | Sora (20s), Runway (16s) | Seedance 2, Veo, Higgsfield |
| Physics simulation | Seedance 2 | All others |
| Style transfer | Runway | Seedance 2, Veo |

If you have applied 3 prompt iterations with no improvement, assume a model limitation and switch models.

---

## Quick Reference — Fix Table

| Failure | One-Line Fix |
|---|---|
| Wrong character | Add full physical description + reference image |
| Missing element | Move element to the first sentence as the grammatical subject |
| Wrong angle | State camera physical position, not just angle name |
| No motion | Lead with action verb; add physics trigger keyword |
| Wrong light colour | Add Kelvin value |
| Style wrong | Use director/stock reference, not abstract adjective |
| Face morphs | Add character seed + negative prompt: "identity drift" |
| Flickering | Simplify background; add negative prompt: "flickering" |
| Extra fingers | Negative prompt: "extra fingers, distorted hands" |
| Model can't do it | Change model; see escalation table above |
