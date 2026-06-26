# Template — Magnific

Magnific is an AI image enhancement and post-processing platform. Its primary capabilities are upscaling (with or without creative enhancement), inpainting, outpainting, relighting, background removal, skin enhancement, and image-to-image generation. This template covers all major Magnific workflows.

---

## When to Use Magnific

Use Magnific when:
- A generated image needs resolution increase for final delivery
- You want to add texture, detail, or quality enhancement beyond the original generation
- A specific region of an image needs correction (inpainting)
- The image needs to extend beyond its original borders (outpainting)
- You need to change the lighting of an existing image (relight)
- Skin texture, detail, or enhancement is required on a portrait
- Background removal or isolation is needed

---

## Magnific Capabilities Reference

| Tool | What It Does | When to Use |
|------|-------------|-------------|
| **Upscale** | Increases image resolution with optional detail enhancement | All final deliverables |
| **Creative Upscale** | Upscales while adding new detail, texture, and enhancement | When original image needs quality improvement |
| **Inpaint** | Replaces a selected region with new AI-generated content | Region correction, element addition/removal |
| **Outpaint** | Extends the image beyond its original borders | Format change, composition expansion |
| **Relight** | Changes the lighting of an existing image | Lighting correction or mood shift |
| **Skin Enhancer** | Dedicated skin quality improvement for portraits | Portrait and beauty work |
| **Background Remove** | Isolates subject from background | E-commerce, compositing |
| **Image Variations** | Generates variations of an existing image | Exploration, options generation |

---

## Upscaling

### Standard Upscale vs. Creative Upscale

**Standard Upscale** (low creativity, 1–2):
- Increases resolution while preserving the original image faithfully
- Minimal hallucination of new detail
- Best for: Images that are already high quality and need resolution only
- Risk: Very low

**Creative Upscale** (medium creativity, 3–4):
- Increases resolution AND adds texture, detail, and enhancement
- Magnific makes creative decisions about what detail to add
- Best for: Images that need texture recovery, detail enhancement, or quality improvement
- Risk: May add detail that wasn't in the original brief; review carefully

**Maximum Creative Upscale** (high creativity, 5):
- Magnific significantly reinterprets the image with extensive new detail
- Can dramatically improve a low-quality base image
- Best for: Deliberately transformative enhancement, when the original is rough
- Risk: High; may change the image substantially

### Upscaling Decision Tree

```
Is the source image high quality with only resolution limitations?
├── YES → Standard Upscale (creativity 1–2)
└── NO ↓

Does the image need texture recovery, material detail, or quality improvement?
├── YES → Creative Upscale (creativity 3–4)
└── NO ↓

Is the source image low quality and in need of transformation?
└── YES → Maximum Creative Upscale (creativity 4–5) with guiding prompt
```

### Upscale Prompt

When using creative upscale (creativity 3+), provide a prompt that guides the type of detail Magnific adds.

**Format**: Describe what the image contains, with emphasis on surfaces and materials that should receive texture enhancement.

```
[SUBJECT DESCRIPTION — who or what is in the image]
[SURFACE AND MATERIAL DESCRIPTION — what details to enhance]
[LIGHTING AND QUALITY REFERENCE]
```

**Example — Portrait upscale**:
```
Editorial portrait of a woman, warm skin with natural texture, 
natural curly hair, white background studio lighting. 
Enhance skin texture naturalistically, preserve individual hair strands, 
maintain soft studio light quality.
```

**Example — Product upscale**:
```
Luxury fragrance bottle, frosted glass body, matte black cap, 
dark background product photography. 
Enhance glass texture and surface detail, preserve material properties, 
maintain controlled studio lighting.
```

**Example — Fashion upscale**:
```
Fashion editorial, model in linen clothing outdoors in natural light. 
Enhance fabric texture and natural weave detail, 
improve skin naturalness, preserve editorial lighting quality.
```

### Upscale Settings Reference

| Setting | Value | Effect |
|---------|-------|--------|
| **Creativity** | 1 | Minimal enhancement, maximum fidelity |
| **Creativity** | 2 | Slight enhancement, high fidelity |
| **Creativity** | 3 | Moderate enhancement, visible improvement |
| **Creativity** | 4 | Strong enhancement, meaningful quality gain |
| **Creativity** | 5 | Maximum enhancement, may substantially alter |
| **HDR** | 0–1 | Increases highlight and shadow detail |
| **Resemblance** | 0–1 | Higher values stay closer to original composition |
| **Fractality** | 0–1 | Controls fine detail generation level |

