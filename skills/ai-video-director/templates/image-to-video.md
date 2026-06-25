# Template — Image to Video

Image-to-video converts a static image into a short video clip, either by animating elements within the scene or by applying camera movement to an otherwise static composition. It is one of the most powerful workflows in AI video production — allowing you to generate a perfect still frame and then bring it to life.

---

## When to Use Image-to-Video

- **Product photography** → animate product rotation, material shimmer, environment movement
- **Portrait photography** → subtle blink, breathing, hair movement
- **Landscape photography** → cloud movement, water flow, wind in foliage
- **Generated stills** → take a perfect image generation and add cinematic life
- **Illustration or artwork** → animate a 2D piece into video
- **Architecture visualization** → camera fly-through of a rendered environment

---

## Core Principle

**The prompt describes what moves, not what the image contains.**

The model already knows what the image looks like — it can see it. Your job is to direct the motion, not re-describe the visual content.

```
// Wrong (re-describes image):
"A forest with tall pine trees, morning mist, golden light filtering through the canopy."

// Correct (describes what moves):
"Morning mist drifts slowly between the trees. The light shifts gently as if clouds 
are passing above. Pine branches sway in a soft breeze. Camera holds completely static."
```

---

## Platform Comparison for Image-to-Video

| Platform | Strengths | Camera Control | Recommended For |
|---|---|---|---|
| Kling 2.1 | Precise motion control, motion brush, strong quality | Full preset suite | Product, lifestyle, precise animation |
| Google Veo | Excellent physics, long duration | Good camera language | Natural scenes, physics-heavy subjects |
| Higgsfield | Strong character animation from portraits | Presets | Portrait, character animation |
| Seedance v2 | Commercial quality, human subjects | Prompt-driven | People, products, commercial |
| Sora | Complex scene animation | Prompt-driven | Multi-element scenes, environments |

---

## Prompt Templates by Subject Type

### Portrait / Person

```
[NATURAL MOVEMENT]. The subject's chest rises and falls with relaxed breathing. 
[HAIR BEHAVIOR]. [EYE BEHAVIOR]. [EXPRESSION SHIFT IF ANY]. 
Camera [STATIC or SLOW PUSH IN]. The moment feels alive and present.
```

**Example**:
```
Hair moves gently as if a light breeze passes. Eyes blink naturally once, 
then maintain soft forward gaze. A slight smile forms at the corner of the lips. 
Camera holds completely static.
```

---

### Landscape / Nature

```
[PRIMARY ATMOSPHERIC MOVEMENT]. [SECONDARY NATURAL ELEMENT MOVEMENT]. 
[LIGHT BEHAVIOR — time of day shift, cloud shadow passing, rays moving]. 
Camera [MOVEMENT OR STATIC]. Very slow, contemplative motion.
```

**Example**:
```
Low clouds drift slowly from left to right across the mountain ridge. 
Wildflowers in the foreground sway gently. The light brightens briefly as a cloud 
clears the sun, then dims again. Camera holds completely static. Very subtle, slow motion.
```

---

### Product

```
[SPECIFIC PRODUCT BEHAVIOR — material catching light, liquid moving, mechanism activating]. 
[ENVIRONMENTAL ACCENT MOVEMENT]. Camera [SLOW ORBIT or STATIC]. 
Slow, deliberate, premium pace.
```

**Example**:
```
The watch's second hand ticks through one rotation. Light catches the crystal face 
and creates a slow sweeping reflection across the background. Camera barely perceptible 
slow orbit from left to right. Premium, deliberate.
```

---

### Architecture / Interior

```
[LIGHT MOVEMENT — sunbeam shifting, shadow pattern moving]. 
[AMBIENT LIFE — dust motes, curtain movement, distant activity]. 
Camera [SLOW DOLLY or STATIC]. The space feels inhabited.
```

**Example**:
```
Sunlight moves slowly across the wooden floor as if time is passing. 
A sheer curtain near the window shifts lightly. Dust motes float in the 
column of light. Camera very slowly dollies in toward the window. 
The atmosphere is quiet and contemplative.
```

---

### Urban / Street

```
[PEOPLE MOVEMENT — blur of pedestrians, specific person action]. 
[VEHICLE MOVEMENT]. [ATMOSPHERIC CONDITIONS — steam, wind, rain if present]. 
Camera [SLOW PAN or STATIC timelapse]. [PACE — busy, sparse, nightlife, etc].
```

