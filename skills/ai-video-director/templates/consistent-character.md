# Template — Consistent Character

This template provides a system for maintaining visual character consistency across multiple AI video generations, regardless of which model you're using. Inconsistent characters are the single most common failure in multi-shot AI video production.

---

## Why Characters Drift

AI video models don't have persistent memory. Each generation is independent. Without deliberate consistency engineering, the same "character" will look noticeably different between shots — different hair, different skin tone, different proportions.

Consistency is achieved through three mechanisms:

1. **Character seed description** — A precise, repeatable written anchor
2. **Reference images** — Visual anchors (available on Higgsfield, Kling, Veo)
3. **Seed locking** — Using the same generation seed for related shots

---

## Step 1: Write the Character Seed

A character seed is a single, standardized paragraph that describes one character. You paste this verbatim at the start of every prompt where the character appears.

### Character Seed Template

```
[CHARACTER IDENTIFIER]: [AGE RANGE]-year-old [GENDER PRESENTATION]. 
Skin: [TONE AND TEXTURE]. 
Hair: [COLOR], [LENGTH], [STYLE], [TEXTURE]. 
Eyes: [COLOR], [SHAPE]. 
Build: [BODY TYPE AND HEIGHT IMPRESSION]. 
Distinctive features: [NOTABLE PHYSICAL DETAILS]. 
Wearing: [GARMENT 1 — color, style, fit], [GARMENT 2], [ACCESSORIES].
```

### Example Character Seeds

**Lead character — young professional woman**:
```
MAYA: 28-year-old woman. Skin: warm deep brown, clear and even-toned. 
Hair: natural black coils, shoulder-length, loose. Eyes: dark brown, slightly wide-set, 
expressive. Build: slim, average height. Distinctive features: small gap between front teeth, 
sharp cheekbones. Wearing: oversized cream linen blazer, white fitted tee underneath, 
straight-leg dark jeans, white sneakers.
```

**Supporting character — older male scientist**:
```
DR. CHEN: 62-year-old man. Skin: light warm tan, deep forehead lines, laugh lines visible. 
Hair: silver-white, short and neat, slight widow's peak. Eyes: dark grey, rimmed glasses, 
squinting slightly from habit. Build: slightly stocky, medium height. Distinctive features: 
full grey beard trimmed close, large hands. Wearing: white lab coat over a blue chambray 
shirt, navy trousers, black rubber-soled shoes.
```

---

## Step 2: Choose Your Consistency Method

### Method A: Prompt-Only (All Models)

**Best for**: Quick work, models without reference image support, when no real person photo is available.

**How it works**: Paste the character seed at the start of every prompt. Use the same seed number across generations.

**Limitation**: Still produces variation between generations; good for adjacent shots, not long sequences.

**Prompt structure**:
```
[CHARACTER SEED]. [SHOT DESCRIPTION]. [ACTION]. [ENVIRONMENT]. [LIGHTING].
```

---

### Method B: Reference Image + Seed Description (Higgsfield, Kling, Veo)

**Best for**: Hero characters in commercial or narrative work, any production requiring high visual fidelity.

**How it works**: Upload a reference image of the character (real person, generated still, or composited reference) alongside the character seed. The model anchors to the image.

**Reference image requirements**:
- Clear, well-lit face (front or 3/4 angle)
- Minimum 1024×1024 pixels
- Wearing wardrobe consistent with the scene (or match wardrobe in prompt)
- Expression: neutral or slight smile (avoid extreme expressions)
- Clean background (easier for model to isolate the face)

**Prompt structure**:
```
[CHARACTER SEED — matches the reference image]. 
[SHOT DESCRIPTION]. [ACTION]. [ENVIRONMENT]. [LIGHTING].
```

**Platform specifics**:
- **Higgsfield**: Pass reference image as `reference_image` parameter
- **Kling**: Upload as source image in image-to-video mode, then describe motion
- **Veo**: Include as image conditioning input

---

### Method C: Seed Locking (All Models)

