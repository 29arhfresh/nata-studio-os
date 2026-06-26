# Product Video — Prompt Template

**Format:** Product Showcase / Demo Video
**Duration:** 15–90 seconds (composed of 3–10s clips)
**Aspect Ratio:** 16:9 (primary), 1:1 (display ads), 9:16 (social)
**Best Models:** Veo (image quality), Runway (style + motion brush), Seedance 2 (animation)

---

## Product Video Shot Architecture

Every product video needs at least three types of shots:

| Shot Type | Purpose | Duration |
|---|---|---|
| **Hero Shot** | The iconic, most compelling product image | 5–8s |
| **Detail Shot** | Key feature, texture, or material close-up | 2–4s |
| **In-Use Shot** | Product in hands or in natural context | 4–6s |
| **Environment Shot** | Product in aspirational setting | 4–6s |
| **Turntable / Orbit** | 360-degree product reveal | 6–10s |

---

## Product Classification Guide

Match the lighting and environment to the product category:

| Category | Environment | Lighting | Tone |
|---|---|---|---|
| **Luxury** | Marble, velvet, glass, natural stone | Soft studio, rim light, precise specular | Aspirational, quiet, refined |
| **Tech** | White or grey surface, clean studio | Hard directional, specular highlights, cool | Precise, modern, functional |
| **Beauty / Skincare** | White marble, water, botanicals | High-key, diffused, flattering | Clean, pure, radiant |
| **Food / Beverage** | Wood, slate, rustic or modern kitchen | Warm window light or studio, appetising | Tactile, indulgent, fresh |
| **Fashion / Apparel** | Studio or lifestyle location | Fashion photography lighting | Bold, stylish, aspirational |
| **Health / Wellness** | Natural materials, light wood, linen | Airy, natural window | Clean, pure, trustworthy |
| **Industrial / B2B** | Workshop, studio, grey seamless | Technical, precise, even | Functional, reliable |
| **Sports / Outdoor** | Location: trail, gym, road | High-energy, natural or dramatic | Dynamic, powerful |

---

## Core Prompt Templates

### 1. Hero Shot

```
[PRODUCT CATEGORY] hero shot. [PRODUCT DESCRIPTION — material, colour, shape].
Placed on [SURFACE DESCRIPTION]. [ENVIRONMENT / BACKGROUND].
Camera: static, [85–135mm] lens, [ANGLE — usually eye-level or very slight high-angle].
Lighting: [SETUP — see category guide above].
Colour grade: [GRADE ALIGNED TO BRAND].
Product is the sole focal point. Shallow depth of field, product sharp.
```

**Luxury example:**
```
Luxury fragrance hero shot. Dark amber glass bottle with gold cap, minimal label.
Placed on polished black marble, single white orchid beside it.
Camera: static, 100mm lens, eye-level.
Lighting: soft key from camera left, specular highlight on gold cap, deep rim light from behind.
Colour grade: warm highlights, deep neutral shadows, high contrast.
Product is the sole focal point. Shallow depth of field, bottle sharp, background soft.
```

**Tech example:**
```
Tech product hero shot. Matte black wireless earbuds in open charging case.
Placed on grey concrete surface, white cyclorama background.
Camera: static, 100mm lens, slight high-angle.
Lighting: hard directional key from camera right, cool 5500K, specular highlight on case hinge.
Colour grade: clean, neutral, no colour cast, crisp white background.
Product is the sole focal point. Shallow depth of field, product sharp.
```

### 2. Detail / Texture Shot

```
Extreme close-up: [SPECIFIC PRODUCT DETAIL — material, texture, mechanism, finish].
[WHAT MAKES THIS DETAIL SIGNIFICANT — quality marker, key feature].
Camera: static, [MACRO OR 100MM], [ANGLE — usually slight for depth].
Lighting: [RAKING LIGHT to reveal texture, or SPECULAR for reflective surfaces].
[BACKGROUND — usually clean, dark, or matching hero shot].
```

**Example:**
```
Extreme close-up: hand-stitched leather seam on a wallet edge.
Thread detail visible, leather grain texture prominent.
Camera: static, 100mm macro, 45-degree angle from the side.
Lighting: raking light from camera right at 45 degrees, reveals stitch texture,
warm 3500K, deep shadow on left side.
Clean black background.
```

### 3. In-Use Shot (Hands-On)

```
[PRODUCT] in use — [HANDS OR CHARACTER] [SPECIFIC ACTION].
[CONTEXT — where, by whom, what does this achieve for them].
Camera: [MOVEMENT], [50–85mm] lens, [ANGLE].
Lighting: [NATURAL OR MOTIVATED PRACTICAL — not studio].
Authentic moment, not posed. [EMOTION OR BENEFIT VISIBLE].
```

