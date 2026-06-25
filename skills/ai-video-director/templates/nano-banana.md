# Template — Nano Banana

Nano Banana is an experimental AI video platform specializing in stylized, abstract, and motion-graphic content. It produces results that other models cannot — particle systems, morphing geometry, surreal transformations, and loop-optimized animations. Use it when photorealism is not the goal.

---

## Model Characteristics

- **Strengths**: Abstract visual art, particle systems, morphing transitions, loop-friendly animation, stylized aesthetics, experimental formats
- **Weaknesses**: Photorealistic humans, precise camera control, complex multi-element narrative scenes
- **Prompt style**: Short, evocative, and sensory — under 50 words for most use cases
- **Negative prompts**: Not supported
- **Duration**: 3s, 6s
- **Loop optimization**: Strong; outputs often designed to seamlessly loop

---

## Prompt Template

```
[VISUAL SUBJECT / ABSTRACT CONCEPT]. [PRIMARY MOTION]. [COLOR AND LIGHT QUALITY]. 
[TEXTURE AND MATERIAL]. [ATMOSPHERE OR FEELING].
```

**Example**:
```
Thousands of luminous gold particles drift upward through dark space, 
slowly converging into a pulsing sphere. Warm amber glow, trailing light threads.
```

---

## Parameters Reference

```yaml
model: nano-banana
duration: 6          # Options: 3 | 6
aspect_ratio: "16:9" # Options: 16:9 | 9:16 | 1:1
loop: true           # Request loop-optimized output where supported
seed: null
```

---

## Prompt Length Guide

**Rule of thumb**: Say what it is, what it does, and what it looks like. Stop there.

| Scenario | Target Length | Example |
|---|---|---|
| Pure abstract | 15–25 words | "Liquid mercury morphs between geometric shapes, reflective surface catching shifting light." |
| Particle system | 20–35 words | "Blue-white particles swirl in a double helix pattern, glowing brighter at the center, fading at the edges." |
| Morphing concept | 25–40 words | "A crystal grows from a single point, branching outward in fractal patterns. Cool blue light refracts through its facets." |
| Styled environment | 30–50 words | "A neon-lit underwater world where glowing jellyfish drift upward past ink-dark water. Bioluminescent trails hang behind them." |

---

## Visual Categories and Prompt Recipes

### Particle Systems

Nano Banana's particle engine is best-in-class. Use these patterns:

```
[NUMBER OR SCALE DESCRIPTOR] [PARTICLE TYPE] [MOTION VERB + DIRECTION/PATTERN]. 
[LIGHT QUALITY]. [COLOR PALETTE]. [ATMOSPHERIC DESCRIPTOR].
```

**Examples**:
```
Millions of glowing white particles swirl into a vortex, forming a figure-eight. 
Trailing light threads. Deep space black background.
```

```
Scattered embers drift upward from an unseen source, cooling from amber to grey 
as they rise. Warm fire glow from below.
```

```
Blue crystal particles fall like slow snow, accumulating and dissolving on an 
invisible surface. Soft iridescent sheen.
```

---

### Morphing / Transformation

Nano Banana handles object morphing naturally. Describe the start state, the transition quality, and the end state:

```
[OBJECT A] slowly transforms into [OBJECT B]. 
[TRANSITION QUALITY — fluid, crystalline, dissolving, shattering, growing]. 
[COLOR AND LIGHT DURING TRANSFORMATION].
```

**Examples**:
```
A rose slowly unfolds its petals, then dissolves into butterflies that scatter outward. 
Warm golden light throughout.
```

```
A human skull morphs into a city skyline, buildings growing from the bone structure. 
Dark, cool blue tones. Slow and deliberate transformation.
```

```
The word "DREAM" written in light dissolves into a galaxy of stars. 
Soft violet and white glow. Ethereal.
```

---

### Abstract Geometry

```
[GEOMETRIC FORMS] [MOTION QUALITY]. [LIGHT INTERACTION]. 
[COLOR PALETTE]. [DEPTH AND DIMENSION].
```

