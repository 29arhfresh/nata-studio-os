# Social Reels — Prompt Template

**Format:** Vertical Social Video (Instagram Reels, TikTok, YouTube Shorts)
**Aspect Ratio:** 9:16 (1080×1920px)
**Duration:** 7–60 seconds
**Best Models:** Seedance 2 (motion), Kling (character), Runway (style)

---

## The Reels Attention Equation

```
Hook (0–2s) × Payoff (2–15s) × Loop/CTA (final 2s) = Retention
```

Every second must earn the next second. Viewers leave in the first 2 seconds or stay for the payoff. Design for both.

---

## Frame Architecture for 9:16

```
┌─────────────────┐  ← Safe zone top: 10% (avoid UI elements)
│                 │
│   ACTIVE ZONE   │  ← 10–80% = primary content area
│   (70% height)  │
│                 │
│─────────────────│  ← Caption zone begins at 80%
│  CAPTION ZONE   │  ← 80–90% = text overlay area
└─────────────────┘  ← Bottom 10%: platform UI chrome
```

### Composition Rules for Vertical

- **Centre your subject.** Place the primary subject in the centre 40% of the frame width.
- **Use vertical leading lines.** Trees, buildings, doorways — elements that draw the eye upward.
- **Face in the upper third.** For talking-head content, position eyes at the upper third.
- **Avoid horizontal composition.** Wide shots work poorly at 9:16; prefer close-ups and medium shots.
- **Fill the frame.** Empty space reads as dead on mobile. Get closer.

---

## Hook Templates

The hook is the most important frame in a reel. Start mid-action, not at the beginning.

### Visual Hook (no dialogue)

```
Vertical frame, 9:16. [DRAMATIC OR SURPRISING ACTION ALREADY IN PROGRESS].
Subject centred, fills frame. [HIGH ENERGY MOVEMENT OR VISUAL CONTRAST].
Camera: [FAST MOVEMENT OR STATIC WITH SUBJECT MOTION], [35–50mm] lens, eye-level.
Lighting: [HIGH CONTRAST OR VISUALLY STRIKING].
```

**Example:**
```
Vertical frame, 9:16. A chef flips a fireball in a dark kitchen, flames filling the frame.
Chef centred, face visible, dramatic expression.
Camera: static, 35mm lens, eye-level.
Lighting: fire as the only light source, dark surroundings, extreme contrast.
```

### Dialogue Hook (talking head)

```
Vertical frame, 9:16. [CHARACTER DESCRIPTION] speaks directly to camera.
Upper third face placement. Natural, direct, engaged expression.
Camera: static, [50–85mm] lens, eye-level.
Lighting: [CLEAN FRONTAL — soft box or ring light], [COLOUR TEMPERATURE].
[SIMPLE BACKGROUND — avoid clutter].
```

**Example:**
```
Vertical frame, 9:16. Woman in her 30s, bright eyes, speaks directly to camera with urgency.
Face in upper third, slightly leaning forward. Engaged, conspiratorial.
Camera: static, 50mm lens, eye-level.
Lighting: soft ring light, 5500K, warm skin tones.
Simple clean white wall background.
```

### Transformation Hook

```
Vertical frame, 9:16. BEFORE state: [DESCRIPTION].
Subject centred, [EMOTION/STATE].
Camera: static, [LENS] lens, eye-level.
```

Followed by a cut to:

```
Vertical frame, 9:16. AFTER state: [DESCRIPTION — dramatic improvement].
Same framing as BEFORE shot for visual comparison impact.
```

---

## Content Type Templates

### 1. Lifestyle / Aesthetic Reel

```
Vertical frame, 9:16. [ACTIVITY OR MOMENT DESCRIPTION].
[CHARACTER OR SUBJECT] in [ASPIRATIONAL ENVIRONMENT].
Camera: [SLOW DOLLY-IN OR TRACKING], [35–50mm] lens, eye-level.
Lighting: [GOLDEN HOUR / NATURAL WINDOW / ATMOSPHERIC].
[FILM STOCK REFERENCE — warm, cinematic].
```

**Example:**
```
Vertical frame, 9:16. A woman pours coffee in a sun-drenched minimalist apartment.
Morning light through floor-to-ceiling windows, plant in foreground.
Camera: slow dolly-in, 35mm lens, eye-level.
Lighting: golden morning window light, 3500K, warm and airy.
Kodak Portra 400 film stock.
```

