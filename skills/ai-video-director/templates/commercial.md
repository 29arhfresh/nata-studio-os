# Commercial Production — Prompt Template

**Format:** Commercial / Advertising Video
**Typical Duration:** 15s, 30s, or 60s
**Aspect Ratios:** 16:9 (broadcast/YouTube), 9:16 (social), 1:1 (display)
**Best Models:** Veo (image quality), Runway (style control), Kling (character consistency)

---

## Commercial Video Structure

### 15-Second Format

| Segment | Duration | Purpose | Shot Type |
|---|---|---|---|
| Hook | 0–2s | Immediate attention capture | Hero shot or surprise |
| Problem / Desire | 2–6s | Establish relatable context | Lifestyle or tension |
| Solution | 6–12s | Product reveal and benefit | Product shot or transformation |
| CTA | 12–15s | Direct response prompt | Brand card or spoken CTA |

### 30-Second Format

| Segment | Duration | Purpose | Shot Type |
|---|---|---|---|
| Hook | 0–3s | Stop the scroll | Hero shot or emotional open |
| Context | 3–8s | Establish the world | Lifestyle wide shots |
| Problem | 8–13s | Surface the tension | Character close-up, reaction |
| Solution | 13–22s | Product introduction + demo | Product, in-use, transformation |
| Benefit | 22–27s | Emotional payoff | Character triumph or satisfaction |
| CTA | 27–30s | Brand and call to action | Brand lockup + voiceover |

---

## Shot Templates

### 1. Hero Shot (Product Showcase)

The most important single image of the product. Every commercial needs one.

```
Clean [PRODUCT CATEGORY] hero shot.
[PRODUCT DESCRIPTION] on [SURFACE / ENVIRONMENT].
Camera: static, [85–135mm] lens, eye-level.
Lighting: [THREE-POINT STUDIO OR ASPIRATIONAL NATURAL LIGHT].
Background: [CLEAN / BRAND COLOUR / CONTEXTUAL ENVIRONMENT].
[COLOUR GRADE ALIGNED TO BRAND IDENTITY].
```

**Example:**
```
Clean skincare hero shot.
Matte white glass serum bottle on a pale marble surface.
Camera: static, 100mm lens, eye-level.
Lighting: soft studio key from camera left, rim light from behind, white reflector fill.
Background: white cyclorama, gradient shadow beneath product.
Colour grade: clean, neutral, high-key, no colour cast.
```

### 2. Lifestyle Shot (Product in Use)

Show the product being used by a real person in a real environment.

```
Lifestyle shot: [CHARACTER DESCRIPTION] using [PRODUCT] in [ENVIRONMENT].
Natural, authentic moment — not posed.
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [NATURAL OR MOTIVATED PRACTICAL LIGHT].
Emotion: [TARGET FEELING — joy, confidence, relief, excitement].
```

**Example:**
```
Lifestyle shot: woman in her 30s, minimal makeup, applying moisturiser in a bright bathroom.
Natural, authentic moment — not posed.
Camera: tracking shot, 50mm lens, eye-level.
Lighting: soft morning window light, 6500K, clean white walls.
Emotion: confident, refreshed, at peace.
```

### 3. Problem / Tension Shot

Establish the problem the product solves without the product present.

```
[CHARACTER DESCRIPTION] experiencing [PROBLEM SCENARIO].
[EMOTION AND BODY LANGUAGE].
Camera: [MOVEMENT], [LENS] lens, [ANGLE].
Lighting: [SLIGHTLY DARKER OR MORE DRAMATIC — signifies the 'before' state].
```

**Example:**
```
A man in his 40s stares at a laptop screen late at night, rubbing his tired eyes.
Slumped posture, visible fatigue, tension in the jaw.
Camera: dolly-in slowly, 85mm lens, slight high-angle.
Lighting: cool blue screen light, dark room, under-eye shadows prominent.
```

### 4. Transformation / Reveal Shot

The moment the product changes the character's state.

```
[CHARACTER DESCRIPTION] after using [PRODUCT] — [TRANSFORMATION DESCRIPTION].
[BODY LANGUAGE AND EXPRESSION OF THE 'AFTER' STATE].
Camera: [MOVEMENT — often dolly-in or reveal], [LENS] lens, eye-level.
Lighting: [BRIGHTER, WARMER — signifies the 'after' state].
```

### 5. Brand Lockup / CTA Shot

Clean end card with brand identity.

```
Clean brand lockup. [BRAND COLOUR] background.
[PRODUCT / LOGO positioned centre frame].
Camera: static, 50mm lens, eye-level.
Lighting: even studio, no shadows, [BRAND COLOUR] tone.
[FADE IN / HOLD].
```

---

## Lighting Palettes by Brand Category

| Category | Lighting Style | Colour Temperature | Quality |
|---|---|---|---|
| Luxury / Beauty | Soft, diffused, high-key | 5500K daylight or 3200K warm | Soft box, butterfly |
| Tech / Gadget | Hard directional, sleek, specular | 5500K cool | Hard key, rim light |
| Food / Beverage | Warm, appetising, practical | 2800–3200K warm | Soft + kick light |
| Health / Wellness | Clean, natural, airy | 6500K daylight | Window light, overcast |
| Automotive | Dramatic, contrasty, cinematic | Mixed: warm key, cool fill | Hard, directional |
| Apparel | Natural, lifestyle, authentic | 5000–6000K neutral | Outdoor, golden hour |
| Finance / B2B | Professional, clean, trustworthy | 5000K neutral | Three-point, minimal |

---

## Brand Colour Integration

To align environment and lighting with brand colours, describe them in the prompt:

```
Environment incorporates [BRAND COLOUR] as [SURFACE / WALL / PROP].
Lighting has a [BRAND COLOUR] cast on the [SHADOW / FILL / BACKGROUND] side.
Complementary colour [COLOUR] used for accent.
```

**Example:**
```
Environment incorporates deep navy blue as the back wall.
Lighting has a warm gold cast on the key light side.
Complementary white used for clean surface and product base.
```

---

## Compliance Notes

- **Do not include product names or text** in the video prompt. AI models will hallucinate text incorrectly. Add text in post-production.
- **Do not include competitor names** in any prompt.
- **Talent likeness:** Ensure any character descriptions do not reference identifiable real people.
- **Food claims:** Avoid visual overstatements (perfect idealized food shots may not represent actual product).

---

## Model Recommendations by Commercial Type

| Commercial Type | Recommended Model | Reason |
|---|---|---|
| Beauty / Skincare | Veo | Highest skin quality, natural light rendering |
| Tech product | Runway | Style control, clean backgrounds |
| Lifestyle | Seedance 2 | Realistic motion, authentic human behaviour |
| Character-driven | Kling | Face consistency across shots |
| Animated product | Runway | Motion brush for controlled animation |
| Multi-character | Kling | Character seed management |

---

## Negative Prompts (Runway / Kling)

```
text overlay, watermark, logo, blurry product, distorted product, 
warped proportions, low resolution, incorrect colour, 
oversaturated, unnatural skin tone, flickering
```

---

## Quality Gate for Commercial Content

- [ ] Hero shot is crisp, well-lit, and product is the clear focal point.
- [ ] Lifestyle shots feel authentic, not staged.
- [ ] Brand colour palette is consistent across all shots.
- [ ] No AI-generated text appears in any shot.
- [ ] Character appearance is consistent if the same character appears in multiple shots.
- [ ] Emotional arc is complete: problem → solution → benefit.
- [ ] All clips are within duration targets for the intended platform.
