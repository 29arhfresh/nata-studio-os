/**
 * Memory System — unified memory layer for Nata Studio OS.
 * Manages short-term, long-term, project, and session memory across all Skills.
 */

// ─── Core Types ──────────────────────────────────────────────────────────────

export type MemoryId = string;

export type MemoryTier = 'short-term' | 'long-term' | 'project' | 'session';

export type MemoryScope = 'global' | 'project' | 'session';

export type MemoryValue = string | number | boolean | Record<string, unknown> | unknown[];

export type RetrievalStrategy = 'exact' | 'semantic' | 'tag-match' | 'hybrid';

export type ConversationRole = 'user' | 'assistant' | 'system';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface MemoryItem {
  id: MemoryId;
  tier: MemoryTier;
  scope: MemoryScope;
  key: string;
  value: MemoryValue;
  ttlSeconds?: number;
  expiresAt?: string;
  tags: string[];
  source: string;
  projectId?: string;
  sessionId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  qualityScore: number;
}

export interface StoreInput {
  tier: MemoryTier;
  scope: MemoryScope;
  key: string;
  value: MemoryValue;
  ttlSeconds?: number;
  tags?: string[];
  source: string;
  projectId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  tiers?: MemoryTier[];
  scope?: MemoryScope;
  tags?: string[];
  limit?: number;
  minQualityScore?: number;
  includeExpired?: boolean;
  projectId?: string;
  sessionId?: string;
  strategy?: RetrievalStrategy;
}

export interface SearchResult {
  items: Array<{ item: MemoryItem; relevanceScore: number }>;
  totalMatches: number;
  durationMs: number;
}

export interface ContextRestoreOptions {
  scope: MemoryScope;
  sessionId?: string;
  projectId?: string;
  limit?: number;
  tiers?: MemoryTier[];
}

export interface ContextRestoration {
  items: Array<{ item: MemoryItem; relevanceScore: number }>;
  tokenEstimate: number;
  restoredAt: string;
}

export interface SummarizeOptions {
  scope: MemoryScope;
  sessionId?: string;
  projectId?: string;
  maxItems?: number;
  tiers?: MemoryTier[];
}

export interface MemorySummary {
  text: string;
  tokenEstimate: number;
  itemCount: number;
  generatedAt: string;
}

export interface HandoffOptions {
  fromSkill: string;
  toSkill: string;
  sessionId: string;
  keys?: string[];
}

export interface HandoffReceipt {
  transferred: number;
  failed: string[];
  handoffId: string;
  handedOffAt: string;
}

export interface PruneOptions {
  expiredOnly?: boolean;
  tier?: MemoryTier;
  scope?: MemoryScope;
  minQualityScore?: number;
  dryRun?: boolean;
  projectId?: string;
  sessionId?: string;
}

export interface PruneCandidate {
  key: string;
  reason: string;
}

export interface PruneReport {
  removed: number;
  retained: number;
  skipped: number;
  candidates: PruneCandidate[];
  dryRun: boolean;
  prunedAt: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{ index: number; message: string }>;
}

export interface MemoryStats {
  totalItems: number;
  expiredItems: number;
  avgQualityScore: number;
  totalTags: number;
  byTier: Record<MemoryTier, number>;
  byScope: Record<MemoryScope, number>;
  lastIndexedAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; code: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}

// ─── Conversation History Types ───────────────────────────────────────────────

