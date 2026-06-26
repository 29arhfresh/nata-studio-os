# Prompt Architect

A production-ready skill for engineering, iterating, and deploying high-performance prompts across Claude and other large language models.

---

## Purpose

Prompt Architect is the systematic engineering discipline for designing AI prompts that perform reliably in production. It is not a collection of tips. It is a structured workflow that converts a task requirement into a deployable prompt with documented behavior, known edge cases, and measurable output quality.

This skill exists because prompt engineering is not intuitive at production scale. A prompt that works in a playground session fails in production when it encounters input variety, edge cases, adversarial users, or token budget constraints. Prompt Architect closes that gap.

**Who this skill is for**: AI engineers, product engineers, and operators who write prompts that run in production systems — customer-facing features, internal automation, AI agents, and data pipelines. If your prompt runs once, you do not need this skill. If it runs a thousand times per day and must be maintained, you do.

---

## Capabilities

| Capability | What It Produces |
|------------|-----------------|
| Task decomposition | Breaks ambiguous requirements into a precise prompt objective with measurable success criteria |
| System prompt architecture | Structures persona, context, constraints, and format instructions into a coherent prompt layer |
| Chain-of-thought scaffolding | Designs reasoning sequences that make models work through problems before concluding |
| Few-shot example design | Selects, sequences, and formats examples to maximize in-context learning signal |
| Structured output enforcement | Defines and contracts output schemas (JSON, XML, Markdown) with escape handling |
| Role and persona engineering | Crafts AI personas that constrain behavior and calibrate tone without reducing capability |
| Multi-turn conversation design | Maps dialogue flows, state carryover, and turn sequencing for chat-based systems |
| Context injection architecture | Plans retrieval, chunking, and document injection for RAG and long-context tasks |
| Evaluation harness design | Defines test cases, quality metrics, and regression criteria for prompt quality assurance |
| Model and tier selection | Matches task characteristics to the correct Claude model based on latency, cost, and capability |
| Prompt compression | Reduces token cost while maintaining output quality through instruction density analysis |
| Prompt versioning and change management | Documents prompt evolution with changelogs, rationale, and diff tracking |

---

## Limitations

Prompt engineering does not overcome model limitations. Understand these hard constraints before designing:

**Knowledge cutoff**: A prompt cannot inject world knowledge that postdates the model's training. Tasks requiring recent events require retrieval-augmented generation (RAG) or tool use, not better prompts.

**Context window boundary**: The combined token count of system prompt + injected context + user input + expected output must fit within the model's context window. Plan token budgets explicitly. Hitting the context limit silently truncates content.

**Stochastic variation**: Models with temperature > 0 produce different outputs on identical inputs. Temperature 0 reduces but does not eliminate variation. Build evaluation pipelines, not deterministic guarantees.

**Reasoning vs. instruction following**: A model can follow an instruction it cannot reason about. For multi-step logic problems, chain-of-thought scaffolding is required. Instruction following alone fails above a threshold of reasoning complexity.

**Self-evaluation unreliability**: Models systematically overrate the quality of their own outputs. Do not use the model to evaluate itself in the same generation call. External evaluation harnesses are mandatory for production.

**Adversarial robustness ceiling**: Prompts that accept user-controlled text are susceptible to prompt injection. No prompt-only defense is complete. Output filtering, schema validation, and application-layer enforcement are necessary complements.

**Schema hallucination**: Models asked to produce structured output (JSON, XML) occasionally invent fields, omit required fields, or produce malformed syntax, even when instructed otherwise. Always parse and validate; never consume raw model output as trusted data.

---

## Quick Start

1. **Define the task contract** — Write a one-sentence description of what input enters the prompt and what output must emerge. Ambiguity at this step propagates into every subsequent decision.

2. **Choose a structural pattern** — Open `templates/` and select the template that matches your task type. If nothing matches, start with `structured-output.md` and adapt.

3. **Fill the template** — Replace placeholder sections with task-specific content. Do not write prose when a table or list will do. Do not use vague qualifiers ("good," "appropriate") when concrete criteria are available.

4. **Stress-test before iterating** — Before refining for quality, confirm the prompt fails gracefully on empty input, malformed input, adversarial input, and input near the token limit. Failures here are architecture problems, not wording problems.

5. **Gate against the checklist** — Open `CHECKLIST.md` and work through every item. Do not deploy until all blocking items pass.

6. **Study annotated examples** — `EXAMPLES.md` contains 12 real production patterns with full prompts, design rationale, and known failure modes. Read the example that most closely matches your task before writing a single token.

---

## Skill Files

| File | Purpose |
|------|---------|
| `SYSTEM_PROMPT.md` | The Prompt Architect persona and behavioral instructions for AI-assisted prompt engineering |
| `WORKFLOW.md` | The complete end-to-end process from requirements intake to production deployment |
| `CHECKLIST.md` | Pre-deployment quality gate — every item is a pass/fail criterion, not a guideline |
| `EXAMPLES.md` | 12 annotated production prompts across task types with design notes and failure modes |
| `templates/` | Structural templates for the eight most common prompt engineering patterns |

---

## Core Principles

**Precision over cleverness.** The best prompt is the most explicit one. Models do not infer intent — they follow instructions. Write what you mean, with the specificity you would use in a technical specification.

**Structure signals intent.** Using XML tags, numbered sections, and JSON schemas is not a formatting preference. It is instruction architecture that reduces ambiguity and produces more reliable structured outputs.

**Test before you trust.** No prompt is production-ready until it has been evaluated against a diverse test set that includes edge cases, adversarial inputs, and distribution-shift scenarios.

**Token budget is a design constraint.** Every token costs money and occupies context space that could hold retrieved content. Budget tokens like memory: deliberately, with explicit tradeoff awareness.

**Version every change.** A prompt is code. It deserves a changelog, version identifier, and rationale for every modification. Silent prompt changes in production systems cause regressions that are nearly impossible to diagnose.

**The system prompt is the product.** In a production AI feature, the system prompt defines the product behavior. It must be reviewed with the same rigor as application code, stored in version control, and guarded against unauthorized modification.
