# Changelog

All notable changes to Nata Studio OS are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] — 2026-06-26

### Added

**Standards**
- `NATA_STANDARD.md` — Universal Skill Standard v1.0.0. Defines mandatory folder structure, `skill.json` manifest schema, `SKILL.md` six-section documentation format, naming conventions, TypeScript code quality requirements, test coverage minimums (≥80%), commit format (Conventional Commits), PR rules, and semantic versioning policy.

**Agent Orchestrator** (`skills/agent-orchestrator/`) — TypeScript Skill
- Central coordination brain for Nata Studio OS.
- Skill registry covering all eight Skills with capability maps, priorities, timeout limits, and concurrency settings.
- Intent analysis engine: keyword-to-capability detection across 24 registered capabilities.
- Routing engine with confidence scoring, allowlist (`allowedSkills`), and blocklist (`forbiddenSkills`) support.
- Dependency graph builder with topological sort (Kahn's algorithm) and cycle detection.
- Dependency rules: `knowledge-manager → creative-director`, `creative-director → ai-image-director`, `creative-director → ai-video-director`, `prompt-architect → ai-image-director`, `prompt-architect → ai-video-director`, `ai-image-director → ai-video-director`.
- Execution plan builder: `sequential`, `parallel`, `conditional`, and `fallback-chain` policies.
- Conflict resolution strategies: `priority`, `merge`, `abort`, `user-prompt`.
- Quality gate evaluator with per-output scoring, failed-check reporting, and warning thresholds (default 0.7).
- Memory handoff: exports all Skill outputs as a keyed snapshot for downstream Skills or sessions.
- Fallback execution: promotes a supporting Skill when the primary output fails the quality gate.
- Hard session limit: 10 iterations maximum per execution context.
- Public API: `orchestrate()`, `route()`, `plan()`, `describeSkill()`, `listSkills()`, `detectConflicts()`, `buildGraph()`.
- Test suite: 294 lines.

**Memory System** (`skills/memory-system/`) — TypeScript Skill
- Unified four-tier memory layer: `short-term`, `long-term`, `project`, `session`.
- Three isolation scopes: `global`, `project`, `session`.
- Core CRUD: `store()`, `get()`, `update()`, `expire()`.
- Semantic search with `exact`, `tag-match`, `semantic`, and `hybrid` strategies.
- TTL-based automatic expiry with scheduled and on-demand pruning via `prune()`.
- Context restoration via `restoreContext()` for session and project scope replay.
- Cross-Skill context handoff via `handoff()`.
- Memory summarization via `summarize()`.
- Quality scoring and re-scoring via `reScore()`.
- Index statistics via `stats()` and `index()`.
- Test suite: 424 lines. Template library: 6 templates.

**Knowledge Manager** (`skills/knowledge-manager/`) — TypeScript Skill
- Central structured knowledge layer for the entire OS.
- Eight knowledge types: `concept`, `procedure`, `reference`, `example`, `decision`, `glossary`, `faq`, `standard`.
- Full CRUD: `create()`, `get()`, `update()`, `archive()`.
- Hybrid retrieval engine: `exact`, `tag-match`, `semantic`, `relationship-traversal`, `hybrid` strategies.
- Typed relationship edges: `related-to`, `depends-on`, `extends`, `contradicts`, `supersedes`, `example-of`.
- Token-budgeted context assembly via `assembleContext()`.
- Duplicate detection using Jaccard title similarity via `detectDuplicates()`.
- Tag management: `listTags()`, `renameTag()`.
- Version history tracking on every `update()` call.
- Index statistics via `stats()`.
- Batch import and export in JSON format via `importEntries()` / `exportEntries()`.
- Quality re-scoring via `reScore()`. Citation and relationship management on all entries.
- Test suite: 388 lines. Template library: 6 templates.

**Creative Director** (`skills/creative-director/`) — TypeScript Skill
- Strategic and aesthetic intelligence for brand and visual direction.
- `buildCreativeBrief()`: brand strategy with objectives, tone descriptors, audience config, deliverables, and creative constraints.
- `buildMoodboard()`: visual reference composition with palette anchoring and typography guidance.
- `buildArtDirection()`: composition rules and lighting direction documents.
- `scoreCreative()`: five-dimension quality scoring — brand alignment, composition quality, color consistency, storytelling clarity, technical execution (each 1–10, weighted total to 100).
- Composition rule library: rule of thirds, golden ratio, symmetry, negative space, leading lines, layered depth.
- Color strategy engine with contrast and harmony validation.
- Five deliverable types: `hero-image`, `social-reels`, `copy`, `video`, `moodboard`.
- Test suite: 258 lines. Template library: 6 templates.

**AI Video Director** (`skills/ai-video-director/`) — TypeScript Skill
- Cinematic video prompt engineering and production-planning for multi-model pipelines.
- Six supported models: Seedance 2, Veo, Kling, Sora, Higgsfield, Runway.
- `buildShot()`: single shot with camera movement, lens, angle, lighting, and duration.
- `buildSequence()`: multi-shot sequence with BPM-aligned pacing.
- `optimisePrompt()`: model-specific token reduction for constrained models.
- `compareModels()`: capability comparison matrix for model selection.
- Camera movement vocabulary: static, dolly-in/out, pan, tilt, orbit, handheld, tracking, crane.
- Camera angles: eye-level, low-angle, high-angle, bird's-eye, dutch-angle, worm's-eye.
- Five production formats: `cinematic`, `reels`, `commercial`, `product-video`, `music-video`.
- Per-model duration limits and capability flags (negative prompt, character seed, image-to-video, video-to-video).
- Test suite: 175 lines. Template library: 21 templates.

**Project Manager** (`skills/project-manager/`) — TypeScript Skill
- Project lifecycle engine for creative production work.
- Six project statuses: `planning`, `active`, `on-hold`, `completed`, `cancelled`, `archived`.
- Seven task statuses: `backlog` → `todo` → `in-progress` → `blocked` → `in-review` → `done` → `cancelled`.
- `createProject()`, `createTask()`, `createMilestone()`, `createRisk()`, `createResource()`.
- `scoreHealth()`: red/yellow/green project health scoring based on progress, risk, and resource allocation.
- `generateStatusReport()`: structured status report with health, blockers, and milestone progress.
- `generateRoadmap()`: milestone timeline with on-track analysis.
- Risk management: probability × impact scoring with mitigation tracking.
- Resource tracking: `human`, `tool`, `budget`, `time` resource types with allocation management.
- Test suite: 661 lines. Template library: 6 templates.

**AI Image Director** (`skills/ai-image-director/`) — AI-native Skill
- Art direction and image prompt engineering for six models: Flux, Midjourney, Ideogram, Google Imagen, Nano Banana, Magnific.
- Execution driven by `SYSTEM_PROMPT.md`, `WORKFLOW.md`, and the template library. No TypeScript entrypoint.
- `SYSTEM_PROMPT.md`: full art director persona with compositional, lighting, and technical guidelines.
- `WORKFLOW.md`: end-to-end production pipeline from brief intake to final asset delivery.
- `CHECKLIST.md`: pre-generation and post-review quality gates.
- `EXAMPLES.md`: annotated production examples by content type.
- Template library: 7 use-case templates (portrait, product, fashion, advertising, cinematic, character, consistent-character) and 6 model-specific templates (flux, midjourney, ideogram, imagen, nano-banana, magnific).
- Typed TypeScript API planned for v1.x.

**Prompt Architect** (`skills/prompt-architect/`) — TypeScript Skill
- Production-quality prompt engineering for prompts that run in production systems.
- Ships at `v0.2.0`: progressed from AI-native (`v0.1.0`) to a full TypeScript implementation within the development cycle.
- `src/index.ts`: typed public API — `selectTemplate()`, `buildPrompt()`, `evaluatePrompt()`, `compressPrompt()`, `versionPrompt()`.
- `buildPrompt()`: assembles system prompt and user template from a `PromptBrief`; auto-compresses when token budget is exceeded; scores quality across five dimensions.
- `selectTemplate()`: returns a `TemplateDescriptor` with structure rules and required fields for all eight task types.
- `evaluatePrompt()`: static analysis against a `TestCase` array; supports `expectedOutputContains`, `mustNotContain`, and `expectedOutputPattern` (regex); returns `EvaluationReport` with verdict, score, and recommendations.
- `compressPrompt()`: removes optional sections and truncates to token budget; reports `sectionsRemoved` and `reductionPercent`.
- `versionPrompt()`: derives `major`/`minor`/`patch` change type by diffing two prompts; bumps semver version; appends changelog entry.
- AI-native execution layer (`SYSTEM_PROMPT.md`, `WORKFLOW.md`, and template library) remains available for AI-session use.
- Template library: 8 structural templates covering chain-of-thought, code-generation, document-analysis, evaluation-judge, few-shot-classifier, multi-agent-orchestrator, role-persona, and structured-output.
- Test suite: 642 lines.

**Root documentation**
- `README.md`: complete architecture reference, Quick Start guide, workflow diagram, installation instructions, development workflow, roadmap, and standards summary.
- Repository structure with placeholder directories for planned expansion: `docs/`, `knowledge/`, `projects/`, `prompts/`, `templates/`.

### Fixed
- Agent Orchestrator Skill Registry: `creative-director`, `knowledge-manager`, `memory-system`, and `project-manager` were implemented but not registered; all four added with accurate capability maps and dependency graph edges.
- `skill.json` author casing: standardized to `"Nata Studio OS"` across all manifests.
- TypeScript import paths: removed incorrect `.ts` extension from `SKILL.md` usage examples.
- README Quick Start: corrected `orchestrate()` export style, parameter name (`allowedSkills`), result property (`finalOutput`), and synchronous call (no `async/await`).
- README Quick Start: corrected `buildSequence()` parameter name (`bpm`), export style, and synchronous call.
- README Quick Start: corrected `create()` field name (`content` not `body`), added missing required fields (`author`, `version`), removed incorrect `async/await`.
- README Repository Structure: removed six non-existent files from `agent-orchestrator/` listing.

---

[Unreleased]: https://github.com/29arhfresh/nata-studio-os/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/29arhfresh/nata-studio-os/releases/tag/v0.1.0
