# Template — Google Imagen

Google Imagen is a text-to-image generation model known for natural scene rendering, accurate skin tone representation, soft photographic realism, and strong performance on lifestyle and editorial content. This template covers prompt strategies and optimization for Imagen 3 and successors.

---

## Imagen Characteristics

**Strengths**:
- Natural, accurate skin tone rendering across diverse ethnicities
- Soft, photographic realism without AI-generated artificiality
- Strong performance on lifestyle, wellness, and natural light imagery
- Good anatomical accuracy relative to many competing models
- Reliable environmental and landscape rendering
- Clean, low-artifact output on first generation

**Limitations**:
- Less artistic stylization than Midjourney
- Text rendering is inconsistent (use Ideogram for text-required images)
- Very high prompt specificity can produce over-rigid results
- Less responsive to photographic and cinematographic vocabulary than Flux
- Character consistency across sessions requires reference input

---

## Imagen Prompt Style

Imagen responds to clear, conversational descriptive language. It is less tuned to comma-separated keyword lists than Midjourney, and less sensitive to technical photography vocabulary than Flux.

**What works best on Imagen**:
- Complete descriptive sentences
- Natural scene descriptions with environmental context
- Clear subject descriptions with realistic physical attributes
- Action and interaction descriptions that convey narrative context
- Soft, natural lighting descriptions (indoor daylight, golden hour, overcast)

**What works less well on Imagen**:
- Highly abstract artistic references
- Dense photographic technical specifications
- Over-specified surreal or fantasy compositions
- Complex multi-subject arrangements with precise spatial relationships

---

## Prompt Structure for Imagen

```
[SUBJECT AND DESCRIPTION — natural language, complete sentences]

[ACTION AND SITUATION — what is happening, naturalistic]

[ENVIRONMENT — specific but not overly structured]

[LIGHTING — natural description, not technical studio language]

[MOOD AND QUALITY — what it should feel like, photography style reference]
```

---

## Subject Description on Imagen

Imagen has strong performance on diverse human subjects. Use specific, respectful, and accurate descriptors.

### People on Imagen

```
[AGE RANGE]-year-old [GENDER], [SKIN TONE — warm/cool/neutral + general tone], 
[HAIR — color, length, natural style], [EXPRESSION AND ENERGY], 
[WARDROBE — casual/natural description].
```

Imagen skin tone rendering tips:
- Specify skin tone explicitly — Imagen tends toward accurate representation when prompted specifically
- Include `natural`, `authentic`, or `real` as quality modifiers to encourage non-idealized rendering
- Avoid modifiers like `perfect` or `flawless` which can trigger over-smoothing

### Environments on Imagen

Imagen handles natural environments with high quality:
- Gardens, parks, outdoor markets, urban streets
- Natural interiors (kitchens, living rooms, cafes)
- Beaches, forests, mountain landscapes

Imagen handles controlled studio environments acceptably but Flux typically produces higher precision for packshot and commercial studio work.

---

## Lighting Descriptions for Imagen

Imagen responds well to natural light descriptions over technical studio specifications.

**Natural interior light**:
```
Bright morning light streaming through large windows, 
warm and golden, casting gentle shadows on the wall.
```

```
Soft overcast daylight filtering through sheer curtains, 
diffused and even, no harsh shadows.
```

**Natural exterior light**:
```
Golden hour sunshine, late afternoon, 
warm golden light from low in the sky, 
long soft shadows.
```

```
Bright overcast day, soft diffused light, 
even illumination, no harsh shadows, 
slight cool blue quality.
```

**Interior lifestyle light**:
```
Cozy cafe interior, warm ambient light from pendant lamps, 
afternoon sun coming through the window at an angle.
```

**Avoid on Imagen**:
Technical studio lighting specifications (softbox, octabox, fill ratio) are less effective on Imagen than on Flux. For controlled studio lighting, Flux is the better platform.

---

## Imagen Use Cases

### Lifestyle Photography

Imagen excels at natural lifestyle imagery.

```
Lifestyle photograph of a [AGE RANGE]-year-old [GENDER], [SKIN DESCRIPTION], 
[HAIR], [CASUAL WARDROBE], [NATURAL ACTION — cooking / reading / walking / laughing with friend].

[NATURAL INTERIOR or OUTDOOR SETTING — specific and relatable].

[NATURAL LIGHT — describe the light source in plain terms].

[MOOD AND ENERGY — warm, relaxed, authentic, joyful, contemplative].

Lifestyle photography, warm and authentic, not overly produced, 
natural and real, [PUBLICATION STYLE if applicable].
```

**Example**:
```
Lifestyle photograph of a 29-year-old woman, warm medium brown skin, 
natural curly hair pulled loosely back, casual cream knit sweater and 
light wash jeans, standing in a bright kitchen stirring a bowl, 
laughing at something off-frame.

Light-filled modern kitchen, pale wood cabinets, afternoon sunlight 
coming through the window above the sink.

Warm, natural afternoon light, slightly golden, soft shadows.

Warm and authentic lifestyle photography, editorial quality, 
Kinfolk or Well+Good aesthetic, natural and real.
```

### Wellness and Health

Imagen performs strongly for wellness, fitness, and health content.

