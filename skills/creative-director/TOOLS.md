# Tools — Creative Director

This Skill integrates with the following Nata Studio OS tools and external platforms. Each tool is listed with its role in the creative pipeline, activation trigger, and configuration notes.

---

## Internal Skills

| Skill | Role | When to Activate |
|-------|------|-----------------|
| **AI Image Director** | Translates art direction into AI image prompts | After art direction is approved for image deliverables |
| **AI Video Director** | Translates art direction into AI video prompts | After art direction is approved for video deliverables |
| **Prompt Architect** | Structures prompts for copy and content generation | After brief and tone are defined for copy deliverables |
| **Knowledge Manager** | Stores and retrieves brand briefs and visual systems | At brief creation and during cross-campaign consistency audits |
| **Memory System** | Persists creative briefs, moodboards, and quality scores across sessions | On brief creation, visual system sign-off, and each review cycle |
| **Project Manager** | Tracks deliverable status from brief to approval | At campaign start and at each stage gate |

---

## Design Platforms

| Platform | Role | When to Use |
|----------|------|------------|
| **Figma** | Visual system documentation, layout specifications, component libraries | When delivering typography systems, color palettes, or composition specs to a design team |
| **Canva** | Moodboard assembly and visual direction presentation | When building moodboards for client or team review |

### Figma Integration

Use Figma when the visual system needs to be consumed by a design team:

1. Create a **Color Styles** file from the approved palette (primary, accent, neutral, supporting)
2. Create a **Text Styles** file from the typography system (primary, secondary, tertiary with size relationships)
3. Document composition rules as annotated frames in a **Art Direction** page
4. Share the Figma link in the creative brief document

### Canva Integration

Use Canva when building a moodboard for non-technical stakeholders:

1. Create a new presentation-format design (16:9 or 4:3)
2. Section one: Concept statement and narrative arc
3. Section two: Color palette swatches with hex codes and rationale
4. Section three: Typography samples at display and body scales
5. Section four: Reference images with one-line caption per image
6. Section five: Lighting and composition reference examples

---

## Image Generation Platforms

| Platform | Role in Creative Pipeline |
|----------|--------------------------|
| **Flux** | Hero image generation with high photorealism and prompt adherence |
| **Midjourney** | Concept exploration, mood development, editorial art direction |
| **Ideogram** | Typography-integrated compositions and graphic design elements |
| **Google Imagen** | Natural scenes, portraits, and lifestyle imagery |
| **Nano Banana** | Experimental and high-concept visual exploration |
| **Magnific** | Upscaling, relight, inpainting for final production quality |

The Creative Director does not write image prompts directly. It produces art direction, which is then passed to AI Image Director for prompt engineering. This separation ensures that creative strategy and technical prompt syntax remain distinct.

---

## Video Generation Platforms

| Platform | Role in Creative Pipeline |
|----------|--------------------------|
| **Seedance 2** | Physics-accurate motion, realistic movement |
| **Kling** | Character consistency, face preservation, motion quality |
| **Veo** | Cinematic quality and long-duration clips |
| **Sora** | World consistency and long-form creative video |
| **Higgsfield** | Dialogue, lip sync, character animation |
| **Runway** | Style control, video-to-video, color grading |

The Creative Director does not write video prompts directly. It produces art direction, which is passed to AI Video Director for prompt engineering.

---

## Copy and Content Platforms

| Platform | Role |
|----------|------|
| **Claude (Anthropic)** | Long-form copy, brand voice development, campaign concepting |
| **Prompt Architect** | Structured prompt templates for consistent copy output |

When producing copy deliverables, the Creative Director provides:
1. Brand voice descriptor from the brief tone
2. Narrative arc and emotional anchor
3. Typography hierarchy (which copy occupies which typographic role)
4. Character count or word count per copy zone

---

## Storage and Knowledge

| Tool | Data Stored |
|------|------------|
| **Memory System** | Creative briefs, visual systems, moodboards, quality scores |
| **Knowledge Manager** | Brand guidelines, campaign history, reference libraries |
| **Google Drive** | Final approved deliverables, master art direction documents |

### Storage Protocol

At the end of each stage:

| Stage | What to Store | Where |
|-------|--------------|-------|
| Brief complete | `CreativeBrief` object | Memory System + Knowledge Manager |
| Concept approved | Concept statement + reference directions | Memory System |
| Visual system signed off | Color palette, typography, composition | Memory System + Google Drive |
| Art direction complete | Full art direction per deliverable | Google Drive |
| Review complete | `CreativeScore` per deliverable | Memory System |
