# Template — Seedance v2

Seedance v2 by ByteDance is optimized for photorealistic commercial video with high-fidelity human subjects, clean motion, and editorial-quality output.

---

## Model Characteristics

- **Strengths**: Human skin, fabric, reflective surfaces, product close-ups, commercial motion
- **Weaknesses**: Text rendering, complex multi-character blocking, extreme close-ups of hands
- **Prompt weighting**: Heavy on first 30 words — lead with subject and camera
- **Default behavior**: Adds subtle camera movement even on static requests; suppress explicitly
- **Duration options**: 4s, 6s, 8s (chain for longer content)

---

## Prompt Template

```
[SHOT SIZE], camera [CAMERA MOVEMENT]. [SUBJECT DESCRIPTION] [SUBJECT ACTION]. 
[SETTING/ENVIRONMENT]. [LIGHTING]. [MOOD/ATMOSPHERE]. [TECHNICAL QUALITIES].
```

**Example**:
```
Medium close-up shot, camera slowly pushes in. A professional woman in her 40s with 
copper-toned skin and short natural hair reviews documents at a glass desk. The office 
behind her is soft-focused with city views. Warm morning side light from the left, 
clean fill on the shadow side. Focused and composed. Photorealistic, editorial quality, 
sharp focus on face.
```

---

## Parameters Reference

```yaml
model: seedance-v2
duration: 6          # Options: 4 | 6 | 8
aspect_ratio: "16:9" # Options: 16:9 | 9:16 | 1:1 | 4:3
motion_intensity: 0.5 # Range: 0.0–1.0 (start at 0.5)
seed: null           # Set after a good result to generate variations
```

---

## Shot Size Reference

| Abbreviation | Description | Use Case |
|---|---|---|
| EWS | Extreme wide shot | Establishes location scale |
| WS | Wide shot | Full body + environment context |
| MWS | Medium wide shot | Waist to above head + surroundings |
| MS | Medium shot | Waist up; conversational |
| MCU | Medium close-up | Chest up; most common for commercial |
| CU | Close-up | Face-filling; emotional impact |
| ECU | Extreme close-up | Eyes or detail; use sparingly |
| OTS | Over-the-shoulder | Dialogue and interaction |

---

## Camera Movement Vocabulary

These phrases produce the most reliable results in Seedance v2:

| Intent | Write This |
|---|---|
| Static shot | "camera holds completely static, locked-off" |
| Move toward subject | "camera slowly pushes in toward the subject" |
| Move away from subject | "camera slowly pulls back, revealing the environment" |
| Pan right | "camera pans slowly from left to right" |
| Tilt up | "camera tilts upward, revealing the sky" |
| Arc around subject | "camera arcs slowly around the subject from left to right" |
| Rise above | "camera rises, revealing the full scene from above" |
| Handheld | "subtle handheld movement, intimate and organic" |

---

## Lighting Recipes

### Luxury/Commercial (Product, Fashion)
```
Soft box light from front-left, subtle fill from front-right, clean white catch lights 
in eyes, rim light separating subject from background.
```

### Editorial/Portrait (People, Interview)
```
Window light from frame left, warm natural daylight, subtle shadow on the right side of 
face, photographic quality skin rendering.
```

### Golden Hour (Outdoor, Lifestyle)
```
Warm 2700K backlight from frame right, soft ambient fill from open sky, subtle lens flare 
catching the lens edge, golden rim light on hair and shoulders.
```

### Night / Urban Neon
```
Practical neon light from above, cool blue and warm amber highlights competing, deep 
natural shadows, ISO grain in shadow areas.
```

### Studio Clean (Corporate, Tech)
```
Three-point studio setup, soft key from 45° front-left, fill at half intensity from right, 
hairlight from above-rear, white or gradient gray background.
```

---

## Quality Trigger Phrases

Append these to improve output quality on specific content types:

**For commercial video**:
```
editorial quality, photorealistic, premium production value, sharp focus, clean composition
```

**For human subjects**:
```
natural skin texture, lifelike movement, photorealistic facial features
```

**For product close-ups**:
```
macro sharp detail, studio lighting, material texture visible, reflection on surface
```

**For lifestyle/brand**:
```
aspirational, warm and authentic, natural moment, documentary-style authenticity
```

---

## Negative Prompt Workaround

Seedance v2 does not support native negative prompts. Embed exclusions using this pattern:

```
...[main prompt]. Avoid: blurry motion, overexposed highlights, distorted hands, 
visible watermarks, text overlays.
```

Or use a "quality assurance" closing sentence:
```
The footage is sharp, properly exposed, anatomically correct, and free of visual artifacts.
```

---

## Common Use Cases

### Product Reveal
```
Extreme close-up, camera slowly pulls back to reveal [PRODUCT] centered on [SURFACE]. 
[LIGHTING]. Shallow depth of field, product in sharp focus throughout. 
Premium production quality.
```

### Lifestyle Portrait
```
Medium close-up, camera holds static. [CHARACTER DESCRIPTION] [ACTION] in [SETTING]. 
[LIGHTING]. The moment feels natural and unposed. Photorealistic, editorial quality.
```

### Brand Story Beat
```
Wide shot, camera slowly dollies in. [SCENE DESCRIPTION]. [LIGHTING]. The atmosphere 
is [MOOD]. As the camera moves, [ADDITIONAL ACTION]. Warm, aspirational tone throughout.
```

### Texture / Material Detail
```
Extreme close-up, camera holds static. [MATERIAL/TEXTURE DESCRIPTION]. [LIGHTING] catches 
[SPECIFIC MATERIAL QUALITY]. Shallow depth of field, in sharp focus. Tactile, high-fidelity 
material rendering.
```

---

## Iteration Strategy

**First generation**: Use 4s duration at 0.5 motion intensity to quickly evaluate composition and subject quality.

**If composition is good**: Extend to target duration. Adjust motion intensity.

**If composition is wrong**: Rewrite the first sentence only — shot size and camera move.

**If lighting is wrong**: Isolate the lighting clause and rewrite it with more specific terms.

**Once satisfied**: Lock the seed. Generate 2–3 variations with the seed locked and slightly adjusted motion intensity.