export interface ConversationTurn {
  turnId: string;
  sessionId: string;
  role: ConversationRole;
  content: string;
  turnIndex: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface RecordTurnInput {
  sessionId: string;
  role: ConversationRole;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationHistoryOptions {
  sessionId: string;
  limit?: number;
  includeSystem?: boolean;
}

export interface ConversationHistory {
  turns: ConversationTurn[];
  sessionId: string;
  tokenEstimate: number;
  retrievedAt: string;
}

// ─── Related Memory Types ─────────────────────────────────────────────────────

export interface FindRelatedOptions {
  limit?: number;
  minScore?: number;
  tiers?: MemoryTier[];
  scope?: MemoryScope;
}

// ─── Memory Aging Types ───────────────────────────────────────────────────────

export interface AgingOptions {
  tiers?: MemoryTier[];
  scope?: MemoryScope;
  projectId?: string;
  sessionId?: string;
}

// ─── Context Assembly Types ───────────────────────────────────────────────────

export interface ContextSection {
  label: string;
  content: string;
  tokenEstimate: number;
}

export interface AssembleContextOptions {
  sessionId: string;
  projectId?: string;
  tokenBudget?: number;
  includeHistory?: boolean;
  historyLimit?: number;
  memoryTiers?: MemoryTier[];
  query?: string;
}

export interface AssembledContext {
  sections: ContextSection[];
  totalTokenEstimate: number;
  assembledAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_KEY_LENGTH = 256;
const MAX_TOKEN_BUDGET = 4000;
const CHARS_PER_TOKEN = 4;
const DEFAULT_RELATED_LIMIT = 5;
const AGING_MIN_FACTOR = 0.05;

const ALLOWED_TIERS: ReadonlySet<MemoryTier> = new Set([
  'short-term',
  'long-term',
  'project',
  'session',
]);

const ALLOWED_SCOPES: ReadonlySet<MemoryScope> = new Set([
  'global',
  'project',
  'session',
]);

const VALID_ROLES: ReadonlySet<ConversationRole> = new Set([
  'user',
  'assistant',
  'system',
]);

// Half-life in seconds per tier: how long before a memory's aging factor reaches 0.5.
const TIER_AGING_HALF_LIFE_SECONDS: Readonly<Record<MemoryTier, number>> = {
  'short-term': 3_600,       // 1 hour
  'session': 1_800,          // 30 minutes
  'project': 1_209_600,      // 14 days
  'long-term': 7_776_000,    // 90 days
};

// ─── Internal Store ───────────────────────────────────────────────────────────

const _store = new Map<MemoryId, MemoryItem>();
let _idCounter = 0;

function _generateId(): MemoryId {
  _idCounter += 1;
  return `ms-${Date.now()}-${_idCounter.toString(16).padStart(7, '0')}`;
}

function _now(): string {
  return new Date().toISOString();
}

// Returns a timestamp strictly after prevTs to ensure updatedAt always advances.
function _nowAfter(prevTs: string): string {
  const prev = new Date(prevTs).getTime();
  return new Date(Math.max(prev + 1, Date.now())).toISOString();
}

function _isExpired(item: MemoryItem): boolean {
  if (!item.expiresAt) return false;
  return new Date().getTime() > new Date(item.expiresAt).getTime();
}

// ─── Memory Aging ─────────────────────────────────────────────────────────────

// Returns a 0–1 multiplier that decays exponentially with item age.
function _agingFactor(item: MemoryItem): number {
  const halfLife = TIER_AGING_HALF_LIFE_SECONDS[item.tier] ?? 86_400;
  const ageSec = (Date.now() - new Date(item.updatedAt).getTime()) / 1_000;
  return Math.max(AGING_MIN_FACTOR, Math.pow(0.5, ageSec / halfLife));
}

// ─── Quality Scoring ──────────────────────────────────────────────────────────

function _scoreQuality(input: StoreInput): number {
  let score = 0;
  score += (input.tags && input.tags.length > 0) ? 0.25 : 0;
  const valueStr = JSON.stringify(input.value ?? '');
  score += valueStr.length > 50 ? 0.30 : valueStr.length > 10 ? 0.15 : 0;
  const metaKeys = Object.keys(input.metadata ?? {});
  score += metaKeys.length > 0 ? 0.15 : 0;
  score += (input.key && input.key.length > 10) ? 0.15 : input.key.length > 0 ? 0.07 : 0;
  score += (input.source && input.source.length > 0) ? 0.15 : 0;
  return Math.min(1, Number(score.toFixed(2)));
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validate a StoreInput before writing to the index. */
export function validate(input: Partial<StoreInput>): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];

  if (!input.tier || !ALLOWED_TIERS.has(input.tier as MemoryTier)) {
    errors.push({ field: 'tier', code: 'INVALID_TIER', message: 'tier must be one of: short-term, long-term, project, session.' });
  }
  if (!input.scope || !ALLOWED_SCOPES.has(input.scope as MemoryScope)) {
    errors.push({ field: 'scope', code: 'INVALID_SCOPE', message: 'scope must be one of: global, project, session.' });
  }
  if (!input.key || input.key.trim().length === 0) {
    errors.push({ field: 'key', code: 'REQUIRED', message: 'key must be a non-empty string.' });
  } else if (input.key.length > MAX_KEY_LENGTH) {
    errors.push({ field: 'key', code: 'KEY_TOO_LONG', message: `key must be ≤${MAX_KEY_LENGTH} characters.` });
  }
  if (input.value === undefined || input.value === null) {
    errors.push({ field: 'value', code: 'REQUIRED', message: 'value must be a non-null JSON-serializable value.' });
  }
  if (!input.source || input.source.trim().length === 0) {
    errors.push({ field: 'source', code: 'REQUIRED', message: 'source must identify the writing Skill.' });
  }
  if (input.scope === 'project' && !input.projectId) {
    errors.push({ field: 'projectId', code: 'SCOPE_MISMATCH', message: 'projectId is required when scope is "project".' });
  }
  if (input.scope === 'session' && !input.sessionId) {
    errors.push({ field: 'sessionId', code: 'SCOPE_MISMATCH', message: 'sessionId is required when scope is "session".' });
  }
  if (!input.tags || input.tags.length === 0) {
    warnings.push({ field: 'tags', message: 'No tags provided. Item will not appear in tag-filtered searches.' });
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ─── Write Operations ─────────────────────────────────────────────────────────

/** Store a new memory item or overwrite an existing key in the same scope. */
export function store(input: StoreInput): MemoryItem {
  const validation = validate(input);
  if (!validation.isValid) {
    throw new Error(`VALIDATION_FAILED: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`);
  }

  const now = _now();
  const expiresAt = input.ttlSeconds !== undefined
    ? new Date(Date.now() + input.ttlSeconds * 1000).toISOString()
    : undefined;

  const item: MemoryItem = {
    id: _generateId(),
    tier: input.tier,
    scope: input.scope,
    key: input.key,
    value: input.value,
    ttlSeconds: input.ttlSeconds,
    expiresAt,
    tags: (input.tags ?? []).map((t) => t.toLowerCase()),
    source: input.source,
    projectId: input.projectId,
    sessionId: input.sessionId,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
    qualityScore: _scoreQuality(input),
  };

  _store.set(item.id, item);
  return item;
}

/** Retrieve a single item by stable ID. */
export function get(id: MemoryId): MemoryItem {
  const item = _store.get(id);
  if (!item) {
    throw new Error(`NOT_FOUND: No item with id "${id}".`);
  }
  if (_isExpired(item)) {
    throw new Error(`EXPIRED: Item "${id}" expired at ${item.expiresAt}.`);
  }
  return item;
}

/** Patch an existing item. Immutable fields: id, createdAt, tier, scope. */
export function update(id: MemoryId, patch: Partial<Omit<StoreInput, 'tier' | 'scope'>>): MemoryItem {
  const existing = _store.get(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: No item with id "${id}".`);
  }
  const merged: MemoryItem = {
    ...existing,
    ...patch,
    id: existing.id,
    tier: existing.tier,
    scope: existing.scope,
    createdAt: existing.createdAt,
    updatedAt: _nowAfter(existing.updatedAt),
    tags: patch.tags ? patch.tags.map((t) => t.toLowerCase()) : existing.tags,
    metadata: patch.metadata ?? existing.metadata,
    qualityScore: _scoreQuality({ ...existing, ...patch }),
  };
  _store.set(id, merged);
  return merged;
}

/** Mark an item as expired immediately without deleting it. */
export function expire(id: MemoryId): MemoryItem {
  const item = _store.get(id);
  if (!item) {
    throw new Error(`NOT_FOUND: No item with id "${id}".`);
  }
  const expired: MemoryItem = { ...item, expiresAt: _now(), updatedAt: _now() };
  _store.set(id, expired);
  return expired;
}

/** Bulk-write a list of items, validating each individually. */
export function importItems(items: StoreInput[]): ImportResult {
  const result: ImportResult = { imported: 0, failed: 0, errors: [] };
  items.forEach((input, index) => {
    try {
      store(input);
      result.imported += 1;
    } catch (err) {
      result.failed += 1;
      result.errors.push({ index, message: (err as Error).message });
    }
  });
  return result;
}

// ─── Retrieval Helpers ────────────────────────────────────────────────────────

function _relevanceScore(item: MemoryItem, query: string, strategy: RetrievalStrategy): number {
  if (strategy === 'exact') {
    return item.key === query ? 1 : 0;
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${item.key} ${JSON.stringify(item.value)} ${item.tags.join(' ')}`.toLowerCase();

  const termFrequency = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0) / Math.max(terms.length, 1);

  if (strategy === 'semantic') return termFrequency;

  const tagScore = item.tags.length > 0
    ? terms.filter((t) => item.tags.some((tag) => tag.includes(t))).length / Math.max(terms.length, 1)
    : 0;

  if (strategy === 'tag-match') return tagScore;

  // hybrid: term frequency + quality + aging factor
  return termFrequency * 0.6 + item.qualityScore * 0.2 + _agingFactor(item) * 0.2;
}

// Jaccard similarity between two tag arrays.
function _tagSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// Ratio of shared colon-delimited key segments to total segments.
function _keySegmentSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const segsA = a.split(':');
  const segsB = b.split(':');
  let common = 0;
  const min = Math.min(segsA.length, segsB.length);
  for (let i = 0; i < min; i++) {
    if (segsA[i] === segsB[i]) common += 1; else break;
  }
  return common / Math.max(segsA.length, segsB.length);
}

// Jaccard similarity over tokenised value text.
function _valueSimilarity(a: MemoryItem, b: MemoryItem): number {
  const tokenize = (item: MemoryItem) =>
    new Set(JSON.stringify(item.value).toLowerCase().split(/\W+/).filter(Boolean));
  const tA = tokenize(a);
  const tB = tokenize(b);
  const intersection = [...tA].filter((t) => tB.has(t)).length;
  const union = new Set([...tA, ...tB]).size;
  return union === 0 ? 0 : intersection / union;
}

function _estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

/** Search memory items using the configured strategy and filters. */
export function search(query: SearchQuery): SearchResult {
  const start = Date.now();
  const {
    query: q,
    tiers,
    scope,
    tags,
    limit = 10,
    minQualityScore = 0,
    includeExpired = false,
    projectId,
    sessionId,
    strategy = 'hybrid',
  } = query;

  const results: Array<{ item: MemoryItem; relevanceScore: number }> = [];

  for (const item of _store.values()) {
    if (!includeExpired && _isExpired(item)) continue;
    if (tiers && tiers.length > 0 && !tiers.includes(item.tier)) continue;
    if (scope && item.scope !== scope) continue;
    if (projectId && item.projectId !== projectId) continue;
    if (sessionId && item.sessionId !== sessionId) continue;
    if (item.qualityScore < minQualityScore) continue;
    if (tags && tags.length > 0 && !tags.some((t) => item.tags.includes(t.toLowerCase()))) continue;

    const relevanceScore = _relevanceScore(item, q, strategy);
    results.push({ item, relevanceScore });
  }

  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    items: results.slice(0, limit),
    totalMatches: results.length,
    durationMs: Date.now() - start,
  };
}

/** Find memory items related to the given item by tag, key, and value similarity. */
export function findRelated(id: MemoryId, options: FindRelatedOptions = {}): SearchResult {
  const { limit = DEFAULT_RELATED_LIMIT, minScore = 0.1, tiers, scope } = options;
  const start = Date.now();
  const anchor = _store.get(id);
  if (!anchor) {
    throw new Error(`NOT_FOUND: No item with id "${id}".`);
  }

  const results: Array<{ item: MemoryItem; relevanceScore: number }> = [];

  for (const item of _store.values()) {
    if (item.id === id) continue;
    if (_isExpired(item)) continue;
    if (tiers && !tiers.includes(item.tier)) continue;
    if (scope && item.scope !== scope) continue;

    const tagSim = _tagSimilarity(anchor.tags, item.tags);
    const keySim = _keySegmentSimilarity(anchor.key, item.key);
    const valSim = _valueSimilarity(anchor, item);
    const relevanceScore =
      (tagSim * 0.4 + keySim * 0.3 + valSim * 0.1 + item.qualityScore * 0.2) *
      _agingFactor(item);

    if (relevanceScore >= minScore) {
      results.push({ item, relevanceScore });
    }
  }

  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    items: results.slice(0, limit),
    totalMatches: results.length,
    durationMs: Date.now() - start,
  };
}

/** Reconstruct session or project context for LLM injection. */
export function restoreContext(options: ContextRestoreOptions): ContextRestoration {
  const { scope, sessionId, projectId, limit = 20, tiers } = options;
  const result = search({
    query: '',
    scope,
    sessionId,
    projectId,
    tiers,
    limit,
    strategy: 'hybrid',
    includeExpired: false,
  });

  const text = result.items
    .map(({ item }) => `**${item.key}**: ${JSON.stringify(item.value).substring(0, 200)}`)
    .join('\n');

  return {
    items: result.items,
    tokenEstimate: Math.ceil(text.length / CHARS_PER_TOKEN),
    restoredAt: _now(),
  };
}

// ─── Context Assembly ─────────────────────────────────────────────────────────

/**
 * Assemble a token-budgeted context block for LLM injection, combining
 * conversation history, project memory, and long-term memory in priority order.
 */
export function assembleContext(options: AssembleContextOptions): AssembledContext {
  const {
    sessionId,
    projectId,
    tokenBudget = MAX_TOKEN_BUDGET,
    includeHistory = true,
    historyLimit = 10,
    memoryTiers,
    query = '',
  } = options;

  const sections: ContextSection[] = [];
  let remaining = tokenBudget;

  if (includeHistory && remaining > 0) {
    const history = getHistory({ sessionId, limit: historyLimit });
    if (history.turns.length > 0) {
      const content = history.turns.map((t) => `**${t.role}**: ${t.content}`).join('\n');
      const tokenEstimate = _estimateTokens(content);
      if (tokenEstimate <= remaining) {
        sections.push({ label: 'Conversation History', content, tokenEstimate });
        remaining -= tokenEstimate;
      }
    }
  }

  if (projectId && remaining > 0) {
    const proj = search({ query, scope: 'project', projectId, tiers: memoryTiers, limit: 10, strategy: 'hybrid' });
    if (proj.items.length > 0) {
      const content = proj.items
        .map(({ item }) => `**${item.key}**: ${JSON.stringify(item.value).substring(0, 200)}`)
        .join('\n');
      const tokenEstimate = _estimateTokens(content);
      if (tokenEstimate <= remaining) {
        sections.push({ label: 'Project Context', content, tokenEstimate });
        remaining -= tokenEstimate;
      }
    }
  }

  if (remaining > 0) {
    const lt = search({ query, tiers: memoryTiers ?? ['long-term'], limit: 10, strategy: 'hybrid' });
    if (lt.items.length > 0) {
      const content = lt.items
        .map(({ item }) => `**${item.key}**: ${JSON.stringify(item.value).substring(0, 200)}`)
        .join('\n');
      const tokenEstimate = _estimateTokens(content);
      if (tokenEstimate <= remaining) {
        sections.push({ label: 'Long-Term Memory', content, tokenEstimate });
      }
    }
  }

  return {
    sections,
    totalTokenEstimate: sections.reduce((acc, s) => acc + s.tokenEstimate, 0),
    assembledAt: _now(),
  };
}

// ─── Conversation History ─────────────────────────────────────────────────────

function _nextTurnIndex(sessionId: string): number {
  let max = -1;
  for (const item of _store.values()) {
    if (item.sessionId !== sessionId || !item.tags.includes('conversation')) continue;
    const idx = (item.metadata as { turnIndex?: number }).turnIndex;
    if (typeof idx === 'number' && idx > max) max = idx;
  }
  return max + 1;
}

/** Record a conversation turn for the given session. */
export function recordTurn(input: RecordTurnInput): ConversationTurn {
  const { sessionId, role, content, metadata = {} } = input;
  if (!sessionId || sessionId.trim().length === 0) {
    throw new Error('REQUIRED: sessionId must be a non-empty string.');
  }
  if (!content || content.trim().length === 0) {
    throw new Error('REQUIRED: content must be a non-empty string.');
  }
  if (!VALID_ROLES.has(role)) {
    throw new Error(`INVALID_ROLE: role must be one of: user, assistant, system.`);
  }

  const turnIndex = _nextTurnIndex(sessionId);
  const timestamp = _now();

  const item = store({
    tier: 'session',
    scope: 'session',
    key: `conversation:${sessionId}:${turnIndex.toString().padStart(8, '0')}`,
    value: content,
    tags: ['conversation', role],
    source: 'memory-system',
    sessionId,
    metadata: { ...metadata, turnIndex, role, timestamp },
  });

  return { turnId: item.id, sessionId, role, content, turnIndex, timestamp, metadata: item.metadata };
}

/** Retrieve all conversation turns for a session in chronological order. */
export function getHistory(options: ConversationHistoryOptions): ConversationHistory {
  const { sessionId, limit = 50, includeSystem = true } = options;

  const turns: ConversationTurn[] = [];
  for (const item of _store.values()) {
    if (item.sessionId !== sessionId || !item.tags.includes('conversation')) continue;
    if (_isExpired(item)) continue;
    const meta = item.metadata as { turnIndex?: number; role?: ConversationRole; timestamp?: string };
    const role = meta.role ?? 'user';
    if (!includeSystem && role === 'system') continue;
    turns.push({
      turnId: item.id,
      sessionId,
      role,
      content: item.value as string,
      turnIndex: meta.turnIndex ?? 0,
      timestamp: meta.timestamp ?? item.createdAt,
      metadata: item.metadata,
    });
  }

  turns.sort((a, b) => a.turnIndex - b.turnIndex);
  const limited = turns.slice(-limit);
  const text = limited.map((t) => `${t.role}: ${t.content}`).join('\n');

  return {
    turns: limited,
    sessionId,
    tokenEstimate: _estimateTokens(text),
    retrievedAt: _now(),
  };
}

// ─── Summarization ────────────────────────────────────────────────────────────

/** Condense memory items into a Markdown summary for LLM injection. */
export function summarize(options: SummarizeOptions): MemorySummary {
  const { scope, sessionId, projectId, maxItems = 50, tiers } = options;
  const result = search({
    query: '',
    scope,
    sessionId,
    projectId,
    tiers,
    limit: maxItems,
    strategy: 'hybrid',
  });

  const grouped = new Map<MemoryTier, MemoryItem[]>();
  for (const { item } of result.items) {
    const group = grouped.get(item.tier) ?? [];
    group.push(item);
    grouped.set(item.tier, group);
  }

  const sections: string[] = [];
  for (const [tier, items] of grouped) {
    const bullets = items
      .map((i) => `- **${i.key}** (score: ${i.qualityScore.toFixed(2)}): ${JSON.stringify(i.value).substring(0, 120)}`)
      .join('\n');
    sections.push(`## ${tier.charAt(0).toUpperCase() + tier.slice(1)} Memory\n${bullets}`);
  }

  const text = sections.join('\n\n---\n\n');
  const tokenEstimate = Math.ceil(text.length / CHARS_PER_TOKEN);

  return {
    text: tokenEstimate > MAX_TOKEN_BUDGET ? _truncateSummary(sections) : text,
    tokenEstimate: Math.min(tokenEstimate, MAX_TOKEN_BUDGET),
    itemCount: result.items.length,
    generatedAt: _now(),
  };
}

function _truncateSummary(sections: string[]): string {
  let budget = MAX_TOKEN_BUDGET * CHARS_PER_TOKEN;
  const output: string[] = [];
  for (const section of sections) {
    if (section.length > budget) {
      output.push(section.substring(0, budget) + '\n...(truncated)');
      break;
    }
    output.push(section);
    budget -= section.length;
  }
  return output.join('\n\n---\n\n');
}

// ─── Handoff ──────────────────────────────────────────────────────────────────

/** Transfer memory keys from one Skill to another within a session. Atomic — rolls back on any failure. */
export function handoff(options: HandoffOptions): HandoffReceipt {
  const { fromSkill, toSkill, sessionId, keys } = options;
  const handoffId = _generateId();
  const now = _now();
  const transferred: string[] = [];
  const failed: string[] = [];

  const candidates = Array.from(_store.values()).filter(
    (item) => item.sessionId === sessionId && item.source === fromSkill,
  );

  const targets = keys
    ? candidates.filter((item) => keys.includes(item.key))
    : candidates;

  if (keys) {
    for (const k of keys) {
      if (!candidates.some((item) => item.key === k)) {
        failed.push(k);
      }
    }
  }

  if (failed.length > 0) {
    return { transferred: 0, failed, handoffId, handedOffAt: now };
  }

  for (const item of targets) {
    try {
      store({
        tier: item.tier,
        scope: item.scope,
        key: item.key,
        value: item.value,
        ttlSeconds: item.ttlSeconds,
        tags: item.tags,
        source: toSkill,
        projectId: item.projectId,
        sessionId: item.sessionId,
        metadata: { ...item.metadata, handoffFrom: fromSkill, handoffId },
      });
      transferred.push(item.key);
    } catch {
      failed.push(item.key);
    }
  }

  if (failed.length > 0) {
    for (const key of transferred) {
      const match = Array.from(_store.values()).find(
        (i) => i.key === key && i.source === toSkill && i.sessionId === sessionId,
      );
      if (match) _store.delete(match.id);
    }
    return { transferred: 0, failed, handoffId, handedOffAt: now };
  }

  store({
    tier: 'session',
    scope: 'session',
    key: `handoff-audit:${handoffId}`,
    value: { fromSkill, toSkill, keys: transferred },
    tags: ['audit', 'handoff'],
    source: 'memory-system',
    sessionId,
    metadata: { handoffId, handedOffAt: now },
  });

  return { transferred: transferred.length, failed, handoffId, handedOffAt: now };
}

// ─── Pruning ──────────────────────────────────────────────────────────────────

/** Remove expired or low-quality items. Supports dry-run mode. */
export function prune(options: PruneOptions = {}): PruneReport {
  const {
    expiredOnly = true,
    tier,
    scope,
    minQualityScore,
    dryRun = false,
    projectId,
    sessionId,
  } = options;

  const candidates: PruneCandidate[] = [];
  const toDelete: MemoryId[] = [];

  for (const item of _store.values()) {
    if (tier && item.tier !== tier) continue;
    if (scope && item.scope !== scope) continue;
    if (projectId && item.projectId !== projectId) continue;
    if (sessionId && item.sessionId !== sessionId) continue;

    if (_isExpired(item)) {
      candidates.push({ key: item.key, reason: 'expired' });
      toDelete.push(item.id);
      continue;
    }
    if (!expiredOnly && minQualityScore !== undefined && item.qualityScore < minQualityScore) {
      candidates.push({ key: item.key, reason: 'below quality threshold' });
      toDelete.push(item.id);
    }
  }

  if (dryRun) {
    return {
      removed: 0,
      retained: _store.size,
      skipped: 0,
      candidates,
      dryRun: true,
      prunedAt: _now(),
    };
  }

  let removed = 0;
  for (const id of toDelete) {
    _store.delete(id);
    removed += 1;
  }

  return {
    removed,
    retained: _store.size,
    skipped: 0,
    candidates,
    dryRun: false,
    prunedAt: _now(),
  };
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

/** Re-evaluate quality scores for all non-expired items. Returns count of rescored items. */
export function reScore(): number {
  let count = 0;
  for (const item of _store.values()) {
    if (_isExpired(item)) continue;
    const newScore = _scoreQuality({
      tier: item.tier,
      scope: item.scope,
      key: item.key,
      value: item.value,
      ttlSeconds: item.ttlSeconds,
      tags: item.tags,
      source: item.source,
      projectId: item.projectId,
      sessionId: item.sessionId,
      metadata: item.metadata,
    });
    _store.set(item.id, { ...item, qualityScore: newScore, updatedAt: _now() });
    count += 1;
  }
  return count;
}

/**
 * Apply time-based decay to stored quality scores.
 * Items in short-lived tiers lose quality faster than long-term memories.
 * Returns the number of items updated.
 */
export function applyAging(options: AgingOptions = {}): number {
  const { tiers, scope, projectId, sessionId } = options;
  let count = 0;
  for (const item of _store.values()) {
    if (_isExpired(item)) continue;
    if (tiers && !tiers.includes(item.tier)) continue;
    if (scope && item.scope !== scope) continue;
    if (projectId && item.projectId !== projectId) continue;
    if (sessionId && item.sessionId !== sessionId) continue;

    const baseScore = _scoreQuality({
      tier: item.tier,
      scope: item.scope,
      key: item.key,
      value: item.value,
      ttlSeconds: item.ttlSeconds,
      tags: item.tags,
      source: item.source,
      projectId: item.projectId,
      sessionId: item.sessionId,
      metadata: item.metadata,
    });
    const decayed = Math.max(AGING_MIN_FACTOR, baseScore * _agingFactor(item));
    _store.set(item.id, { ...item, qualityScore: Number(decayed.toFixed(4)), updatedAt: _now() });
    count += 1;
  }
  return count;
}

/** Return aggregate statistics about the memory index. */
export function stats(): MemoryStats {
  let totalItems = 0;
  let expiredItems = 0;
  let qualitySum = 0;
  const tagSet = new Set<string>();
  const byTier: Record<MemoryTier, number> = {
    'short-term': 0,
    'long-term': 0,
    project: 0,
    session: 0,
  };
  const byScope: Record<MemoryScope, number> = {
    global: 0,
    project: 0,
    session: 0,
  };

  for (const item of _store.values()) {
    totalItems += 1;
    if (_isExpired(item)) expiredItems += 1;
    qualitySum += item.qualityScore;
    byTier[item.tier] = (byTier[item.tier] ?? 0) + 1;
    byScope[item.scope] = (byScope[item.scope] ?? 0) + 1;
    item.tags.forEach((t) => tagSet.add(t));
  }

  return {
    totalItems,
    expiredItems,
    avgQualityScore: totalItems > 0 ? Number((qualitySum / totalItems).toFixed(2)) : 0,
    totalTags: tagSet.size,
    byTier,
    byScope,
    lastIndexedAt: _now(),
  };
}

// ─── Default Export ───────────────────────────────────────────────────────────

const memorySystem = {
  store,
  get,
  update,
  expire,
  importItems,
  search,
  findRelated,
  restoreContext,
  assembleContext,
  summarize,
  handoff,
  prune,
  reScore,
  applyAging,
  recordTurn,
  getHistory,
  stats,
  validate,
};

export default memorySystem;
