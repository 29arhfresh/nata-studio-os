# AI Video Director

A production-ready skill for directing, scripting, and prompting AI-generated video content across all major platforms and models.

## What This Skill Does

AI Video Director transforms creative briefs into precise, model-optimized video prompts. It operates as a virtual cinematographer and director — applying film grammar, shot theory, lighting principles, and narrative structure to every generation request.

This skill covers the full production pipeline:

- **Pre-production**: Concept development, storyboarding, shot lists, style references
- **Prompt engineering**: Model-specific syntax, parameter tuning, camera control
- **Consistency management**: Character coherence, world continuity, style locks
- **Post-production guidance**: Concatenation, upscaling, color grading, audio sync

## When to Use This Skill

Use AI Video Director when you need to:

- Generate cinematic video from text descriptions
- Animate a still image or existing character
- Produce product commercials, social content, or branded video
- Build consistent multi-shot sequences with the same characters or environments
- Create talking avatars and lip-synced dialogue videos
- Direct complex camera movements, lighting setups, or visual effects
- Troubleshoot generation failures, drift, or quality issues

## Supported Models

| Model | Strengths | Template |
|-------|-----------|----------|
| Seedance v2 | Photorealistic motion, commercial quality | `templates/seedance-v2.md` |
| Google Veo | Cinematic realism, long-form coherence | `templates/veo.md` |
| Kling | Fast iteration, creative styles | `templates/kling.md` |
| Sora | Complex scene composition, physics | `templates/sora.md` |
| Higgsfield | Character consistency, cinematics | `templates/higgsfield.md` |
| Nano Banana | Stylized, experimental formats | `templates/nano-banana.md` |

## Skill Files

| File | Purpose |
|------|---------|
| `SYSTEM_PROMPT.md` | The directing persona and core behavioral instructions |
| `WORKFLOW.md` | End-to-end production pipeline with decision points |
| `CHECKLIST.md` | Pre-generation, generation, and review checklists |
| `EXAMPLES.md` | Annotated real-world examples by content type |
| `TOOLS.md` | Tool reference for all supported platforms and APIs |
| `TROUBLESHOOTING.md` | Failure mode diagnosis and recovery strategies |
| `templates/` | Model-specific and use-case-specific prompt templates |

## Quick Start

1. Describe your creative intent (scene, mood, subject, purpose)
2. Identify your target model and output format
3. Load the relevant template from `templates/`
4. Follow `WORKFLOW.md` to develop and refine the prompt
5. Generate, evaluate against `CHECKLIST.md`, and iterate

## Core Principles

**Specificity over abstraction.** AI video models respond to concrete visual language — lens choices, color temperatures, specific motion verbs — not vague adjectives.

**Prompt hierarchy matters.** Lead with the most important visual element. Models weight the beginning of a prompt more heavily.

**Plan for imperfection.** Generate multiple variations. Budget for 3–5 iterations per final shot.

**Camera language is prompt language.** Using cinematographic terms (dolly, rack focus, Dutch angle, motivated lighting) produces dramatically better results than descriptive prose.
