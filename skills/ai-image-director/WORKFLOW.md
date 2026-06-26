# Workflow — AI Image Director

The AI Image Director workflow runs in five stages. Each stage has defined inputs, outputs, decision gates, and exit criteria. Do not advance to the next stage until the current stage's exit criteria are met.

---

## Stage 1: Brief Intake

**Input**: Raw creative brief from the art director, designer, or client  
**Output**: Resolved visual specification  
**Time budget**: As long as needed — ambiguity here propagates directly into generation failures

### Capture These Elements

Before writing a single prompt token, establish the following. Any unresolved item becomes an implicit creative decision made by default.

| Element | Questions to Answer |
|---------|---------------------|
| **Subject** | Who or what is the primary subject? What is their action, state, or relationship to the environment? |
| **Purpose** | What is the image for? E-commerce, editorial, advertising, social, branding, internal? The use case determines technical requirements. |
| **Audience** | Who will see it? What response must it produce (desire, trust, inspiration, information)? |
| **Platform / format** | What aspect ratio and pixel dimensions are required? What context will the image appear in (mobile screen, billboard, magazine spread, social story)? |
| **Aesthetic reference** | What existing images, photographers, films, or art directions does this need to feel like? |
| **Constraints** | What must be avoided — content, colors, brand elements, cultural sensitivities? |
| **Character consistency** | Does this image belong to a series where a character or environment must match across images? |
| **Target model** | Which AI platform is being used, and is that the right choice for this task? |

### Visual Specification Template

Document this before writing a prompt:

```
Subject:
  Primary: [describe the main subject in one sentence]
  Action or state: [what is the subject doing or being?]

Environment:
  Location: [interior, exterior, studio, abstract]
  Time of day: [if relevant]
  Background: [simple, complex, contextual, abstract]

Lighting:
  Type: [natural, studio, practical, mixed]
  Setup: [key source direction and quality, fill, rim, background]
  Color temperature: [warm/cool/neutral; Kelvin value if precise]
  Mood: [what should the lighting communicate emotionally?]

Camera and Lens:
  Focal length: [wide / normal / portrait / telephoto / macro]
  Aperture / DOF: [deep focus / mid aperture / shallow bokeh]
  Angle: [eye level / low / high / bird's eye / Dutch]
  Composition: [rule of thirds / central / leading lines / negative space]

Color and Tone:
  Palette: [dominant hues, accent colors]
  Saturation: [vivid / natural / muted / desaturated]
  Grade: [warm / cool / neutral / film stock reference]

Production Context:
  Style: [photographic realism / editorial / illustrative / conceptual]
  Quality cues: [luxury, approachable, raw, polished, editorial]

Output Specification:
  Aspect ratio: [1:1 / 16:9 / 4:5 / 3:4 / 9:16 / custom]
  Dimensions: [minimum pixel size for final use]
  Target model: [Flux / Midjourney / Ideogram / Imagen / Nano Banana]
  Post-processing: [upscale / inpaint / outpaint / none]
```

### Exit Criteria

- All required elements in the visual specification are filled or explicitly marked "open."
- The target model is selected and justified by the task profile.
- Character consistency requirements are identified (yes/no).
- Format and dimension requirements are confirmed.

---

## Stage 2: Template Selection and Prompt Architecture

**Input**: Resolved visual specification  
**Output**: Selected template and first-draft prompt structure  
**Time budget**: 15–30 minutes

### Template Decision Tree

Work through this tree in order. The first match is the correct template.

```
Is this image part of a multi-image sequence with recurring characters?
├── YES → consistent-character.md
└── NO ↓

Is the primary subject a human portrait (headshot, beauty, lifestyle person)?
├── YES → portrait.md
└── NO ↓

Is the primary subject a physical product (packshot, e-commerce, product detail)?
├── YES → product.md
└── NO ↓

Is the primary context fashion — garments as subject, editorial styling?
├── YES → fashion.md
└── NO ↓

Is the primary purpose an advertising asset — brand, campaign, commercial?
├── YES → advertising.md
└── NO ↓

Is this a narrative or atmospheric still — scene, environment, mood?
├── YES → cinematic.md
└── NO ↓

Is this an original character design — concept art, non-photographic?
├── YES → character.md
└── NO ↓

Default: Use portrait.md as structural base and adapt sections.
```

### Model Selection Guide

| If the task requires... | Use... |
|------------------------|--------|
| Maximum photorealism, precise prompt adherence | Flux Pro or Flux Ultra |
| Stylized artistic quality, painterly moods | Midjourney |
| Text in the image, graphic design, logos | Ideogram |
| Natural skin tones, soft realism, lifestyle | Google Imagen |
| Experimental or high-concept visual styles | Nano Banana |
| Upscaling, enhancement, inpainting, extension | Magnific |

### Prompt Architecture Rules