**Example:**
```
Coffee grinder in use — hands press the button, freshly ground beans fall into glass container.
Morning kitchen context, home environment.
Camera: static, 85mm lens, slight high-angle.
Lighting: warm morning window light from left, 3200K, coffee steam visible in backlight.
Authentic moment, natural. The aroma of coffee suggested by steam and expression of anticipation.
```

### 4. Turntable / 360 Orbit Shot

```
[PRODUCT DESCRIPTION] on [SURFACE].
Camera: orbit — slow 360-degree circle around the product, [LENS], eye-level.
Lighting: constant three-point studio — lighting remains fixed as camera moves.
Product remains centred throughout the orbit.
[BACKGROUND — clean cyclorama or branded].
Duration: [8–10s] for a full orbit.
```

**Note:** Not all AI models execute full orbits correctly. Test with a 90-degree arc first.

### 5. Environment / Lifestyle Shot

```
[PRODUCT] in [ASPIRATIONAL ENVIRONMENT matching brand identity].
[CONTEXT — who uses this, where, and what feeling does it evoke].
Camera: [MOVEMENT], [35–85mm] lens, [ANGLE].
Lighting: [NATURAL ATMOSPHERIC — aspirational, not studio].
Product visible but integrated into the scene — not isolated.
```

**Example:**
```
Luxury watch on a yacht deck at sea, white sails behind.
Owner's wrist visible, sailing in clear weather.
Camera: slow tilt down from wrist to sea, 85mm lens, eye-level.
Lighting: bright midday sunlight, 5500K, specular glint on watch face, sun on water background.
Product visible, sea and sky provide aspirational context.
```

---

## Lighting Setups for Products

### Standard Studio Three-Point

```
Key light: [45 degrees to subject, left or right], [QUALITY], [HEIGHT — above subject level], [COLOUR TEMPERATURE].
Fill light: opposite side of key, [LOWER INTENSITY — 2:1 ratio], [SOFTER].
Rim light: behind subject, highlights edges, separates from background.
```

### Specular / Reflective Products (Glass, Metal, Chrome)

```
Gradient diffusion panel: large soft source creating controlled highlight on [REFLECTIVE SURFACE].
No direct hard sources — reflected light only.
Background gradient: [LIGHT TO DARK OR BRAND COLOUR].
No visible hotspots or burned-out reflections.
```

### Raking / Texture Light (Leather, Fabric, Food)

```
Hard light from [EXTREME SIDE — nearly parallel to surface].
[COLOUR TEMPERATURE]. Deep shadow on opposite side.
Purpose: reveals surface texture and material depth.
Fill card on opposite side to control shadow density.
```

### High-Key / Clean White (Skincare, Beauty)

```
Large soft box key from above, slightly in front.
White reflector below for fill. No hard shadows.
White seamless background evenly lit — no gradient.
Product well-lit, no harsh shadows anywhere.
```

---

## Motion for Products

Even "static" product shots benefit from subtle motion:

| Motion Type | Description | Prompt |
|---|---|---|
| Slow push-in | Camera drifts almost imperceptibly toward product | "imperceptible slow dolly-in" |
| Environmental motion | Background elements move (leaves, fabric, liquid) | "background [ELEMENT] moves gently" |
| Product reveal | Fog/smoke clears to reveal product | "smoke clears revealing product" |
| Light change | Single light source changes intensity over clip | "light fades in from camera left" |
| Floating/suspension | Product appears to float (zero gravity) | "product floats in space, slow rotation" |

---

## Negative Prompts (Runway / Kling)

### General Product

```
warped product, incorrect proportions, distorted label, missing details,
text visible in scene, watermark, blurry product, incorrect colour,
overexposed highlights, unnatural reflections, duplicate products
```

### Hands-On Shots

```
extra fingers, distorted hands, blurry hands, incorrect product interaction,
unnatural grip, missing product element, warped product shape
```

---

## Quality Gate for Product Videos

- [ ] Hero shot: product is the clear, sharp focal point with no distractions.
- [ ] Detail shots: target feature is the sharpest element in frame.
- [ ] Lighting is consistent in colour temperature across all shots.
- [ ] Product colour is accurate — no cast from coloured fills.
- [ ] No text appears in any AI-generated frame.
- [ ] Product proportions are correct across all shots.
- [ ] In-use shots show authentic, believable usage.
- [ ] Turntable shot (if used) shows all product faces cleanly.
- [ ] Colour grade is consistent across all clips.
- [ ] Product is not obscured by shadow, blur, or foreground elements.
