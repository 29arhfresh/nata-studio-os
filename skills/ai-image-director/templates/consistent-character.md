# Template — Consistent Character

Use this template when generating a sequence of images where one or more characters must appear visually consistent across all images. Character consistency is the most technically demanding challenge in multi-image AI production.

---

## The Core Problem

AI image models have no persistent memory. Each generation is stateless. Without deliberate engineering, the "same" character generated across ten images will produce ten variations of that character — different hair shade, different eye shape, different skin tone, different build.

Consistency is achieved through four mechanisms, ranked by reliability:

| Mechanism | Reliability | Availability |
|-----------|------------|--------------|
| **LoRA / character model** | Highest | Requires training; Stable Diffusion, some Flux setups |
| **Reference image conditioning** | High | Magnific, some Flux workflows |
| **Character seed + style lock** | Medium | All models |
| **Generation seed locking** | Low-Medium | Same model and similar prompt only |

Choose the highest reliability mechanism available for the production requirement.

---

## Step 1: Write the Character Seed

A character seed is a standardized description block pasted identically at the start of every prompt where this character appears. It is the verbal anchor.

### Character Seed Template

```
[CHARACTER NAME IF APPLICABLE]: [AGE RANGE]-year-old [GENDER PRESENTATION].
Skin: [TONE — warm/cool/neutral + descriptors], [TEXTURE — clear/freckled/scarred/etc.].
Hair: [COLOR], [LENGTH], [STYLE], [TEXTURE — straight/wavy/curly/coiled/etc.].
Eyes: [COLOR], [SHAPE — almond/round/hooded/etc.], [NOTABLE QUALITY].
Build: [BODY TYPE], [HEIGHT IMPRESSION].
Face: [FACE SHAPE], [JAWLINE], [DISTINCTIVE FACIAL FEATURES].
Wearing: [GARMENT 1 — color, type, material, fit], [GARMENT 2], [FOOTWEAR], [ACCESSORIES].
```

### Example Character Seeds

**Professional woman — contemporary campaign**:
```
CLAIRE: 36-year-old woman. 
Skin: warm light beige, smooth and clear, slight natural flush in cheeks.
Hair: rich dark brown, mid-length wavy bob, slightly tucked behind right ear.
Eyes: deep brown, slightly almond shape, long natural lashes, warm expression.
Build: slim, medium height.
Face: soft oval, defined cheekbones, small straight nose, full lips.
Wearing: fitted sage green blazer, white fitted turtleneck beneath, 
straight dark navy trousers, white leather sneakers, small gold stud earrings.
```

**Young male character — game/animation**:
```
KAI: Appears early 20s, slight build, average height.
Skin: light tan, smooth, no marks.
Hair: jet black, slightly overgrown, falls across forehead in loose waves.
Eyes: pale amber-gold, sharp and alert.
Build: lean and wiry, slight but not fragile.
Face: angular jaw, high cheekbones, thin nose, slight natural frown.
Wearing: dark olive hooded jacket, unzipped over a grey fitted long-sleeve shirt, 
black cargo trousers, worn black low-profile boots, no accessories.
```

**Elderly woman — editorial portrait series**:
```
ELENA: Appears early 70s.
Skin: warm light with deep laugh lines, forehead lines, and crow's feet — natural, not reduced.
Hair: silver white, thick, swept back in a loose chignon, few strands escaping at temples.
Eyes: pale blue, wise, slightly narrowed, deep-set under strong brows.
Build: upright and composed, slender, clear posture.
Face: strong angular jaw softened with age, prominent cheekbones, aquiline nose.
Wearing: a deep burgundy linen shirt, loose wide-leg grey trousers, 
simple brown leather slide sandals, tortoiseshell reading glasses hung at neckline.
```

### Seed Quality Rules

- Use concrete, specific descriptors — not "beautiful" or "striking"
- Specify measurements by impression, not number: "medium height" not "5'7"
- For skin: always include tone and texture
- For hair: always include color, length, style, and texture — all four
- For eyes: always include color and shape at minimum
- For wardrobe: describe every visible garment including shoes and one or two accessories

---

## Step 2: Write the Style Lock

The style lock describes the image aesthetic that remains constant across all images in the sequence. It is separate from the character seed and describes the photographic or illustration style.

### Style Lock Template