---

## Inpainting

Inpainting replaces a masked region of an image with new AI-generated content that blends with the surrounding image.

### When to Use Inpainting

- Incorrect label, graphic, or element in a product image
- Distorted face, hand, or anatomy needing correction
- Background element that needs removal or replacement
- Adding a product or object to an existing image
- Changing one product color or material in a shot
- Removing an unwanted object (crew equipment, dust, reflections)

### Inpainting Workflow

**Step 1: Evaluate the target region**
- Identify exactly what is wrong and what should replace it
- Determine the minimum mask area: mask only what needs changing
- Larger masks produce more visible seams; keep the mask as tight as possible

**Step 2: Set the mask**
- Use a soft-edge feathered mask for organic shapes (skin, hair, backgrounds)
- Use a precise hard-edge mask for product features (label edges, geometric elements)
- Feather 5–10px for most portrait and lifestyle inpainting

**Step 3: Write a focused inpaint prompt**
- Describe ONLY what should appear in the masked region — not the whole image
- Match the lighting, color grade, and material quality of the surrounding image
- Do not describe elements outside the mask

**Step 4: Set creativity level**
- Low creativity (1–2): Small corrections, tight to the surrounding area
- Medium creativity (3): Standard inpainting, visible improvement
- High creativity (4–5): Major region replacement, substantial change

### Inpaint Prompt Format

```
[WHAT REPLACES THE MASKED REGION — described specifically]
[HOW IT SHOULD LOOK — material, color, texture, lighting match]
[INTEGRATION NOTE — seamless, matching the surrounding image]
```

**Example — Product label correction**:
```
Clean matte white paper label, smooth and flat, 
no text, no graphics, pure white surface with subtle paper texture, 
fitting the bottle curvature, slight edge shadow from bottle curve, 
matching the studio lighting of the surrounding product image.
```

**Example — Hand correction**:
```
Natural human hand, correct anatomy, five fingers, 
warm light skin with natural skin texture, 
holding the cup naturally, matching the lighting and color grade 
of the rest of the image.
```

**Example — Background element removal**:
```
Clean [SURFACE MATERIAL — marble/wood/white seamless], 
matching the texture and color of the surrounding background, 
no objects, seamless continuation of the existing surface.
```

**Example — Sky replacement**:
```
Bright blue sky with a few soft white cumulus clouds, 
matching the horizon line and color temperature of the existing image, 
natural daylight quality matching the existing landscape lighting.
```

---

## Outpainting

Outpainting extends the image beyond its original borders by generating new content that continues the established visual world.

### When to Use Outpainting

- Converting a portrait crop (4:5) to a landscape format (16:9) for advertising
- Adding space above a portrait for headline copy
- Extending a product image to include more environmental context
- Revealing more of a scene that was cropped in the original generation
- Changing the aspect ratio of an image for a different platform

### Outpainting Workflow

**Step 1: Define the extension direction and amount**
- Top extension: useful for sky, ceiling, copy space
- Bottom extension: useful for ground, floor continuation, lifestyle context
- Side extension: useful for format conversion, environmental expansion

**Step 2: Analyze what continues beyond the original frame**
- What is the logical continuation of the environment?
- What direction does the light come from? It must continue consistently.
- What perspective and vanishing point applies? Continuation must maintain this.

**Step 3: Write the outpaint prompt**
- Describe what appears in the EXTENDED AREA specifically
- Match the environment, lighting direction, and color grade of the original
- Be specific about background elements, surface materials, and atmosphere

**Step 4: Evaluate the blend**
- Check for visible seam at the original image boundary
- Check lighting continuity — shadows fall in the correct direction in both original and extension
- Check perspective — horizontal lines continue at the correct angle
- If seam is visible, try slight adjustment to the extension amount and re-run

### Outpaint Prompt Format

```
[WHAT APPEARS IN THE EXTENDED AREA — describe the continuation of the scene]
[LIGHTING CONTINUATION — maintaining the existing light direction and quality]
[ENVIRONMENT CONTINUATION — surface, architecture, or nature continuing]
[COLOR AND ATMOSPHERE — matching the existing image grade]
```

**Example — Portrait to landscape (add left side)**:
```
Left side continues the same neutral charcoal grey seamless background, 
matching the color and texture of the existing right side, 
subtle light gradient continuing from the right where the key light is, 
no new objects or elements, clean and minimal.
```

