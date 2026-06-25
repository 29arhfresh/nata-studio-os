# Template — Sora (OpenAI)

Sora is OpenAI's world-model video generator. It builds an internal spatial model of the scene, enabling complex multi-element compositions, physically plausible motion, and long-form narrative coherence. Best for complex scenes, fantastical content, and multi-shot storyboarding.

---

## Model Characteristics

- **Strengths**: Complex multi-element scenes, physical plausibility, surreal and fantastical content, environment consistency, multi-shot storyboarding
- **Weaknesses**: Specific character consistency across separate generations (no reference image), text rendering, predictable commercial-style output
- **Prompt weighting**: Processes full context holistically — scene description and atmosphere carry as much weight as action
- **Negative prompts**: Not natively supported; embed "avoid" language within the main prompt
- **Duration**: 5s, 10s, 20s
- **Modes**: Standard, Remix (variation of existing clip), Storyboard (multi-shot narrative)

---

## Prompt Template

```
[SCENE DESCRIPTION — environment + time + atmosphere]. [SUBJECT + ACTION + POSITION]. 
[CAMERA FRAMING + MOVEMENT]. [LIGHTING]. [VISUAL STYLE/FEEL]. 
[MOTION QUALITIES]. Avoid: [EXCLUSIONS].
```

**Example**:
```
A sun-drenched ancient Roman marketplace buzzes with activity at midday. Vendors call out 
from cloth-covered stalls, and crowds of citizens in togas move between them, carrying 
baskets and amphora. The camera floats at eye level, slowly drifting through the crowd as 
a documentary camera might. Harsh midday Mediterranean sun casts short, hard shadows on 
stone paving. Dust particles catch the light in the air. The scene has the lived-in, 
immersive quality of a historical epic. Avoid: modern elements, CGI sheen, empty environment.
```

---

## Parameters Reference

```yaml
model: sora
duration: 10        # Options: 5 | 10 | 20
aspect_ratio: "16:9" # Options: 16:9 | 9:16 | 1:1
resolution: "1080p"  # Options: 480p | 1080p
variation: 50       # Range: 0–100 (0 = faithful to prompt; 100 = creative interpretation)
```

---

## The World-Model Approach

Sora builds a 3D scene model before generating video. This means:

- **Spatial relationships are understood**: Objects in front, behind, and beside each other behave coherently
- **Physics are simulated**: Gravity, collision, fluid dynamics are modeled, not just animated
- **Camera can move freely through the scene**: Not just a 2D crop, but a genuine spatial perspective change

### How to Leverage the World Model

**Describe the world, not just the frame**:
```
// Weak (frame-focused):
"Close-up of a coffee cup with steam rising."

// Strong (world-focused):
"A coffee shop on a rainy morning. Customers sit at wooden tables with fogged windows 
behind them. A full mug of coffee steams gently on a table in the foreground, 
a half-eaten croissant beside it. The barista moves in the background."
```

**Let the camera explore**:
```
"The camera begins above the valley, then descends slowly, passing through a layer 
of morning mist before settling at eye level with a herd of horses grazing at dawn."
```

---

## Storyboard Mode

Sora's storyboard mode allows you to define multiple connected shots that Sora generates as a coherent sequence.

### Storyboard Structure

```
Shot 1:
[Description of shot 1 — what the camera sees, subject action, environment]

Shot 2:
[Description of shot 2 — continuing from shot 1's spatial model]

Shot 3:
[Description of shot 3 — developing the narrative]
```

### Storyboard Best Practices

- Keep the **environment description identical** across shots from the same scene
- Change only **camera position and subject action** between shots
- Use **spatial transitions**: "The camera moves to the left to reveal..." connects shots spatially
- **Do not change** lighting conditions between shots unless a time jump is intended
- **Label subjects consistently**: Call the character "the woman in the red jacket" across all shots

### Example Storyboard

```
Shot 1 (Establishing):
Sunrise over a Moroccan riad courtyard. Tiled fountain in the center, orange trees around 
the perimeter. No people. Camera holds wide and static, revealing the space in soft morning light.

Shot 2 (Introduction):
Same Moroccan riad courtyard at sunrise. A woman in white linen emerges from an arched 
doorway at the far end and walks slowly toward the fountain. Camera holds static at medium 
wide as she crosses the courtyard.

Shot 3 (Intimate moment):
Same riad courtyard. The woman sits at the edge of the fountain, trailing her fingers 
in the water. Camera slowly pushes in to a medium close-up of her face, eyes closed, 
listening to the water. Warm dawn light on her face.
```

