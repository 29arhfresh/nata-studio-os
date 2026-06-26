# Knowledge Manager

## Overview

Knowledge Manager is the central knowledge layer of Nata Studio OS. It organizes structured knowledge, indexes documentation, enables semantic search, manages tags and document relationships, tracks version history, validates entries, detects duplicates, assembles retrieval context, scores knowledge quality, and manages citations. Every other Skill that needs to store, retrieve, or share knowledge does so through this Skill.

## Usage

```typescript
import knowledgeManager from './src/index';

// Create a knowledge entry
const entry = knowledgeManager.create({
  title: 'Cinematic Shot Types',
  content: 'A shot type defines the relationship between the camera and subject...',
  type: 'reference',
  status: 'active',
  tags: ['cinematography', 'video', 'reference'],
  author: 'nata-studio-os',
  version: '0.1.0',
  relationships: [],
  citations: [],
  metadata: {},
});

// Search for related entries
const results = knowledgeManager.search({
  query: 'camera shot framing',
  strategy: 'hybrid',
  limit: 5,
});

// Assemble context for an AI prompt
const context = knowledgeManager.assembleContext('shot types for video', 'hybrid');
console.log(context.assembledText);
```

## Parameters

### `create(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | Yes | — | Short, descriptive title of the entry. Max 200 characters. |
| `content` | `string` | Yes | — | Full content body of the knowledge entry. |
| `type` | `KnowledgeType` | Yes | — | Category: `concept`, `procedure`, `reference`, `example`, `decision`, `glossary`, `faq`, or `standard`. |
| `status` | `KnowledgeStatus` | Yes | — | Lifecycle state: `draft`, `active`, `deprecated`, or `archived`. |
| `tags` | `string[]` | Yes | — | Lowercase tags for indexing and filtering. At least one is recommended. |
| `author` | `string` | Yes | — | Creator or owner of the entry. |
| `version` | `string` | Yes | — | Semver string (e.g., `0.1.0`). |
| `relationships` | `KnowledgeRelationship[]` | No | `[]` | Links to related entries with typed relationships. |
| `citations` | `Citation[]` | No | `[]` | Source references supporting the entry content. |
| `metadata` | `Record<string, unknown>` | No | `{}` | Arbitrary key-value metadata for downstream consumers. |

### `search(query)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | `string` | Yes | — | Plain-language or keyword search string. |
| `strategy` | `RetrievalStrategy` | No | `'hybrid'` | How to score results: `exact`, `semantic`, `tag-match`, `relationship-traversal`, or `hybrid`. |
| `tags` | `string[]` | No | `[]` | Restrict results to entries with at least one of these tags. |
| `types` | `KnowledgeType[]` | No | `[]` | Restrict results to these knowledge types. |
| `limit` | `number` | No | `10` | Maximum entries to return. |
| `minQualityScore` | `number` | No | `0` | Minimum quality score (0–1) for inclusion. |
| `includeArchived` | `boolean` | No | `false` | When true, archived entries are included in results. |

### `update(id, patch, changeSummary, changedBy)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `KnowledgeId` | Yes | — | ID of the entry to update. |
| `patch` | `Partial<KnowledgeEntry>` | Yes | — | Fields to overwrite. `id` and `createdAt` are immutable. |
| `changeSummary` | `string` | Yes | — | Human-readable description of what changed and why. |
| `changedBy` | `string` | Yes | — | Identifier of the user or system making the change. |

### `assembleContext(query, strategy?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | `string` | Yes | — | Topic or question for which context should be assembled. |
| `strategy` | `RetrievalStrategy` | No | `'hybrid'` | Retrieval strategy to use for scoring candidates. |

### `importEntries(request)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `source` | `string` | Yes | — | Identifier of the data source (for provenance tracking). |
| `format` | `'json'` | Yes | — | Format of the content string. Currently only `json` is supported. |
| `content` | `string` | Yes | — | Raw content to parse and import. |
| `defaultType` | `KnowledgeType` | No | `'concept'` | Fallback type when entries omit the `type` field. |
| `defaultTags` | `string[]` | No | `[]` | Tags appended to every imported entry. |
| `validateBeforeImport` | `boolean` | No | `true` | When false, skips validation and imports as-is. |

### `exportEntries(request)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `ids` | `KnowledgeId[]` | No | All | Export only these specific entry IDs. |
| `tags` | `string[]` | No | All | Export only entries with at least one of these tags. |
| `types` | `KnowledgeType[]` | No | All | Export only these knowledge types. |
| `format` | `'json'` | Yes | — | Output format. Currently only `json` is supported. |
| `includeRelationships` | `boolean` | No | `false` | Include relationship data in the export. |
| `includeCitations` | `boolean` | No | `false` | Include citation data in the export. |