**Examples**:
```
Interlocking octahedrons rotate slowly in three-dimensional space, 
casting wireframe shadows. White light on black void. Meditative.
```

```
Hundreds of transparent cubes stack and collapse in rhythmic patterns, 
catching prismatic light. Monochrome with rainbow refractions.
```

---

### Organic / Flowing

```
[ORGANIC MATERIAL] [MOTION — flowing, pulsing, blooming, unraveling]. 
[TEXTURE QUALITY]. [COLOR AND LIGHT]. [SCALE IMPRESSION].
```

**Examples**:
```
Ink blooms outward through water in slow motion, branching in fractal patterns. 
Deep indigo on pale gold. Macro scale.
```

```
Roots grow and branch in real time, fractal expansion across dark earth. 
Time-lapse growth quality. Cool green bioluminescent glow.
```

---

### Loop-Optimized Content

For social media, digital installations, or background video:

```
[VISUAL SUBJECT] [CYCLICAL OR CONTINUOUS MOTION]. 
[QUALITY that implies seamless repeat]. [PALETTE].
```

**Avoid**: Describing a start or end state — this implies a non-loop. Describe continuous or cyclical motion.

**Examples**:
```
Waves of liquid light pulse outward from center in concentric rings, endlessly. 
Electric blue on deep black.
```

```
A clock made of sand grains continuously forms and dissolves, face visible 
then erased in repeating cycle. Warm sepia tones.
```

---

## Texture and Material Vocabulary

These material descriptors produce strong results in Nano Banana:

| Category | Triggers |
|---|---|
| Light-based | luminous, glowing, radiant, bioluminescent, iridescent, phosphorescent, incandescent |
| Surface quality | crystalline, metallic, liquid, molten, translucent, reflective, matte, refractive |
| Movement quality | flowing, drifting, pulsing, orbiting, cascading, blooming, dissolving, crystallizing |
| Texture | gossamer, granular, fibrous, smooth, faceted, cellular, woven |
| Scale | microscopic, macro, vast, infinite, intimate, monumental |

---

## Color Palette Recipes

Short, specific palette descriptions work best:

| Mood | Palette Description |
|---|---|
| Cosmic / Space | "deep indigo void, white particle light, cold blue nebula haze" |
| Golden / Warm | "amber, gold, warm white — like firelight in dark space" |
| Neon / Electric | "electric blue, neon magenta, white core glow on black" |
| Natural / Organic | "emerald green, root brown, pale golden morning light" |
| Monochrome | "pure white forms on absolute black, hard shadow geometry" |
| Pastel / Ethereal | "soft lavender, pale mint, cloud white — dreamy and weightless" |
| Fire / Volcanic | "deep orange, blood red, white hot core, black smoke" |

---

## Common Use Cases

### Social Media Loop (9:16)
```
[3s loop]. [Abstract pattern with continuous motion]. 
[Bold palette]. [Hypnotic or satisfying quality].
```

### Brand Motion Graphic (16:9)
```
[Brand color palette] [geometric or particle system] 
[flows/forms/reveals] in smooth motion. Premium and clean.
```

### Title Card Background
```
Subtle [moving texture or pattern] in [muted or dark palette]. 
Slow, low-energy motion. Designed to be seen beneath white text.
```

### Digital Art Installation
```
[Surreal visual concept]. [Extended duration loop]. 
[Immersive quality]. [Scale suggests the viewer is small].
```

---

## Iteration Strategy

**Test short first**: Generate at 3s to evaluate the visual concept. Only extend to 6s once the concept is confirmed.

**If results are too literal**: Shorten the prompt by half. Nano Banana interprets shorter prompts with more creative freedom.

**If results are too abstract**: Add one more specific detail about the primary visual element (its color, its shape, its scale).

**For loops**: Generate multiple seeds and test each for seamlessness before selecting the final clip.

**Layer with other models**: Use Nano Banana for abstract background or motion graphic layers, then composite with character work from Higgsfield or Seedance using post-production tools.
