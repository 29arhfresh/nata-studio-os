# Template — Cinematic Scene

A cinematic scene template for generating high-production-value video that reads as "film" rather than "content." This covers the full grammar of cinematic composition — from establishing shots to intimate close-ups — with attention to the visual language of professional film production.

---

## What Makes Something "Cinematic"

Cinematic video is defined by:

1. **Motivated camera movement** — the camera moves with purpose, not randomly
2. **Depth and dimension** — foreground, midground, background are all used
3. **Light that tells a story** — lighting direction and quality have emotional meaning
4. **Shot progression** — shots build on each other to create meaning through editing
5. **Negative space** — what's NOT in the frame matters as much as what is
6. **Pacing** — the duration of each shot matches its emotional weight
7. **Aspect ratio** — widescreen (2.39:1 or 2.35:1) strongly implies cinema

---

## Aspect Ratio Guide

| Ratio | Name | Feel |
|---|---|---|
| 1.33:1 (4:3) | Academy | Classic, old-film, intimate, square |
| 1.78:1 (16:9) | HDTV | Standard, television, familiar |
| 1.85:1 | Flat | Most theatrical films, slightly wide |
| 2.39:1 | Scope / Anamorphic | Epic, cinematic, widescreen spectacle |
| 2.76:1 | Ultra Panavision | IMAX-style, overwhelming scale |
| 0.56:1 (9:16) | Vertical | Social/mobile, portrait orientation |

For maximum cinematic impact, use **2.39:1** and specify **"anamorphic lens"** in the prompt.

---

## Shot Grammar Sequence

A cinematic scene typically follows this shot progression:

### The Classic Three-Shot Narrative Arc

```
Shot 1 — Establish the world
Shot 2 — Introduce the subject within the world
Shot 3 — Connect the subject to their emotional state
```

### Shot 1: Establishing Shot

**Purpose**: Orients the viewer spatially. Answers "where are we?"

**Template**:
```
Extreme wide shot. [TIME OF DAY] in [ENVIRONMENT — specific, geographic]. 
[ATMOSPHERIC CONDITIONS — weather, quality of light, season]. 
[HUMAN PRESENCE — absent, small in frame, distant]. 
Camera [MOVEMENT — slow drift, static hold, aerial descent]. 
[VISUAL SCALE REFERENCE — something that shows how vast or intimate the space is]. 
[EMOTIONAL FEELING THE SPACE EVOKES].
```

**Example**:
```
Extreme wide shot, 2.39:1 anamorphic. Late afternoon in a Sicilian hilltop village. 
Golden light rakes across terracotta rooftops, long shadows falling east. 
A lone figure is barely visible walking a cobblestone lane. Camera holds static 
on a high vantage point, looking down across the village to the sea beyond. 
The scale makes the figure feel solitary and small. Nostalgic, timeless.
```

---

### Shot 2: Subject Introduction

**Purpose**: Shows the protagonist in their environment. Answers "who is in this world?"

**Template**:
```
[SHOT SIZE — WS to MS]. [CHARACTER SEED IF APPLICABLE]. [ACTION/MOVEMENT]. 
[RELATIONSHIP TO ENVIRONMENT — moving through it, observing it, belonging to it]. 
[CAMERA MOVEMENT — follow, push in, orbit]. 
[SAME ENVIRONMENT ANCHOR AS ESTABLISHING SHOT]. [SAME LIGHTING CONDITIONS].
```

**Example**:
```
Medium wide shot. A woman in her 60s with silver hair and a black linen dress 
walks slowly down the same cobblestone lane, her hand trailing along a stone wall. 
She pauses at a doorway, looking at something out of frame. Camera very slowly pushes in 
from behind her. Warm late-afternoon light from the west. The village is quiet.
```

---

### Shot 3: Emotional Close-Up

**Purpose**: Reveals inner state. Answers "what is she feeling?"

**Template**:
```
[MCU or CU]. [CHARACTER SEED]. [SPECIFIC EXPRESSION OR MICRO-ACTION — not general emotion]. 
[WHAT THEY LOOK AT — POV implied or stated]. 
Camera [STATIC or BARELY PERCEPTIBLE PUSH IN]. 
[SAME LIGHTING — must be consistent]. [EMOTIONAL ATMOSPHERE].
```

**Example**:
```
Medium close-up. The woman's face in three-quarter profile. She looks at something 
just off-frame right with an expression that cycles from recognition to something 
like grief, then softens. Her eyes glisten slightly. Camera holds completely still. 
Warm side light from the afternoon sun, a shadow crossing the right side of her face. 
The moment is private, like we shouldn't be watching.
```

---

## Lighting Grammar

### Hard vs. Soft Light

| Light Quality | How to Write It | Emotional Feel |
|---|---|---|
| Hard (direct) | "hard directional sun, sharp shadows" | Drama, tension, clarity, harshness |
| Soft (diffused) | "overcast diffused light, minimal shadows" | Calm, safe, documentary, gentle |
| Mixed | "direct key, soft fill" | Natural, three-dimensional, professional |

### Light Direction Meanings

| Direction | Camera Perspective | Emotional Implication |
|---|---|---|
| Front lit | Light behind camera | Safe, exposed, nothing hidden |
| Side lit (45°) | Classic key light | Dimensional, professional, neutral |
| Hard side | Light at 90° to camera | Division, conflict, dramatic |
| Backlit / Rim | Light behind subject | Mystery, beauty, separation, spiritual |
| Top lit | Light from above | Power, divine, menacing |
| Under lit | Light from below | Unnatural, horror, revelation |

