# Checklist — AI Image Director

Every item is a pass/fail gate. Items marked **Recommended** improve output quality but do not block generation. All unmarked items are blocking — the prompt must not generate until they pass.

---

## Stage 1: Brief Gate

Run before writing any prompt text.

### Creative Objectives
- [ ] The primary subject is described in a single concrete sentence.
- [ ] The purpose of the image is defined (e-commerce, editorial, advertising, social, branding).
- [ ] The intended audience and their expected response are documented.
- [ ] The target aspect ratio and minimum pixel dimensions are confirmed.
- [ ] Aesthetic references (existing images, photographers, art directions) are identified.

### Constraints and Restrictions
- [ ] Any content that must be avoided (colors, elements, cultural sensitivities) is documented.
- [ ] Brand guidelines that constrain creative choices are reviewed and noted.
- [ ] Model capability limits for the target platform are checked against the brief's requirements.

### Consistency Requirements
- [ ] It is confirmed whether this image belongs to a multi-image consistency sequence.
- [ ] If yes, the character or environment anchor from the existing sequence is located.

### Exit Gate
- [ ] The visual specification template in `WORKFLOW.md` Stage 1 is fully completed.

---

## Stage 2: Template and Model Gate

Run after selecting a template and target model.

- [ ] The template is selected using the decision tree in `WORKFLOW.md` Stage 2.
- [ ] The template selection is justified by the brief, not by habit or default.
- [ ] The target model is matched to the task using the model selection guide.
- [ ] The model's known limitations are confirmed as acceptable for this task.
- [ ] **Recommended**: A reference image is identified for style anchoring (if the model supports conditioning).

---

## Stage 3: Prompt Construction Gate

Run before generating. This is the most detailed gate.

### Subject Block
- [ ] The subject is described with enough specificity that any two people reading the prompt would visualize the same image.
- [ ] Age range or approximate age is specified for human subjects.
- [ ] Pose, action, or state is explicit — not implied.
- [ ] No vague qualifiers are present ("beautiful," "nice," "stunning") without concrete visual backing.

### Environment Block
- [ ] The setting is specified: interior, exterior, studio, abstract, contextual.
- [ ] Background complexity is defined: seamless, simple, complex, or environmental.
- [ ] For studio shots: background color or texture is explicit.
- [ ] For natural settings: time of day and weather are specified where they affect lighting.

### Lighting Block
- [ ] The key light source is identified (direction and quality: hard or soft).
- [ ] Fill light treatment is specified (reflector, second source, ambient, none).
- [ ] Rim or hair light is addressed (present or deliberately absent).
- [ ] Color temperature is specified (warm/cool/neutral or Kelvin value).
- [ ] The lighting matches the stated purpose (commercial product → clean studio; editorial → motivated natural).

