# Template — Midjourney

Midjourney is an image generation model known for its artistic quality, stylistic range, and painterly aesthetics. This template covers prompt syntax, parameter system, and optimization strategies for Midjourney v6 and v6.1.

---

## Midjourney Characteristics

**Strengths**:
- Exceptional artistic and painterly quality
- Strong aesthetic coherence and composition
- Excellent for mood, atmosphere, and editorial work
- Rich visual vocabulary from the training data
- Strong response to photographer, artist, and magazine references
- `--style raw` unlocks photographic realism

**Limitations**:
- Text rendering is poor (use Ideogram for text-required images)
- Less precise prompt adherence than Flux for literal descriptions
- Character consistency is harder without `--cref`
- Photorealistic packshot accuracy is lower than Flux

---

## Midjourney Prompt Anatomy

Midjourney prompts follow this structure:

```
[IMAGE URL — optional, for style or reference][SUBJECT AND DESCRIPTION] [STYLE REFERENCES] --[PARAMETERS]
```

Unlike Flux, Midjourney responds well to:
- Short, evocative phrases (not required to be complete sentences)
- Comma-separated descriptors
- References to photographers, artists, films, and magazines
- Adjectives used as style modifiers

However, for maximum photographic realism, use `--style raw` with complete descriptive sentences.

---

## Midjourney Parameter Reference

### Aspect Ratio

```
--ar [WIDTH]:[HEIGHT]
```

| Use Case | Parameter |
|----------|-----------|
| Square social | `--ar 1:1` |
| Portrait (social, editorial) | `--ar 4:5` |
| Portrait (print, editorial) | `--ar 2:3` |
| Widescreen (digital, banner) | `--ar 16:9` |
| Billboard | `--ar 21:9` |
| Tall story/reel | `--ar 9:16` |

### Version

```
--v 6.1
```

Always specify `--v 6.1` for current production work. Do not omit — default version changes with platform updates.

### Style

```
--style raw
```

Use `--style raw` when photographic realism is required. Default Midjourney style adds painterly stylization and aesthetic enhancement. `--style raw` removes this and produces more literal, photographic outputs.

When to use `--style raw`:
- Product photography requiring realistic materials
- Portraits where photographic accuracy matters more than artistry
- Brand images where deviation from brief is not acceptable

When to omit `--style raw` (use default style):
- Editorial fashion with artistic intent
- Mood and atmospheric imagery
- Illustration-inspired aesthetics
- Any image where Midjourney's aesthetic sensibility is an asset

### Stylize

```
--stylize [VALUE]
--s [VALUE]
```

Controls the strength of Midjourney's aesthetic interpretation.

| Value | Effect |
|-------|--------|
| 0 | Minimal stylization, closest to literal prompt |
| 100 | Default Midjourney stylization |
| 250–400 | Noticeable artistic enhancement, good for editorial |
| 500–750 | Strong stylization, Midjourney's "artistic eye" is dominant |
| 1000 | Maximum stylization, prompt is a loose inspiration |

Production recommendation:
- Literal brief: `--stylize 50–100`
- Editorial balance: `--stylize 200–400`
- Pure aesthetic: `--stylize 600–1000`

### Chaos

```
--chaos [VALUE]
--c [VALUE]
```

Controls variation between results in a single generation (0–100).

- `--chaos 0`: Consistent, predictable results
- `--chaos 25`: Light variation — good for commercial work
- `--chaos 50`: Significant variation — good for exploration
- `--chaos 100`: Maximum variation — pure exploration

Production recommendation: `--chaos 10–20` for commercial; `--chaos 30–60` for exploration.

### Weird

```
--weird [VALUE]
--w [VALUE]
```

Introduces unconventional visual elements (0–3000).

- `--weird 0`: Conventional, expected
- `--weird 500–1000`: Slightly unconventional, interesting
- `--weird 2000–3000`: Highly experimental, unpredictable

Use only for conceptual or experimental briefs.

### Character Reference (Consistency)

```
--cref [IMAGE URL] --cw [WEIGHT 0–100]
```

Uses an existing image to anchor character appearance across generations.

- `--cw 100`: Maximum character reference weight (face + body)
- `--cw 50`: Balanced reference (useful when you want style flexibility)
- `--cw 0`: Minimum reference (only general character feel)

**Best practice**: Use `--cref` with `--cw 75–90` for commercial character consistency.

### Style Reference

```
--sref [IMAGE URL] --sw [WEIGHT 0–100]
```

Uses an existing image to anchor visual style (color, texture, art direction) across generations.

**Use for**: Maintaining consistent visual language across a campaign or lookbook series.

### Negative Prompt

```
--no [ELEMENT 1], [ELEMENT 2], [ELEMENT 3]
```

Midjourney uses `--no` instead of a separate negative prompt field.

```
--no blurry, low quality, distorted, oversaturated, extra fingers, 
deformed hands, text, watermark, logo
```

---

## Midjourney Prompt Styles

### Short Keyword Style (Midjourney classic)

Best for: Aesthetic and artistic images where Midjourney's interpretation is welcome.

```
[SUBJECT], [ENVIRONMENT], [LIGHTING ADJECTIVE], [STYLE REFERENCES], 
[QUALITY CUES] --ar [RATIO] --s [VALUE] --v 6.1
```

Example:
```
female model in cream linen, terracotta courtyard, bougainvillea, 
golden hour backlight, Helmut Newton editorial, 1970s Italian Vogue, 
film grain, ultra-detailed --ar 2:3 --s 400 --style raw --v 6.1
```