## Examples

### Minimal — create and retrieve a concept

```typescript
import knowledgeManager from './src/index';

const entry = knowledgeManager.create({
  title: 'Prompt Hierarchy',
  content: 'AI models weight the beginning of a prompt more heavily. Lead with the most important visual element.',
  type: 'concept',
  status: 'active',
  tags: ['prompting', 'ai', 'best-practice'],
  author: 'prompt-architect',
  version: '0.1.0',
  relationships: [],
  citations: [],
  metadata: {},
});

const retrieved = knowledgeManager.get(entry.id);
console.log(retrieved.title); // 'Prompt Hierarchy'
```

### Realistic — multi-step pipeline with search, context assembly, and version tracking

```typescript
import knowledgeManager from './src/index';

// 1. Add foundational knowledge
const shotTypes = knowledgeManager.create({
  title: 'Cinematic Shot Types',
  content: 'ECU (extreme close-up) isolates detail. CU focuses the face. MCU shows chest up...',
  type: 'reference',
  status: 'active',
  tags: ['cinematography', 'shots', 'video-production'],
  author: 'ai-video-director',
  version: '0.1.0',
  relationships: [],
  citations: [{ source: 'Film Grammar Handbook', accessedAt: '2026-06-26' }],
  metadata: { domain: 'video' },
});

// 2. Link a related concept
const depthOfField = knowledgeManager.create({
  title: 'Depth of Field in Video',
  content: 'Shallow DoF isolates the subject from the background using wide apertures...',
  type: 'concept',
  status: 'active',
  tags: ['cinematography', 'optics', 'video-production'],
  author: 'ai-video-director',
  version: '0.1.0',
  relationships: [{ targetId: shotTypes.id, type: 'related-to', weight: 0.8 }],
  citations: [],
  metadata: { domain: 'video' },
});

// 3. Search the knowledge base
const results = knowledgeManager.search({
  query: 'camera framing close-up',
  strategy: 'hybrid',
  tags: ['cinematography'],
  limit: 5,
  minQualityScore: 0.5,
});
console.log(results.entries[0].entry.title); // 'Cinematic Shot Types'

// 4. Assemble context for an AI prompt
const ctx = knowledgeManager.assembleContext('video shot selection guide', 'hybrid');
console.log(ctx.tokenEstimate); // estimated tokens in the assembled context

// 5. Update the entry and inspect history
knowledgeManager.update(
  shotTypes.id,
  { content: 'ECU (extreme close-up) isolates detail. CU focuses the face...\n\nAdded: MS (medium shot).' },
  'Added medium shot definition.',
  'ai-video-director',
);
const history = knowledgeManager.getHistory(shotTypes.id);
console.log(history.versions.length); // 1

// 6. Run duplicate detection
const report = knowledgeManager.detectDuplicates();
console.log(report.hasDuplicates); // false

// 7. Export for backup
const exported = knowledgeManager.exportEntries({
  format: 'json',
  tags: ['cinematography'],
  includeRelationships: true,
  includeCitations: true,
});
console.log(exported.entryCount); // 2
```

## Errors

| Code | Description | Remediation |
|---|---|---|
| `VALIDATION_FAILED` | One or more required fields are missing or invalid. | Check the error message for which fields failed and supply correct values. |
| `NOT_FOUND` | No entry exists with the given ID. | Verify the ID is correct; list entries with `stats()` to confirm the index state. |
| `INVALID_QUERY` | The search query is empty or blank. | Supply a non-empty query string. |
| `INVALID_TAG` | A tag name passed to `renameTag` is empty. | Provide non-empty strings for both `oldTag` and `newTag`. |
| `UNSUPPORTED_FORMAT` | The requested import or export format is not supported. | Use `json` as the format value. |
| `PARSE_ERROR` | The import content could not be parsed. | Ensure the content is valid JSON and is an array of entry objects. |

## Changelog

### [0.1.0] — 2026-06-26

- Initial release of Knowledge Manager Skill.
- Structured entry creation with validation and quality scoring.
- Full CRUD: `create`, `get`, `update`, `archive`.
- Hybrid search engine with `exact`, `tag-match`, and `hybrid` strategies.
- Context assembly with configurable token budget.
- Duplicate detection using Jaccard title similarity.
- Tag management: `listTags`, `renameTag`.
- Version history tracking on every `update`.
- Index statistics via `stats()`.
- Batch import and export in JSON format.
- Quality re-scoring via `reScore()`.
- Citation and relationship management on all entries.