### Lens and Camera Block
- [ ] Focal length character is specified (wide, normal, portrait, telephoto, macro).
- [ ] Depth of field intent is explicit (deep focus, mid aperture, or shallow bokeh).
- [ ] Shot size is defined (ECU, CU, MCU, MS, MWS, WS, EWS).
- [ ] Camera angle is stated (eye level, low angle, high angle, bird's eye, Dutch).
- [ ] Composition rule is applied (rule of thirds, central, leading lines, negative space).

### Materials and Texture Block (when applicable)
- [ ] Surface properties are described for the primary subject material.
- [ ] For product photography: all relevant surfaces are addressed (primary, secondary, packaging).
- [ ] For skin: skin tone, texture, and quality are specified.
- [ ] For fabric: weave, drape, and reflectivity are described.

### Color and Grade Block
- [ ] A dominant color palette or reference is stated.
- [ ] Saturation intent is explicit (vivid, natural, muted, desaturated, monochrome).
- [ ] Shadow and highlight treatment is defined (crushed blacks, lifted shadows, compressed highlights).
- [ ] A grade reference is provided (film stock, photographer, colorist vocabulary).

### Quality Cues
- [ ] Production quality anchors are included at the end of the prompt.
- [ ] Quality cues match the production context (commercial photography, editorial, packshot, fine art).

### Model-Specific Syntax
- [ ] Correct parameters for the target model are applied (see model-specific template).
- [ ] Parameters not supported by the target model are not present.
- [ ] Aspect ratio is set using the model's native syntax.

### Negative Prompt
- [ ] Tier 1 universal quality failures are listed.
- [ ] Tier 2 anatomical failures are listed for any image containing people.
- [ ] Context-specific failure modes for this prompt type are anticipated and listed.

---

## Stage 4: Generation and Evaluation Gate

Run after each generation batch.

### First Generation Evaluation
- [ ] Subject: Matches specification in pose, state, and appearance.
- [ ] Composition: Framing matches specified shot size and angle.
- [ ] Lighting: Light direction, quality, and color match specification.
- [ ] Depth of field: Bokeh and sharpness match aperture intent.
- [ ] Materials: Surface properties render as specified.
- [ ] Color grade: Palette and tonal range match color specification.
- [ ] Technical quality: Sharp at subject plane, no artifacts, no banding.
- [ ] Anatomical accuracy: No hand, face, or extremity distortion.

### Iteration Protocol
- [ ] Only one major variable is changed per iteration.
- [ ] The reason for each change is documented against the evaluation grid failure it addresses.
- [ ] If 15 iterations pass without convergence, prompt architecture is reassessed before continuing.

### Failure Mode Documentation
- [ ] Every failure mode that persists across three or more iterations is documented.
- [ ] Each persistent failure is classified: wording issue, architecture issue, or model limitation.
- [ ] Model limitations are marked "accepted" with rationale, not marked as resolved.

### **Recommended**: Seed Recording
- [ ] When a successful generation is found, the seed is recorded for future consistency use.

---

## Stage 5: Post-Processing Gate

Run before delivering the final image.

### Upscaling
- [ ] Target resolution for final use is confirmed before upscaling.
- [ ] Upscale type (creative vs. standard) is matched to the image's needs.
- [ ] The upscale prompt matches the subject and context of the original image.
- [ ] No new artifacts are introduced by the upscaling process.

### Inpainting (when applied)
- [ ] The mask covers only the region requiring correction.
- [ ] The inpaint prompt describes only the masked region, not the whole image.
- [ ] Lighting and color grade in the inpainted region match the surrounding image.
- [ ] No visible blend seam at the mask edge.

### Outpainting (when applied)
- [ ] The outpaint prompt continues the established environment logically.
- [ ] Lighting direction in the extension matches the original image.
- [ ] Perspective lines continue correctly in the extended area.
- [ ] No visible seam at the original image boundary.

### Final Delivery
- [ ] Resolution meets or exceeds minimum requirement for final use.
- [ ] Color profile is correct for delivery medium (sRGB for digital, Adobe RGB or CMYK for print).
- [ ] Skin tones and anatomical details are reviewed at 1:1 zoom.
- [ ] Face enhancement artifacts are checked (if face enhancement was applied).
- [ ] File format, naming convention, and metadata are applied per project spec.
- [ ] The final image achieves the communication objective stated in Stage 1.

---

## Quick Reference: Blocking vs. Recommended

| Gate | Blocking Items | Recommended Items |
|------|---------------|-------------------|
| Stage 1: Brief | Subject, purpose, audience, format, constraints | Reference images, mood board |
| Stage 2: Template | Template selection, model selection | Reference conditioning setup |
| Stage 3: Construction | Subject, environment, lighting, lens, color, quality cues, correct model syntax | Extended negative prompt |
| Stage 4: Evaluation | All eight evaluation grid dimensions, failure mode documentation | Seed recording |
| Stage 5: Post-processing | Resolution, color profile, seam check, final brief compliance | Face enhancement review |
