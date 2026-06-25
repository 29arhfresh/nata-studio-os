# Template — Higgsfield

Higgsfield is a cinematic AI video platform built for character-driven content. It offers best-in-class character consistency via reference images, a full suite of named camera motion presets, and built-in upscaling. Ideal for narrative film, brand spokespeople, and any work requiring recognizable characters across multiple shots.

---

## Model Characteristics

- **Strengths**: Character consistency with reference images, cinematic drama, named camera presets, built-in 4K upscaling, strong emotional close-ups
- **Weaknesses**: Abstract or non-narrative content, large crowd scenes
- **Prompt weighting**: Character description carries significant weight; be thorough
- **Negative prompts**: Supported
- **Duration**: 4s, 8s
- **Aspect ratios**: 16:9, 9:16, 1:1, 4:5, 2.39:1 (cinemascope)

---

## Prompt Template

```
[SHOT SIZE]. [CHARACTER DESCRIPTION + ACTION]. [ENVIRONMENT]. 
[LIGHTING]. [MOOD/ATMOSPHERE]. [TECHNICAL QUALITIES].
```

**Example**:
```
Medium close-up. A man in his late 30s with olive skin, dark wavy hair, and a tailored 
charcoal suit stands at a floor-to-ceiling window overlooking a rain-soaked city at night. 
He holds a lowball glass, contemplating. The only light is from the cityscape behind him 
and a warm desk lamp at frame edge, casting him in half-shadow. Tense, introspective. 
Cinematic, anamorphic lens quality, film grain.
```

**Negative prompt**:
```
blurry, overexposed, distorted face, bad anatomy, watermark, text overlay, 
duplicate subject, low quality, inconsistent character appearance
```

---

## Parameters Reference

```yaml
model: higgsfield-1
duration: 8              # Options: 4 | 8
aspect_ratio: "16:9"     # Options: 16:9 | 9:16 | 1:1 | 4:5 | 2.39:1
camera_motion: "push_in" # See preset list below — set as parameter, not in prompt
negative_prompt: ""
seed: null
reference_image: null    # URL or asset_id — strongly recommended for character work
upscale: false           # Set true for delivery-ready 4K output
```

---

## Camera Motion Presets

Always set camera motion as a **parameter**, not in the prompt text. Mixing prompt camera description with the preset parameter causes conflicts.

| Preset | Description |
|---|---|
| `static` | Locked-off, no camera movement |
| `push_in` | Camera moves forward toward the subject |
| `pull_out` | Camera moves backward away from the subject |
| `zoom_in` | Optical zoom in (tighter framing, no spatial change) |
| `zoom_out` | Optical zoom out (wider framing) |
| `pan_left` | Camera pans to the left |
| `pan_right` | Camera pans to the right |
| `tilt_up` | Camera tilts upward |
| `tilt_down` | Camera tilts downward |
| `truck_left` | Camera laterally moves left (truck/slide) |
| `truck_right` | Camera laterally moves right |
| `orbit_left` | Camera arcs around subject from right to left |
| `orbit_right` | Camera arcs around subject from left to right |
| `arc_left` | Tighter arc, stays closer to subject |
| `arc_right` | Tighter arc from opposite direction |
| `drone_ascent` | Camera rises upward, bird's-eye reveal |
| `drone_descent` | Camera descends from above |
| `handheld` | Subtle organic movement, documentary feel |
| `crane_up` | Smooth upward crane movement |
| `crane_down` | Smooth downward crane movement |

---

## Character Consistency System

Higgsfield's reference image system is the most powerful character consistency tool in any AI video platform.

### Reference Image Best Practices

**Image quality requirements**:
- Minimum 512×512 pixels (1024×1024+ recommended)
- Clear view of the face (not obscured, angled, or heavily shadowed)
- Good lighting on facial features
- Neutral or on-model expression

**Best reference image types**:
- Clean headshot or portrait (most reliable)
- 3/4 angle portrait
- Mid-shot showing wardrobe (for wardrobe consistency)

