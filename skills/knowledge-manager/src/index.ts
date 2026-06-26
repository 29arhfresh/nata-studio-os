/**
 * Knowledge Manager — central knowledge layer of Nata Studio OS.
 * Organizes, indexes, searches, validates, and retrieves structured knowledge
 * across all Skills and sessions.
 */

// ─── Core Types ──────────────────────────────────────────────────────────────

export type KnowledgeId = string;

export type KnowledgeType =
  | 'concept'
  | 'procedure'
  | 'reference'
  | 'example'
  | 'decision'
  | 'glossary'
  | 'faq'
  | 'standard';

export type KnowledgeStatus = 'draft' | 'active' | 'deprecated' | 'archived';

export type QualityFlag = 'verified' | 'unverified' | 'conflicted' | 'outdated';

export type RetrievalStrategy =
  | 'exact'
  | 'semantic'
  | 'tag-match'
  | 'relationship-traversal'
  | 'hybrid';

export type RelationshipType =
  | 'related-to'
  | 'depends-on'
  | 'extends'
  | 'contradicts'
  | 'supersedes'
  | 'example-of';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface KnowledgeEntry {
  id: KnowledgeId;
  title: string;
  content: string;
  type: KnowledgeType;
  status: KnowledgeStatus;
  tags: string[];
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  qualityScore: number;
  qualityFlag: QualityFlag;
  relationships: KnowledgeRelationship[];
  citations: Citation[];
  metadata: Record<string, unknown>;
}

export interface KnowledgeRelationship {
  targetId: KnowledgeId;
  type: RelationshipType;
  weight: number;
}

export interface Citation {
  source: string;
  url?: string;
  accessedAt: string;
  excerpt?: string;
}

export interface SearchQuery {
  query: string;
  strategy?: RetrievalStrategy;
  tags?: string[];
  types?: KnowledgeType[];
  limit?: number;
  minQualityScore?: number;
  includeArchived?: boolean;
}

export interface SearchResult {
  entries: ScoredEntry[];
  totalMatches: number;
  strategy: RetrievalStrategy;
  durationMs: number;
  assembledContext?: string;
}

export interface ScoredEntry {
  entry: KnowledgeEntry;
  relevanceScore: number;
  matchedTerms: string[];
}

export interface IndexStats {
  totalEntries: number;
  byType: Record<KnowledgeType, number>;
  byStatus: Record<KnowledgeStatus, number>;
  avgQualityScore: number;
  totalTags: number;
  totalRelationships: number;
  lastIndexedAt: string;
}

export interface DuplicateReport {
  hasDuplicates: boolean;
  groups: DuplicateGroup[];
}

export interface DuplicateGroup {
  representativeId: KnowledgeId;
  duplicateIds: KnowledgeId[];
  similarityScore: number;
  reason: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  qualityScore: number;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

export interface ContextAssembly {
  query: string;
  entries: KnowledgeEntry[];
  assembledText: string;
  tokenEstimate: number;
  strategy: RetrievalStrategy;
}

export interface VersionHistory {
  entryId: KnowledgeId;
  versions: VersionRecord[];
}

export interface VersionRecord {
  version: string;
  changedAt: string;
  changedBy: string;
  changeSummary: string;
  snapshot: KnowledgeEntry;
}

export interface ImportRequest {
  source: string;
  format: 'markdown' | 'json' | 'yaml' | 'csv';
  content: string;
  defaultType?: KnowledgeType;
  defaultTags?: string[];
  validateBeforeImport?: boolean;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ line: number; message: string }>;
  entries: KnowledgeEntry[];
}

export interface ExportRequest {
  ids?: KnowledgeId[];
  tags?: string[];
  types?: KnowledgeType[];
  format: 'markdown' | 'json' | 'yaml' | 'csv';
  includeRelationships?: boolean;
  includeCitations?: boolean;
}