### Time of Day as Lighting Direction

```
Golden hour (30 min after sunrise / before sunset):
"Warm 2700K backlight from [west/east], long horizontal shadows, 
golden lens flare, sky gradient from orange at horizon to blue overhead."

Blue hour (30 min before sunrise / after sunset):
"Cool 4000K ambient light from the open sky. No direct sun. 
Deep blue shadows, soft overall illumination, artificial lights beginning to show."

Midday:
"Hard overhead sun, short shadows falling directly below subjects, 
high contrast between lit surfaces and shadow areas, sky bright overhead."

Overcast:
"Fully diffused soft light from overhead, no directional shadow, 
even illumination across all surfaces, muted shadows."

Night exterior:
"Dark ambient, practical light sources visible — streetlights, window glow, 
signs. Deep shadows. Subjects lit primarily by practical sources in frame."
```

---

## Camera Movement Grammar

### What Each Movement Communicates

| Movement | Emotional Effect | Best Use |
|---|---|---|
| Static lock-off | Observation, objectivity, stability | Establishing shots, power shots |
| Slow push in | Growing interest, encroachment, intensity | Emotional reveals, tension building |
| Slow pull out | Distance, loss, isolation, conclusion | Endings, separations, scale reveals |
| Pan | Following action, revealing environment | Action, geography, curiosity |
| Tilt up | Aspiration, scale, dominance | Architecture, power moments |
| Tilt down | Vulnerability, consequence, revelation | Aftermath, discovery |
| Handheld | Intimacy, urgency, chaos, immediacy | War, documentary, drama |
| Steadicam / Oner | Long unbroken observation, grace | Complex choreography, intimacy |
| Orbit / Arc | Examination, revelation of 3D space | Character introduction, objects |
| Crane / Ascent | God's perspective, overview, conclusion | Final shots, resolutions |
| Drone | Geographic scale, environmental power | Establishing, nature, action |

---

## The Single-Take Cinematic Shot

One of the strongest cinematic approaches is a single uncut shot that handles multiple story beats through camera movement:

```
[OPENING FRAME DESCRIPTION]. Camera [OPENING MOVEMENT]. 
As the camera moves, [SECOND STORY BEAT IS REVEALED]. 
The camera continues [SECOND MOVEMENT] to reveal [THIRD BEAT OR EMOTIONAL PEAK]. 
The shot ends on [FINAL COMPOSITION]. Total duration approximately [X] seconds. 
[CONTINUOUS LIGHTING CONDITIONS — must work throughout the move]. 
[ATMOSPHERE]. This is a single uncut shot.
```

**Example**:
```
Wide shot looking down a quiet hospital corridor, late at night. Camera slowly dollies 
forward between the dim fluorescent lights. As it moves, a man comes into view through 
a window in a door on the right — sitting beside a hospital bed, holding someone's hand. 
Camera continues forward, passing the window, then slows to rest on a child's drawing 
taped to the hallway wall: a house, a family, the sun. Fluorescent light throughout, 
slightly greenish and institutional. Quiet, suspended grief. This is a single uncut shot.
```

---

## Color Grade Descriptors

Add these to the end of cinematic scene prompts to anchor the visual tone:

| Genre / Tone | Grade Description |
|---|---|
| Neo-noir | "High contrast, deep blacks, cool blue shadows, single warm practical accent" |
| Golden epic | "Warm teal and orange grade, lifted blacks, cinematic grain" |
| Social realism | "Desaturated, naturalistic, low contrast, skin tones protected" |
| Sci-fi cold | "Cool white and steel blue dominant, minimal warm tones, clinical" |
| Horror | "Desaturated shadows, sickly green undertone, underexposed edges" |
| Romance | "Warm, slightly lifted, soft vignette, pastel highlights" |
| Documentary | "Natural, slightly warm, grain visible, no obvious grading" |
| 70s period | "Faded print quality, warm midtones, slightly crushed blacks" |

---

## Multi-Scene Production Template

For productions requiring multiple distinct scenes:

```
SCENE [NUMBER]: [SCENE NAME]
Location: [SPECIFIC ENVIRONMENT]
Time: [TIME OF DAY AND WEATHER]
Lighting anchor: [CONSISTENT LIGHT DESCRIPTION FOR ALL SHOTS IN SCENE]
Color grade: [CONSISTENT GRADE FOR ALL SHOTS IN SCENE]
Tone: [EMOTIONAL REGISTER]

  Shot [A]: [TYPE] — [CAMERA MOVEMENT]
  [PROMPT]

  Shot [B]: [TYPE] — [CAMERA MOVEMENT]
  [PROMPT]

  Shot [C]: [TYPE] — [CAMERA MOVEMENT]
  [PROMPT]
```

---

## Final Polish: What Separates Good from Great

After generating and reviewing your clips, apply this filter:

1. **Does each shot tell you something new?** If it repeats information from the previous shot, cut it.
2. **Does the camera movement mean something?** If not, make it static.
3. **Is the duration right?** Emotional shots deserve time; action shots move faster.
4. **Is the light consistent?** Inconsistent lighting breaks the spell instantly.
5. **Does the sound match the visual?** Score, silence, or ambience — the choice matters.
