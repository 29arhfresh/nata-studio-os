# Memory System

**Version**: 0.1.0
**Status**: Active
**Tier**: Core Infrastructure

---

Memory System is the unified memory layer for Nata Studio OS. Every Skill that needs to remember state, restore context, or share knowledge across session boundaries does so through this Skill.

---

## What It Does

| Capability | Description |
|---|---|
| **Short-term memory** | Ephemeral data within a session. Expires automatically via TTL. |
| **Long-term memory** | Persistent data that survives sessions and informs future work. |
| **Project memory** | Scoped to a project. Shared by all Skills working on that project. |
| **Session memory** | Scoped to a single session. Isolated between concurrent sessions. |
| **Context restoration** | Reconstructs relevant memory when a new session starts. |
| **Memory retrieval** | Fetches items by ID, key, tag, or semantic query. |
| **Memory indexing** | Maintains a searchable index with quality scores and metadata. |
| **Semantic search** | Ranks results by relevance using hybrid scoring. |
| **Memory summarization** | Condenses a memory tier or scope into a summary for LLM context. |
| **Memory pruning** | Removes expired, stale, or low-quality items on demand or by schedule. |
| **Context handoff** | Transfers relevant memory keys between Skills within a session. |
| **Quality scoring** | Scores every item on completeness, freshness, and tag coverage. |

---

## Quick Start

```typescript
import memorySystem from './src/index';

// Store
const item = memorySystem.store({
  tier: 'short-term',
  scope: 'session',
  key: 'user-style-preference',
  value: 'minimalist dark mode',
  ttlSeconds: 3600,
  tags: ['preference', 'ui'],
  source: 'ai-image-director',
  sessionId: 'sess-abc',
  metadata: {},
});

// Search
const results = memorySystem.search({
  query: 'user style preference',
  tiers: ['short-term'],
  limit: 5,
});

// Restore context
const ctx = memorySystem.restoreContext({
  scope: 'session',
  sessionId: 'sess-abc',
  limit: 20,
});
```

---

## File Map

```
skills/memory-system/
├── SKILL.md                    ← API reference
├── README.md                   ← This file
├── SYSTEM_PROMPT.md            ← Behavioral rules for the agent
├── WORKFLOW.md                 ← Stage-by-stage process guide
├── CHECKLIST.md                ← Operational checklists
├── EXAMPLES.md                 ← Annotated usage examples
├── TOOLS.md                    ← Integration reference
├── TROUBLESHOOTING.md          ← Failure mode diagnosis
├── skill.json                  ← Machine-readable manifest
├── src/
│   └── index.ts                ← Primary entry point
├── tests/
│   └── memory-system.test.ts   ← Test suite
└── templates/
    ├── session-memory.md       ← Session memory item template
    ├── project-memory.md       ← Project memory item template
    ├── knowledge-memory.md     ← Knowledge memory item template
    ├── memory-search.md        ← Memory search query template
    ├── memory-summary.md       ← Memory summary template
    └── memory-cleanup.md       ← Memory cleanup plan template
```

---

## Memory Tier Guide

| Tier | Lifetime | Scope Options | Typical Use |
|---|---|---|---|
| `short-term` | Session or TTL | `session`, `global` | Active work context, current preferences |
| `long-term` | Permanent | `global`, `project` | Approved outputs, learned preferences, brand decisions |
| `project` | Project lifetime | `project` | Project-specific settings, assets, decisions |
| `session` | Single session | `session` | Transient reasoning, intermediate steps |

---

## Integration Points

- **Agent Orchestrator** — reads session context to route requests accurately.
- **Knowledge Manager** — writes approved knowledge entries to long-term memory.
- **Prompt Architect** — reads project memory to maintain prompt style consistency.
- **AI Image Director** — reads and writes style and brand memory.
- **AI Video Director** — reads cinematography preferences from project memory.

---

## Related Skills

| Skill | Relationship |
|---|---|
| Knowledge Manager | Peer — manages structured knowledge; Memory System manages ephemeral and operational state |
| Agent Orchestrator | Consumer — reads context to make routing decisions |
| Prompt Architect | Consumer — reads memory to apply consistent style rules |