### 2. Tutorial / Demo Reel

```
Vertical frame, 9:16. Close-up of [SUBJECT BEING DEMONSTRATED].
[HANDS / TOOLS] performing [ACTION STEP].
Camera: static, [MACRO OR 50MM], slight high-angle (looking down at work).
Lighting: even, shadow-free, [COLOUR TEMPERATURE].
Clean [SURFACE COLOUR] background.
```

**Example:**
```
Vertical frame, 9:16. Close-up of hands kneading bread dough on a wooden board.
Flour dusting the surface, textured dough visible.
Camera: static, 50mm, slight high-angle (45-degree overhead).
Lighting: soft diffused window light, 5500K, no hard shadows.
Clean marble background.
```

### 3. Travel / Adventure Reel

```
Vertical frame, 9:16. [LOCATION DESCRIPTION] — [TIME OF DAY, WEATHER].
[SUBJECT / PERSON] in foreground, [LANDSCAPE] in background.
Camera: [SLOW PAN OR STATIC], [24–35mm] lens, [ANGLE].
Lighting: [NATURAL ATMOSPHERIC LIGHT].
[VERTICAL FRAMING ELEMENT — waterfall, cliff face, doorway].
```

### 4. Fashion / Outfit Reel

```
Vertical frame, 9:16. [CHARACTER DESCRIPTION] wearing [OUTFIT DESCRIPTION].
[MOVEMENT — walking, turning, adjusting outfit].
Camera: [TRACKING OR SLOW DOLLY], [50–85mm] lens, eye-level.
Lighting: [NATURAL DAYLIGHT OR SOFT STUDIO].
[ENVIRONMENT — street, studio, interior].
```

### 5. Product Demo Reel (Conversion-Focused)

```
Vertical frame, 9:16. [PRODUCT] in use — [SPECIFIC USE CASE].
[RESULT OR TRANSFORMATION VISIBLE IN FRAME].
Camera: static or subtle push-in, [85–100mm] lens, eye-level or slight high-angle.
Lighting: clean studio, [COLOUR TEMPERATURE], product prominently lit.
Clean or brand-coloured background.
```

---

## Motion Guidelines for Reels

| Content Energy | Movement Style | Speed |
|---|---|---|
| High energy (dance, sport, action) | Fast cuts, tracking, handheld | 1–2s per clip |
| Mid energy (lifestyle, tutorial) | Slow dolly, gentle pan | 3–5s per clip |
| Low energy (ASMR, peaceful, luxury) | Static or imperceptible drift | 5–10s per clip |

**Beat sync:** For music-driven reels, cut on kick drum hits (typically every 0.5s at 120 BPM).

---

## Caption Zone Management

All generated clips must leave the bottom 20% of frame clear. Describe this in the prompt:

```
Subject and key action in the top 80% of the vertical frame.
Bottom 20% is clear — no text, faces, or important elements.
```

---

## Negative Prompts

### Runway / Kling Reels

```
horizontal composition, letterbox bars, landscape crop, 
blurry, low resolution, off-centre subject, empty frame, 
washed out colour, overexposed, underexposed
```

---

## Platform Specifications

| Platform | Ratio | Resolution | Duration | Safe Zone |
|---|---|---|---|---|
| Instagram Reels | 9:16 | 1080×1920 | 3–90s | Top and bottom 10% |
| TikTok | 9:16 | 1080×1920 | 3s–10min | Top and bottom 10% |
| YouTube Shorts | 9:16 | 1080×1920 | Up to 60s | Top 5%, bottom 20% |
| Facebook Reels | 9:16 | 1080×1920 | 3–90s | Top and bottom 10% |

---

## Quality Gate for Reels

- [ ] Frame is 9:16 vertical composition.
- [ ] Subject is centred horizontally.
- [ ] Bottom 20% is clear for captions.
- [ ] Hook is mid-action — not a slow buildup.
- [ ] Every clip reads clearly at mobile screen size.
- [ ] Motion is present in every shot (static reels underperform).
- [ ] Colour is vibrant and high-contrast for small screens.
- [ ] Duration is within platform limit.
