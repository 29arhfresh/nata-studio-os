# Template — Flux (Black Forest Labs)

Flux is a family of text-to-image models from Black Forest Labs. This template covers prompt syntax, parameter selection, and optimization strategies for all Flux variants.

---

## Flux Model Variants

| Model | Best For | Speed | Quality Ceiling |
|-------|---------|-------|----------------|
| **Flux.1 [dev]** | Open creative work, general use | Fast | Very high |
| **Flux.1 [pro]** | Commercial production, prompt adherence | Medium | Highest |
| **Flux.1 [schnell]** | Rapid iteration, draft generation | Very fast | Medium |
| **Flux Ultra** | Hero assets, maximum detail | Slow | Maximum |
| **Flux 1.1 [pro]** | Improved pro with better coherence | Medium | Very high |

**Decision rule**:
- Iterating and exploring → Flux [schnell] or [dev]
- Commercial deliverable → Flux [pro] or Flux Ultra
- Maximum quality hero image → Flux Ultra

---

## Flux Prompt Architecture

Flux processes prompts differently from diffusion-based models. Key behaviors:

1. **Natural language preferred**: Flux handles complete sentences better than keyword lists. Write in full descriptive sentences.
2. **Prompt length**: Flux handles long, detailed prompts well. 150–400 words is a typical range for complex images.
3. **No special syntax required**: Unlike Midjourney, Flux does not use parameter flags inside the prompt.
4. **Order matters**: Front-load the most important visual elements. Flux weights earlier tokens more heavily.
5. **Technical descriptors activate quality**: Camera and lens language, production quality cues, and photography style references produce measurably better results than abstract adjectives.

---

## Flux Prompt Structure

```
[PRIMARY SUBJECT AND CORE DESCRIPTION]

[ENVIRONMENT AND SETTING]

[LIGHTING SPECIFICATION]

[LENS AND CAMERA SPECIFICATION]

[MATERIAL AND TEXTURE DETAILS]

[COLOR AND GRADE]

[PRODUCTION QUALITY ANCHORS]
```

---

## Subject Description on Flux

**People**: Flux renders people well but benefits from specific physical descriptors. Include:
- Age range (decade range, not specific age)
- Skin tone with modifier (warm/cool/neutral)
- Hair (color + length + style + texture)
- Eyes (color + shape)
- Action or pose
- Wardrobe (color + garment type + material)

**Products**: Flux has strong material rendering. Specify:
- Product category and shape
- Primary material and finish (glossy / matte / frosted / metallic)
- Color precisely
- Key design features (label placement, cap style, proportions)

**Environments**: Flux handles complex architectural and natural environments. Be specific about:
- Architectural style and materials
- Lighting source (windows, skylights, practical fixtures)
- Atmosphere (clean/dusty/foggy/crisp)

---

## Lighting Language on Flux

Flux responds well to photographic lighting vocabulary. Use these constructions:

**Studio lighting**:
```
[MODIFIER TYPE — large softbox / octabox / strip light / beauty dish / bare bulb] 
at camera [left/right], [ANGLE — 30°/45°/60°] down from horizontal, 
[KELVIN]K color temperature, [QUALITY — hard/soft/diffused].
[FILL — silver reflector / white card / second source at 1:[RATIO] / none].
[RIM — hair light from above behind at camera [right/left] / no rim].
```

**Natural light**:
```
[DIRECTION] window light, [SIZE — narrow / large / floor-to-ceiling], 
[QUALITY — direct sun / diffused cloudy / north-facing indirect], 
[KELVIN]K, [FILL — bounce from white wall / ambient / none].
```

**Mixed and practical**:
```
Primary: [PRACTICAL SOURCE — pendant lamp / candles / neon sign / TV screen glow], 
[DIRECTION AND QUALITY], [KELVIN]K warm/cool/color.
Fill: [AMBIENT SOURCE], [KELVIN]K.
Intentional color temperature contrast between [WARM SOURCE] and [COOL SOURCE].
```

---

## Lens and Camera Language on Flux

Flux is highly responsive to photography and cinematography vocabulary. These phrases activate quality:

**Focal length character** (choose one):
- `ultra-wide 16mm lens, strong perspective distortion, environment dominant`
- `35mm street lens, natural perspective, slight context in frame`
- `50mm standard lens, neutral perspective, closest to naked eye`
- `85mm portrait lens, slight compression, flattering perspective`
- `100mm macro lens, neutral perspective, close-focus capability, extreme detail`
- `135mm telephoto, compression, background isolation, observed distance`
- `200mm super telephoto, strong compression, very flat perspective, extreme background blur`
- `anamorphic lens, 2.39:1 crop, oval bokeh quality, horizontal lens flares from specular sources`

**Aperture and depth of field**:
- `f/1.4, extremely shallow depth of field, subject in sharp focus, extreme background bokeh`
- `f/2.0, shallow depth of field, smooth bokeh, slight background recognition`
- `f/2.8, moderate bokeh, sharp subject, recognizable background`
- `f/5.6, moderate depth of field, background soft but legible`
- `f/8, deep focus, sharp from foreground to background`
- `f/16, maximum depth of field, everything in sharp focus from near to far`

**Camera quality anchors**:
- `shot on Phase One XF 150MP, medium format resolution`
- `shot on Hasselblad H6D, medium format quality`
- `shot on Canon EOS R5, commercial photography standard`
- `shot on Leica Q2, street and portrait quality`
- `shot on Sony A1, sports and commercial versatility`

---

## Color and Grade Language on Flux

**Film stock references** (activate natural film quality):
- `Kodak Portra 400 emulation, warm skin tones, fine grain, rich but not oversaturated`
- `Fujifilm Provia 100F, neutral accurate color, clean highlights`
- `Kodak Ektar 100, vivid saturated, deep greens and blues`
- `Ilford HP5 black and white, fine grain, medium contrast, film quality`
- `Cinestill 800T, tungsten balanced, magenta halation around highlights, grain`

**Digital grade references**:
- `clean neutral color grade, accurate color, no cast`
- `warm golden grade, lifted shadows, compressed highlights, skin-forward`
- `cool desaturated editorial grade, blue-grey shadows, slight lift`
- `high contrast dramatic grade, crushed blacks, bright highlights, color pop`
- `muted pastel grade, low saturation, slight haze, ethereal`

---

## Quality Anchors for Flux

End prompts with quality anchors appropriate to the use case:

**Commercial photography**:
```
commercial photography quality, shot on [CAMERA], ultra-high resolution, 
tack sharp at subject plane, professional retouching quality, 
published in [RELEVANT PUBLICATION].
```

**Fine art / editorial**:
```
editorial photography quality, art directed, published in [MAGAZINE], 
natural light portraiture, film-inspired, [PHOTOGRAPHER REFERENCE] aesthetic.
```

**Product photography**:
```
commercial product photography, studio quality, ultra-high resolution, 
no dust, no fingerprints, professional packshot quality.
```

**Luxury / campaign**:
```
luxury campaign photography, [BRAND TIER] quality, 
hero asset quality, ultra-high resolution, 
meticulous retouching, publishable immediately.
```

---

## Negative Prompts on Flux

Flux [dev] and [pro] support negative prompts via the `negative_prompt` parameter.

### Universal Negative Prompt

```
blurry, low quality, jpeg artifacts, pixelated, noise, oversaturated, 
overexposed, underexposed, color banding, washed out, hazy, 
watermark, text overlay, signature, username
```

### For People

Add to the universal negative prompt:
```
deformed hands, extra fingers, missing fingers, merged fingers, 
distorted face, asymmetrical eyes, crossed eyes, lazy eye, 
uneven eye size, uneven facial features, uncanny valley, 
plastic skin, overly retouched, airbrushed skin, 
bad anatomy, wrong proportions, disfigured
```

### For Products

Add to the universal negative prompt:
```
wrong product shape, warped perspective, distorted label, 
text on label (unless using Ideogram), wrong material appearance, 
visible studio equipment, reflections of photographer, 
floating product, incorrect shadow direction
```

---

## Flux API Parameters