```
[HEALTH OR WELLNESS ACTIVITY — yoga / meditation / hiking / cooking healthy food], 
[PERSON DESCRIPTION], [NATURAL SETTING], [MOOD — calm/energizing/peaceful].

[NATURAL LIGHT — morning/afternoon/outdoor].

Wellness photography, authentic and aspirational, 
warm and natural, not over-staged.
```

### Diverse Representation

Imagen's training emphasizes diverse representation. Use explicit, respectful descriptors to ensure accurate rendering.

```
[AGE RANGE]-year-old [GENDER], [SPECIFIC SKIN TONE — do not omit], 
[NATURAL HAIR TYPE if relevant — afro / straight / wavy / coiled], 
[PHYSICAL CHARACTERISTICS that matter for the brief].
```

### Food Photography

Imagen handles food imagery well.

```
[DISH NAME], [KEY INGREDIENTS VISIBLE], [STYLING DESCRIPTION — rustic/minimal/elegant], 
[SURFACE — marble/wood/linen], [PROPS — minimal/none/natural], 
[LIGHTING — natural window light/soft studio/moody candlelight].

Food photography, [STYLE — editorial/rustic/luxury/home cook], 
appetizing, [PUBLICATION REFERENCE if applicable], ultra-high resolution.
```

### Nature and Landscape

```
[LANDSCAPE TYPE — forest/beach/mountain/desert/urban], 
[TIME OF DAY], [WEATHER AND ATMOSPHERE], 
[SPECIFIC ELEMENTS — particular trees / rock formation / water body / sky condition], 
[MOOD].

[PHOTOGRAPHY STYLE — National Geographic / travel editorial / fine art landscape], 
shot on [CAMERA REFERENCE], ultra-high resolution, ultra-detailed.
```

---

## What Imagen Does Well vs. What Needs Other Models

| Task | Imagen | Better Alternative |
|------|--------|-------------------|
| Natural skin tones, diverse subjects | Excellent | — |
| Lifestyle and relatable scenarios | Excellent | — |
| Natural light photography | Excellent | — |
| Landscapes and environments | Very good | — |
| Controlled studio product photography | Acceptable | Flux |
| Luxury product with precise materials | Moderate | Flux |
| Artistic stylization | Moderate | Midjourney |
| Text in image | Poor | Ideogram |
| Highly technical prompt adherence | Moderate | Flux |
| Fantasy or sci-fi creative | Moderate | Midjourney, Flux |

---

## Imagen Prompt Examples

### Authentic Lifestyle Portrait

```
A lifestyle photograph of a 44-year-old man with warm dark brown skin, 
close-cropped grey-flecked hair, wire-frame glasses, wearing a relaxed 
navy linen shirt and khaki trousers, sitting in a warmly lit home library, 
reading a book, calm and absorbed.

Bookshelves filled with books visible behind him, afternoon light 
coming through a side window, a cup of tea on the side table.

Warm afternoon natural light, golden and soft, from window on the left.

Warm, authentic lifestyle photography, editorial quality, 
approachable and real, not posed.
```

### Editorial Travel Portrait

```
A travel editorial portrait of a 31-year-old woman with warm tan skin, 
long dark hair in a loose braid, wearing a flowing white linen dress, 
standing at the edge of a whitewashed terrace overlooking the sea, 
looking at the horizon, hair moving slightly in the wind.

Greek island aesthetic, clear blue sea below, deep blue sky with 
a few white clouds, whitewashed architecture.

Bright midday Mediterranean sun overhead with slight haze, 
warm and golden quality, slight overexposure on white surfaces.

Travel editorial photography, wanderlust aesthetic, 
Condé Nast Traveler quality, natural and luminous.
```

### Product in Natural Context

```
A ceramic coffee mug with a warm cream glaze, sitting on 
a worn wooden kitchen table next to a small succulent plant, 
morning steam rising from the coffee inside, 
soft morning light coming through a window beside it.

Natural morning lifestyle setting, warm and domestic, 
hygge aesthetic.

Morning window light, soft and warm, 5000K golden morning quality, 
gentle shadows.

Lifestyle product photography, warm and authentic, 
editorial quality, natural styling.
```

---

## Imagen Negative Prompt

Imagen supports negative prompts in the API.

```
blurry, low quality, oversaturated, overexposed, underexposed, 
artificial looking, stock photo appearance, overly staged, 
plastic skin, unrealistic skin tone, 
deformed hands, anatomical errors, distorted features, 
harsh shadows, artificial lighting, studio lighting (unless brief requires)
```

---

## Imagen API Notes

Imagen is available through:
- **Google AI Studio** (API access, Vertex AI)
- **Google Cloud Vertex AI** (enterprise)
- Selected third-party integrations

Key parameters (Vertex AI):
- `prompt`: Text description
- `negativePrompt`: Negative prompt string
- `sampleCount`: Number of images to generate (1–8)
- `aspectRatio`: `"1:1"`, `"9:16"`, `"16:9"`, `"3:4"`, `"4:3"`
- `safetyFilterLevel`: Content filtering level
- `personGeneration`: `"allow_adult"`, `"allow_all"` (for images with people)

Consult current Vertex AI documentation for the most up-to-date parameter names and values, as the API schema evolves with model updates.
