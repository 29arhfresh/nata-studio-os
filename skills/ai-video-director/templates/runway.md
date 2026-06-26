# Runway — Prompt Template

**Model:** Runway Gen-3 Alpha / Gen-4
**Strengths:** Style control, video-to-video, colour grading, motion brush, creative freedom
**Max Duration:** 16 seconds
**Negative Prompt:** Supported
**Image-to-Video:** Supported
**Video-to-Video:** Supported (Act-One, motion brush)
**Character Seed:** Not supported (use reference images)

---

## Core Prompt Structure

```
[STYLE REFERENCE OR VISUAL LANGUAGE]. [SCENE DESCRIPTION].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [DESCRIPTION — director reference effective here].
[COLOUR GRADE OR FILM STOCK].
```

**Key rule:** Runway responds strongly to cinematographer and director references. Use them.

---

## Style Reference Library

### Director / DP References

| Reference | Visual Language |
|---|---|
| Roger Deakins | Natural practical light, earthy tones, precise shadows |
| Emmanuel Lubezki | Long takes, natural light, wide angle intimacy |
| Wes Anderson | Symmetrical composition, pastel palette, deadpan framing |
| Christopher Doyle | Saturated colour, unconventional angles, urban night |
| Gordon Willis | Low-key, deep shadow, underexposed faces ("The Godfather") |
| Bradford Young | Desaturated, warm, low ambient light, grain |
| Matthew Libatique | High contrast, warm highlights, stylized urban |
| Rodrigo Prieto | Rich saturation, bold colour, emotional warmth |

### Film Stock References

| Stock | Look |
|---|---|
| Kodak Vision3 500T | Cinema standard, warm shadows, rich colour |
| Fujifilm Velvia | Ultra-saturated, punchy, high contrast |
| Kodak Portra 400 | Skin-friendly, muted, gentle contrast |
| Cinestill 800T | Tungsten halation, blooming highlights, night-appropriate |
| Ilford HP5 | Classic black and white, medium grain |
| Kodak Tri-X | High contrast B&W, strong grain, documentary feel |

---

## Camera Language Reference

### Movements
- `static` — stability, authority, formal composition
- `dolly-in` — increasing intimacy, building tension
- `dolly-out` — revelation, isolation, drift
- `pan` — landscape reveal, subject tracking
- `tilt up` — power, scale, aspiration
- `tilt down` — observation, defeat, humility
- `tracking` — kinetic energy, following momentum
- `orbit` — examination, showpiece reveal
- `handheld` — urgency, naturalism, anxiety
- `crane up` — god's eye, scope, liberation
- `motion brush` — selective movement within a static frame (Runway-specific)

### Motion Brush (Runway-specific)

Motion brush defines which parts of the frame move and which remain static. Describe this in the prompt as:

```
Motion brush: [MOVING ELEMENT] moves [DIRECTION/QUALITY]. 
[STATIC ELEMENTS] remain still.
```

**Example:**
```
Motion brush: the woman's hair blows to the right in slow motion.
The background cityscape and her body remain perfectly still.
```

---

## Lighting Templates

### Cinematic Practical Lighting

```
Practical lighting: [SOURCE — lamp, screen, fire, neon], 
[QUALITY — hard/soft], [DIRECTION], [COLOUR TEMPERATURE].
Motivated by [STORY REASON FOR THE LIGHT].
```

### Studio Lighting Setup

```
Three-point lighting: key light [DIRECTION], fill from [DIRECTION], 
rim light from behind [SUBJECT SIDE]. [COLOUR TEMPERATURE]. [QUALITY].
```

### Natural / Location Lighting

```
[TIME OF DAY] natural light. [SKY CONDITION]. 
[COLOUR TEMPERATURE]. [QUALITY OF LIGHT]. 
[SHADOW DIRECTION AND LENGTH].
```

---

## Prompt Templates by Use Case

### Cinematic Style Shot

```
[DIRECTOR/DP REFERENCE] cinematography. [SCENE DESCRIPTION].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [DESCRIPTION].
[FILM STOCK]. [COLOUR GRADE].
```

