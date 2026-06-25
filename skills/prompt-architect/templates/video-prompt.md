# Template: Video Prompt

Use for text-to-video and image-to-video generation with models like Sora, Runway Gen-3, Kling, Higgsfield, Pika, or similar.

---

## Key Differences from Image Prompts

Video prompts must describe **motion over time**, not just a single frame. Think in terms of:
- **What moves** and **how** (direction, speed, style of movement)
- **Camera movement** (pan, zoom, dolly, static, handheld)
- **Scene progression** (beginning → middle → end of the clip)
- **Duration** (if the model accepts it)

---

## Template

```
[OPENING FRAME — describe the first shot as if it's an image]
[ACTION / MOTION — what happens; describe movement explicitly]
[CAMERA MOVEMENT — static, pan left/right, zoom in/out, dolly forward, crane up, handheld, orbit]
[ENVIRONMENT — setting, time of day, weather, atmosphere]
[LIGHTING — quality, direction, changes over the clip]
[STYLE — cinematic genre, visual aesthetic]
[PACING — slow, normal, fast; smooth or jump-cut]
[DURATION — seconds, if the model accepts it]
[AUDIO CUE — optional, if the model supports ambient sound]
[EXCLUSIONS — no text, no watermark, no abrupt cuts]
```

---

## Filled Example: Cinematic Scene

```
Opening frame: A lone astronaut stands on a rust-red Martian plain, 
facing away from camera toward a massive dust storm on the horizon.

Action: The astronaut slowly raises one hand to visor. 
The dust storm advances, darkening the sky from orange to deep red.
Fine dust particles swirl around the astronaut's boots.

Camera: Slow dolly-in from behind, stopping in medium shot. 
No camera shake.

Environment: Barren Martian surface, scattered rocks, distant mountains. 
Late afternoon, low sun partially obscured by haze.

Lighting: Warm amber light fading to diffused red as the storm approaches. 
Dramatic shadow play on the ground.

Style: Cinematic science fiction. IMAX quality. Photorealistic CGI. 
Color grade: desaturated with warm highlights.

Pacing: Slow and deliberate. 8-second clip.

No text overlay. No watermark. No jump cuts.
```

---

## Filled Example: Product / Commercial

```
Opening frame: A glass of iced coffee on a minimalist white marble surface.
A droplet of condensation runs down the side of the glass.

Action: A hand enters frame from the right and lifts the glass.
The coffee swirls gently. Close-up on the golden-brown liquid.

Camera: Static macro shot, then smooth rack focus from the glass to the background.

Environment: Bright Scandinavian kitchen, morning light through floor-to-ceiling windows.

Lighting: Soft diffused daylight, slight lens flare in background.

Style: Premium lifestyle commercial. Clean, minimal, aspirational.

Pacing: Smooth, 6-second clip. No cuts within the clip.

No text. No people in full frame. No brand logos visible.
```

---

## Motion Vocabulary

### Camera Movements
- **Static** — no camera movement
- **Pan** — horizontal rotation (pan left, pan right)
- **Tilt** — vertical rotation (tilt up, tilt down)
- **Dolly** — camera physically moves forward/backward (dolly in, dolly out)
- **Zoom** — focal length changes (zoom in, zoom out)
- **Truck** — camera moves laterally (truck left, truck right)
- **Crane/Pedestal** — camera moves vertically (crane up, crane down)
- **Orbit** — circular movement around subject
- **Handheld** — slight, naturalistic shake
- **Whip pan** — fast lateral snap to new subject

### Subject Motion Descriptors
- Slow, fluid, sudden, rhythmic, erratic, hovering, drifting, pulsing, swirling, cascading

### Transition Types (if supported)
- Cut, dissolve, crossfade, wipe, zoom transition, match cut

---

## Model-Specific Notes

| Model | Tips |
|-------|------|
| Runway Gen-3 | Describe motion in the first sentence; it's weighted heavily |
| Kling | Works well with Chinese scene descriptions; handles face consistency |
| Pika | Short clips (3–5s) work better; specify motion magnitude |
| Sora | Handles complex multi-shot descriptions; be explicit about camera |
| Higgsfield | Strong at physics-based motion; describe forces (gravity, wind, water) |

---

## Checklist

- [ ] Opening frame described as a clear image
- [ ] Motion is explicit — what moves, in what direction, at what speed
- [ ] Camera movement named (even if "static")
- [ ] Duration specified if supported
- [ ] Style matches the intended use (cinematic, commercial, social, documentary)
- [ ] Exclusions listed (no text overlay, no abrupt cuts, no watermark)