**Avoid as reference**:
- Extreme angles (profile, looking away)
- Heavy beauty retouching (model won't render naturally)
- Group photos (model may conflate features)
- Low resolution or blurry images
- Studio images with very different lighting from target scene

### Writing the Character Seed Description

A "character seed" is a paragraph that you paste into every shot prompt. It anchors the character across all generations.

**Character Seed Template**:
```
[CHARACTER NAME/ROLE]: [AGE RANGE], [GENDER PRESENTATION], [SKIN TONE AND TEXTURE], 
[HAIR — color, length, style, texture], [EYE COLOR AND SHAPE], [DISTINCTIVE FEATURES], 
wearing [WARDROBE — specific garments, colors, fit].
```

**Example**:
```
Elena: woman in her mid-30s, warm honey-toned skin, dark chestnut hair in loose waves 
to her shoulders, almond-shaped dark brown eyes, slight natural arch to her brows, 
minimal makeup, wearing a deep burgundy turtleneck and camel trench coat belted at the waist.
```

Paste this exact paragraph at the start of every shot prompt where Elena appears.

---

## Lighting Setups for Cinematic Work

### Film Noir / Dramatic
```
Hard directional sidelight from frame left, deep natural shadow covering the right half 
of the face. Motivated by a single practical lamp source barely visible at frame edge. 
Cool ambient fill from a window at rear. High contrast chiaroscuro.
```

### Golden Hour Exterior
```
Low warm sun from behind and to the right of the subject, casting a golden rim light 
on hair and shoulders. Open sky provides soft blue fill on the shadow side. 
The subject's face catches warm ambient reflected light from the ground.
```

### Studio Interview / Commercial
```
Large soft box key light from 30° front-left. Half-intensity fill from front-right. 
Hairlight from directly above and behind. Clean white or gradient gray background. 
Professional, broadcast quality.
```

### Night Exterior — Urban
```
Practical neon overhead provides cool blue-green top light with colored highlights. 
Warm amber streetlight from frame right provides a secondary light source. 
Dark background with specular reflections in rain-wet pavement.
```

### Intimate Interior
```
Single practical bedside lamp at frame right, warm 2700K incandescent quality. 
Deep shadows at frame edges. Subject's face lit mostly from one side with gentle 
gradient. The atmosphere is quiet and personal.
```

---

## Quality Triggers

Append these to the end of prompts to elevate Higgsfield's output quality:

**General cinematic**:
```
cinematic quality, anamorphic lens, film grain, high production value
```

**Character drama**:
```
emotionally rich, naturalistic performance, photorealistic skin and eyes
```

**Commercial/editorial**:
```
editorial quality, premium production, sharp focus, clean composition
```

**Dark/noir**:
```
high contrast, chiaroscuro, deep shadows, film noir aesthetic
```

---

## Shot Sequences for Character Work

### Three-Shot Character Introduction
```
Shot 1 (Establishing — static wide):
[CHARACTER SEED]. Walking into frame from [DIRECTION] in [ENVIRONMENT]. 
Full body visible. Camera static, wide.

Shot 2 (Approach — push_in):
[CHARACTER SEED]. Walking forward, getting closer to camera. 
From wide to medium as they approach. Environment: same as shot 1.
Camera: push_in preset.

Shot 3 (Reveal — static MCU):
[CHARACTER SEED]. Stops and looks directly to camera. Expression: [EMOTIONAL STATE]. 
Framing: medium close-up. Environment: same. Camera: static.
```

### Emotional Sequence
```
Shot 1 (Neutral — static MCU):
[CHARACTER SEED]. Listening, neutral expression, subtle eye movement.

Shot 2 (Reaction — static CU):
[CHARACTER SEED]. Reaction builds — [EMOTIONAL PROGRESSION: e.g., "slight widening 
of eyes, then a slow exhale as tension releases"].

Shot 3 (Resolution — push_in CU to ECU):
[CHARACTER SEED]. [FINAL EMOTIONAL STATE]. Camera pushes slowly in to extreme close-up 
on eyes during the moment of decision/emotion peak.
```

---

## MCP Integration

Access Higgsfield capabilities via MCP tools:

```
Generate video:     mcp__Hihhsfield__generate_video
Generate image:     mcp__Hihhsfield__generate_image
Upscale video:      mcp__Hihhsfield__upscale_video
Upscale image:      mcp__Hihhsfield__upscale_image
Remove background:  mcp__Hihhsfield__remove_background
Motion control:     mcp__Hihhsfield__motion_control
Show generations:   mcp__Hihhsfield__show_generations
Upload media:       mcp__Hihhsfield__media_upload_widget
Import from URL:    mcp__Hihhsfield__media_import_url
```

---

## Iteration Strategy

**First pass**: Generate at 4s with static camera to evaluate character rendering quality against the reference image.

**If character doesn't match reference**: Ensure the reference image is high quality; add more physical descriptors in the prompt; try a different reference image angle.

**Once character is confirmed**: Extend to 8s and add camera motion preset.

**For delivery quality**: Enable upscale for final approved clips.

**Consistency across sequence**: Use the same seed that produced the best character result as a starting point for all shots in the sequence, then vary other parameters.