### Long Descriptive Style (photorealistic)

Best for: Images where accuracy and literal interpretation matter. Use with `--style raw`.

```
[DETAILED SUBJECT DESCRIPTION IN SENTENCES]. 
[ENVIRONMENT WITH SPECIFICS]. 
[PRECISE LIGHTING SETUP]. 
[LENS AND CAMERA]. 
[MATERIAL DESCRIPTORS]. 
[GRADE REFERENCE]. 
[QUALITY CUES] --ar [RATIO] --s [VALUE] --style raw --v 6.1
```

---

## Midjourney Reference Vocabulary

Midjourney's training includes a large library of photographers, artists, and publications. These references activate specific aesthetics.

### Photography References

**Portrait and editorial**:
- `Annie Leibovitz` — dramatic editorial portraiture, strong personality
- `Helmut Newton` — fashion, power, provocative
- `Peter Lindbergh` — raw beauty, natural, black and white
- `Irving Penn` — classic, clean, white background portraiture
- `Mario Testino` — warm, glamorous, aspirational
- `Tim Walker` — surreal, fantastical, highly styled

**Documentary and street**:
- `Steve McCurry` — vivid color, human connection, global aesthetic
- `Sebastião Salgado` — black and white, powerful, social documentary
- `Henri Cartier-Bresson` — decisive moment, street, reportage
- `Nan Goldin` — intimate, raw, warm tones

**Commercial and advertising**:
- `Nick Knight` — fashion technology, innovation
- `David LaChapelle` — hyper-saturated, theatrical, pop
- `Guy Bourdin` — surreal, provocative, French Vogue aesthetic

### Publication References

`Vogue`, `Harper's Bazaar`, `AnOther Magazine`, `i-D`, `Dazed and Confused`, `W Magazine`, `Purple Magazine`, `System Magazine`, `The New Yorker`, `National Geographic`, `Kinfolk`, `Monocle`

### Film References (for cinematic stills)

`Stanley Kubrick`, `Wong Kar-wai`, `Sofia Coppola`, `Wes Anderson`, `Roger Deakins` (cinematographer), `Emmanuel Lubezki` (cinematographer), `Ridley Scott`

---

## Complete Midjourney Prompt Templates

### Fashion Editorial

```
Fashion editorial photography, [MODEL DESCRIPTION], 
wearing [GARMENT DESCRIPTION], 
[ENVIRONMENT — specific and evocative], 
[LIGHTING — one or two adjectives + direction], 
[MAGAZINE REFERENCE] editorial, [PHOTOGRAPHER REFERENCE] aesthetic, 
film grain, fashion week quality, shot on film 
--ar 2:3 --s 350 --style raw --v 6.1 
--no blurry, low quality, distorted proportions, bad anatomy
```

### Portrait (Photorealistic)

```
Editorial portrait of a [AGE RANGE]-year-old [GENDER], 
[SKIN TONE] skin, [HAIR DESCRIPTION], [EYE DESCRIPTION], 
[WARDROBE — specific garment].

[POSE AND EXPRESSION].

[ENVIRONMENT — setting description].

[LIGHTING — source, direction, quality, temperature].

[FOCAL LENGTH]mm portrait lens, f/[APERTURE], [SHOT SIZE].

[COLOR GRADE — film stock or grade reference].

[MAGAZINE] editorial portrait, [PHOTOGRAPHER] aesthetic, 
ultra-high resolution, published in [MAGAZINE]
--ar 4:5 --s 150 --style raw --v 6.1
--no blurry, distorted face, asymmetrical eyes, bad hands, watermark
```

### Cinematic Atmospheric

```
Cinematic still frame, [SCENE DESCRIPTION — evocative and specific], 
[ATMOSPHERE — weather, time of day, quality of light], 
[CHARACTER if any — brief description and action], 
[LIGHTING — cinematic practical motivated], 
[FILM STOCK or CINEMATOGRAPHER reference], 
[DIRECTOR or FILM reference], anamorphic lens, film grain 
--ar 21:9 --s 500 --v 6.1
--no digital, CGI, video game, artificial, clean, corporate
```

### Luxury Product

```
[PRODUCT DESCRIPTION — type, material, color, finish], 
[BACKGROUND — dark, specific color and texture], 
[LIGHTING — hard specular, direction], 
[FOCAL LENGTH], luxury product photography, 
[BRAND REFERENCE] tier, [MAGAZINE] advertisement, 
ultra-high resolution, packshot quality 
--ar 4:5 --s 100 --style raw --v 6.1
--no blurry, cheap, amateur, plastic appearance, wrong material
```

---

## Midjourney-Specific Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Image too painted / not photographic | Default Midjourney stylization | Add `--style raw` and reduce `--stylize` to 50–100 |
| Character inconsistency across images | No character reference | Add `--cref [URL] --cw 80` |
| Text in image is distorted | Midjourney cannot render type reliably | Remove text from prompt; generate on Ideogram instead |
| Style references conflict | Too many photographer references | Use one photographer + one publication only |
| High chaos produces inconsistent batch | `--chaos` too high for production | Reduce to `--chaos 0–15` for commercial work |
| Composition not matching brief | Short prompt leaves too much to Midjourney | Write longer, more specific compositional description |
| Model ignores garment detail | Garment description too vague | Describe fabric, fit, color, and distinctive features in detail |
