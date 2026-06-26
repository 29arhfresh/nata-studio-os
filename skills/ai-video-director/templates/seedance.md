# Seedance 2 — Prompt Template

**Model:** Seedance 2
**Strengths:** Physics accuracy, realistic motion, fast generation, strong prompt adherence
**Max Duration:** 10 seconds
**Negative Prompt:** Not supported
**Image-to-Video:** Supported
**Video-to-Video:** Not supported
**Character Seed:** Not supported

---

## Core Prompt Structure

```
[ACTION VERB + SUBJECT]. [ENVIRONMENT AND CONTEXT].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [QUALITY], [DIRECTION], [COLOUR TEMPERATURE].
[STYLE — optional].
```

**Key rule:** Lead with a strong action verb. Seedance 2 is physics-forward — verbs activate simulation.

---

## Physics Keywords (activate simulation engine)

| Category | Keywords |
|---|---|
| Fluid | water splashes, waves crash, liquid pours, rain falls, mist rises |
| Cloth | fabric billows, cape flows, curtain sways, dress ripples |
| Particle | dust rises, sparks fly, embers drift, snow falls, leaves scatter |
| Rigid body | glass shatters, wood splinters, rocks tumble, car skids |
| Fire | flame flickers, fire spreads, candle burns, explosion erupts |
| Wind | hair blows, trees sway, grass ripples, flags wave |

---

## Camera Language Reference

### Movements
- `dolly-in` — camera moves physically closer to subject (intimacy, tension)
- `dolly-out` — camera pulls away (revelation, isolation)
- `pan left / pan right` — horizontal pivot (tracking, reveal)
- `tilt up / tilt down` — vertical pivot (scale, defeat)
- `tracking shot` — camera follows subject in motion
- `orbit` — camera circles subject (examination, power)
- `static` — no movement (stability, stillness)
- `crane up / crane down` — vertical movement on a vertical axis

### Angles
- `eye-level` — neutral, natural, objective
- `low-angle` — subject appears powerful, heroic, threatening
- `high-angle` — subject appears vulnerable, small, observed
- `bird's-eye` — overhead view, spatial context, scale
- `dutch-angle` — tilted horizon, unease, psychological tension

### Lens Reference
- `14–24mm` — wide, environmental, distortion at edges, dramatic scale
- `35mm` — neutral-wide, documentary feel, natural field of view
- `50mm` — standard, closest to human eye, versatile
- `85mm` — portrait, slight compression, flattering, separated subject
- `135mm` — telephoto, compressed space, background blur
- `200mm+` — surveillance feel, extreme compression, heat shimmer

---

## Lighting Patterns

| Pattern | Description | Best For |
|---|---|---|
| Golden Hour | Warm low sun, long shadows, orange-pink haze | Outdoor drama, landscape |
| Blue Hour | Cool deep blue, purple shadows, soft diffused | Moody exterior, urban |
| Overcast | Soft wrap light, no hard shadows, even tones | Faces, portraits, drama |
| Tungsten Interior | Warm 3200K orange, practical lamps | Indoor scenes, intimacy |
| Hard Sunlight | Harsh shadows, high contrast, bleached highlights | Action, desert, tension |
| Backlight / Silhouette | Subject against bright source, rim highlight | Heroic entrance, mystery |
| Neon Practical | Coloured light from signs, screens, LEDs | Urban night, cyberpunk |
| Overcast Rain | Wet surfaces, reflection, diffused grey light | Drama, melancholy |

---

## Prompt Templates by Use Case

### Action / Physics Shot

```
A [SUBJECT] [STRONG VERB] across [ENVIRONMENT] as [PHYSICAL EFFECT].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [DESCRIPTION].
```

**Example:**
```
A motorcyclist skids to a stop on wet asphalt as sparks fly from the tyres.
Camera: tracking shot, 35mm lens, eye-level.
Lighting: overcast day, wet surface reflections, cool 6500K daylight.
```

### Landscape / Environment

```
[ENVIRONMENT DESCRIPTION] — [TIME OF DAY, WEATHER, ATMOSPHERIC CONDITION].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [DESCRIPTION].
[PHYSICS ELEMENT — wind, water, cloud movement].
```

**Example:**
```
A vast red canyon stretches to the horizon under a storm-lit sky.
Camera: crane up, 24mm lens, low-angle.
Lighting: dramatic storm light, volumetric rays breaking through clouds, 5500K.
Wind: desert dust rises from canyon floor.
```

### Close-Up Detail

```
Extreme close-up: [SUBJECT DETAIL] — [SPECIFIC TEXTURE, MATERIAL, OR ACTION].
Camera: static, [MACRO / TELEPHOTO] lens, eye-level.
Lighting: [CONTROLLED STUDIO DESCRIPTION — quality, direction].
```

**Example:**
```
Extreme close-up: water droplets slide down a polished silver watch face.
Camera: static, 100mm macro lens, eye-level.
Lighting: hard directional light from camera left, specular highlights on metal, 5500K.
```

### Character in Environment

```
[CHARACTER DESCRIPTION] [ACTION] [ENVIRONMENT].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [DESCRIPTION].
```

**Example:**
```
A woman in a red coat walks alone through a snowy forest path, breath visible in cold air.
Camera: tracking shot from behind, 50mm lens, eye-level.
Lighting: overcast winter light, blue-white tones, bare tree silhouettes.
```

---

## Image-to-Video Template (Seedance 2)

```
Animate this scene: [DESCRIBE THE MOTION — what moves, direction, speed].
Maintain [STATIC ELEMENTS — background, lighting].
Camera: [SUBTLE MOVEMENT OR STATIC].
Physics: [SPECIFIC PHYSICAL EFFECT — if applicable].
```

**Example:**
```
Animate this scene: the woman's hair blows gently in the wind, leaves drift from the trees.
Maintain the forest background and overcast lighting.
Camera: static.
```

---

## Negative Prompt

Seedance 2 does not support negative prompts. To push away from unwanted elements, use positive framing:

| Instead of (negative intent) | Write (positive framing) |
|---|---|
| "no blur" | "sharp, in-focus" |
| "no camera shake" | "stable, smooth camera" |
| "no people" | "empty environment, no figures" |
| "not fast" | "slow, deliberate movement" |

---

## Best Practices

1. **Open with action.** Start the prompt with the subject doing something, not just existing.
2. **Be physically specific.** "Water splashes off wet stones" > "a river".
3. **Name the physics.** If you need cloth simulation, write "fabric billows". The model reads these as simulation triggers.
4. **Keep lighting concrete.** Colour temperature + direction + quality.
5. **Avoid abstract modifiers.** "Beautiful", "stunning", "impressive" do not help.
6. **Short prompts work.** Seedance 2 has high prompt adherence — a clean 2-sentence prompt beats a cluttered 5-sentence one.
7. **Test at 5s first.** Verify motion direction before generating full 10s clip.

---

## Common Failures

| Failure | Likely Cause | Fix |
|---|---|---|
| Subject is static | No action verb / physics keyword | Lead with strong verb, add physics trigger |
| Wrong motion direction | Ambiguous direction in prompt | Add compass direction or spatial reference |
| Too much camera shake | "handheld" interpreted as aggressive | Add "subtle handheld" or switch to "static" |
| Wrong time of day | Lighting clause omitted | Always specify time of day and colour temperature |
| Physics effect missing | Trigger keyword absent | Add exact physics keyword from the table above |