```
STYLE LOCK:
Photography style: [commercial / editorial / lifestyle / cinematic / etc.]
Lighting signature: [describe the distinctive lighting that will repeat — color temperature, quality, direction pattern]
Color grade: [describe grade reference — film stock, photographer, color approach]
Lens character: [focal length range, aperture tendency, DOF style]
Retouching level: [light touch / commercial clean / heavily retouched / raw]
Format: [aspect ratio, consistent across sequence]
```

### Example Style Lock

```
STYLE LOCK:
Photography style: editorial lifestyle, Kinfolk magazine aesthetic.
Lighting signature: natural light, directional from one side, warm 4500K to 5000K, soft diffused, no fill, slight underexposure.
Color grade: warm natural, slightly muted, film-inspired, lifted shadow floor, no blown highlights.
Lens character: 50mm to 85mm range, f/2.8 to f/4, moderate bokeh.
Retouching level: light touch — natural skin, no skin smoothing, color correction only.
Format: 4:5 vertical throughout.
```

---

## Step 3: Select and Apply a Consistency Method

### Method A: Prompt-Only Consistency

**Best for**: Exploratory generation, budget workflows, low-risk consistency requirements.

**Reliability**: Low to medium. Expect noticeable variation between images. Character will feel like the same archetype, not the exact same person.

**Protocol**:
1. Use identical character seed text at the start of every prompt
2. Keep seed text identical — do not paraphrase or abbreviate
3. Use the same model variant for all images in the sequence
4. Record the generation seed for each acceptable image; use the best seed for subsequent prompts when possible

**Prompt structure**:
```
[CHARACTER SEED — paste verbatim].

[SCENE DESCRIPTION for this image].

[LIGHTING — from Style Lock].
[LENS — from Style Lock].
[COLOR GRADE — from Style Lock].

[QUALITY CUES].
```

---

### Method B: Reference Image Conditioning

**Best for**: Commercial production, hero campaign characters, any work where consistency is non-negotiable.

**Reliability**: High. The model anchors to the visual reference rather than generating from text alone.

**Protocol**:
1. Generate or source a reference image of the character (front or three-quarter view, well-lit, clean background)
2. Attach the reference image as conditioning input to each subsequent generation
3. Include the character seed text alongside the reference (text + image = stronger consistency than either alone)
4. Keep the reference image facial angle similar to the target angle in each generation

**Prompt structure** (with reference image attached):
```
[CHARACTER SEED — paste verbatim, confirms reference identity].

[SCENE DESCRIPTION for this image].

[LIGHTING — from Style Lock].
[LENS — from Style Lock].
[COLOR GRADE — from Style Lock].

Character appearance matches the provided reference image.
[QUALITY CUES].
```

**Platforms supporting reference conditioning**:
- **Magnific**: Use `library` to store character reference, pass as reference in generation
- **Flux with IP-Adapter**: Reference image conditions identity while prompt guides scene
- **Midjourney**: `--cref [image URL]` (character reference) with `--cw` (character weight)
- **Kling**: Source image input in image-to-video transfers to image-to-image workflows

---

### Method C: LoRA / Character Model

**Best for**: Extended production runs, recurring characters across many images, animation pre-production.

**Reliability**: Highest — the model is trained specifically on the character.

**Protocol**:
1. Train a LoRA on 15–30 high-quality reference images of the character (multiple angles, lighting conditions, expressions)
2. Apply the LoRA to every generation in the sequence at the recommended weight (typically 0.6–0.9)
3. Use the LoRA alongside a character seed prompt — they work better together than either alone
4. Maintain the same base model that was used for LoRA training

**Note**: LoRA training is outside the scope of prompt engineering and requires specialized tooling (Kohya SS, Ostris, or equivalent). This method is documented here for workflow awareness, not implementation guidance.

---

### Method D: Seed Locking

**Best for**: Same-scene variations (different angles of the same scene moment), tight version control within a single shoot.

**Reliability**: Low outside narrow conditions. Seed locking helps when prompts are very similar; breaks down when environment or action changes significantly.

**Protocol**:
1. Generate until you find a seed that produces a good character match
2. Record the seed number
3. Use that seed for related prompts with minimal structural variation
4. Accept that seed locking will not hold across dramatically different scenes

---

## Step 4: Build the Image Sequence

### Shot List Template for Character Sequence