Every prompt follows this order of information. Changing the order degrades output quality.

```
[SUBJECT AND CORE ACTION] + [ENVIRONMENT] + [LIGHTING] + [LENS AND CAMERA] + [MATERIAL AND TEXTURE] + [COLOR AND GRADE] + [PRODUCTION QUALITY CUES] + [MODEL-SPECIFIC SYNTAX]
```

**Front-load the most important element.** The model weights the first clause most heavily. If the image is about the subject, describe the subject first. If the image is about the environment, describe the environment first.

**Use visual nouns, not emotional adjectives.** "50mm portrait lens, shallow depth of field, soft side key light" outperforms "beautiful artistic photo." Concrete beats abstract every time.

**One idea per clause.** Do not combine subject, action, and environment in a single run-on sentence. Separate discrete ideas with commas, then punctuate with periods between major sections.

### Exit Criteria

- The correct template is selected and the rationale is documented.
- The correct model is selected and justified.
- The prompt architecture follows the standard order.

---

## Stage 3: Prompt Construction

**Input**: Selected template and visual specification  
**Output**: Complete, ready-to-test prompt  
**Time budget**: 20–60 minutes depending on complexity

### Construction Sequence

**Step 1: Write the subject block**

Describe the primary subject with maximum specificity. Include age range (for people), gender presentation (for people), action or pose, and relationship to the frame.

Weak: `a woman standing`  
Strong: `a 32-year-old woman, natural olive skin, standing in three-quarter profile, weight shifted to left foot, hands resting loosely at sides, slight upward gaze`

**Step 2: Define the environment**

Specify the setting with enough detail to prevent the model from inventing a generic background. For studio images: background color, gradient, or texture. For natural settings: location type, time of day, weather, specific environmental elements.

Weak: `in a nice studio`  
Strong: `seamless white cyclorama studio, slight warm light gradient from left, no visible floor-wall seam`

**Step 3: Write the lighting specification**

Describe lighting as a photographer would brief a gaffer. Include key light source and direction, fill light quality, rim or hair light, background light, and color temperature.

Weak: `dramatic lighting`  
Strong: `single large softbox at camera left, 45° down angle, 5500K daylight balanced, slight warm fill from silver reflector on right, rim light from behind at camera right creating hair separation, white seamless background lit separately to pure white`

**Step 4: Specify lens and camera**

State the focal length character, aperture feel, shot size, and camera angle. For photorealistic images this is essential — it determines perspective, compression, and depth of field.

Weak: `close-up shot`  
Strong: `85mm portrait lens equivalent, f/2.2 shallow depth of field, soft bokeh background, medium close-up from chin to upper chest, slight below eye-level angle looking up at subject 3°`

**Step 5: Define materials and surfaces**

For product photography, fashion, or any image where texture matters: specify surface properties. Matte vs. glossy, fabric type, reflectivity, translucency, subsurface scattering behavior.

`matte uncoated paper texture, slight natural fiber weave visible at 1:1, no specular highlights`  
`polished stainless steel with directional brushed finish, elongated specular highlight, high contrast reflections`

**Step 6: Set the color grade**

State the color intent explicitly. Reference a film stock, a photographer, a color temperature, or a specific palette.

`warm tonal grade, lifted shadows, compressed highlights, slight golden cast in midtones, clean skin tones, Kodak Portra 400 emulation`

**Step 7: Add production quality cues**

Close every prompt with quality anchors appropriate to the output type. These are model-aware phrases that activate high-quality rendering.

For photorealistic images: `shot on Phase One, ultra-high resolution, tack sharp at subject plane, commercial photography quality`  
For editorial: `editorial photography, published in Vogue, art directed, retouched`  
For product: `packshot, commercial product photography, studio quality, white background, no shadows`

**Step 8: Add model-specific syntax**

Apply the parameter and syntax conventions for the target model. See model-specific templates for complete syntax references.

### Negative Prompt Construction (Where Supported)

Negative prompts prevent common failure modes. Use a tiered structure:

**Tier 1 — Universal failures**: `blurry, low quality, jpeg artifacts, pixelated, oversaturated, overexposed, underexposed`  
**Tier 2 — Anatomical failures** (for people): `deformed hands, extra fingers, missing fingers, distorted face, asymmetrical eyes, crossed eyes`  
**Tier 3 — Context-specific failures**: Add based on what commonly goes wrong for the specific prompt type

### Exit Criteria

- All eight construction steps are completed.
- The negative prompt addresses at least Tier 1 and any context-specific failure modes.
- The prompt uses the correct syntax for the target model.
- No placeholder text remains in the prompt.

---

## Stage 4: Generation and Evaluation

**Input**: Complete prompt  
**Output**: Evaluated image set with iteration plan  
**Time budget**: Variable — budget 5–15 iterations per final deliverable

### Generation Protocol

