# Template — Ideogram

Ideogram is an AI image generation model with industry-leading text rendering capabilities, strong graphic design output, and reliable typography integration. Use Ideogram when the image requires legible text, logos, typography, or graphic design elements.

---

## When to Use Ideogram

Use Ideogram when:
- The image contains text that must be legible (headlines, labels, signs, packaging)
- The output is a graphic design asset (poster, book cover, logo treatment)
- The composition needs integrated typography (not text overlaid in post)
- The brief requires clean, repeatable graphic design quality
- Product labels with text must appear in the generated image

Do NOT use Ideogram when:
- Maximum photographic realism is required (Flux is better)
- Artistic stylization is the primary goal (Midjourney is better)
- No text appears in the image and photorealism is needed

---

## Ideogram Models

| Model | Characteristics |
|-------|----------------|
| **Ideogram 2.0** | Current generation, strong text, photorealistic and stylized |
| **Ideogram 2.0 Turbo** | Faster, slightly lower quality, good for iteration |
| **Ideogram 3.0** | Latest generation (when available), improved realism and text |

Use Ideogram 2.0 for production. Use Turbo for rapid exploration.

---

## Text Rendering on Ideogram

Ideogram's primary advantage is reliable text rendering. Follow these rules to maximize text quality.

### Text Specification Rules

1. **Use quotation marks for exact text**: Place the literal text string in quotation marks within the prompt.
   ```
   a billboard reading "PURE"
   a label with the word "BOTANICA" in serif type
   ```

2. **Specify typeface character**: Ideogram does not use actual typeface names consistently, but describe the style.
   ```
   clean geometric sans-serif
   elegant high-contrast serif, editorial fashion quality
   condensed bold industrial sans
   handwritten brush script
   monospace code-style lettering
   ```

3. **Specify text placement in composition**: Tell the model where the text appears in the image.
   ```
   text in the upper center
   headline centered at the top third
   single word at bottom right
   label text on the bottle center
   ```

4. **Keep text short**: Ideogram handles 1–5 word text strings most reliably. Longer strings are less consistent.
   - 1–3 words: Excellent reliability
   - 4–7 words: Good reliability
   - 8+ words: Moderate reliability, may require iteration

5. **Specify text color and contrast**: Help the model ensure readability.
   ```
   white text on dark background
   dark charcoal text on cream background
   gold foil text on matte black
   ```

---

## Ideogram Style Parameters

Ideogram uses a style selector alongside the prompt.

### Style Options

| Style | Best For |
|-------|---------|
| **Auto** | Let Ideogram determine the best style from the prompt |
| **General** | Balanced photorealistic and artistic output |
| **Realistic** | Photorealistic images, product photography, portraits |
| **Design** | Graphic design, posters, typography-led compositions |
| **Anime** | Japanese animation aesthetic |
| **3D Render** | Three-dimensional rendered appearance |

**Production recommendation**:
- Product packaging with text → `Realistic` or `Design`
- Poster or editorial graphic → `Design`
- Lifestyle with text overlay → `Realistic`
- Concept or stylized → `Auto` or `General`

### Aspect Ratio

Ideogram supports standard aspect ratios. Specify in generation settings, not in the prompt.

Common ratios: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `4:5`, `3:2`

### Magic Prompt

Ideogram's "Magic Prompt" feature automatically enhances prompts with additional descriptors. 

- Enable for creative exploration
- Disable for commercial work where prompt precision matters (Magic Prompt may alter your specific text or composition)

---

## Ideogram Prompt Structure

Ideogram responds well to structured, descriptive prompts. The model is less sensitive to keyword-only style than Midjourney.

```
[CORE IMAGE DESCRIPTION — subject, setting, mood]

[TEXT CONTENT — in quotes, with typeface description and placement]

[STYLE AND QUALITY DESCRIPTORS]
```

---

## Use Case: Product Label Photography

For generating product images where the label text must appear legible:

```
[PRODUCT TYPE AND FORM], [MATERIAL AND SURFACE], 
[BACKGROUND — color and texture], [LIGHTING — direction and quality].

The label reads "[EXACT TEXT]" in [TYPEFACE STYLE] lettering, 
centered on the front of the product, [TEXT COLOR] text on [LABEL BACKGROUND] background.

[PRODUCTION QUALITY CUES].
```

**Example**:
```
Glass skincare serum bottle, slim cylindrical form, frosted matte glass, 
dark grey matte aluminum cap, positioned three-quarter angle on a 
white marble surface with soft reflections.

Soft studio lighting from camera left, 5500K daylight, 
large octabox, neutral fill from right.

The label on the bottle front reads "LUMIA SERUM" in clean 
elegant sans-serif capitals, white text on a minimal matte white label, 
small text line below reading "30ml".

Commercial product photography, skincare brand, luxury tier, 
ultra-high resolution, no dust, no fingerprints.
```