**Example — Add sky above landscape**:
```
Continuation of the existing outdoor landscape, bright midday sky, 
pale blue with soft scattered white clouds, 
matching the warm daylight quality of the existing image, 
no dramatic weather, slight haze at horizon blending into the existing landscape.
```

**Example — Extend interior to add room context**:
```
Continuation of the same warm minimalist interior, 
pale oak wood floor extending left, white walls continuing, 
same warm natural window light from the right continuing into the extended area, 
a blurred bookshelf partially visible in the far left, 
no sharp competing elements.
```

---

## Relighting

Magnific's relight tool changes the lighting of an existing image.

### When to Use Relight

- Changing the time of day in a lifestyle image
- Converting a studio-lit product image to a natural light aesthetic
- Adding a dramatic mood shift (daylight to golden hour, studio to candlelight)
- Correcting flat or uninspiring lighting on an otherwise good image
- Creating a night version of a day scene

### Relight Prompt Format

```
[TARGET LIGHTING DESCRIPTION — what the new lighting should look like]
[LIGHT SOURCE — direction, quality, color temperature]
[MOOD — what the new lighting communicates]
```

**Example — Daylight to golden hour**:
```
Golden hour evening light from the left, warm 3500K, 
low angle sun just above the horizon, 
long soft shadows to the right, warm orange-gold quality on all surfaces, 
atmospheric warmth in the air.
```

**Example — Interior studio to window light**:
```
Soft natural window light from camera left, 5000K daylight neutral, 
diffused through sheer curtains, no harsh shadows, 
ambient fill from surrounding room surfaces.
```

---

## Skin Enhancer

Dedicated skin quality improvement for portrait and beauty images.

### When to Use

- Portrait images where skin rendering is too smooth (plastic) or too rough
- Beauty and skincare imagery where skin quality is primary
- Headshots where professional retouching quality is required
- Any portrait where the skin needs to read as natural and healthy

### Skin Enhancer Settings

| Setting | Direction | Effect |
|---------|-----------|--------|
| **Smoothing** | Lower | Preserve natural pores and texture |
| **Smoothing** | Higher | Polish and reduce surface variation |
| **Enhancement** | Lower | Minimal intervention |
| **Enhancement** | Higher | Stronger skin quality improvement |

**Production recommendation for editorial**: Low smoothing (preserve texture), medium enhancement (improve quality without removing natural surface).

**Production recommendation for commercial beauty**: Medium smoothing, medium-high enhancement.

**Production recommendation for natural lifestyle**: Very low smoothing, low enhancement — preserve authenticity.

---

## Background Removal

Isolates the subject from the background for compositing.

### Quality Tips for Background Removal

- Highest quality results on high-contrast subject-to-background images
- Fine hair removal requires high resolution source image
- Request high resolution before removing background (upscale first if needed)
- Check hair edges at 100% zoom — hair is the most common failure point
- Re-touch fine hair edges manually in Photoshop if automated result is imperfect

---

## Magnific Workflow Integration

### Standard Production Pipeline

```
Generate → Evaluate → Upscale → Inpaint (if needed) → Deliver
```

1. **Generate** on Flux, Midjourney, or Imagen
2. **Evaluate** using the CHECKLIST.md evaluation grid
3. **Upscale** with creative upscale at appropriate creativity level
4. **Inpaint** any regions that need correction
5. **Outpaint** if format change is needed
6. **Final QC** at 100% zoom, then deliver

### Face Enhancement Order

For portraits, apply Magnific tools in this order:

1. **Upscale** first (creative, creativity 3–4)
2. **Skin Enhancer** on the upscaled image
3. **Inpaint** any remaining face issues on the enhanced image

Never inpaint before upscaling — the resolution is too low for precise mask control.

---

## Magnific Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Visible seam at inpaint boundary | Mask edge too hard or mask too small | Feather mask 10–15px; slightly expand mask beyond the problem area |
| Inpainted region has different lighting | Prompt didn't specify lighting match | Add "matching the existing lighting direction and color temperature of the surrounding image" to inpaint prompt |
| Outpaint extension looks disconnected | Environment not continued correctly | Be more specific about surface material, color, and lighting in the outpaint prompt |
| Over-smoothed skin after enhancement | Smoothing setting too high | Reduce smoothing; target "natural skin with visible pore structure" |
| Creative upscale adds wrong texture | Creativity too high with no guiding prompt | Add a focused prompt describing the image content; reduce creativity level |
| Background removal has rough hair edges | Low resolution source | Upscale the source image first, then remove background |
