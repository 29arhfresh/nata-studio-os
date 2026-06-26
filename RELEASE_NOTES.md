# Nata Studio OS — v0.1.0 Release Notes

**Released:** 2026-06-26  
**Tag:** `v0.1.0`  
**Status:** Foundation Release

---

## What is Nata Studio OS?

Nata Studio OS is a modular, skill-based AI runtime for creative professionals. It gives creative teams a structured system to orchestrate AI workflows — from brand strategy and image generation to video production, knowledge management, and project tracking.

Every capability is packaged as a self-contained **Skill** with a standard manifest, typed interface, and full documentation. A central **Agent Orchestrator** routes work, resolves conflicts, enforces quality gates, and hands off context automatically across Skills.

---

## What's in v0.1.0

This is the **Foundation Release** — all eight core Skills are established and the orchestration layer is fully wired.

### Eight Skills, one standard

Every Skill follows [NATA_STANDARD v1.0.0](standards/NATA_STANDARD.md) — the same manifest format, documentation structure, code quality rules, and versioning policy across the entire system.

| Skill | Type | Role |
|---|---|---|
| **Agent Orchestrator** | TypeScript | Routes requests, builds execution plans, enforces quality gates, manages memory handoff |
| **Memory System** | TypeScript | Four-tier memory (short-term, long-term, project, session) with semantic search and cross-Skill handoff |
| **Knowledge Manager** | TypeScript | Structured knowledge indexing, semantic retrieval, token-budgeted context assembly, citation tracking |
| **Creative Director** | TypeScript | Brand strategy, visual direction, moodboard composition, five-dimension quality scoring |
| **AI Video Director** | TypeScript | Cinematic prompt engineering for Seedance 2, Veo, Kling, Sora, Higgsfield, Runway |
| **Project Manager** | TypeScript | Project lifecycle, tasks, milestones, risks, health scoring, roadmap generation |
| **AI Image Director** | AI-native | Art direction and prompt engineering for Flux, Midjourney, Ideogram, Imagen, Nano Banana, Magnific |
| **Prompt Architect** | TypeScript | Production-quality prompt engineering: architecture, evaluation, versioning, compression |

### Two Skill types

**TypeScript Skills** expose a typed `src/index.ts` entrypoint, a test suite, and can be imported directly.

**AI-native Skills** are executed by an AI model using `SYSTEM_PROMPT.md`, `WORKFLOW.md`, and the template library. Their execution model is the AI session, not a TypeScript import. AI Image Director is the only AI-native Skill in v0.1.0.

### Numbers

| Metric | Count |
|---|---|
| TypeScript Skills | 7 |
| AI-native Skills | 1 |
| Total source lines (TypeScript) | 3,909 |
| Total test lines | 2,200 |
| Templates (all Skills) | 55 |
| SKILL.md documentation files | 8 |
| skill.json manifests | 8 |

---

## Quick Start

### Prerequisites

- Node.js 20+
- TypeScript 5+

### Install a Skill

```bash
cd skills/agent-orchestrator
npm install
```

### Orchestrate a request

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

### Use AI Image Director (AI-native)

```
1. Load skills/ai-image-director/SYSTEM_PROMPT.md as the system instruction.
2. Select a template: skills/ai-image-director/templates/portrait.md
3. Fill all template fields and run the generation.
4. Evaluate against skills/ai-image-director/CHECKLIST.md.
```

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

console.log(sequence.totalDuration); // 18
```

---

## Known Limitations

The following are known limitations of v0.1.0. None are release blockers — all are addressed in the roadmap.

**No workspace configuration**
There is no root-level `package.json`, `tsconfig.json`, or `jest.config.js`. Each Skill is installed and tested independently by navigating into its directory. A unified workspace configuration is planned for Phase 2.

**No CI pipeline**
There are no `.github/workflows/` files. Tests must be run manually per Skill. Automated coverage enforcement is planned for Phase 2.

**AI Image Director has no TypeScript API**
AI Image Director is executed through AI sessions using `SYSTEM_PROMPT.md` and templates. A typed TypeScript entrypoint (`buildPrompt()`, `optimiseForModel()`, etc.) is planned for v1.x. Prompt Architect ships a full TypeScript API in v0.1.0 (`selectTemplate()`, `buildPrompt()`, `evaluatePrompt()`, `compressPrompt()`, `versionPrompt()`).

**Execution is simulated**
The Agent Orchestrator's execution engine (`executeStep()`, `runPlan()`) simulates Skill execution and returns synthetic outputs with quality scores. Real inter-Skill invocation requires the v1.x API layer.

**No persistent storage**
Memory System and Knowledge Manager maintain state in-process only. There is no file system persistence, database backend, or cross-session storage in v0.1.0. Persistence adapters are planned for Phase 3.

---

## What's Next

### Phase 2 — Stability (next)

- Promote all Skills to `1.0.0` with locked, stable public interfaces
- Root workspace configuration (`package.json`, `tsconfig.json`, `jest.config.js`)
- CI pipeline with automated test and coverage enforcement
- Shared `docs/` with integration guides
- Prompt library in `prompts/` for common creative patterns
- Skill templates in `templates/` for faster onboarding

### Phase 3 — Expansion

- Asset Manager Skill
- Brand System Skill
- Workflow Builder Skill
- Analytics Skill
- `nata` CLI for local Skill invocation
- Persistent storage adapters
- Shared knowledge base in `knowledge/`

### Phase 4 — Platform

- Skill marketplace
- Web UI (visual orchestration canvas)
- Team workspace with shared memory and knowledge
- REST and WebSocket API server

---

## Standards

All development in Nata Studio OS is governed by **[NATA_STANDARD.md](standards/NATA_STANDARD.md)** — Universal Skill Standard v1.0.0. Read it before contributing.

---

## Repository

**GitHub:** https://github.com/29arhfresh/nata-studio-os  
**Tag:** `v0.1.0`  
**Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

*Nata Studio OS — Built to the NATA_STANDARD.*