---

## Use Case: Poster and Graphic Design

For typographic posters, book covers, album art, and graphic design assets:

```
[STYLE — graphic design / minimalist poster / editorial layout / etc.]

[VISUAL COMPOSITION — background, imagery, graphic elements]

[TYPOGRAPHY — position, size relationship, content in quotes, typeface style, color]

[COLOR PALETTE]

[QUALITY AND STYLE REFERENCE]
```

**Example — Event Poster**:
```
Minimalist music event poster design, deep navy blue background, 
abstract geometric circular form in pale gold in the center, 
soft glow emanating from the center.

Large centered headline text reading "NATA" in bold condensed 
geometric sans-serif, white, positioned above the central form.
Smaller text below reading "LIVE IN MILAN" in light weight tracking, 
pale gold, tight tracking.
Very small footer text "JUNE 26 — FABRIQUE MILAN" in clean regular weight, 
white, at the bottom.

Color palette: deep navy, pale gold, white.

Editorial graphic design, luxury event branding, print poster quality, 
ultra-high resolution.
```

---

## Use Case: Advertising with Integrated Text

For social ads, digital banners, or print ads where text is baked into the image:

```
[IMAGE CONCEPT AND COMPOSITION — describe where negative space for text exists]

[PRODUCT OR SUBJECT — positioned to complement the text placement]

[TEXT PLACEMENT — "HEADLINE" in [TYPE STYLE] in the [POSITION] of the image]

[BRAND COLOR AND AESTHETIC]

[QUALITY AND FORMAT]
```

**Example**:
```
Premium coffee brand advertisement, rich photographic background showing 
close-up of dark espresso being poured into a white ceramic cup, 
steam rising, dark walnut table surface visible, 
lower third of image fades to near-black.

Text in the lower third reading "BLACK. PURE. PERFECT." 
in elegant spaced uppercase serif letters, white, 
clean and minimal with generous letter-spacing.

Warm photography quality, coffee brand premium tier, 
published in a lifestyle magazine, ultra-high resolution.
```

---

## Use Case: Package Design Mockup

For generating how a product design concept would look in context:

```
[PACKAGE TYPE AND FORM — box/bottle/bag/tube/etc.], 
[MATERIAL AND SURFACE], 
[PRIMARY COLOR AND FINISH].

The front panel shows:
- Brand name: "[BRAND]" in [TYPEFACE STYLE], [COLOR], [POSITION]
- Product name: "[PRODUCT]" in [TYPEFACE STYLE], [COLOR], [POSITION]
- Volume or variant: "[DETAIL]" in small [TYPEFACE STYLE], [COLOR], [POSITION]

[BACKGROUND AND SETTING — simple surface/white/dark/environment].
[LIGHTING].
[PHOTOGRAPHY QUALITY CUES].
```

---

## Ideogram Negative Prompt

Ideogram supports a negative prompt field.

```
blurry, low quality, misspelled text, distorted text, unreadable typography, 
illegible font, wrong text, extra letters, missing letters, 
text running off edge, overlapping text, generic design, amateur, 
clipart, stock illustration appearance
```

---

## Ideogram Failure Modes and Fixes

| Failure | Cause | Fix |
|---------|-------|-----|
| Text is misspelled | Probabilistic character generation | Keep text to 3–5 words; regenerate several times; try shorter text |
| Text is illegible | Text too small in the composition | Describe text as "large" or "dominant" in the composition |
| Extra letters appear | Token boundary artifacts | Simplify the text string; avoid uncommon letter combinations |
| Text style doesn't match brief | Typeface description too vague | Use more specific typeface style descriptors (condensed, light weight, high-contrast) |
| Image is too illustrated | Wrong style setting | Switch to `Realistic` style and add `photographic quality` to prompt |
| Text placement wrong | Placement description too vague | Be very explicit: "text centered in the upper third, taking up approximately one-quarter of the image height" |
| Brand name appears wrong | Uncommon or AI-unfamiliar words | Spell it phonetically in the prompt for reference, or use very simple placeholder text |

---

## Ideogram + Flux Workflow

The optimal workflow for product photography requiring legible text:

1. **Generate the product without text on Flux**: Produce a high-quality, photorealistic product image with no text on Flux Pro or Ultra.
2. **Generate the text treatment separately on Ideogram**: Create a typographic asset (text only on transparent or matching background) using Ideogram.
3. **Composite in Photoshop or equivalent**: Place the Ideogram typography over the Flux product image in post-production.

This workflow separates the two tasks — photorealism (Flux) and typography (Ideogram) — and achieves best-in-class quality for both. It mirrors how professional product and advertising photography works: the photography studio and the design studio are separate.
