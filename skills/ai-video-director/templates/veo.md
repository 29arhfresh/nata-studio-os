# Template — Google Veo (Veo 3)

Google Veo 3 is a state-of-the-art video generation model from DeepMind. It produces cinematic, physically realistic video with strong environmental coherence and — uniquely — synchronized audio generation. Best for long-form narrative content, nature and environmental subjects, and physics-heavy scenes.

---

## Model Characteristics

- **Strengths**: Physical simulation (water, fire, cloth, hair), long-form coherence, environmental detail, audio generation
- **Weaknesses**: Close-up faces can drift toward uncanny; complex multi-character interaction requires careful prompting
- **Prompt weighting**: Processes full prompt context well; longer prompts outperform short ones
- **Negative prompts**: Fully supported and strongly recommended
- **Duration**: Up to 60s in principle; generate in 8–16s segments for best quality
- **Unique capability**: Generates synchronized ambient sound, dialogue, and music (Veo 3)

---

## Prompt Template

```
[SHOT DESCRIPTION]. [SUBJECT + ACTION]. [ENVIRONMENT DETAILS]. [LIGHTING CONDITIONS]. 
[ATMOSPHERIC QUALITIES]. [CAMERA BEHAVIOR]. [MOTION CHARACTERISTICS]. [TECHNICAL STYLE].
```

**Example**:
```
A wide establishing shot filmed as if on a 35mm anamorphic lens. A lone lighthouse keeper 
walks along a rocky coastal path at dusk, her yellow oilskin jacket catching the last 
orange light before the storm. Waves crash against the granite rocks below, spray catching 
the wind. Heavy clouds with violet undersides roll in from the northwest. The camera holds 
on a static wide as she disappears around a rock formation. The image has the tonal depth 
of a Terrence Malick film — naturalistic, contemplative, wide dynamic range.
```

**Negative prompt**:
```
blurry, overexposed, watermark, text overlay, CGI, animated, cartoon, low resolution, 
jittery motion, temporal artifacts, duplicate subject
```

---

## Parameters Reference

```yaml
model: veo-3
duration: 8          # Seconds; 8–16s for optimal quality
aspect_ratio: "16:9" # Options: 16:9 | 9:16 | 4:3 | 1:1
negative_prompt: ""  # Always populate this
seed: null
temperature: 0.7     # Lower = more predictable; higher = more creative
audio: true          # Veo 3 audio generation (ambient, dialogue, music)
```

---

## Lens Language

Veo responds well to mm-equivalent lens descriptions:

| Lens | Feel | Use Case |
|---|---|---|
| 10–18mm equivalent | Ultra-wide, distorted edges, vast environments | Establishing shots, landscapes, architecture |
| 24–28mm equivalent | Wide, natural perspective, slight edge pull | Documentary, street, journalism |
| 35mm equivalent | Natural human eye feel, slight intimacy | Lifestyle, drama, conversation |
| 50mm equivalent | Neutral compression, no distortion | Product, balanced portraiture |
| 85mm equivalent | Soft background separation, flattering compression | Portrait, character close-up |
| 135–200mm equivalent | Heavy compression, subject isolation, background blur | Wildlife, sports, telephoto drama |
| Anamorphic | Horizontal lens flare, oval bokeh, cinemascope feel | Cinematic drama, science fiction |
| Macro | Extreme detail, millimeter focus plane | Texture, insect/nature close-up |

---

## Physics-Heavy Content Prompts

Veo 3 excels at simulating physical phenomena. Use these recipes:

### Water
```
[WATER TYPE] moves [MOTION QUALITY] across/through/around [SURFACE]. 
The water catches [LIGHT DESCRIPTION] and [SPECIFIC WATER BEHAVIOR 
— splash, ripple, cascade, flow, drip].
```

### Fire
```
[FIRE SIZE] burns [QUALITY — steady, flickering, intense] on [FUEL SOURCE]. 
[LIGHT CAST BY FIRE] illuminates [NEARBY ELEMENTS]. 
[SMOKE BEHAVIOR] rises [DIRECTION AND SPEED].
```