export interface ExportResult {
  format: string;
  content: string;
  entryCount: number;
  exportedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_QUALITY_SCORE = 1.0;
const MIN_QUALITY_SCORE = 0.0;
const DEFAULT_SEARCH_LIMIT = 10;
const DEFAULT_MIN_QUALITY_SCORE = 0.0;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.85;
const MAX_CONTEXT_TOKENS = 4000;
const TOKENS_PER_CHAR_ESTIMATE = 0.25;

// ─── In-Memory Store (replace with persistent layer in production) ────────────

const _store = new Map<KnowledgeId, KnowledgeEntry>();
const _versionHistory = new Map<KnowledgeId, VersionRecord[]>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _generateId(): KnowledgeId {
  return `km-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function _nowIso(): string {
  return new Date().toISOString();
}

function _clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function _tokenEstimate(text: string): number {
  return Math.ceil(text.length * TOKENS_PER_CHAR_ESTIMATE);
}

/** Computes a naive term-frequency relevance score between a query and entry content. */
function _scoreRelevance(query: string, entry: KnowledgeEntry): { score: number; matched: string[] } {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${entry.title} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase();
  const matched: string[] = [];

  for (const term of terms) {
    if (haystack.includes(term)) {
      matched.push(term);
    }
  }

  const score = terms.length > 0 ? matched.length / terms.length : 0;
  return { score, matched };
}

/** Computes title similarity for duplicate detection (Jaccard on word sets). */
function _jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter((w) => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validates an entry against required field rules and quality heuristics. */
export function validate(entry: Partial<KnowledgeEntry>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!entry.title || entry.title.trim().length === 0) {
    errors.push({ field: 'title', code: 'REQUIRED', message: 'Title is required and must not be empty.' });
  }

  if (!entry.content || entry.content.trim().length === 0) {
    errors.push({ field: 'content', code: 'REQUIRED', message: 'Content is required and must not be empty.' });
  }

  if (!entry.type) {
    errors.push({ field: 'type', code: 'REQUIRED', message: 'Knowledge type is required.' });
  }

  if (!entry.author || entry.author.trim().length === 0) {
    errors.push({ field: 'author', code: 'REQUIRED', message: 'Author is required.' });
  }

  if (!entry.tags || entry.tags.length === 0) {
    warnings.push({ field: 'tags', code: 'RECOMMENDED', message: 'At least one tag is recommended for searchability.' });
  }

  if (entry.title && entry.title.length > 200) {
    warnings.push({ field: 'title', code: 'TOO_LONG', message: 'Title exceeds 200 characters; consider shortening.' });
  }

  if (entry.content && entry.content.length < 50) {
    warnings.push({ field: 'content', code: 'TOO_SHORT', message: 'Content is very short; consider adding more detail.' });
  }

  if (entry.citations && entry.citations.length === 0 && entry.type === 'reference') {
    warnings.push({ field: 'citations', code: 'RECOMMENDED', message: 'Reference entries benefit from at least one citation.' });
  }

  const qualityScore = _clamp(1 - errors.length * 0.3 - warnings.length * 0.05, MIN_QUALITY_SCORE, MAX_QUALITY_SCORE);

  return { isValid: errors.length === 0, errors, warnings, qualityScore };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Creates a new knowledge entry, validates it, and adds it to the index. */
export function create(input: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'qualityScore' | 'qualityFlag'>): KnowledgeEntry {
  const validation = validate(input);
  if (!validation.isValid) {
    const messages = validation.errors.map((e) => e.message).join('; ');
    throw new Error(`VALIDATION_FAILED: ${messages}`);
  }

  const entry: KnowledgeEntry = {
    ...input,
    id: _generateId(),
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
    qualityScore: validation.qualityScore,
    qualityFlag: 'unverified',
    relationships: input.relationships ?? [],
    citations: input.citations ?? [],
    metadata: input.metadata ?? {},
  };

  _store.set(entry.id, entry);
  _versionHistory.set(entry.id, []);
  return entry;
}

/** Retrieves a single entry by ID. */
export function get(id: KnowledgeId): KnowledgeEntry {
  const entry = _store.get(id);
  if (!entry) {
    throw new Error(`NOT_FOUND: No entry with id "${id}".`);
  }
  return entry;
}

/** Updates an existing entry and records the change in version history. */
export function update(
  id: KnowledgeId,
  patch: Partial<Omit<KnowledgeEntry, 'id' | 'createdAt'>>,
  changeSummary: string,
  changedBy: string,
): KnowledgeEntry {
  const existing = get(id);

  const merged: KnowledgeEntry = { ...existing, ...patch, id, updatedAt: _nowIso() };

  const validation = validate(merged);
  if (!validation.isValid) {
    const messages = validation.errors.map((e) => e.message).join('; ');
    throw new Error(`VALIDATION_FAILED: ${messages}`);
  }

  merged.qualityScore = validation.qualityScore;

  const history = _versionHistory.get(id) ?? [];
  history.push({
    version: existing.version,
    changedAt: _nowIso(),
    changedBy,
    changeSummary,
    snapshot: { ...existing },
  });
  _versionHistory.set(id, history);

  _store.set(id, merged);
  return merged;
}

/** Removes an entry from the active index (soft-delete via status = archived). */
export function archive(id: KnowledgeId, archivedBy: string): KnowledgeEntry {
  return update(id, { status: 'archived' }, 'Archived entry.', archivedBy);
}

// ─── Search ───────────────────────────────────────────────────────────────────

/** Searches the knowledge index using the specified retrieval strategy. */
export function search(query: SearchQuery): SearchResult {
  const start = Date.now();
  const {
    query: queryText,
    strategy = 'hybrid',
    tags = [],
    types = [],
    limit = DEFAULT_SEARCH_LIMIT,
    minQualityScore = DEFAULT_MIN_QUALITY_SCORE,
    includeArchived = false,
  } = query;

  if (!queryText || queryText.trim().length === 0) {
    throw new Error('INVALID_QUERY: Search query must not be empty.');
  }

  let candidates = [..._store.values()];

  if (!includeArchived) {
    candidates = candidates.filter((e) => e.status !== 'archived');
  }

  if (types.length > 0) {
    candidates = candidates.filter((e) => types.includes(e.type));
  }

  if (tags.length > 0) {
    candidates = candidates.filter((e) => tags.some((t) => e.tags.includes(t)));
  }

  candidates = candidates.filter((e) => e.qualityScore >= minQualityScore);

  const scored: ScoredEntry[] = candidates.map((entry) => {
    const { score, matched } = _scoreRelevance(queryText, entry);
    const combinedScore =
      strategy === 'tag-match'
        ? tags.filter((t) => entry.tags.includes(t)).length / Math.max(tags.length, 1)
        : strategy === 'exact'
        ? entry.title.toLowerCase() === queryText.toLowerCase() ? 1 : 0
        : score * 0.7 + entry.qualityScore * 0.3;

    return { entry, relevanceScore: _clamp(combinedScore, 0, 1), matchedTerms: matched };
  });

  const filtered = scored.filter((s) => s.relevanceScore > 0);
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const results = filtered.slice(0, limit);

  return {
    entries: results,
    totalMatches: filtered.length,
    strategy,
    durationMs: Date.now() - start,
  };
}

// ─── Context Assembly ─────────────────────────────────────────────────────────

/** Assembles a context block from search results, respecting a token budget. */
export function assembleContext(query: string, strategy: RetrievalStrategy = 'hybrid'): ContextAssembly {
  const results = search({ query, strategy, limit: 20 });
  const parts: string[] = [];
  let totalTokens = 0;

  for (const { entry } of results.entries) {
    const section = `## ${entry.title}\n\n${entry.content}\n`;
    const tokens = _tokenEstimate(section);
    if (totalTokens + tokens > MAX_CONTEXT_TOKENS) {
      break;
    }
    parts.push(section);
    totalTokens += tokens;
  }

