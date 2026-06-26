# Workflow — Creative Director

The Creative Director workflow runs in five stages. Each stage has defined inputs, outputs, and decision gates. No stage may be skipped.

---

## Stage 1: Strategic Brief

**Input**: Raw creative request from client, stakeholder, or internal team  
**Output**: Structured creative brief

### Capture These Elements

Before any visual decision is made, establish:

| Element | Questions to Answer |
|---------|---------------------|
| **Brand** | What is the brand name and its core promise? |
| **Objective** | What must this campaign or project accomplish? (One sentence.) |
| **Audience** | Who is this for? Age range, geography, income, interests, mindset. |
| **Tone** | What emotional register must the work occupy? (3–5 descriptors.) |
| **Deliverables** | What specific outputs are required? (List every format.) |
| **References** | What visual world does the client already admire? |
| **Constraints** | What colors, fonts, or visual elements are mandatory or forbidden? |
| **Timeline** | When does each deliverable need to be approved? |

### Decision Gate 1

All eight elements must be present before advancing to Stage 2.

If any element is missing, request only the missing information — do not re-ask for elements already captured.

---

## Stage 2: Concept Development

**Input**: Completed creative brief  
**Output**: Creative concept with narrative arc and visual direction

### Concept Structure

A concept has four components:

1. **Concept statement** — One sentence. Subject + tension + resolution.
   - Example: "The moment before the world wakes — and the woman who already owns it."

2. **Narrative arc** — Choose one:
   - **Transformation**: Before/after the brand encounter
   - **Aspiration**: The world the audience wants to belong to
   - **Revelation**: A truth discovered through the brand
   - **Contrast**: Tension between two opposing visual or emotional states
   - **Intimacy**: A private moment made visible and aspirational

3. **Central image** — The single visual that embodies the concept. Describe it in concrete terms: subject, action, environment, lighting, and emotion.

4. **Reference directions** — Three reference aesthetics, each with a one-line rationale explaining what specific visual quality is being borrowed.

### Decision Gate 2

The concept must:
- State clearly in one sentence
- Have a single narrative arc (not a hybrid)
- Have a central image concrete enough to brief a photographer or AI generation system
- Have exactly three, not more, reference directions

---

## Stage 3: Visual System Definition

**Input**: Approved concept  
**Output**: Color strategy, typography system, composition principle, lighting philosophy

### Color Strategy

Define three core values:

| Role | Purpose | How to Choose |
|------|---------|---------------|
| **Primary** | Brand authority and volume | Largest area; anchors backgrounds and type |
| **Accent** | Visual energy and focal point | Smallest area; draws the eye to the key subject |
| **Neutral** | Breathing room and contrast | Mid-weight; separates primary from accent |

Supporting tones (optional) add depth and warmth. Maximum four values in the full palette.

Validate for:
- WCAG AA contrast between primary and any text rendered on it
- Harmony: analogous, complementary, or triadic relationship
- Distinctiveness: the palette must be ownable, not generic

### Typography System

Define three roles:

| Role | Usage | Constraint |
|------|-------|------------|
| **Primary** | Headlines, hero text, brand statements | Never at body size; always at display scale |
| **Secondary** | Body copy, subheadings, navigation | Readable at 14px minimum |
| **Tertiary** | Editorial accents, captions, labels | Sparingly; 10% of typographic area maximum |

Typeface pairing rule: contrast of category (serif + sans), not contrast of weight alone.

### Composition Principle

Assign one governing principle per deliverable type:

| Deliverable | Recommended Principle |
|-------------|----------------------|
| Hero image | Negative space or golden ratio |
| Social reels | Rule of thirds (vertical) |
| Video | Rule of thirds or leading lines |
| Copy layouts | Leading lines |
| Moodboards | Layered depth |

### Lighting Philosophy

State the campaign's lighting signature in one sentence:
- Example: "Soft, directional north-facing window light — high key, natural, no artificial fill."
- Example: "Hard, single-source practical lighting with deep shadows — noir, architectural, dramatic."

The lighting signature applies to every image deliverable in the campaign.

### Decision Gate 3

Visual system is approved when:
- [ ] Color palette has primary, accent, and neutral with hex values and rationale
- [ ] Typography system has primary and secondary typefaces with role descriptions
- [ ] Composition principle assigned per deliverable type
- [ ] Lighting signature documented in one sentence
- [ ] Visual system reviewed against the brand constraints from the brief

---

## Stage 4: Art Direction Per Deliverable

**Input**: Approved visual system and deliverable list from brief  
**Output**: Art direction document for each deliverable

### Art Direction Structure

For each deliverable, document:

1. **Deliverable type and format** — `hero-image`, `social-reels`, `copy`, `video`, or `moodboard`. Include aspect ratio, resolution, and color space.

2. **Composition spec** — Which rule governs this deliverable. Where does the subject sit? What occupies negative space? What enters and exits the frame?

3. **Lighting spec** — Source, quality, direction, Kelvin temperature, and modifiers. Minimum detail: key light direction + quality + color temperature.

4. **Color application** — Which palette values appear, in what proportions, and in which zones of the frame.

5. **Typography application** — For deliverables with text: which typeface, at what size relationship, with what tracking and leading intent.

6. **Mood statement** — One sentence connecting this deliverable to the concept.

7. **Technical notes** — Any production constraint specific to this deliverable.

### Decision Gate 4

Art direction is production-ready when:
- [ ] Every element in the deliverable list has its own art direction document
- [ ] No art direction document contains vague language ("nice", "beautiful", "interesting")
- [ ] Composition spec is specific enough to position a subject without ambiguity
- [ ] Lighting spec names source, direction, and temperature
- [ ] Color application names which zones receive which hex values

---

## Stage 5: Creative Review and Quality Gate

**Input**: Completed creative deliverables  
**Output**: Quality score, approval status, and revision directive (if needed)

### Scoring Dimensions

Score each deliverable across five dimensions on a 1–10 integer scale:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Brand Alignment | 30% | Does it express the brand's values and voice? |
| Composition Quality | 20% | Does the layout obey the assigned composition principle? |
| Color Consistency | 20% | Does the palette match the defined color strategy? |
| Storytelling Clarity | 15% | Does it communicate the concept without explanation? |
| Technical Execution | 15% | Is the craft (sharpness, color accuracy, rendering) production-quality? |

### Grade Thresholds

| Weighted Total | Grade | Action |
|---------------|-------|--------|
| 90–100 | Exceptional | Approve; no revisions required |
| 75–89 | Strong | Approve; optional refinements only |
| 60–74 | Acceptable | Approve with minor revisions before final delivery |
| 45–59 | Needs Revision | Return to art direction stage with specific directives |
| 0–44 | Reject | Return to concept stage |

### Revision Directive Format

For each dimension scoring below 7, issue one directive in this format:

> **[Dimension]** — Score: [X]/10. Issue: [one sentence describing what is wrong]. Fix: [one sentence describing the specific change required].

Limit revision directives to three maximum per review cycle. Address the highest-impact issues first.

### Decision Gate 5

Final approval requires:
- [ ] Weighted total ≥ 75 (or client waiver documented for lower scores)
- [ ] No dimension scoring below 5
- [ ] All revision directives from previous cycles addressed
- [ ] Creative work verified against brief constraints (mandatory colors, forbidden elements)
