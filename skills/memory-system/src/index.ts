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

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_KEY_LENGTH = 256;
const MAX_TOKEN_BUDGET = 4000;
const CHARS_PER_TOKEN = 4;

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

function _isExpired(item: MemoryItem): boolean {
  if (!item.expiresAt) return false;
  return new Date().getTime() > new Date(item.expiresAt).getTime();
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
    updatedAt: _now(),
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

// ─── Retrieval ────────────────────────────────────────────────────────────────

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

  return termFrequency * 0.7 + item.qualityScore * 0.3;
}

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
  restoreContext,
  summarize,
  handoff,
  prune,
  reScore,
  stats,
  validate,
};

export default memorySystem;
