# Template — Kling (Kling 2.1)

Kling by Kuaishou is a high-speed, versatile video generation model with best-in-class motion brush controls and strong camera presets. It's ideal for fast iteration, style exploration, and precision motion control on specific regions of the frame.

---

## Model Characteristics

- **Strengths**: Iteration speed, motion brush (region control), camera presets, style flexibility, strong image-to-video
- **Weaknesses**: Complex multi-character dialogue blocking, audio generation (not native)
- **Prompt weighting**: Balanced — responds to both short punchy prompts and longer detailed ones
- **Negative prompts**: Fully supported
- **Duration options**: 5s, 10s
- **Modes**: Standard (fast/draft), Pro (quality), Master (2K, premium quality)

---

## Prompt Template

```
[SHOT SIZE], [CAMERA MOVEMENT]. [SUBJECT + ACTION]. [ENVIRONMENT]. 
[LIGHTING]. [STYLE/MOOD].
```

**Example**:
```
Medium close-up, camera slowly pushes in. A young chef with flour-dusted hands 
carefully places a tart onto a cooling rack in a warm bakery kitchen. 
Morning light streams through a skylight above, catching steam rising from nearby trays. 
Warm and inviting, artisanal quality.
```

**Negative prompt**:
```
blurry, low quality, distorted face, bad hands, overexposed, watermark, CGI, 
flickering, jittery motion, duplicate subject
```

---

## Parameters Reference

```yaml
model: kling-2.1
mode: "pro"              # Options: standard | pro | master
duration: 5              # Options: 5 | 10
aspect_ratio: "16:9"     # Options: 16:9 | 9:16 | 1:1
cfg_scale: 0.5           # Range: 0.0–1.0 (prompt adherence strength)
camera_control:          # Optional: use preset or describe in prompt
  type: "zoom_in"        # See preset list below
negative_prompt: ""
seed: null
```

---

## Camera Control Presets

Kling 2.1 supports named camera presets that produce more reliable results than prompt-only camera direction:

| Preset Name | Effect |
|---|---|
| `static` | No camera movement; locked off |
| `zoom_in` | Camera zooms in toward subject |
| `zoom_out` | Camera zooms out from subject |
| `pan_left` | Camera pans to the left |
| `pan_right` | Camera pans to the right |
| `tilt_up` | Camera tilts upward |
| `tilt_down` | Camera tilts downward |
| `push_in` | Camera dollies forward toward subject |
| `pull_out` | Camera dollies backward away from subject |
| `orbit_left` | Camera arcs left around subject |
| `orbit_right` | Camera arcs right around subject |
| `handheld` | Subtle organic handheld movement |

**Best practice**: Use `camera_control` preset for the primary movement and omit camera direction from the prompt to avoid conflicts.

---

## Motion Brush

Motion brush allows you to draw motion vectors on regions of a source image for image-to-video generation.

### How to Use
1. Upload the source image
2. Draw brush strokes on the region that should move
3. Indicate the direction and distance of movement
4. Generate — only the brushed region animates

### Motion Brush Use Cases

**Flowing water**: Brush over a river or waterfall in a direction following the flow
**Blowing hair or fabric**: Brush in the wind direction
**Cloud movement**: Brush across the sky in the direction of drift
**Character walking**: Brush the legs in the direction of travel
**Flower petals**: Brush lightly in multiple directions for gentle sway
**Background crowd**: Light diffuse brush over crowd area for subtle life

### Motion Brush Tips
- Use broader masks for natural-looking results
- Multiple small precise masks can conflict; use fewer larger ones
- Combine motion brush with camera control presets for complex shots
- Motion speed in brush correlates to motion speed in output — don't over-stretch

---

## Style Modes

Kling supports distinct visual style modes beyond "realistic":

### Realistic
Default mode. Use for photorealistic commercial, portrait, and lifestyle content.
```
...[prompt]. Photorealistic, natural.
```

### Animation (3D)
3D animated style. Strong for characters, product visualization, explainer content.
```
...[prompt]. 3D animation style, Pixar-quality, smooth rendering.
```

### Anime
Japanese animation aesthetic. Strong for dramatic scenes and fantasy content.
```
...[prompt]. Anime art style, high detail, fluid animation.
```

### Comics
Flat or semi-flat graphic style with strong outlines.
```
...[prompt]. Comics art style, bold outlines, graphic novel aesthetic.
```

---

## Prompt Length Guide

Kling performs well across prompt lengths, but length strategy matters by use case:

| Content Type | Recommended Length | Reason |
|---|---|---|
| Abstract/stylized | 20–40 words | Short prompts leave creative space |
| Commercial product | 40–80 words | Enough detail for material quality |
| Character scene | 60–100 words | Character and environment need detail |
| Nature/environment | 50–90 words | Physical elements need specification |
| Style exploration | 15–30 words | Let the model interpret freely |

---

## Quality Triggers by Content Type

**Photorealistic people**:
```
photorealistic, natural skin, lifelike movement, high production value
```

**Stylized animation**:
```
smooth animation, expressive movement, high-quality render, vibrant colors
```

**Product**:
```
studio quality, sharp material detail, premium presentation, clean composition
```

**Nature/environment**:
```
cinematic, natural lighting, high dynamic range, breathtaking detail
```

---

## Image-to-Video Best Practices

Kling has one of the strongest image-to-video implementations.

1. **Image quality matters**: Start with a high-resolution (minimum 1024px), well-composed source image
2. **Match aspect ratio**: Crop your source image to match the target output aspect ratio before uploading
3. **Describe what moves, not what exists**: The prompt should describe the motion, not re-describe the image
4. **Use camera control**: Image-to-video + camera preset is a powerful combination for precise control
5. **Keep foreground and background separate in the prompt if possible**: "The subject in the foreground [action]. The background [action]."

### Image-to-Video Prompt Structure
```
[WHAT MOVES] [HOW IT MOVES]. [SECONDARY MOTION IF ANY]. [CAMERA BEHAVIOR].
```

**Example**:
```
The woman's hair flows gently in the breeze. Leaves in the background sway softly. 
Camera holds static.
```

---

## Iteration Strategy

**Speed workflow**:
1. Generate in Standard mode at 5s — fast, cheap, good for composition testing
2. When composition is confirmed, switch to Pro mode
3. For hero shots or delivery-ready clips, use Master mode (2K)

**Style exploration**:
1. Write a short 25-word prompt and generate 4+ variations
2. Select the most promising result
3. Extend with more detailed re-prompting on the winning seed

**Motion brush workflow**:
1. Prepare source image in correct aspect ratio
2. Generate a static reference in image-to-video mode first
3. Add motion brush regions and re-generate
4. Iterate brush size and direction until motion is natural
