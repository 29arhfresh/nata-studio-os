# Nata Studio OS

**AI Operating System for Creative Professionals**

Nata Studio OS is a modular, skill-based AI runtime that gives creative teams a structured system to orchestrate AI workflows — from brand strategy and image generation to video production, knowledge management, and project tracking. Every capability is packaged as a self-contained **Skill** that can be invoked independently or composed through the central **Agent Orchestrator**.

---

## Table of Contents

1. [Vision](#vision)
2. [Architecture Overview](#architecture-overview)
3. [Skills](#skills)
4. [Workflow Diagram](#workflow-diagram)
5. [Installation](#installation)
6. [Quick Start](#quick-start)
7. [Repository Structure](#repository-structure)
8. [Development Workflow](#development-workflow)
9. [Roadmap](#roadmap)
10. [Standards](#standards)

---

## Vision

Creative work is fragmented across too many tools, models, and workflows. Nata Studio OS unifies them under a single operating layer:

- **One standard** — Every Skill follows [NATA_STANDARD](standards/NATA_STANDARD.md), so every module is predictable, testable, and composable.
- **One orchestrator** — The Agent Orchestrator routes work, resolves conflicts, enforces quality gates, and hands off context automatically.
- **One memory layer** — The Memory System and Knowledge Manager give every Skill access to shared context without manual wiring.
- **Creative-first** — Purpose-built for image direction, video production, and brand strategy — not generic task automation.

The goal is a system where a creative professional can describe a deliverable in plain language and the OS handles model selection, prompt engineering, asset generation, and quality review.

---

## Architecture Overview

Nata Studio OS is organized in three layers:

### Layer 1 — Core Infrastructure

| Skill | Role |
|---|---|
| **Agent Orchestrator** | Routes requests, builds dependency graphs, enforces quality gates, and manages execution order across all Skills. |
| **Memory System** | Four-tier memory (short-term, long-term, project, session) with semantic search and cross-Skill context handoff. |
| **Knowledge Manager** | Central knowledge layer with structured indexing, semantic search, version tracking, and citation management. |

### Layer 2 — Creative Production

| Skill | Role |
|---|---|
| **Creative Director** | Brand strategy, visual direction, moodboard composition, and quality scoring across five creative dimensions. |
| **AI Image Director** | Model-specific prompt optimization and production direction for Flux, Midjourney, Ideogram, Imagen, Nano Banana, and Magnific. |
| **AI Video Director** | Cinematic shot construction, multi-shot storyboarding, and model optimization for Seedance, Veo, Kling, Sora, Higgsfield, and Runway. |

### Layer 3 — Operations & Engineering

| Skill | Role |
|---|---|
| **Project Manager** | Project lifecycle engine with tasks, milestones, risks, resource allocation, health scoring, and roadmap generation. |
| **Prompt Architect** | Production-quality prompt engineering: task decomposition, system prompt architecture, few-shot design, and evaluation harnesses. |

### Skill Types

Nata Studio OS includes two types of Skills:

| Type | Description | Entrypoint |
|---|---|---|
| **TypeScript Skill** | Fully implemented module with typed API, tests, and direct invocation | `src/index.ts` |
| **AI-native Skill** | Executed by an AI model via `SYSTEM_PROMPT.md`, `WORKFLOW.md`, and templates | `SYSTEM_PROMPT.md` |

AI Image Director and Prompt Architect are AI-native Skills. They are complete and production-ready — their execution model is the AI session, not a TypeScript import. Typed TypeScript APIs for both are planned for v1.x.

### Key Design Principles

- **Skill isolation** — Each Skill is self-contained with its own source, tests, and documentation.
- **Standard interface** — All Skills expose `skill.json` manifests. TypeScript Skills add a typed `src/index.ts` entrypoint.
- **Context sharing** — Memory System enables Skills to share context without direct coupling.
- **Quality gates** — Agent Orchestrator scores every output before returning it to the caller.
- **No external dependencies by default** — All `skill.json` manifests declare `"dependencies": {}` unless a runtime dependency is explicitly required.

---

## Skills

### Agent Orchestrator

**Path:** `skills/agent-orchestrator/`

The central coordination brain. Accepts a high-level intent, maps it to the right Skills, builds an execution plan with dependency resolution, detects conflicts, runs Skills in the configured policy (sequential, parallel, conditional, or fallback-chain), and enforces quality gates on every output.

**Key functions:**

| Function | Description |
|---|---|
| `orchestrate()` | Full execution pipeline — intent analysis, routing, planning, execution, quality gating, memory handoff |
| `route()` | Intent-to-Skill mapping with confidence scoring |
| `plan()` | Dependency graph construction with topological sort and cycle detection |
| `detectConflicts()` | Identifies capability overlaps with resolution strategies (priority, merge, abort, user-prompt) |

**Supports:** Allowlist/blocklist of Skills, max 10 iterations per session, fallback execution on primary output failure.

---

### AI Image Director

**Path:** `skills/ai-image-director/`  
**Type:** AI-native

Translates a creative brief into production-ready, model-optimized image prompts. Handles character consistency anchoring, composition and lighting direction, and post-processing guidance (upscale, inpaint, outpaint).

**Invocation:** Load `SYSTEM_PROMPT.md` into an AI session, select a template, and follow `WORKFLOW.md`.

**Supported models:** Flux · Midjourney · Ideogram · Google Imagen · Nano Banana · Magnific

**Built-in templates:** `portrait` · `product` · `fashion` · `advertising` · `cinematic` · `character` · `consistent-character`

**Core principle:** Visual language over verbal language — concrete descriptors, not adjectives. Platform syntax is non-optional. Iteration is the process (5–15 variations per final deliverable).

---

### AI Video Director

**Path:** `skills/ai-video-director/`

Builds production-ready video prompts and multi-shot sequences. Applies camera grammar (dolly, pan, tilt, orbit, tracking, crane), lens descriptors, angle vocabulary, and music BPM alignment for sequence pacing.

**Supported models:** Seedance 2 · Veo · Kling · Sora · Higgsfield · Runway

**Key functions:**

| Function | Description |
|---|---|
| `buildShot()` | Single shot with camera movement, lighting, and duration |
| `buildSequence()` | Multi-shot sequence with music BPM alignment |
| `optimisePrompt()` | Model-specific syntax optimization |
| `compareModels()` | Model capability comparison for a given brief |

**Production formats:** `cinematic` · `reels` · `commercial` · `product-video` · `music-video`

---

### Creative Director

**Path:** `skills/creative-director/`

Strategic and aesthetic intelligence for brand and visual direction. Produces creative briefs, moodboards, and art direction documents. Scores creative outputs across five dimensions: brand alignment, composition quality, color consistency, storytelling clarity, and technical execution (each 1–10).

**Key functions:**

| Function | Description |
|---|---|
| `buildCreativeBrief()` | Brand strategy with objectives, tone, and deliverables |
| `buildMoodboard()` | Visual reference composition with palette anchoring |
| `buildArtDirection()` | Composition rules and lighting guidance |
| `scoreCreative()` | Five-dimension quality scoring |

**Built-in composition rules:** Rule of thirds · Golden ratio · Symmetry · Negative space · Leading lines · Layered depth

---

### Knowledge Manager

**Path:** `skills/knowledge-manager/`

Central knowledge layer for the entire OS. Stores structured entries with typed relationships, full-text indexing, and citation provenance. Assembles token-budgeted context windows for downstream AI prompts.

**Knowledge types:** `concept` · `procedure` · `reference` · `example` · `decision` · `glossary` · `faq` · `standard`

**Key functions:**

| Function | Description |
|---|---|
| `create()` | Structured entry with validation |
| `search()` | Hybrid retrieval — exact, semantic, tag-match, relationship-traversal |
| `assembleContext()` | Token-budgeted context assembly for AI prompts |
| `detectDuplicates()` | Jaccard title similarity scanning |
| `importEntries()` / `exportEntries()` | Batch JSON operations |

---

### Memory System

**Path:** `skills/memory-system/`

Unified four-tier memory with semantic search, TTL-based expiry, quality scoring, and cross-Skill context handoff.

**Memory tiers:**

| Tier | Scope | Persistence |
|---|---|---|
| `short-term` | Session | Temporary, high recency |
| `long-term` | Global | Persistent, semantically indexed |
| `project` | Project | Shared across sessions |
| `session` | Session | Temporary |

**Key functions:**

| Function | Description |
|---|---|
| `store()` | Write with TTL, tags, and quality metadata |
| `search()` | Semantic search across tiers (exact, tag-match, hybrid) |
| `restoreContext()` | Full context restoration for sessions and projects |
| `handoff()` | Cross-Skill context transfer |
| `prune()` | Scheduled and on-demand memory cleanup |

---

### Project Manager

**Path:** `skills/project-manager/`

Project lifecycle engine for managing creative production work. Tracks tasks, milestones, risks, and resources. Generates health scores, status reports, and roadmaps.

**Task states:** `backlog` → `todo` → `in-progress` → `blocked` → `in-review` → `done` → `cancelled`

**Key functions:**

| Function | Description |
|---|---|
| `createProject()` | New project with priority, dates, owner, and tags |
| `createTask()` | Task with priority, assignee, effort estimate, and dependencies |
| `createMilestone()` | Milestone with success criteria |
| `createRisk()` | Risk with probability/impact and mitigation plan |
| `scoreHealth()` | Project health scoring |
| `generateRoadmap()` | Milestone timeline with on-track analysis |

**Resource types:** `human` · `tool` · `budget` · `time`

---

### Prompt Architect

**Path:** `skills/prompt-architect/`  
**Type:** AI-native

Production-quality prompt engineering discipline for reliable, reproducible AI outputs. Covers system prompt architecture, chain-of-thought scaffolding, few-shot design, structured output enforcement, and evaluation harness design.

**Invocation:** Load `SYSTEM_PROMPT.md` into an AI session, select a template from `templates/`, and follow `WORKFLOW.md`.

**Core principle:** The system prompt is the product. Precision over cleverness. Test before you trust. Version every change.

**Capabilities:**

- Task decomposition with measurable success criteria
- System prompt architecture (persona, context, constraints)
- Chain-of-thought scaffolding for complex reasoning
- Few-shot example design for in-context learning
- Structured output enforcement (JSON, XML, Markdown)
- Multi-turn conversation design
- Context injection for RAG systems
- Evaluation harness design
- Model selection guidance
- Prompt compression and token budget management

---

## Workflow Diagram

```
User Request
     │
     ▼
┌─────────────────────┐
│   Agent Orchestrator │  ◄── Skill registry, allowlist/blocklist
│                     │
│  1. Analyse intent  │
│  2. Route to Skills │
│  3. Build exec plan │
│  4. Detect conflicts│
│  5. Execute Skills  │
│  6. Quality gate    │
│  7. Memory handoff  │
└─────────┬───────────┘
          │
    ┌─────┴──────────────────────────────────────────┐
    │                                                │
    ▼                                                ▼
┌─────────────────┐                      ┌─────────────────────┐
│  Core Layer     │                      │  Production Layer   │
│                 │                      │                     │
│ Memory System   │◄────context share────│ Creative Director   │
│ Knowledge Mgr   │                      │ AI Image Director   │
└────────┬────────┘                      │ AI Video Director   │
         │                              └──────────┬──────────┘
         │                                         │
         └──────────────────┬──────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Operations     │
                    │                │
                    │ Project Mgr    │
                    │ Prompt Architect│
                    └───────┬────────┘
                            │
                            ▼
                    Structured Output
                    (scored, versioned,
                     memory-persisted)
```

**Execution policies supported by the Orchestrator:**

| Policy | When to use |
|---|---|
| `sequential` | Output of one Skill feeds the next |
| `parallel` | Independent Skills run concurrently |
| `conditional` | Branch based on runtime output quality |
| `fallback-chain` | Try primary Skill; fall back on failure |

---

## Installation

### Prerequisites

- Node.js 20+
- TypeScript 5+
- Git

### Clone the repository

```bash
git clone https://github.com/29arhfresh/nata-studio-os.git
cd nata-studio-os
```

### Install dependencies

Each Skill is self-contained. Navigate into any Skill directory to install its dependencies:

```bash
cd skills/agent-orchestrator
npm install
```

To install all Skills at once:

```bash
for skill in skills/*/; do
  (cd "$skill" && npm install)
done
```

### Run tests

```bash
cd skills/agent-orchestrator
npm test
```

---

## Quick Start

### Orchestrate a multi-skill pipeline

```typescript
import orchestrator from './skills/agent-orchestrator/src/index';

const result = orchestrator.orchestrate({
  intent: 'Create a cinematic portrait prompt for a fashion campaign',
  allowedSkills: ['creative-director', 'ai-image-director'],
  policy: 'sequential',
  qualityThreshold: 0.8,
});

console.log(result.qualityGate.status); // 'pass'
console.log(result.finalOutput);
```

### Use the AI Image Director (AI-native)

AI Image Director is an AI-native Skill — load its system prompt into your AI session, then select a template:

```
1. Load skills/ai-image-director/SYSTEM_PROMPT.md as the system instruction.
2. Select a template: skills/ai-image-director/templates/portrait.md
3. Fill all template fields and run the generation.
4. Evaluate the output against skills/ai-image-director/CHECKLIST.md.
```

See `skills/ai-image-director/SKILL.md` for the full usage guide.

### Build a video sequence

```typescript
import director from './skills/ai-video-director/src/index';

const sequence = director.buildSequence({
  model: 'runway',
  format: 'commercial',
  shots: [
    { scene: 'Luxury watch on white marble, close-up, macro detail', duration: 6 },
    { scene: 'Watch worn on wrist, outdoor golden hour, tracking shot', duration: 8 },
    { scene: 'Brand logo reveal on black background', duration: 4 },
  ],
  bpm: 120,
});

console.log(sequence.shots);
console.log(sequence.totalDuration); // 18
```

### Store and retrieve knowledge

```typescript
import { create, search } from './skills/knowledge-manager/src/index';

create({
  type: 'procedure',
  title: 'Consistent character workflow',
  content: 'Use IP-Adapter or seed anchoring to preserve character appearance across generations...',
  tags: ['image', 'character', 'flux'],
  status: 'active',
  author: 'ai-image-director',
  version: '0.1.0',
});

const results = search({ query: 'character consistency', strategy: 'hybrid' });
console.log(results.entries[0].entry.title); // 'Consistent character workflow'
```

---

## Repository Structure

```
nata-studio-os/
├── README.md                          # This file
├── standards/
│   └── NATA_STANDARD.md              # Universal Skill standard (v1.0.0)
├── skills/
│   ├── agent-orchestrator/           # Core: routing, planning, quality gates
│   │   ├── SKILL.md                  # API documentation
│   │   ├── skill.json                # Manifest
│   │   ├── src/index.ts              # Entrypoint (TypeScript)
│   │   └── tests/                    # Test suite
│   ├── ai-image-director/            # AI-native: image prompt direction
│   │   ├── SKILL.md                  # Usage guide
│   │   ├── skill.json                # Manifest (type: ai-native)
│   │   ├── SYSTEM_PROMPT.md          # AI director persona
│   │   ├── WORKFLOW.md               # Production pipeline
│   │   ├── CHECKLIST.md              # Quality gates
│   │   ├── EXAMPLES.md               # Annotated examples
│   │   └── templates/                # Use-case and model-specific templates
│   ├── ai-video-director/            # Video prompt direction
│   │   ├── SKILL.md                  # API documentation
│   │   ├── skill.json                # Manifest
│   │   ├── src/index.ts              # Entrypoint (TypeScript)
│   │   ├── tests/                    # Test suite
│   │   └── templates/                # Shot and sequence templates
│   ├── creative-director/            # Brand strategy and visual direction
│   ├── knowledge-manager/            # Knowledge indexing and retrieval
│   ├── memory-system/                # Four-tier memory management
│   ├── project-manager/              # Project lifecycle management
│   └── prompt-architect/             # AI-native: prompt engineering discipline
│       ├── SKILL.md                  # Usage guide
│       ├── skill.json                # Manifest (type: ai-native)
│       ├── SYSTEM_PROMPT.md          # Prompt Architect persona
│       ├── WORKFLOW.md               # Engineering process
│       ├── CHECKLIST.md              # Pre-deployment gates
│       ├── EXAMPLES.md               # Annotated production patterns
│       └── templates/                # Structural prompt templates
├── docs/                             # Project-level documentation (planned)
├── knowledge/                        # Shared knowledge base (planned)
├── projects/                         # Project templates (planned)
├── prompts/                          # Prompt library (planned)
└── templates/                        # Skill and project templates (planned)
```

Each Skill follows the same mandatory layout defined in [NATA_STANDARD](standards/NATA_STANDARD.md#1-folder-structure).

---

## Development Workflow

### Adding a new Skill

1. **Create the directory** under `skills/<skill-name>/` using kebab-case.
2. **Add required files**: `SKILL.md`, `skill.json`, `src/index.ts`, `tests/<skill-name>.test.ts`.
3. **Follow the standard** — see [NATA_STANDARD](standards/NATA_STANDARD.md) for the complete specification.
4. **Write tests** — minimum 80% line coverage; positive, negative, and edge cases for every public function.
5. **Open a PR** — title follows Conventional Commits format; max 400 LOC per PR excluding tests.
6. **Squash and merge** after one approved review and all checks passing.

### Commit format

Nata Studio OS uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

**Types:** `feat` · `fix` · `docs` · `test` · `refactor` · `chore` · `perf` · `ci`

**Scope:** Skill folder name or `standards`

**Example:**

```
feat(ai-image-director): add consistent-character template for Flux
```

### Code standards

- TypeScript strict mode — no `any` types.
- Max function length: 40 lines.
- No magic numbers — use named constants.
- No commented-out code in committed files.
- All exported symbols have explicit return types.

### Versioning

Skills use [Semantic Versioning 2.0.0](https://semver.org/):

| Bump | When |
|---|---|
| `PATCH` | Backward-compatible bug fix |
| `MINOR` | New backward-compatible functionality |
| `MAJOR` | Breaking change to the public interface |

New Skills start at `0.1.0`. Promotion to `1.0.0` only when the public interface is stable.

Every version bump requires a Changelog entry in the same commit.

---

## Roadmap

### Phase 1 — Foundation (Complete)

- [x] NATA_STANDARD v1.0.0 — Universal Skill standard established
- [x] Agent Orchestrator v0.1.0 — Routing, planning, quality gates
- [x] Memory System v0.1.0 — Four-tier memory with semantic search
- [x] Knowledge Manager v0.1.0 — Structured indexing and context assembly
- [x] Creative Director v0.1.0 — Brand strategy and visual direction
- [x] AI Image Director v0.1.0 — Six-model image prompt direction
- [x] AI Video Director v0.1.0 — Six-model video prompt direction
- [x] Project Manager v0.1.0 — Project lifecycle engine
- [x] Prompt Architect v0.1.0 — Production-quality prompt engineering

### Phase 2 — Stability (In Progress)

- [ ] Promote all Skills to `1.0.0` with stable public interfaces
- [ ] Shared `docs/` with integration guides
- [ ] Prompt library in `prompts/` for common creative patterns
- [ ] Skill templates in `templates/` for faster onboarding
- [ ] CI pipeline with automated coverage enforcement

### Phase 3 — Expansion (Planned)

- [ ] Asset Manager Skill — Binary asset tracking, versioning, and tagging
- [ ] Brand System Skill — Design token management and brand compliance
- [ ] Workflow Builder Skill — Visual workflow composition and export
- [ ] Analytics Skill — Output quality trends and generation cost tracking
- [ ] CLI — `nata` command for local Skill invocation
- [ ] Shared knowledge base in `knowledge/` seeded with creative best practices

### Phase 4 — Platform (Future)

- [ ] Skill marketplace — Publish and consume community Skills
- [ ] Web UI — Visual orchestration canvas
- [ ] Team workspace — Shared memory and knowledge across users
- [ ] API server — REST and WebSocket interface for Skill invocation

---

## Standards

All development in Nata Studio OS is governed by a single authoritative document:

**[NATA_STANDARD.md](standards/NATA_STANDARD.md)** — Universal Skill Standard v1.0.0

It covers:

- Mandatory folder structure and file layout for every Skill
- Naming conventions (kebab-case folders, camelCase functions, PascalCase classes, SCREAMING_SNAKE constants)
- `skill.json` manifest schema
- `SKILL.md` six-section documentation format (Overview, Usage, Parameters, Examples, Errors, Changelog)
- Writing standards (American English, max 25 words per sentence, active voice)
- Code quality requirements (strict TypeScript, no `any`, max 40 lines per function)
- Test requirements (80% line coverage, positive + negative + edge cases)
- Commit format (Conventional Commits)
- PR rules (max 400 LOC, squash & merge, one approved review)
- Semantic versioning and deprecation policy

Read the standard before contributing. Every PR is reviewed against it.

---

*Nata Studio OS — Built to the NATA_STANDARD.*