```
CHARACTER: [NAME]
CHARACTER SEED: [paste full seed text]
STYLE LOCK: [paste style lock]
CONSISTENCY METHOD: [A / B / C / D / combination]
REFERENCE IMAGE: [path or URL if using Method B]

---

IMAGE 01 — [SCENE NAME] — [SHOT SIZE]
Scene: [describe what is happening in this specific image]
Prompt:

[CHARACTER SEED — paste verbatim]

[SCENE DESCRIPTION]. [ENVIRONMENT]. 
[ACTION AND POSE for this image].
[GAZE AND EXPRESSION for this image].

[LIGHTING from Style Lock, adapted for this scene's light source].
[LENS from Style Lock].
[COLOR GRADE from Style Lock].
[QUALITY CUES].

---

IMAGE 02 — [SCENE NAME] — [SHOT SIZE]
Scene: [describe]
Prompt:

[CHARACTER SEED — paste verbatim]

[Continue...]
```

---

## Step 5: Evaluate Consistency

After generating each image, assess consistency against this grid:

| Feature | Check Method |
|---------|-------------|
| **Skin tone** | Compare to reference — same warm/cool/neutral quality, same general lightness |
| **Hair** | Color, length, and style match across images |
| **Eye color and shape** | Same color family, same basic shape |
| **Facial structure** | Same jaw width, nose shape, eye spacing impression |
| **Age appearance** | No sudden aging or de-aging between images |
| **Wardrobe** | Same garments described in seed — correct colors, materials |
| **Build and proportions** | Same height impression and body type |
| **Distinctive features** | Freckles, glasses, scar, etc. — present and consistent |

---

## Consistency Recovery

When a generated image does not match the established character:

**Problem: Skin tone shifted**  
Fix: Strengthen skin tone descriptor in seed — add Fitzpatrick scale reference or very specific hex-like description ("warm medium brown, like rosewood or warm walnut")

**Problem: Hair color changed**  
Fix: Add a closing sentence: "Hair is [COLOR], not blonde, not brunette — specifically [COLOR]."

**Problem: Eye color wrong**  
Fix: Add "Eyes are specifically [COLOR], not [COMMON ALTERNATIVE]."

**Problem: Character aged or de-aged**  
Fix: Add age impression specifically: "face appears [AGE] — [SPECIFIC AGE MARKERS present, e.g., faint crow's feet / no lines / deep laugh lines]."

**Problem: Wardrobe inconsistent**  
Fix: Describe each garment with more specificity — exact color name, specific material, precise fit.

**Problem: Reference image conditioning not holding**  
Fix: Increase reference weight; ensure reference image is well-lit front or three-quarter view; crop reference to face if only face consistency is needed.

---

## Multi-Character Sequences

When two or more characters appear together:

1. Write a separate complete character seed for each character
2. In the prompt, introduce each character by their seed, clearly separated
3. Use spatial language to place characters: "CHARACTER A on the left of frame, CHARACTER B on the right"
4. Label which character does which action: "CHARACTER A (Claire) reaches forward; CHARACTER B (Elena) watches"
5. For reference conditioning: attach both character references, weight each separately if the platform allows

```
[CHARACTER A SEED — paste verbatim].
[CHARACTER B SEED — paste verbatim].

[SCENE]. [CHARACTER A PLACEMENT AND ACTION]. [CHARACTER B PLACEMENT AND ACTION].

[LIGHTING]. [LENS]. [GRADE]. [QUALITY CUES].
```

---

## Face Consistency Special Considerations

Face consistency is harder than body consistency. The face has more features in a smaller space, and models produce more variation here.

**Techniques to improve face consistency**:

1. **Add face-specific descriptors to the seed**: Include nose shape, lip fullness, jaw shape, brow shape — not just eyes and skin tone.

2. **Use face reference conditioning separately**: If the platform allows, condition on a face crop separately from a full-body reference.

3. **Consistent head angle across sequence**: Faces generated from similar angles (all three-quarter, or all front-facing) are more consistent than faces with mixed angles.

4. **Avoid extreme expressions in the reference**: The reference image should have a neutral or near-neutral expression — extreme expressions in the reference bias the model toward that expression.

5. **Magnific face enhancement**: After generating each image in a sequence, run Magnific face enhancement to correct anatomical distortions and restore detail. Apply consistently to all images to maintain parity.