**Example**:
```
Pedestrians move purposefully past in the mid-distance, slightly blurred. 
A single taxi moves through the intersection. Steam rises from a street vent. 
Camera holds static. The pace of the city flows around a still center.
```

---

### Illustration / Artwork

```
[STYLE-APPROPRIATE MOVEMENT — what would move in this artistic world]. 
[PARTICLE OR TEXTURE ANIMATION if applicable]. 
Camera [SLOW ZOOM or STATIC]. The animation respects the original art style.
```

**Example**:
```
Wind passes through the illustrated forest, bending the painted trees gently. 
Leaves in the watercolor style drift downward. The painted sky's clouds 
shift almost imperceptibly. Camera very slowly zooms in toward the horizon. 
The art style remains consistent — watercolor texture throughout.
```

---

## Camera Movement Strategies

### Static (Most Reliable)
Best for: portrait animation, product shots, scenes where content movement IS the story.
```
Camera holds completely static. No camera movement of any kind.
```

### Slow Push In
Best for: building emotional intimacy, revealing detail, creating focus.
```
Camera very slowly and smoothly pushes in toward [SUBJECT], 
barely perceptible over the duration of the clip.
```

### Slow Pull Out / Reveal
Best for: establishing scale, environmental reveals, dramatic distance.
```
Camera slowly pulls back, revealing more of the environment as it retreats.
```

### Slow Pan (L→R or R→L)
Best for: environmental panoramas, following action, revealing a scene.
```
Camera pans slowly from left to right at a constant, smooth pace.
```

### Slow Orbit
Best for: product shots, character moments, architectural shots.
```
Camera arcs slowly around the subject from left to right, 
keeping the subject centered in frame throughout.
```

### Tilt Up / Reveal
Best for: revealing scale, architectural grandeur, dramatic upward reveals.
```
Camera begins low, tilting upward to reveal the full height of [SUBJECT].
```

---

## Motion Intensity Guide

| Content | Motion Intensity | Reasoning |
|---|---|---|
| Portrait animation (breathing only) | 0.1–0.2 | Barely perceptible motion |
| Hair and fabric movement | 0.2–0.3 | Gentle ambient motion |
| Landscape (clouds, water) | 0.3–0.5 | Natural environmental pace |
| Product (material shimmer) | 0.2–0.4 | Premium = never frantic |
| Urban scene | 0.4–0.6 | Active environment |
| Action or sports | 0.6–0.9 | High energy movement |

---

## Common Failure Modes and Fixes

### Subject starts morphing or changing shape
**Cause**: Motion intensity too high; model starts altering geometry.  
**Fix**: Reduce motion intensity to 0.2–0.3; add "the subject maintains its exact shape and form throughout"

### Camera adds unwanted movement when static is specified
**Cause**: Model defaults to adding subtle camera movement.  
**Fix**: Repeat the static instruction: "camera is completely locked off, absolutely no camera movement, zero camera motion"

### Background people start walking in weird ways
**Cause**: The model is animating background figures but they're not described clearly.  
**Fix**: Add "background figures move naturally as pedestrians" or "background is completely static"

### Portrait blinks too much / too little
**Cause**: Default blink rate varies by model.  
**Fix**: "Blinks once naturally over the duration" (for too much); "eyes naturally open and attentive" (for too little)

### Landscape looks like a video game pan
**Cause**: Camera movement speed is too uniform and mechanical.  
**Fix**: Add "smooth, organic camera movement with natural deceleration"; try Veo or Kling instead

### Artwork loses its stylistic integrity
**Cause**: Model is "correcting" toward photorealism.  
**Fix**: Add "[original art style] is preserved throughout — no photorealistic correction, maintain the painted/illustrated/drawn aesthetic"

---

## Input Image Quality Standards

The quality of the source image directly determines the quality of the output video.

| Parameter | Minimum | Recommended |
|---|---|---|
| Resolution | 512 × 512 | 1024 × 1024 or higher |
| Format | JPG, PNG | PNG (lossless) |
| Aspect ratio | Match target video ratio | Exactly match target ratio |
| Compression | Under 5MB | Under 2MB, maximum quality |
| Sharpness | In focus | Critically sharp throughout |
| Noise | Some acceptable | Clean, low noise |

**Pre-process if needed**: Use Magnific upscale (`mcp__Magnific__images_upscale`) to improve source image quality before image-to-video generation.