**Example:**
```
Roger Deakins cinematography. A farmer stands at the edge of a dry wheat field at dusk.
Camera: static, 50mm lens, eye-level.
Lighting: golden hour backlight, long shadow, warm 2800K.
Kodak Vision3 500T. Desaturated highlights, warm shadow fill.
```

### Video-to-Video Style Transfer

```
Restyle this footage in the visual language of [STYLE REFERENCE].
Preserve: [MOTION PATHS, SILHOUETTES, CAMERA MOVEMENT].
Target environment: [DESCRIPTION].
Target colour grade: [GRADE].
Motion strength: [LOW / MEDIUM / HIGH].
```

**Example:**
```
Restyle this footage in the visual language of a 1980s neon noir.
Preserve: all camera movement and character motion paths.
Target environment: rain-soaked city streets, neon reflections.
Target colour grade: deep teal shadows, orange highlights, high contrast.
Motion strength: medium.
```

### Act-One Lip Sync

```
[CHARACTER DESCRIPTION] speaks [SPEAKING STYLE].
Audio: [UPLOAD AUDIO FILE].
Environment: [SIMPLE BACKGROUND].
Lighting: [SOFT FRONTAL — recommended for clarity].
Camera: static, [LENS], eye-level.
```

### Image-to-Video

```
Animate this image: [MOTION DESCRIPTION].
Motion brush: [SPECIFIC MOVING ELEMENTS] move [HOW].
[STATIC ELEMENTS] remain still.
Camera: [SUBTLE MOVEMENT OR STATIC].
Maintain the original lighting and colour grade.
```

---

## Negative Prompt Templates

### General Purpose

```
flickering, temporal artifacts, morphing background, inconsistent lighting, 
motion blur, watermark, text overlay, low resolution, overexposed, clipping
```

### Character Integrity

```
distorted face, morphed features, extra limbs, anatomical errors, 
identity drift, costume change, unnatural skin tone
```

### Style Preservation

```
lens flare, chromatic aberration, film burn, vignette, 
colour cast, desaturated, washed out, oversharpened
```

---

## Colour Grade Language

| Grade | Description | Prompt Language |
|---|---|---|
| Bleach Bypass | High contrast, desaturated, silver tones | "bleach bypass look, low saturation, lifted blacks" |
| Teal and Orange | Complementary grade, warm skin, teal shadows | "teal shadows, warm orange highlights, skin-friendly grade" |
| Day for Night | Day footage processed as night | "dark exposure, blue moonlight, deep shadows" |
| Cross Process | Unpredictable colour shifts, high saturation | "cross-processed colour, magenta shadows, cyan highlights" |
| Film Noir | Deep B&W, hard shadows, high contrast | "monochrome, high contrast, hard directional light, deep black shadows" |
| Warm Vintage | Muted, lifted blacks, warm cast | "warm vintage grade, lifted shadows, golden tones, soft vignette" |

---

## Best Practices

1. **Use director references.** "Roger Deakins lighting" activates a learned visual style instantly.
2. **Specify film stock.** Stock references carry colour, grain, and contrast information.
3. **Use motion brush for precision.** When you want selective movement, describe it explicitly.
4. **Negative prompts matter.** Runway honours negative prompts — use them to prevent flickering and artifacts.
5. **Style consistency.** Include the colour grade in every shot of a sequence.
6. **Video-to-video motion strength.** Start at medium; low preserves more source structure, high gives more creative freedom.
7. **Gen-4 prefers longer descriptions.** More context = better coherence across the clip.

---

## Common Failures

| Failure | Likely Cause | Fix |
|---|---|---|
| Flickering | High motion area without temporal smoothing | Add "smooth, stable" to negative prompt |
| Style drift mid-clip | No style anchor | Add film stock and colour grade to every shot |
| Wrong style transfer | Motion strength too high | Lower motion strength to preserve source structure |
| Character morphing | No reference image | Use reference image for character consistency |
| Overexposed highlights | No exposure control | Add "correctly exposed, no clipping" and adjust settings |
| Unintended motion | Motion brush not specified | Explicit motion brush description in prompt |