When calling Flux via API (Black Forest Labs API, Replicate, or third-party):

| Parameter | Typical Range | Notes |
|-----------|--------------|-------|
| `prompt` | — | Full prompt text |
| `negative_prompt` | — | Not supported on all variants; check API docs |
| `aspect_ratio` | `1:1`, `16:9`, `9:16`, `4:5`, `3:4`, `2:3`, `21:9` | Specify in API, not in prompt |
| `steps` | 20–50 | Higher = more detail, slower; 28–35 is good balance |
| `guidance` | 2.5–5.0 | Higher = stricter prompt following; 3.0–3.5 typical |
| `seed` | Any integer | Set for reproducibility; omit for variety |
| `output_format` | `jpeg`, `webp`, `png` | PNG for quality; JPEG for file size; WebP balanced |
| `output_quality` | 80–100 | 95 recommended for production; 100 for archival |

---

## Flux-Specific Prompt Examples

### Flux — Photorealistic Portrait

```
Editorial portrait of a 42-year-old man, warm medium tan skin, 
salt-and-pepper close-cropped hair, strong jaw, warm brown eyes, 
slight stubble, wearing a dark charcoal merino wool crew-neck sweater.

Direct gaze into camera, neutral confident expression, 
shoulders relaxed, head slightly tilted right.

White studio background, slight warm gradient, no visible texture.

Large softbox from camera left, 45° down, 5200K neutral, 
soft wrap-around quality. Small white reflector fill from camera right 
at 1:4 ratio. No rim light. Slight warmth on left cheek.

85mm portrait lens, f/2.8, medium close-up from sternum to above head, 
camera at eye level, subject center-right of frame.

Natural skin texture, fine pores visible, no airbrushing, 
healthy luminosity without plastic sheen. Hair: slight sheen, 
individual hairs visible at hairline.

Warm natural color grade, skin tones leading the palette, 
slight warmth in midtones, clean highlights, lifted shadow floor. 
Kodak Portra 400 reference.

Editorial portrait photography, published in GQ, 
shot on Phase One XF, ultra-high resolution, 
tack sharp focus on both eyes simultaneously.
```

### Flux — Luxury Product

```
Premium glass perfume bottle, tall and rectangular with slightly tapered neck, 
frosted matte glass body, obsidian black metallic cap, 
thin debossed vertical line running full height of bottle front, 
standing upright, three-quarter angle, 20° clockwise rotation.

Dark charcoal seamless background, near-black, slight vignette.

Single narrow strip light from camera right, 3200K warm, 
hard vertical specular on right edge of frosted glass, 
slight internal glow through frosted body from strip light, 
no fill, deep shadow on left side, 
slight warm ambient bounce in shadow from background.

90mm macro lens equivalent, f/8, tack sharp entire bottle, 
slight compression, camera at product midpoint height.

Frosted glass: diffuse translucent surface, no clear transparency, 
soft internal luminescence. Black cap: matte metallic, 
slight anisotropic surface sheen, no bright specular. 
Seamless surface: non-reflective, dark, flat.

Color palette: near-black, charcoal, no color cast from lighting. 
Single warm accent from strip light specular on glass.

Commercial product photography, luxury fragrance, 
Chanel / Tom Ford production tier, shot on Hasselblad H6D, 
ultra-high resolution, no dust, no fingerprints.
```

---

## Common Flux Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Generic face instead of specified person | Subject description too vague | Add five or more specific physical descriptors to face |
| Wrong lighting direction | Lighting description too brief | Specify key light direction, angle, quality, and temperature in full |
| Fabric looks digital | Missing material specificity | Add fabric weave type, reflectivity, weight behavior |
| Background not matching spec | Prompt front-loaded with background | Move subject description first, background second |
| Text on product is nonsense | Flux struggles with all rendered type | Remove text requirement from prompt; handle in Ideogram or post-production |
| Over-smoothed skin | "Professional retouching" reads as skin removal | Replace with "natural skin texture, fine pores visible, light retouching" |
| Image too dark overall | Negative descriptors pulled exposure | Remove "dramatic" and "dark" from main prompt; control via lighting spec instead |