---

## Style References That Work in Sora

Sora responds well to director, cinematographer, and aesthetic references:

| Style Reference | Visual Character |
|---|---|
| "Wes Anderson symmetry and palette" | Centered frames, pastel colors, deadpan staging |
| "Wong Kar-wai" | Neon blur, slow motion, romantic melancholy, Hong Kong nights |
| "Roger Deakins cinematography" | Natural light, warm/cool contrast, patient camera |
| "Terrence Malick golden hour" | Handheld, nature-forward, lyrical, magic hour light |
| "Kubrickian symmetry" | Axial composition, tracking shots, cold precision |
| "Blade Runner 2049 aesthetic" | Vast empty spaces, orange dust, cold blue indoors |
| "A24 film aesthetic" | Grainy 16mm feel, intimate, naturalistic performances |
| "David Fincher style" | Clean dark frames, motivated practical light, controlled |

---

## Embedding Negative Instructions

Sora does not accept a separate negative prompt field. Instead, embed exclusions at the end of your main prompt:

```
...[main prompt]. Avoid: [list of exclusions].
```

**Common exclusion phrases**:
```
Avoid: watermarks, text overlays, low quality, blurry footage, camera shake, 
bad anatomy, CGI sheen, oversaturated colors, duplicate subjects.
```

For stronger exclusion, phrase it positively:
```
"The footage is sharp, well-exposed, anatomically correct, and cinematic in quality."
```

---

## Content Type Recipes

### Epic Landscape
```
[TIME OF DAY] over [ENVIRONMENT TYPE]. [SPECIFIC GEOGRAPHY DETAILS]. 
[WEATHER AND ATMOSPHERE]. [MOVEMENT IN THE SCENE]. Camera [MOVEMENT DESCRIPTION]. 
The scale is overwhelming — a reminder of nature's indifference. [STYLE REFERENCE].
```

### Fantasy / Surreal
```
In a world where [UNUSUAL PREMISE], a [SUBJECT] [ACTION]. [IMPOSSIBLE ELEMENTS] 
exist alongside [ORDINARY ELEMENTS] as if natural. The lighting is [QUALITY], 
creating [EMOTIONAL FEEL]. Camera [MOVEMENT]. Avoid: cheap CGI, obvious visual effects.
```

### Urban Crowd / Event
```
[LOCATION AND TIME]. A crowd of [NUMBER] people [COLLECTIVE ACTION]. 
[SPECIFIC DETAILS — clothing era, activity, emotion]. 
The camera [MOVEMENT] at [HEIGHT], capturing the energy of [EVENT].
```

### Abstract / Conceptual
```
[ABSTRACT CONCEPT] visualized as [VISUAL METAPHOR]. [COLOR AND LIGHT DESCRIPTION]. 
[MOTION AND TRANSFORMATION]. The feeling is [EMOTIONAL QUALITY]. No literal people — 
only [ABSTRACT ELEMENTS]. Camera [MOVEMENT]. [ARTISTIC STYLE].
```

---

## Remix Mode

Sora Remix mode generates variations of an existing clip while preserving spatial structure.

### Remix Workflow
1. Generate a base clip with your primary prompt
2. Select the best result as the "base"
3. Write a variation prompt describing what to change
4. Set variation slider (0 = minor change; 100 = major reinterpretation)

### Variation Prompt Examples

**Change style while keeping composition**:
```
Same scene, but reimagined as a watercolor painting come to life. Painted texture visible throughout.
```

**Change time of day while keeping layout**:
```
Same environment, but at midnight. Moonlight and artificial street light replace the daytime sun.
```

**Change atmosphere while keeping action**:
```
Same scene, but during a rainstorm. Everything is wet, rain falls visibly, puddles reflect the lights.
```

---

## Iteration Strategy

**For complex scenes**: Start at 5s to test spatial composition. The world model builds faster at shorter durations.

**For narrative coherence**: Use Storyboard mode instead of separate prompts — it maintains the spatial model across shots.

**For unexpected results**: Increase the variation slider — sometimes Sora's creative interpretation is more interesting than a literal prompt.

**For specific control**: Lower variation slider to 10–20 and be very precise in the prompt. Sora will stay closer to the instruction.
