# Knowledge Manager

The central knowledge layer of Nata Studio OS — the single source of truth for structured documentation, indexed content, and semantic retrieval across every Skill and session.

## What This Skill Does

Knowledge Manager turns unstructured information into a queryable, versioned, quality-scored knowledge base. It acts as the memory and documentation engine that all other Skills read from and write to.

Core capabilities:

- **Structured storage** — every entry has a typed schema, status lifecycle, and quality flag
- **Semantic search** — hybrid retrieval combines term frequency, tag matching, and quality weighting
- **Context assembly** — packages retrieved entries into a token-budgeted prompt context
- **Tag management** — global tag registry with rename propagation across all entries
- **Document relationships** — typed links (depends-on, extends, contradicts, supersedes) between entries
- **Version tracking** — full snapshot history on every update, with author and change summary
- **Knowledge validation** — field-level rules with errors and warnings before any write
- **Duplicate detection** — Jaccard title similarity scan across the active index
- **Quality scoring** — per-entry quality score (0–1) updated on every write and re-score pass
- **Citation management** — source provenance attached to individual entries
- **Import / Export** — batch JSON ingestion and extraction with filter support

## When to Use This Skill

Use Knowledge Manager when you need to:

- Store and retrieve domain knowledge for use in AI prompts
- Index documentation so it can be searched semantically
- Track changes to knowledge entries over time
- Detect and resolve duplicate or conflicting entries
- Assemble a context block from the most relevant knowledge for a given query
- Manage a shared tag taxonomy across the knowledge base
- Export a knowledge snapshot for backup or external consumption
- Import knowledge from external sources in bulk

## Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Full API documentation, parameter tables, examples, and changelog |
| `SYSTEM_PROMPT.md` | Persona and behavioral instructions for AI-assisted knowledge work |
| `WORKFLOW.md` | End-to-end knowledge lifecycle pipeline with decision gates |
| `CHECKLIST.md` | Pre-write, post-search, and review checklists for every operation |
| `EXAMPLES.md` | Annotated real-world usage patterns by task type |
| `TOOLS.md` | Integration reference for upstream and downstream tools |
| `TROUBLESHOOTING.md` | Failure mode diagnosis and recovery strategies |
| `templates/` | Operation-specific templates for common knowledge workflows |

## Quick Start

```typescript
import knowledgeManager from './src/index';

// 1. Add a knowledge entry
const entry = knowledgeManager.create({
  title: 'Prompt Hierarchy',
  content: 'Models weight the beginning of a prompt more heavily. Lead with the primary subject.',
  type: 'concept',
  status: 'active',
  tags: ['prompting', 'best-practice'],
  author: 'prompt-architect',
  version: '0.1.0',
  relationships: [],
  citations: [],
  metadata: {},
});

// 2. Search the knowledge base
const results = knowledgeManager.search({ query: 'prompt structure', strategy: 'hybrid' });

// 3. Assemble a context block for an AI call
const ctx = knowledgeManager.assembleContext('prompt engineering guide');
console.log(ctx.assembledText);
```

## Core Principles

**Every entry is a first-class document.** Each knowledge entry carries a version, status, quality score, and author — not just raw text.

**Search is multi-dimensional.** Relevance combines term frequency, tag overlap, and quality score. Low-quality entries rank lower even when their content matches.

**Writes are audited.** Every update creates a version snapshot with a change summary and author, so the full history of any entry is always recoverable.

**Context has a budget.** The context assembler respects a token ceiling so that assembled knowledge never exceeds what an AI model can process.

**Duplicates are surfaced, not silently overwritten.** Duplicate detection runs on demand and returns actionable groups for manual resolution.
