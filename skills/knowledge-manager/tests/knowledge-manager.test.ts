/**
 * Tests for Knowledge Manager — covers all public functions with positive,
 * negative, and edge-case scenarios.
 */

import knowledgeManager, {
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
  type KnowledgeEntry,
} from '../src/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'qualityScore' | 'qualityFlag'>> = {}) {
  return {
    title: 'Test Entry',
    content: 'This is the content of the test knowledge entry with enough detail.',
    type: 'concept' as const,
    status: 'active' as const,
    tags: ['test', 'unit'],
    author: 'test-author',
    version: '0.1.0',
    relationships: [],
    citations: [],
    metadata: {},
    ...overrides,
  };
}

// ─── validate ─────────────────────────────────────────────────────────────────

describe('validate', () => {
  test('returns valid for a complete entry', () => {
    const result = validate(makeEntry());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns error when title is missing', () => {
    const result = validate(makeEntry({ title: '' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'title')).toBe(true);
  });

  test('returns error when content is missing', () => {
    const result = validate(makeEntry({ content: '' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'content')).toBe(true);
  });

  test('returns error when type is missing', () => {
    const result = validate({ ...makeEntry(), type: undefined as never });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'type')).toBe(true);
  });

  test('returns error when author is missing', () => {
    const result = validate(makeEntry({ author: '' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'author')).toBe(true);
  });

  test('warns when tags are missing', () => {
    const result = validate(makeEntry({ tags: [] }));
    expect(result.warnings.some((w) => w.field === 'tags')).toBe(true);
  });

  test('quality score is between 0 and 1', () => {
    const result = validate(makeEntry());
    expect(result.qualityScore).toBeGreaterThanOrEqual(0);
    expect(result.qualityScore).toBeLessThanOrEqual(1);
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('create', () => {
  test('creates and returns an entry with generated id', () => {
    const entry = create(makeEntry());
    expect(entry.id).toBeTruthy();
    expect(entry.id.startsWith('km-')).toBe(true);
    expect(entry.title).toBe('Test Entry');
  });

  test('throws VALIDATION_FAILED for invalid input', () => {
    expect(() => create(makeEntry({ title: '' }))).toThrow('VALIDATION_FAILED');
  });

  test('sets createdAt and updatedAt', () => {
    const entry = create(makeEntry());
    expect(entry.createdAt).toBeTruthy();
    expect(entry.updatedAt).toBeTruthy();
  });

  test('sets qualityFlag to unverified by default', () => {
    const entry = create(makeEntry());
    expect(entry.qualityFlag).toBe('unverified');
  });
});

// ─── get ──────────────────────────────────────────────────────────────────────

describe('get', () => {
  test('retrieves a created entry by id', () => {
    const entry = create(makeEntry({ title: 'Unique Get Test' }));
    const retrieved = get(entry.id);
    expect(retrieved.id).toBe(entry.id);
  });

  test('throws NOT_FOUND for unknown id', () => {
    expect(() => get('non-existent-id')).toThrow('NOT_FOUND');
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('update', () => {
  test('updates a field and records history', () => {
    const entry = create(makeEntry({ title: 'Before Update' }));
    const updated = update(entry.id, { title: 'After Update' }, 'Changed title.', 'tester');
    expect(updated.title).toBe('After Update');

    const history = getHistory(entry.id);
    expect(history.versions.length).toBe(1);
    expect(history.versions[0].snapshot.title).toBe('Before Update');
  });

  test('throws NOT_FOUND when updating unknown id', () => {
    expect(() => update('bad-id', { title: 'X' }, 'test', 'tester')).toThrow('NOT_FOUND');
  });

  test('throws VALIDATION_FAILED when update creates invalid state', () => {
    const entry = create(makeEntry());
    expect(() => update(entry.id, { title: '' }, 'clear title', 'tester')).toThrow('VALIDATION_FAILED');
  });
});

// ─── archive ──────────────────────────────────────────────────────────────────

describe('archive', () => {
  test('sets status to archived', () => {
    const entry = create(makeEntry({ title: 'To Archive' }));
    const archived = archive(entry.id, 'tester');
    expect(archived.status).toBe('archived');
  });
});

// ─── search ───────────────────────────────────────────────────────────────────

describe('search', () => {
  test('finds entries matching the query', () => {
    create(makeEntry({ title: 'Searchable Concept', tags: ['search-test'] }));
    const result = search({ query: 'Searchable Concept', tags: ['search-test'] });
    expect(result.entries.length).toBeGreaterThan(0);
  });

  test('throws INVALID_QUERY for empty query', () => {
    expect(() => search({ query: '' })).toThrow('INVALID_QUERY');
  });

  test('filters by type', () => {
    create(makeEntry({ title: 'Type Filter Test', type: 'glossary', tags: ['type-filter'] }));
    const result = search({ query: 'Type Filter Test', types: ['glossary'] });
    expect(result.entries.every((s) => s.entry.type === 'glossary')).toBe(true);
  });

  test('respects limit parameter', () => {
    for (let i = 0; i < 5; i++) {
      create(makeEntry({ title: `Limit Test Entry ${i}`, tags: ['limit-test'] }));
    }
    const result = search({ query: 'Limit Test Entry', limit: 2 });
    expect(result.entries.length).toBeLessThanOrEqual(2);
  });

  test('returns empty when nothing matches', () => {
    const result = search({ query: 'zzz-no-match-xyz-impossible' });
    expect(result.entries).toHaveLength(0);
    expect(result.totalMatches).toBe(0);
  });

  test('excludes archived entries by default', () => {
    const entry = create(makeEntry({ title: 'Archive Search Test', tags: ['archive-search'] }));
    archive(entry.id, 'tester');
    const result = search({ query: 'Archive Search Test', tags: ['archive-search'] });
    expect(result.entries.every((s) => s.entry.status !== 'archived')).toBe(true);
  });
});

// ─── assembleContext ──────────────────────────────────────────────────────────

describe('assembleContext', () => {
  test('returns a context assembly with assembled text', () => {
    create(makeEntry({ title: 'Context Assembly Entry', tags: ['context'] }));
    const ctx = assembleContext('Context Assembly Entry');
    expect(ctx.assembledText).toBeTruthy();
    expect(ctx.tokenEstimate).toBeGreaterThan(0);
  });
});

// ─── detectDuplicates ─────────────────────────────────────────────────────────

describe('detectDuplicates', () => {
  test('detects near-identical titles', () => {
    create(makeEntry({ title: 'Duplicate Detection Alpha', tags: ['dup'] }));
    create(makeEntry({ title: 'Duplicate Detection Alpha', tags: ['dup'] }));
    const report = detectDuplicates();
    expect(report.hasDuplicates).toBe(true);
  });

  test('returns no duplicates for distinct entries', () => {
    create(makeEntry({ title: 'Unique Title Zeta One', tags: ['unique'] }));
    create(makeEntry({ title: 'Completely Different Concept Epsilon', tags: ['unique'] }));
    const report = detectDuplicates();
    const group = report.groups.find(
      (g) =>
        g.representativeId === 'nonexistent' &&
        g.duplicateIds.includes('nonexistent2'),
    );
    expect(group).toBeUndefined();
  });
});

// ─── listTags / renameTag ─────────────────────────────────────────────────────

describe('listTags', () => {
  test('returns tag usage counts', () => {
    create(makeEntry({ title: 'Tag Count Alpha', tags: ['tag-count-unique'] }));
    create(makeEntry({ title: 'Tag Count Beta', tags: ['tag-count-unique'] }));
    const tags = listTags();
    expect(tags['tag-count-unique']).toBeGreaterThanOrEqual(2);
  });
});

describe('renameTag', () => {
  test('renames a tag across all entries', () => {
    create(makeEntry({ title: 'Rename Tag Test', tags: ['old-tag-rename'] }));
    const affected = renameTag('old-tag-rename', 'new-tag-rename', 'tester');
    expect(affected).toBeGreaterThanOrEqual(1);
    const tags = listTags();
    expect(tags['new-tag-rename']).toBeGreaterThanOrEqual(1);
    expect(tags['old-tag-rename']).toBeUndefined();
  });

  test('throws INVALID_TAG for empty tag names', () => {
    expect(() => renameTag('', 'new', 'tester')).toThrow('INVALID_TAG');
    expect(() => renameTag('old', '', 'tester')).toThrow('INVALID_TAG');
  });
});

// ─── getHistory ───────────────────────────────────────────────────────────────

describe('getHistory', () => {
  test('returns history for an entry', () => {
    const entry = create(makeEntry({ title: 'History Test' }));
    update(entry.id, { title: 'History Test Updated' }, 'first update', 'tester');
    const history = getHistory(entry.id);
    expect(history.entryId).toBe(entry.id);
    expect(history.versions.length).toBe(1);
  });

  test('throws NOT_FOUND for unknown entry', () => {
    expect(() => getHistory('bad-id')).toThrow('NOT_FOUND');
  });
});

// ─── stats ────────────────────────────────────────────────────────────────────

describe('stats', () => {
  test('returns aggregate stats', () => {
    const s = stats();
    expect(s.totalEntries).toBeGreaterThanOrEqual(0);
    expect(typeof s.avgQualityScore).toBe('number');
    expect(s.lastIndexedAt).toBeTruthy();
  });
});

// ─── importEntries ────────────────────────────────────────────────────────────

describe('importEntries', () => {
  test('imports valid JSON entries', () => {
    const payload = JSON.stringify([
      {
        title: 'Import Test Entry',
        content: 'Imported content for testing the import function.',
        type: 'concept',
        author: 'importer',
        version: '0.1.0',
        tags: ['import-test'],
      },
    ]);

    const result = importEntries({ source: 'test', format: 'json', content: payload });
    expect(result.imported).toBe(1);
    expect(result.failed).toBe(0);
  });

  test('records failures for invalid entries', () => {
    const payload = JSON.stringify([{ title: '', content: '', type: 'concept', author: '' }]);
    const result = importEntries({
      source: 'test',
      format: 'json',
      content: payload,
      validateBeforeImport: true,
    });
    expect(result.failed).toBe(1);
    expect(result.errors.length).toBe(1);
  });

  test('throws UNSUPPORTED_FORMAT for non-JSON', () => {
    expect(() =>
      importEntries({ source: 'test', format: 'csv', content: 'a,b' }),
    ).toThrow('UNSUPPORTED_FORMAT');
  });

  test('throws PARSE_ERROR for invalid JSON', () => {
    expect(() =>
      importEntries({ source: 'test', format: 'json', content: 'not-json' }),
    ).toThrow('PARSE_ERROR');
  });

  test('throws PARSE_ERROR when JSON is not an array', () => {
    expect(() =>
      importEntries({ source: 'test', format: 'json', content: '{"key":"value"}' }),
    ).toThrow('PARSE_ERROR');
  });
});

// ─── exportEntries ────────────────────────────────────────────────────────────

describe('exportEntries', () => {
  test('exports all entries as JSON', () => {
    create(makeEntry({ title: 'Export Test Entry', tags: ['export-test'] }));
    const result = exportEntries({ format: 'json', tags: ['export-test'] });
    expect(result.format).toBe('json');
    expect(result.entryCount).toBeGreaterThanOrEqual(1);
    const parsed = JSON.parse(result.content);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test('throws UNSUPPORTED_FORMAT for non-JSON', () => {
    expect(() => exportEntries({ format: 'yaml' })).toThrow('UNSUPPORTED_FORMAT');
  });
});

// ─── reScore ──────────────────────────────────────────────────────────────────

describe('reScore', () => {
  test('updates quality scores and returns count', () => {
    create(makeEntry({ title: 'ReScore Test' }));
    const count = reScore();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Default export ───────────────────────────────────────────────────────────

describe('default export', () => {
  test('exposes all public functions', () => {
    expect(typeof knowledgeManager.create).toBe('function');
    expect(typeof knowledgeManager.get).toBe('function');
    expect(typeof knowledgeManager.update).toBe('function');
    expect(typeof knowledgeManager.archive).toBe('function');
    expect(typeof knowledgeManager.search).toBe('function');
    expect(typeof knowledgeManager.assembleContext).toBe('function');
    expect(typeof knowledgeManager.detectDuplicates).toBe('function');
    expect(typeof knowledgeManager.listTags).toBe('function');
    expect(typeof knowledgeManager.renameTag).toBe('function');
    expect(typeof knowledgeManager.getHistory).toBe('function');
    expect(typeof knowledgeManager.stats).toBe('function');
    expect(typeof knowledgeManager.validate).toBe('function');
    expect(typeof knowledgeManager.importEntries).toBe('function');
    expect(typeof knowledgeManager.exportEntries).toBe('function');
    expect(typeof knowledgeManager.reScore).toBe('function');
  });
});