  const assembledText = parts.join('\n---\n\n');
  return {
    query,
    entries: results.entries.map((s) => s.entry),
    assembledText,
    tokenEstimate: totalTokens,
    strategy,
  };
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

/** Scans the index for near-duplicate entries based on title similarity. */
export function detectDuplicates(): DuplicateReport {
  const entries = [..._store.values()].filter((e) => e.status !== 'archived');
  const visited = new Set<KnowledgeId>();
  const groups: DuplicateGroup[] = [];

  for (let i = 0; i < entries.length; i++) {
    if (visited.has(entries[i].id)) {
      continue;
    }

    const duplicateIds: KnowledgeId[] = [];
    let maxSimilarity = 0;

    for (let j = i + 1; j < entries.length; j++) {
      if (visited.has(entries[j].id)) {
        continue;
      }

      const sim = _jaccardSimilarity(entries[i].title, entries[j].title);
      if (sim >= DUPLICATE_SIMILARITY_THRESHOLD) {
        duplicateIds.push(entries[j].id);
        visited.add(entries[j].id);
        maxSimilarity = Math.max(maxSimilarity, sim);
      }
    }

    if (duplicateIds.length > 0) {
      visited.add(entries[i].id);
      groups.push({
        representativeId: entries[i].id,
        duplicateIds,
        similarityScore: maxSimilarity,
        reason: 'Title Jaccard similarity above threshold.',
      });
    }
  }

  return { hasDuplicates: groups.length > 0, groups };
}

// ─── Tag Management ───────────────────────────────────────────────────────────

/** Returns all unique tags across the active index with usage counts. */
export function listTags(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of _store.values()) {
    if (entry.status === 'archived') {
      continue;
    }
    for (const tag of entry.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

/** Renames a tag across all entries in the index. */
export function renameTag(oldTag: string, newTag: string, changedBy: string): number {
  if (!oldTag || !newTag) {
    throw new Error('INVALID_TAG: Tag names must not be empty.');
  }

  let affected = 0;
  for (const entry of _store.values()) {
    if (entry.tags.includes(oldTag)) {
      const newTags = entry.tags.map((t) => (t === oldTag ? newTag : t));
      update(entry.id, { tags: newTags }, `Renamed tag "${oldTag}" to "${newTag}".`, changedBy);
      affected++;
    }
  }
  return affected;
}

// ─── Version History ──────────────────────────────────────────────────────────

/** Returns the full version history for an entry. */
export function getHistory(id: KnowledgeId): VersionHistory {
  get(id);
  return { entryId: id, versions: _versionHistory.get(id) ?? [] };
}

// ─── Index Stats ──────────────────────────────────────────────────────────────

/** Returns aggregate statistics about the knowledge index. */
export function stats(): IndexStats {
  const entries = [..._store.values()];

  const byType = {} as Record<KnowledgeType, number>;
  const byStatus = {} as Record<KnowledgeStatus, number>;
  let qualitySum = 0;
  let totalTags = 0;
  let totalRelationships = 0;

  for (const e of entries) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
    byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    qualitySum += e.qualityScore;
    totalTags += e.tags.length;
    totalRelationships += e.relationships.length;
  }

  return {
    totalEntries: entries.length,
    byType,
    byStatus,
    avgQualityScore: entries.length > 0 ? qualitySum / entries.length : 0,
    totalTags,
    totalRelationships,
    lastIndexedAt: _nowIso(),
  };
}

// ─── Import / Export ──────────────────────────────────────────────────────────

/** Imports knowledge entries from structured content. Supports JSON array format. */
export function importEntries(request: ImportRequest): ImportResult {
  const errors: Array<{ line: number; message: string }> = [];
  const imported: KnowledgeEntry[] = [];
  let skipped = 0;
  let failed = 0;

  if (request.format !== 'json') {
    throw new Error(`UNSUPPORTED_FORMAT: Only "json" format is supported in this version. Got "${request.format}".`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(request.content);
  } catch {
    throw new Error('PARSE_ERROR: Content is not valid JSON.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('PARSE_ERROR: JSON content must be an array of entry objects.');
  }

  for (let i = 0; i < parsed.length; i++) {
    const raw = parsed[i] as Record<string, unknown>;

    try {
      if (request.validateBeforeImport !== false) {
        const validation = validate(raw as Partial<KnowledgeEntry>);
        if (!validation.isValid) {
          errors.push({ line: i + 1, message: validation.errors.map((e) => e.message).join('; ') });
          failed++;
          continue;
        }
      }

      const entry = create({
        title: String(raw['title'] ?? ''),
        content: String(raw['content'] ?? ''),
        type: (raw['type'] as KnowledgeType) ?? request.defaultType ?? 'concept',
        status: (raw['status'] as KnowledgeStatus) ?? 'draft',
        tags: (raw['tags'] as string[]) ?? request.defaultTags ?? [],
        author: String(raw['author'] ?? 'import'),
        version: String(raw['version'] ?? '0.1.0'),
        qualityFlag: 'unverified',
        relationships: (raw['relationships'] as KnowledgeRelationship[]) ?? [],
        citations: (raw['citations'] as Citation[]) ?? [],
        metadata: (raw['metadata'] as Record<string, unknown>) ?? {},
      });

      imported.push(entry);
    } catch (err) {
      errors.push({ line: i + 1, message: err instanceof Error ? err.message : String(err) });
      failed++;
    }
  }

  return { imported: imported.length, skipped, failed, errors, entries: imported };
}

/** Exports entries from the index as structured content. */
export function exportEntries(request: ExportRequest): ExportResult {
  let candidates = [..._store.values()];

  if (request.ids && request.ids.length > 0) {
    candidates = candidates.filter((e) => request.ids!.includes(e.id));
  }

  if (request.tags && request.tags.length > 0) {
    candidates = candidates.filter((e) => request.tags!.some((t) => e.tags.includes(t)));
  }

  if (request.types && request.types.length > 0) {
    candidates = candidates.filter((e) => request.types!.includes(e.type));
  }

  if (request.format !== 'json') {
    throw new Error(`UNSUPPORTED_FORMAT: Only "json" format is supported in this version. Got "${request.format}".`);
  }

  const payload = candidates.map((e) => {
    const out: Record<string, unknown> = { ...e };
    if (!request.includeRelationships) {
      delete out['relationships'];
    }
    if (!request.includeCitations) {
      delete out['citations'];
    }
    return out;
  });

  return {
    format: request.format,
    content: JSON.stringify(payload, null, 2),
    entryCount: candidates.length,
    exportedAt: _nowIso(),
  };
}

// ─── Quality Scoring ─────────────────────────────────────────────────────────

/** Re-scores all entries and updates their quality flags. Returns updated count. */
export function reScore(): number {
  let updated = 0;
  for (const entry of _store.values()) {
    const { qualityScore } = validate(entry);
    const flag: QualityFlag =
      qualityScore >= 0.9
        ? 'verified'
        : qualityScore >= 0.6
        ? 'unverified'
        : 'outdated';

    const patched: KnowledgeEntry = { ...entry, qualityScore, qualityFlag: flag, updatedAt: _nowIso() };
    _store.set(entry.id, patched);
    updated++;
  }
  return updated;
}

// ─── Public Default Export ────────────────────────────────────────────────────

const knowledgeManager = {
  create,
  get,
  update,
  archive,
  search,
  assembleContext,
  detectDuplicates,
  listTags,
  renameTag,
  getHistory,
  stats,
  validate,
  importEntries,
  exportEntries,
  reScore,
};

export default knowledgeManager;
