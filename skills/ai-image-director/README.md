# AI Image Director

A production-ready skill for directing, engineering, and optimizing AI-generated images across all major platforms and models.

---

## What This Skill Does

AI Image Director transforms creative briefs into precise, model-optimized image prompts. It operates as a virtual art director and visual strategist — applying composition principles, lighting theory, lens optics, material science, and platform-specific syntax to every generation request.

This skill covers the full image production pipeline:

- **Creative development**: Brief interpretation, mood definition, reference analysis, visual strategy
- **Prompt engineering**: Model-specific syntax, parameter optimization, trigger phrase libraries
- **Technical direction**: Lighting setups, camera simulation, lens selection, material rendering
- **Consistency systems**: Character anchoring, face consistency, style locking across generations
- **Post-processing guidance**: Upscaling, inpainting, outpainting, relight, background removal

---

## When to Use This Skill

Use AI Image Director when you need to:

- Generate product photography for e-commerce, editorial, or advertising
- Create portrait, fashion, or lifestyle imagery for brand campaigns
- Build character references with consistent face and body across multiple images
- Produce cinematic stills with controlled lighting, lens effects, and atmosphere
- Engineer luxury, editorial, or high-concept visual content
- Edit existing images through inpainting, outpainting, or selective modification
- Upscale and enhance images while preserving detail and realism
- Optimize prompts for a specific model's syntax, strengths, and quirks

---

## Supported Models

| Model | Strengths | Template |
|-------|-----------|----------|
| Flux (Black Forest Labs) | Photorealism, prompt adherence, detail fidelity | `templates/flux.md` |
| Midjourney | Artistic quality, stylization, mood | `templates/midjourney.md` |
| Ideogram | Typography, graphic design, logo integration | `templates/ideogram.md` |
| Google Imagen | Natural scenes, skin accuracy, soft realism | `templates/imagen.md` |
| Nano Banana | Stylized, experimental, high-concept | `templates/nano-banana.md` |
| Magnific | Upscaling, enhancement, creative upscale | `templates/magnific.md` |

---

## Skill Files

| File | Purpose |
|------|---------|
| `SYSTEM_PROMPT.md` | The AI Image Director persona and behavioral instructions |
| `WORKFLOW.md` | End-to-end production pipeline with decision points and gates |
| `CHECKLIST.md` | Pre-generation and review quality gates |
| `EXAMPLES.md` | Annotated real-world examples by content type |
| `templates/` | Use-case and model-specific prompt templates |

---

## Quick Start

1. Define the visual objective — what the image must communicate and to whom
2. Choose the appropriate template from `templates/` based on use case or target model
3. Fill the template with specific visual decisions (do not leave placeholders)
4. Run the prompt, evaluate against `CHECKLIST.md`, and iterate
5. Apply post-processing (upscale, inpaint, outpaint) using `templates/magnific.md`

---

## Template Index

### Use-Case Templates

| Template | When to Use |
|----------|------------|
| `portrait.md` | Headshots, character portraits, beauty, lifestyle |
| `product.md` | E-commerce, product detail, packshot, hero product |
| `fashion.md` | Editorial fashion, lookbook, runway, campaign |
| `advertising.md` | Brand campaigns, hero ads, OOH, digital banners |
| `cinematic.md` | Cinematic stills, atmosphere, narrative scenes |
| `character.md` | Character design, concept art, original characters |
| `consistent-character.md` | Multi-image sequences with one or more recurring characters |

### Model-Specific Templates

| Template | When to Use |
|----------|------------|
| `flux.md` | Generating on Flux (any variant) |
| `midjourney.md` | Generating on Midjourney |
| `ideogram.md` | Generating on Ideogram |
| `imagen.md` | Generating on Google Imagen |
| `nano-banana.md` | Generating on Nano Banana |
| `magnific.md` | Upscaling, inpainting, or outpainting on Magnific |

---

## Core Principles

**Visual language over verbal language.** AI image models respond to concrete visual descriptors — specific focal lengths, lighting directions, material properties, and composition rules — not emotional adjectives like "beautiful" or "stunning."

**Prompt hierarchy determines visual hierarchy.** The first clause of a prompt receives the most weight. Lead with the most important visual element: the subject, then the action or state, then the environment, then technical parameters.

**Reference is a design tool.** Using reference images as conditioning input is not cheating — it is the professional workflow. Every art director uses references. Build a reference vocabulary before writing a single prompt token.

**Iteration is the process.** No prompt produces the final image on the first generation. Budget for five to fifteen variations per final deliverable. The prompt evolves through feedback loops.

**Platform syntax is not optional.** Each model has a prompt grammar. Using Midjourney syntax on Flux, or Flux syntax on Ideogram, produces suboptimal results. Always use the model-specific template for the target platform.
