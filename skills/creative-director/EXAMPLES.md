# Examples — Creative Director

Annotated real-world examples organized by project type.

---

## Example 1 — Luxury Fragrance Launch

**Context**: Global launch campaign for a new fragrance by a heritage fashion house. Primary deliverables: hero image, social reels, copy.

### Creative Brief

```typescript
const brief = buildCreativeBrief({
  brand: 'Maison Éclat',
  objective: 'Launch a new fragrance to urban women aged 25–40 who value heritage and modernity.',
  tone: ['sophisticated', 'sensual', 'minimal', 'poetic'],
  references: ['Celine SS23', 'Bottega Veneta campaign 2022', 'Peter Lindbergh monochrome'],
  deliverables: ['hero-image', 'social-reels', 'copy'],
  audience: {
    ageRange: '25–40',
    geography: 'Global urban',
    interests: ['fashion', 'culture', 'wellness'],
    income: 'high',
  },
  constraints: {
    mandatoryColors: ['#1A1A1A', '#C9A96E'],
    forbiddenElements: ['busy backgrounds', 'warm filters', 'fast fashion aesthetics'],
  },
});
```

**Output — Color Strategy**:
- Primary: `#1A1A1A` (brand authority, silence, weight)
- Accent: `#C9A96E` (gold warmth, luxury, the scent bottle)
- Neutral: `#F5F0EB` (skin, linen, morning light)

**Output — Typography**:
- Primary: Didot (display, headlines)
- Secondary: Helvetica Neue Light (body, navigation)
- Tertiary: Garamond Italic (editorial accents)

---

### Moodboard

```typescript
const moodboard = buildMoodboard({
  concept: 'Memory of light — the scent of a city at dusk',
  palette: brief.colorStrategy,
  typography: brief.typographyGuidance,
  mood: ['golden', 'quiet', 'architectural', 'intimate', 'timeless'],
  format: 'digital',
});
```

**Reference Categories**:
1. **Color & Light** — Late afternoon window light, long shadows, warm-to-cool gradient
2. **Texture & Material** — Linen, glass, unpolished concrete, skin
3. **Composition** — Negative space, architectural geometry, single subject in silence
4. **Typography** — Large Didot against clean space, sparse tracking
5. **Talent & Casting** — Woman, late 30s, strong features, no expression, presence

---

### Art Direction — Hero Image

```typescript
const artDir = buildArtDirection({
  brief,
  deliverableType: 'hero-image',
  compositionRule: 'negative-space',
  lightingStyle: 'soft north-facing window light from camera left, 5500K, no fill, shadow gradient to the right',
});
```

**Output**:
- **Composition**: Subject occupies the right third of frame. The left two-thirds is pure background — linen or concrete. The fragrance bottle sits between the subject and the right edge, in sharp focus.
- **Lighting**: Soft north window light, camera left. No artificial fill. Long shadow moving right. Color temperature 5500K.
- **Color application**: Background at `#F5F0EB`. Shadow zones approaching `#1A1A1A`. Gold accent `#C9A96E` on the bottle only.
- **Typography**: Maison Éclat logotype in Didot, bottom-left, small scale, generous tracking.
- **Mood**: Silence before the city moves. The private moment of choosing.

---

### Quality Score — Completed Hero Image

```typescript
const score = scoreCreative({
  deliverable: 'hero-image',
  brandAlignment: 9,
  compositionQuality: 9,
  colorConsistency: 8,
  storytellingClarity: 8,
  technicalExecution: 9,
});
// → total: 87, grade: 'Strong', recommendation: 'Approve for production. No mandatory revisions.'
```

---

## Example 2 — Direct-to-Consumer Skincare Launch

**Context**: Digital-first product launch for a vitamin C serum. Primary deliverable: hero image and copy for paid social.

### Creative Brief

```typescript
const brief = buildCreativeBrief({
  brand: 'NOVA Skincare',
  objective: 'Introduce a new vitamin C serum to a global DTC audience seeking visible results.',
  tone: ['clean', 'scientific', 'optimistic', 'accessible'],
  references: ['Glossier campaign 2021', 'The Ordinary product photography'],
  deliverables: ['hero-image', 'copy'],
  audience: {
    ageRange: '22–35',
    geography: 'Global digital-first',
    interests: ['wellness', 'beauty', 'skincare routines'],
    income: 'mid',
  },
  constraints: {
    mandatoryColors: ['#FFFFFF', '#0066CC'],
    forbiddenElements: ['heavy retouching', 'unrealistic skin', 'clutter'],
  },
});
```

**Output — Color Strategy**:
- Primary: `#FFFFFF` (clinical clarity, trust)
- Accent: `#0066CC` (science, efficacy, digital native)
- Neutral: `#F2F2F2` (soft studio, clean surface)

**Output — Typography**:
- Primary: Neue Haas Grotesk (headlines, product name)
- Secondary: IBM Plex Mono (ingredient callouts, percentage claims)

---

### Art Direction — Hero Image

```typescript
const artDir = buildArtDirection({
  brief,
  deliverableType: 'hero-image',
  compositionRule: 'rule-of-thirds',
  lightingStyle: 'soft diffused overhead studio light, 6000K, even illumination, no shadow drama',
});
```

**Art Direction**:
- Product bottle occupies left third, vertically centered, angled 15° toward camera.
- Right two-thirds: model's bare shoulder and neck, showing skin texture — real pores visible, no blur.
- Background: `#FFFFFF`. No props.
- Lighting: Even, clinical, shadowless. 6000K overhead diffusion.
- Typography: Product name in Neue Haas Grotesk Bold, upper right. "Vitamin C 20%" in IBM Plex Mono below.

---

### Quality Score

```typescript
const score = scoreCreative({
  deliverable: 'hero-image',
  brandAlignment: 8,
  compositionQuality: 7,
  colorConsistency: 9,
  storytellingClarity: 7,
  technicalExecution: 8,
});
// → total: 79, grade: 'Strong', recommendation: 'Approve for production. No mandatory revisions.'
```

---

## Example 3 — Creative Revision After Low Score

**Context**: A social reels deliverable scored 58 — "Needs Revision". The Creative Director issues a revision directive.

### Initial Score

```typescript
const score = scoreCreative({
  deliverable: 'social-reels',
  brandAlignment: 5,
  compositionQuality: 6,
  colorConsistency: 5,
  storytellingClarity: 6,
  technicalExecution: 7,
});
// → total: 58, grade: 'Needs Revision'
```

### Revision Directive

**Brand Alignment** — Score: 5/10. Issue: The reel uses a warm yellow-orange filter that contradicts the brand's cool, clinical palette. Fix: Remove the color grade and regrade to the defined palette — white primary background, `#0066CC` accent on typography only.

**Color Consistency** — Score: 5/10. Issue: Three different background tones appear across six cuts; the palette shifts mid-reel. Fix: Lock the background to `#FFFFFF` across all cuts and apply grade in post before export.

**Storytelling Clarity** — Score: 6/10. Issue: The product appears in cut 4 of 6 — too late; the viewer has not been anchored to the brand before the product reveal. Fix: Introduce the product in cut 1 or 2, establish the skin benefit, then resolve with the product as the answer.

### Revised Score (After Revisions Applied)

```typescript
const revisedScore = scoreCreative({
  deliverable: 'social-reels',
  brandAlignment: 8,
  compositionQuality: 7,
  colorConsistency: 8,
  storytellingClarity: 8,
  technicalExecution: 7,
});
// → total: 78, grade: 'Strong', recommendation: 'Approve for production. No mandatory revisions.'
```