**How it works**: Once you generate a version of the character that you like, note the seed number. Use that seed for all subsequent shots from the same scene.

**Limitation**: Seed locking only helps within the same model and with similar prompts. Changing the environment or action significantly can still cause drift.

**Best practice**: Combine seed locking with Method A or B for maximum consistency.

---

## Step 3: Build the Shot Sequence

### Shot List Template for Character Sequence

```
CHARACTER: [CHARACTER NAME]
REFERENCE IMAGE: [file path or URL]
CHARACTER SEED: [paste character seed text]
SCENE ENVIRONMENT: [paste environment anchor text]
CONSISTENCY METHOD: [A | B | C | A+C | B+C]

SHOT 01 — [SHOT TYPE] — [CAMERA PRESET]
Prompt: [CHARACTER SEED]. [SHOT DESCRIPTION]. [ACTION]. [SCENE ENVIRONMENT]. [LIGHTING].

SHOT 02 — [SHOT TYPE] — [CAMERA PRESET]
Prompt: [CHARACTER SEED]. [SHOT DESCRIPTION]. [ACTION]. [SCENE ENVIRONMENT]. [LIGHTING].

[Continue for each shot]
```

---

## Character Appearance Change Management

When the character must change appearance within a story (different outfit, different time of day, etc.):

### Outfit Change
Create a new character seed for the new outfit. Archive the original. Mark clearly in the shot list which seed applies to which shots.

```
MAYA_OUTFIT_A: [...casual wardrobe description...]
MAYA_OUTFIT_B: [...formal wardrobe description...]
```

### Time Jump / Aging
If the character ages within the story, write a second seed that describes the aged version:
```
MAYA_YOUNG: [early 20s description]
MAYA_OLDER: [same character, 15 years later — same eyes, same gap in teeth, 
hair now shorter and greying at temples, expression more settled and assured]
```

### Emotion and Expression
Do NOT change the character seed for emotional states. Describe the emotion in the action section of the prompt, not in the character seed:

```
// Correct:
[CHARACTER SEED]. She sits alone, tears forming at the edges of her eyes, 
looking at a photograph. [ENVIRONMENT]. [LIGHTING].

// Wrong (modifies seed):
[CHARACTER SEED — but describe "tearful, red-eyed"]. 
```

---

## Evaluating Consistency

After generating each shot in a sequence, check:

| Feature | Check |
|---|---|
| Skin tone | Matches across all shots? |
| Hair | Color, length, style consistent? |
| Wardrobe | Same garments, colors, fit? |
| Facial structure | Same jawline, nose shape, eye placement? |
| Age appearance | No sudden age variation? |
| Distinctive features | Gap in teeth, glasses, birthmark — present? |

---

## Consistency Recovery

If a shot doesn't match the rest of the sequence:

1. **Re-generate with a higher cfg_scale** (if supported) — forces stricter prompt adherence
2. **Strengthen the character seed** — add two or three more specific descriptors
3. **Add a consistency closing line**: "This character's appearance is identical to the established reference."
4. **Try a different seed** — sometimes the random initialization produces a closer match
5. **Use Higgsfield** — if you're on another model and consistency is failing critically, switch to Higgsfield + reference image for character shots
6. **Color correct in post** — minor skin tone variations across shots can be unified in DaVinci Resolve or similar

---

## Multi-Character Sequences

When two or more characters appear in the same shot:

- Include **both character seeds** at the start of the prompt, separated clearly
- Label which character does what: "CHARACTER A (Maya) turns to face CHARACTER B (Dr. Chen)"
- Use spatial language: "Maya is on the left of frame, Dr. Chen on the right"
- Generate single-character close-ups separately and intercut with two-shots
- Reference images for both characters are strongly recommended on Higgsfield

```
MAYA: [seed]. DR. CHEN: [seed]. 
Medium two-shot. Maya stands on the left, arms crossed, skeptical. 
Dr. Chen stands on the right, holding up a tablet screen toward her, urgent. 
[ENVIRONMENT]. [LIGHTING].
```