**First generation**: Run the prompt as-written with default parameters. This is diagnostic — you are learning how the model interprets your prompt, not expecting the final image.

**Evaluation pass**: Compare the output against the visual specification. Use the evaluation grid below.

**Second generation**: Address the highest-priority failure first. Change one major variable. Do not change five things at once — you will not know what fixed the problem.

### Evaluation Grid

Run every generated image through this grid before iterating.

| Dimension | Pass Criteria | Fail Indicators |
|-----------|--------------|-----------------|
| **Subject** | Subject matches specification in pose, age, appearance | Wrong age, wrong gender, wrong action |
| **Composition** | Framing matches specified shot size and angle | Cropped incorrectly, wrong angle, unintended crop |
| **Lighting** | Light direction, quality, and color match specification | Flat light, wrong direction, wrong temperature |
| **Depth of field** | Bokeh / sharpness matches aperture intent | Everything sharp when bokeh specified, or vice versa |
| **Materials** | Surface properties render as specified | Skin looks plastic, fabric looks wrong, specular blooms |
| **Color grade** | Palette and tonal range match color specification | Oversaturated, wrong cast, muddy shadows |
| **Technical quality** | Sharp at subject plane, clean edges, no artifacts | Blurry, banding, noise, compression artifacts |
| **Anatomical accuracy** | No distortion on hands, face, extremities | Bad hands, asymmetrical face, neck issues |
| **Brand / campaign fit** | Output achieves the brief's communication objective | Off-brand, wrong mood, wrong audience signal |

### Iteration Decision Rules

| Issue Found | Intervention |
|-------------|-------------|
| Subject wrong | Revise subject block — add more specific descriptors |
| Composition wrong | Add explicit shot size, angle, and compositional rule |
| Lighting wrong | Rewrite lighting specification with source, direction, quality, temperature |
| Depth of field wrong | Add explicit focal length and aperture value |
| Material wrong | Add material-specific descriptor language |
| Color wrong | Add color grade and palette specification |
| Artifacts / quality | Add quality cues, reduce complexity, add negative prompts |
| Anatomical failure | Add negative prompt, try different seed, reduce complexity near affected area |
| Off-brief | Return to Stage 1 — the brief itself may need resolution |

### When to Stop Iterating

Stop when:
- The image meets all pass criteria in the evaluation grid
- The remaining failure is a model limitation (document it and choose a different approach)
- You have reached 15 iterations with no convergence (the prompt architecture needs to change, not the wording)

### Exit Criteria

- At least one image passes all evaluation grid dimensions.
- All failures are documented with root cause and resolution status.
- If no image passes, the iteration plan for the next session is documented.

---

## Stage 5: Post-Processing

**Input**: Approved generated image  
**Output**: Production-ready final image  
**Time budget**: Variable — 30 minutes to several hours depending on scope

### Upscaling Decision Tree

```
Is the image at final delivery resolution?
├── YES → Skip upscaling
└── NO ↓

Does the image need creative enhancement (added detail, texture recovery)?
├── YES → Magnific Creative Upscale (creativity 3–5, with subject-specific prompt)
└── NO ↓

Does the image need faithful resolution increase only?
└── → Magnific Standard Upscale (creativity 1–2, minimal prompt)
```

### Inpainting Workflow

Use inpainting when a specific region of an otherwise good image needs correction.

1. **Identify the target region** — Be precise. Mask only the area that needs change.
2. **Write a focused inpaint prompt** — Describe only what should appear in the masked region. Do not re-describe the entire image.
3. **Match the context** — The inpaint prompt must match the lighting, color grade, and style of the surrounding image. A different style in the inpainted region reads as composite.
4. **Iterate on the mask** — If the blend is visible, slightly expand or contract the mask and run again.

### Outpainting Workflow

Use outpainting when the image needs to extend beyond its original borders.

1. **Define the extension direction** — top, bottom, left, right, or all sides
2. **Write a contextual outpaint prompt** — Describe what logically continues beyond the frame. Match environment, lighting direction, and perspective.
3. **Preserve lighting continuity** — Light sources established in the original image must be honored in the extension. If the key light is from the left, the new area still has light from the left.
4. **Check perspective** — Outpainting on images with strong perspective lines requires the extension to continue the converging lines correctly.

### Final Delivery Checklist

Before delivering the final image:

- [ ] Resolution meets or exceeds minimum for final use case
- [ ] Color profile is correct for delivery medium (sRGB for digital, Adobe RGB or CMYK for print)
- [ ] No visible inpaint or outpaint seams
- [ ] Face and anatomical details reviewed at 1:1 zoom
- [ ] Image meets all criteria in the brief
- [ ] File format, naming, and metadata conventions applied

### Exit Criteria

- All post-processing steps are complete.
- Final image meets resolution, color, and quality requirements.
- No artifacts from post-processing are visible.
- File is delivered in the correct format and color profile.