### Fabric / Cloth
```
[FABRIC DESCRIPTION — weight, texture, material] [MOTION TRIGGER — wind catches it, 
it settles, it billows]. The fabric moves with [WEIGHT QUALITY — light and ethereal | 
heavy and deliberate | rapid and reactive].
```

### Weather
```
[WEATHER CONDITION] creates [VISUAL EFFECT]. [SPECIFIC DETAIL — 
raindrops hit surface X, snow accumulates on Y, fog obscures Z]. 
The atmosphere feels [EMOTIONAL QUALITY].
```

---

## Audio Generation (Veo 3 Exclusive)

Veo 3 generates synchronized audio. Specify in the prompt:

### Ambient Sound
```
...[visual prompt]. The audio is natural ambient sound — [SPECIFIC SOUNDS: 
ocean waves, wind through trees, distant traffic, café noise]. No music.
```

### Dialogue
```
...[visual prompt]. A [GENDER/AGE DESCRIPTION] voice says: "[DIALOGUE LINE]" 
with a [ACCENT/TONE] delivery. Background ambience: [SETTING SOUNDS].
```

### Music
```
...[visual prompt]. Score: [MUSICAL STYLE — melancholic piano, epic orchestral, 
lo-fi acoustic guitar] that builds from [QUALITY AT START] to [QUALITY AT END].
```

### Sound Design
```
...[visual prompt]. Sound design: the [ACTION] produces [SPECIFIC SOUND DESCRIPTION]. 
[ADDITIONAL LAYERS]. Overall audio has [MIX QUALITY — clean and present, distant and reverberant].
```

---

## Cinematic Style References

Veo responds well to director and cinematographer style references:

| Reference | Visual Result |
|---|---|
| "Roger Deakins cinematography" | Motivated practical lighting, warm and cool contrast, naturalistic |
| "Emmanuel Lubezki style" | Long takes, natural light, wide lenses, intimate |
| "Gordon Willis style" | Low-key, chiaroscuro, dark and deliberate |
| "Christopher Doyle style" | Saturated, handheld, impressionistic |
| "Terrence Malick film" | Golden hour, nature-forward, lyrical camera |
| "Wong Kar-wai aesthetic" | Saturated neon, motion blur, romantic melancholy |
| "Kubrick symmetry" | Centered compositions, long corridors, unsettling balance |

---

## Negative Prompt Recipes

### Commercial/Brand
```
blurry, overexposed, lens distortion, watermark, text overlay, low quality, 
pixelated, bad composition, amateur, stock footage feel
```

### Human Subject
```
distorted face, extra limbs, bad anatomy, missing fingers, duplicate faces, 
uncanny valley, wax-like skin, plastic appearance, dead eyes
```

### Nature/Environmental
```
CGI environment, fake-looking, game engine graphics, flat lighting, 
artificial shadows, video game texture quality
```

### Cinematic
```
TV quality, soap opera look, over-sharpened, digital noise, video compression 
artifacts, flat colors, no depth of field
```

---

## Multi-Shot Coherence Strategy

For Veo 3 multi-shot sequences:

1. **Write a scene anchor** — a paragraph that defines the environment, time of day, lighting, and palette. Paste this into every shot prompt.

2. **Chain with storyboard prompting** — describe where the previous shot ended and where this shot begins.

3. **Use consistent lens descriptions** — if shot 1 is "35mm anamorphic," keep that across the scene.

4. **Match duration to pacing** — action scenes: 4–6s clips; dialogue/contemplative scenes: 8–12s clips.

---

## Iteration Strategy

**First pass**: Full prompt with target duration. Evaluate composition and physics accuracy.

**If environment looks wrong**: Elaborate on environmental details — Veo responds to specificity.

**If motion is incorrect**: Add explicit motion direction for each moving element.

**If audio is off**: Move audio specification to the end of the prompt; use more specific descriptors.

**Once satisfied with composition**: Generate 2–3 seeds and select the strongest audio+visual combination.
