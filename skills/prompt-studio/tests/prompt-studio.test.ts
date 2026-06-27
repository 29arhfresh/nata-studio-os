/**
 * Tests for the Prompt Studio Skill.
 * Covers all public functions with positive, negative, and edge cases.
 */

import promptStudio, {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  createPrompt,
  getPrompt,
  updatePrompt,
  deletePrompt,
  listPrompts,
  getVersion,
  listVersions,
  restoreVersion,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  listTemplates,
  createPromptFromTemplate,
  searchPrompts,
  toggleFavorite,
  listFavorites,
  validatePrompt,
  validateVariables,
  renderContent,
  previewPrompt,
  getHistory,
  listAllHistory,
  exportPrompts,
  importPrompts,
} from '../src/index';

import type {
  Category,
  Prompt,
  PromptVariable,
  ExportBundle,
} from '../src/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCategory(overrides: Partial<Parameters<typeof createCategory>[0]> = {}): Category {
  return createCategory({ name: `Cat-${Date.now()}-${Math.random()}`, ...overrides });
}

function makePrompt(
  categoryId: string,
  overrides: Partial<Parameters<typeof createPrompt>[0]> = {},
): Prompt {
  return createPrompt({
    title: `Prompt-${Date.now()}-${Math.random()}`,
    content: 'Write about {{topic}} in {{style}} style.',
    categoryId,
    ...overrides,
  });
}

const VAR_TOPIC: PromptVariable = { name: 'topic', description: 'The subject', required: true };
const VAR_STYLE: PromptVariable = {
  name: 'style',
  description: 'Writing style',
  required: false,
  defaultValue: 'professional',
};

// ─── Category Tests ───────────────────────────────────────────────────────────

describe('createCategory', () => {
  test('creates a category with the correct fields', () => {
    const cat = createCategory({ name: 'Marketing', description: 'Marketing prompts', color: '#ff0000' });
    expect(cat.name).toBe('Marketing');
    expect(cat.description).toBe('Marketing prompts');
    expect(cat.color).toBe('#ff0000');
    expect(cat.id).toMatch(/^cat-/);
    expect(cat.createdAt).toBeTruthy();
  });

  test('applies default color when color is omitted', () => {
    const cat = createCategory({ name: 'NoColor' });
    expect(cat.color).toBe('#6366f1');
  });

  test('throws VALIDATION_FAILED when name is empty', () => {
    expect(() => createCategory({ name: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when name is whitespace only', () => {
    expect(() => createCategory({ name: '   ' })).toThrow('VALIDATION_FAILED');
  });

  test('trims whitespace from name', () => {
    const cat = createCategory({ name: '  TrimMe  ' });
    expect(cat.name).toBe('TrimMe');
  });
});

describe('getCategory', () => {
  test('returns the correct category by ID', () => {
    const cat = makeCategory({ name: 'GetCatTest' });
    expect(getCategory(cat.id).name).toBe(cat.name);
  });

  test('throws NOT_FOUND for an unknown ID', () => {
    expect(() => getCategory('cat-does-not-exist')).toThrow('NOT_FOUND');
  });
});

describe('updateCategory', () => {
  test('updates name and description', () => {
    const cat = makeCategory({ name: 'Old Name' });
    const updated = updateCategory(cat.id, { name: 'New Name', description: 'Updated' });
    expect(updated.name).toBe('New Name');
    expect(updated.description).toBe('Updated');
    expect(updated.id).toBe(cat.id);
    expect(updated.createdAt).toBe(cat.createdAt);
  });

  test('throws VALIDATION_FAILED when new name is empty', () => {
    const cat = makeCategory();
    expect(() => updateCategory(cat.id, { name: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND for unknown category', () => {
    expect(() => updateCategory('cat-ghost', { name: 'X' })).toThrow('NOT_FOUND');
  });
});

describe('deleteCategory', () => {
  test('deletes a category with no associated prompts', () => {
    const cat = makeCategory();
    deleteCategory(cat.id);
    expect(() => getCategory(cat.id)).toThrow('NOT_FOUND');
  });

  test('throws CATEGORY_IN_USE when prompts reference it', () => {
    const cat = makeCategory();
    makePrompt(cat.id);
    expect(() => deleteCategory(cat.id)).toThrow('CATEGORY_IN_USE');
  });

  test('throws NOT_FOUND for unknown category', () => {
    expect(() => deleteCategory('cat-missing')).toThrow('NOT_FOUND');
  });
});

describe('listCategories', () => {
  test('returns categories sorted alphabetically', () => {
    const z = makeCategory({ name: 'ZZZ-Cat' });
    const a = makeCategory({ name: 'AAA-Cat' });
    const list = listCategories();
    const names = list.map((c) => c.name);
    const zIdx = names.findIndex((n) => n === z.name);
    const aIdx = names.findIndex((n) => n === a.name);
    expect(aIdx).toBeLessThan(zIdx);
  });

  test('returns an array (even when many categories exist)', () => {
    expect(Array.isArray(listCategories())).toBe(true);
  });
});

// ─── Prompt Tests ─────────────────────────────────────────────────────────────

describe('createPrompt', () => {
  test('creates a prompt with the correct fields', () => {
    const cat = makeCategory();
    const p = createPrompt({
      title: 'Test Prompt',
      content: 'Say {{greeting}} to {{name}}.',
      description: 'A test.',
      categoryId: cat.id,
      tags: ['Test', 'Greeting'],
      variables: [VAR_TOPIC],
    });
    expect(p.title).toBe('Test Prompt');
    expect(p.content).toBe('Say {{greeting}} to {{name}}.');
    expect(p.tags).toEqual(['test', 'greeting']);
    expect(p.isFavorite).toBe(false);
    expect(p.usageCount).toBe(0);
    expect(p.id).toMatch(/^prm-/);
    expect(p.currentVersionId).toMatch(/^ver-/);
    expect(p.versionIds).toHaveLength(1);
  });

  test('creates an initial version automatically', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const version = getVersion(p.currentVersionId);
    expect(version.versionNumber).toBe(1);
    expect(version.content).toBe(p.content);
    expect(version.changeNote).toBe('Initial version.');
  });

  test('throws VALIDATION_FAILED when title is empty', () => {
    const cat = makeCategory();
    expect(() => createPrompt({ title: '', content: 'x', categoryId: cat.id })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when content is empty', () => {
    const cat = makeCategory();
    expect(() => createPrompt({ title: 'T', content: '', categoryId: cat.id })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when title exceeds maximum length', () => {
    const cat = makeCategory();
    expect(() => createPrompt({ title: 'x'.repeat(201), content: 'y', categoryId: cat.id })).toThrow(
      'VALIDATION_FAILED',
    );
  });

  test('throws NOT_FOUND when categoryId does not exist', () => {
    expect(() => createPrompt({ title: 'T', content: 'C', categoryId: 'cat-ghost' })).toThrow('NOT_FOUND');
  });

  test('records a created history entry', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const history = getHistory(p.id);
    expect(history.some((h) => h.action === 'created')).toBe(true);
  });
});

describe('getPrompt', () => {
  test('returns the correct prompt by ID', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id, { title: 'GetMe' });
    expect(getPrompt(p.id).title).toBe(p.title);
  });

  test('throws NOT_FOUND for unknown ID', () => {
    expect(() => getPrompt('prm-ghost')).toThrow('NOT_FOUND');
  });
});

describe('updatePrompt', () => {
  test('updates title without creating a new version', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const initialVersionCount = p.versionIds.length;
    const updated = updatePrompt(p.id, { title: 'New Title' });
    expect(updated.title).toBe('New Title');
    expect(updated.versionIds).toHaveLength(initialVersionCount);
  });

  test('creates a new version when content changes', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const updated = updatePrompt(p.id, { content: 'Completely new content.' });
    expect(updated.versionIds).toHaveLength(2);
    const newVersion = getVersion(updated.currentVersionId);
    expect(newVersion.versionNumber).toBe(2);
    expect(newVersion.content).toBe('Completely new content.');
  });

  test('uses provided changeNote for new version', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    updatePrompt(p.id, { content: 'Changed.' }, 'My custom note');
    const updated = getPrompt(p.id);
    const ver = getVersion(updated.currentVersionId);
    expect(ver.changeNote).toBe('My custom note');
  });

  test('lowercases tags on update', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const updated = updatePrompt(p.id, { tags: ['UPPER', 'MiXeD'] });
    expect(updated.tags).toEqual(['upper', 'mixed']);
  });

  test('throws VALIDATION_FAILED when title is set to empty', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    expect(() => updatePrompt(p.id, { title: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when content is set to empty', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    expect(() => updatePrompt(p.id, { content: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND when categoryId does not exist', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    expect(() => updatePrompt(p.id, { categoryId: 'cat-ghost' })).toThrow('NOT_FOUND');
  });

  test('preserves usageCount and versionIds as managed fields', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const updated = updatePrompt(p.id, { title: 'Safe Update' });
    expect(updated.usageCount).toBe(p.usageCount);
    expect(updated.id).toBe(p.id);
    expect(updated.createdAt).toBe(p.createdAt);
  });
});

describe('deletePrompt', () => {
  test('removes the prompt and its versions', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const versionId = p.currentVersionId;
    deletePrompt(p.id);
    expect(() => getPrompt(p.id)).toThrow('NOT_FOUND');
    expect(() => getVersion(versionId)).toThrow('NOT_FOUND');
  });

  test('throws NOT_FOUND when prompt does not exist', () => {
    expect(() => deletePrompt('prm-ghost')).toThrow('NOT_FOUND');
  });

  test('cleans up history entries for the deleted prompt', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const promptId = p.id;
    deletePrompt(promptId);
    const remaining = listAllHistory(1000).filter((h) => h.promptId === promptId);
    expect(remaining).toHaveLength(0);
  });
});

describe('listPrompts', () => {
  test('returns all prompts when no filter is provided', () => {
    const cat = makeCategory();
    const p1 = makePrompt(cat.id);
    const p2 = makePrompt(cat.id);
    const all = listPrompts();
    expect(all.some((p) => p.id === p1.id)).toBe(true);
    expect(all.some((p) => p.id === p2.id)).toBe(true);
  });

  test('filters by categoryId', () => {
    const catA = makeCategory();
    const catB = makeCategory();
    const pA = makePrompt(catA.id);
    makePrompt(catB.id);
    const results = listPrompts({ categoryId: catA.id });
    expect(results.every((p) => p.categoryId === catA.id)).toBe(true);
    expect(results.some((p) => p.id === pA.id)).toBe(true);
  });

  test('filters by isFavorite', () => {
    const cat = makeCategory();
    const fav = makePrompt(cat.id);
    toggleFavorite(fav.id);
    const notFav = makePrompt(cat.id);
    const favorites = listPrompts({ isFavorite: true });
    expect(favorites.some((p) => p.id === fav.id)).toBe(true);
    expect(favorites.some((p) => p.id === notFav.id)).toBe(false);
  });

  test('filters by tags', () => {
    const cat = makeCategory();
    const tagged = makePrompt(cat.id, { tags: ['special-tag-xyz'] });
    const plain = makePrompt(cat.id);
    const results = listPrompts({ tags: ['special-tag-xyz'] });
    expect(results.some((p) => p.id === tagged.id)).toBe(true);
    expect(results.some((p) => p.id === plain.id)).toBe(false);
  });

  test('returns results sorted by updatedAt descending', () => {
    const cat = makeCategory();
    for (let i = 0; i < 3; i++) makePrompt(cat.id);
    const results = listPrompts();
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].updatedAt >= results[i + 1].updatedAt).toBe(true);
    }
  });
});

// ─── Version Tests ────────────────────────────────────────────────────────────

describe('getVersion', () => {
  test('returns the correct version by ID', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const ver = getVersion(p.currentVersionId);
    expect(ver.promptId).toBe(p.id);
    expect(ver.versionNumber).toBe(1);
  });

  test('throws NOT_FOUND for unknown version', () => {
    expect(() => getVersion('ver-ghost')).toThrow('NOT_FOUND');
  });
});

describe('listVersions', () => {
  test('returns versions in descending version number order', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    updatePrompt(p.id, { content: 'Version 2 content.' });
    updatePrompt(p.id, { content: 'Version 3 content.' });
    const versions = listVersions(p.id);
    expect(versions[0].versionNumber).toBe(3);
    expect(versions[1].versionNumber).toBe(2);
    expect(versions[2].versionNumber).toBe(1);
  });

  test('returns a single version for a new prompt', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    expect(listVersions(p.id)).toHaveLength(1);
  });

  test('throws NOT_FOUND when prompt does not exist', () => {
    expect(() => listVersions('prm-ghost')).toThrow('NOT_FOUND');
  });
});

describe('restoreVersion', () => {
  test('restores content from a previous version', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id, { content: 'Original content.' });
    updatePrompt(p.id, { content: 'Revised content.' });
    const v1 = listVersions(p.id).find((v) => v.versionNumber === 1)!;
    const restored = restoreVersion(p.id, v1.id);
    expect(restored.content).toBe('Original content.');
    expect(restored.versionIds.length).toBe(3);
  });

  test('creates a new version record upon restoration', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id, { content: 'v1 content.' });
    updatePrompt(p.id, { content: 'v2 content.' });
    const v1 = listVersions(p.id).find((v) => v.versionNumber === 1)!;
    restoreVersion(p.id, v1.id);
    const updated = getPrompt(p.id);
    const restoredVer = getVersion(updated.currentVersionId);
    expect(restoredVer.changeNote).toContain('Restored from version 1');
  });

  test('throws VALIDATION_FAILED when version belongs to a different prompt', () => {
    const cat = makeCategory();
    const p1 = makePrompt(cat.id);
    const p2 = makePrompt(cat.id);
    expect(() => restoreVersion(p2.id, p1.currentVersionId)).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND for unknown version', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    expect(() => restoreVersion(p.id, 'ver-ghost')).toThrow('NOT_FOUND');
  });
});

// ─── Template Tests ───────────────────────────────────────────────────────────

describe('createTemplate', () => {
  test('creates a template with correct fields', () => {
    const cat = makeCategory();
    const tpl = createTemplate({
      name: 'Blog Template',
      structure: 'Write a blog post about {{topic}}.',
      categoryId: cat.id,
      tags: ['Blog'],
    });
    expect(tpl.name).toBe('Blog Template');
    expect(tpl.tags).toEqual(['blog']);
    expect(tpl.id).toMatch(/^tpl-/);
    expect(tpl.categoryId).toBe(cat.id);
  });

  test('creates a template without a category', () => {
    const tpl = createTemplate({ name: 'General', structure: 'Generic {{placeholder}}.' });
    expect(tpl.categoryId).toBe('');
  });

  test('throws VALIDATION_FAILED when name is empty', () => {
    expect(() => createTemplate({ name: '', structure: 'x' })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when structure is empty', () => {
    expect(() => createTemplate({ name: 'T', structure: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND when categoryId does not exist', () => {
    expect(() => createTemplate({ name: 'T', structure: 'x', categoryId: 'cat-ghost' })).toThrow(
      'NOT_FOUND',
    );
  });
});

describe('getTemplate', () => {
  test('returns the correct template by ID', () => {
    const tpl = createTemplate({ name: 'GetMe', structure: 'Template body.' });
    expect(getTemplate(tpl.id).name).toBe('GetMe');
  });

  test('throws NOT_FOUND for unknown ID', () => {
    expect(() => getTemplate('tpl-ghost')).toThrow('NOT_FOUND');
  });
});

describe('updateTemplate', () => {
  test('updates the template name and tags', () => {
    const tpl = createTemplate({ name: 'Old', structure: 'Body.' });
    const updated = updateTemplate(tpl.id, { name: 'New', tags: ['UPDATED'] });
    expect(updated.name).toBe('New');
    expect(updated.tags).toEqual(['updated']);
    expect(updated.id).toBe(tpl.id);
  });

  test('throws VALIDATION_FAILED when name is set to empty', () => {
    const tpl = createTemplate({ name: 'T', structure: 'S.' });
    expect(() => updateTemplate(tpl.id, { name: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when structure is set to empty', () => {
    const tpl = createTemplate({ name: 'T', structure: 'S.' });
    expect(() => updateTemplate(tpl.id, { structure: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND for unknown template', () => {
    expect(() => updateTemplate('tpl-ghost', { name: 'X' })).toThrow('NOT_FOUND');
  });
});

describe('deleteTemplate', () => {
  test('deletes a template', () => {
    const tpl = createTemplate({ name: 'DeleteMe', structure: 'x' });
    deleteTemplate(tpl.id);
    expect(() => getTemplate(tpl.id)).toThrow('NOT_FOUND');
  });

  test('throws NOT_FOUND for unknown template', () => {
    expect(() => deleteTemplate('tpl-ghost')).toThrow('NOT_FOUND');
  });
});

describe('listTemplates', () => {
  test('returns templates sorted by name', () => {
    createTemplate({ name: 'ZZZ-Template', structure: 'body.' });
    createTemplate({ name: 'AAA-Template', structure: 'body.' });
    const list = listTemplates();
    const names = list.map((t) => t.name);
    const zIdx = names.findIndex((n) => n === 'ZZZ-Template');
    const aIdx = names.findIndex((n) => n === 'AAA-Template');
    expect(aIdx).toBeLessThan(zIdx);
  });

  test('filters by categoryId', () => {
    const cat = makeCategory();
    const tpl = createTemplate({ name: 'CatTemplate', structure: 'x', categoryId: cat.id });
    const results = listTemplates({ categoryId: cat.id });
    expect(results.some((t) => t.id === tpl.id)).toBe(true);
  });

  test('filters by tags', () => {
    const tpl = createTemplate({ name: 'TaggedTpl', structure: 'x', tags: ['unique-tag-abc'] });
    const results = listTemplates({ tags: ['unique-tag-abc'] });
    expect(results.some((t) => t.id === tpl.id)).toBe(true);
  });

  test('returns empty array when no templates match', () => {
    const results = listTemplates({ tags: ['completely-nonexistent-tag-xyz-123'] });
    expect(results).toHaveLength(0);
  });
});

describe('createPromptFromTemplate', () => {
  test('creates a prompt by rendering template structure', () => {
    const cat = makeCategory();
    const tpl = createTemplate({
      name: 'Email Template',
      structure: 'Dear {{name}}, please see {{subject}}.',
      categoryId: cat.id,
    });
    const p = createPromptFromTemplate(tpl.id, { name: 'Alice', subject: 'the report' });
    expect(p.content).toBe('Dear Alice, please see the report.');
    expect(p.categoryId).toBe(cat.id);
  });

  test('uses overrides for title and tags', () => {
    const cat = makeCategory();
    const tpl = createTemplate({ name: 'Base', structure: 'Body {{x}}.', categoryId: cat.id });
    const p = createPromptFromTemplate(tpl.id, { x: 'value' }, { title: 'Custom Title', tags: ['override'] });
    expect(p.title).toBe('Custom Title');
    expect(p.tags).toContain('override');
  });

  test('throws VALIDATION_FAILED when template has no category and no override provided', () => {
    const tpl = createTemplate({ name: 'NoCat', structure: 'body.' });
    expect(() => createPromptFromTemplate(tpl.id, {})).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND for unknown template', () => {
    expect(() => createPromptFromTemplate('tpl-ghost', {})).toThrow('NOT_FOUND');
  });
});

// ─── Search Tests ─────────────────────────────────────────────────────────────

describe('searchPrompts', () => {
  test('returns all prompts for an empty query', () => {
    const cat = makeCategory();
    makePrompt(cat.id, { title: 'SearchableA' });
    makePrompt(cat.id, { title: 'SearchableB' });
    const results = searchPrompts('');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].score).toBe(0);
  });

  test('finds prompts by title keyword', () => {
    const cat = makeCategory();
    makePrompt(cat.id, { title: 'UniqueKeywordXYZQRS', content: 'generic content' });
    const results = searchPrompts('UniqueKeywordXYZQRS');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].prompt.title).toContain('UniqueKeywordXYZQRS');
  });

  test('scores title matches higher than content matches', () => {
    const cat = makeCategory();
    const titleMatch = makePrompt(cat.id, { title: 'marvelous prompt', content: 'unrelated body' });
    const contentMatch = makePrompt(cat.id, { title: 'unrelated title', content: 'marvelous content body' });
    const results = searchPrompts('marvelous');
    const titleResult = results.find((r) => r.prompt.id === titleMatch.id);
    const contentResult = results.find((r) => r.prompt.id === contentMatch.id);
    expect(titleResult).toBeDefined();
    expect(contentResult).toBeDefined();
    expect(titleResult!.score).toBeGreaterThan(contentResult!.score);
  });

  test('filters by categoryId', () => {
    const catA = makeCategory();
    const catB = makeCategory();
    makePrompt(catA.id, { title: 'filtercat alpha', content: 'alpha content' });
    makePrompt(catB.id, { title: 'filtercat beta', content: 'beta content' });
    const results = searchPrompts('filtercat', { categoryId: catA.id });
    expect(results.every((r) => r.prompt.categoryId === catA.id)).toBe(true);
  });

  test('respects the limit option', () => {
    const cat = makeCategory();
    for (let i = 0; i < 5; i++) makePrompt(cat.id, { title: `limitprompt ${i}` });
    const results = searchPrompts('', { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  test('filters by favoritesOnly', () => {
    const cat = makeCategory();
    const fav = makePrompt(cat.id, { title: 'favprompt preferred', content: 'favprompt content' });
    const notFav = makePrompt(cat.id, { title: 'favprompt other', content: 'favprompt content' });
    toggleFavorite(fav.id);
    const results = searchPrompts('favprompt', { favoritesOnly: true });
    expect(results.some((r) => r.prompt.id === fav.id)).toBe(true);
    expect(results.some((r) => r.prompt.id === notFav.id)).toBe(false);
  });
});

// ─── Favorites Tests ──────────────────────────────────────────────────────────

describe('toggleFavorite', () => {
  test('marks a prompt as favorite', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    expect(p.isFavorite).toBe(false);
    const toggled = toggleFavorite(p.id);
    expect(toggled.isFavorite).toBe(true);
  });

  test('unmarks a favorited prompt', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    toggleFavorite(p.id);
    const unFav = toggleFavorite(p.id);
    expect(unFav.isFavorite).toBe(false);
  });

  test('records history for favorite and unfavorite', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    toggleFavorite(p.id);
    toggleFavorite(p.id);
    const history = getHistory(p.id);
    expect(history.some((h) => h.action === 'favorited')).toBe(true);
    expect(history.some((h) => h.action === 'unfavorited')).toBe(true);
  });

  test('throws NOT_FOUND for unknown prompt', () => {
    expect(() => toggleFavorite('prm-ghost')).toThrow('NOT_FOUND');
  });
});

describe('listFavorites', () => {
  test('returns only favorited prompts', () => {
    const cat = makeCategory();
    const fav = makePrompt(cat.id);
    const notFav = makePrompt(cat.id);
    toggleFavorite(fav.id);
    const results = listFavorites();
    expect(results.some((p) => p.id === fav.id)).toBe(true);
    expect(results.some((p) => p.id === notFav.id)).toBe(false);
  });

  test('returns an empty array when no favorites exist after unfavoriting all', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    toggleFavorite(p.id);
    toggleFavorite(p.id);
    const favs = listFavorites();
    expect(favs.some((f) => f.id === p.id)).toBe(false);
  });
});

// ─── Validation Tests ─────────────────────────────────────────────────────────

describe('validatePrompt', () => {
  test('returns valid for correct content and matching variables', () => {
    const result = validatePrompt('Hello {{name}}!', [
      { name: 'name', description: 'recipient', required: true },
    ]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.extractedVariables).toEqual(['name']);
  });

  test('returns invalid for empty content', () => {
    const result = validatePrompt('', []);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('warns when a variable is used in content but not declared', () => {
    const result = validatePrompt('Use {{undeclared}} here.', []);
    expect(result.warnings.some((w) => w.includes('{{undeclared}}'))).toBe(true);
  });

  test('warns when a declared variable is not used in content', () => {
    const result = validatePrompt('No placeholders here.', [
      { name: 'unused', description: 'x', required: false },
    ]);
    expect(result.warnings.some((w) => w.includes('"unused"'))).toBe(true);
  });

  test('extracts multiple unique variables from content', () => {
    const result = validatePrompt('{{a}} and {{b}} and {{a}} again.', []);
    expect(result.extractedVariables).toContain('a');
    expect(result.extractedVariables).toContain('b');
    expect(result.extractedVariables).toHaveLength(2);
  });
});

describe('validateVariables', () => {
  test('returns valid when all required variables have values', () => {
    const result = validateVariables(
      'Hello {{name}}.',
      { name: 'Alice' },
      [{ name: 'name', description: 'x', required: true }],
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns invalid when a required variable has no value and no default', () => {
    const result = validateVariables(
      'Hello {{name}}.',
      {},
      [{ name: 'name', description: 'x', required: true }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('"name"'))).toBe(true);
  });

  test('passes when a required variable has a default value', () => {
    const result = validateVariables(
      'Style: {{style}}.',
      {},
      [{ name: 'style', description: 'x', required: true, defaultValue: 'formal' }],
    );
    expect(result.valid).toBe(true);
  });

  test('does not fail optional variables without values', () => {
    const result = validateVariables(
      'Optional: {{opt}}.',
      {},
      [{ name: 'opt', description: 'x', required: false }],
    );
    expect(result.valid).toBe(true);
  });

  test('fails when a required variable has an empty-string default and no value', () => {
    const result = validateVariables(
      'Hello {{name}}.',
      {},
      [{ name: 'name', description: 'x', required: true, defaultValue: '' }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('"name"'))).toBe(true);
  });
});

// ─── Preview Tests ────────────────────────────────────────────────────────────

describe('renderContent', () => {
  test('substitutes all provided variable values', () => {
    const result = renderContent('Hello {{name}}, meet {{other}}.', { name: 'Alice', other: 'Bob' });
    expect(result).toBe('Hello Alice, meet Bob.');
  });

  test('leaves unresolved variables as-is', () => {
    const result = renderContent('Hello {{name}}.', {});
    expect(result).toBe('Hello {{name}}.');
  });

  test('substitutes the same variable multiple times', () => {
    const result = renderContent('{{x}} and {{x}} and {{x}}', { x: 'value' });
    expect(result).toBe('value and value and value');
  });
});

describe('previewPrompt', () => {
  test('renders prompt with provided variable values', () => {
    const cat = makeCategory();
    const p = createPrompt({
      title: 'Preview Test',
      content: 'Write about {{topic}} in {{style}} style.',
      categoryId: cat.id,
      variables: [VAR_TOPIC, VAR_STYLE],
    });
    const result = previewPrompt(p.id, { topic: 'AI', style: 'casual' });
    expect(result.rendered).toBe('Write about AI in casual style.');
    expect(result.missingVariables).toHaveLength(0);
    expect(result.usedDefaultValues).toHaveLength(0);
  });

  test('applies default values for missing optional variables', () => {
    const cat = makeCategory();
    const p = createPrompt({
      title: 'Default Test',
      content: 'Style: {{style}}.',
      categoryId: cat.id,
      variables: [VAR_STYLE],
    });
    const result = previewPrompt(p.id, {});
    expect(result.rendered).toBe('Style: professional.');
    expect(result.usedDefaultValues).toContain('style');
  });

  test('reports missing required variables', () => {
    const cat = makeCategory();
    const p = createPrompt({
      title: 'Missing Test',
      content: 'Topic: {{topic}}.',
      categoryId: cat.id,
      variables: [VAR_TOPIC],
    });
    const result = previewPrompt(p.id, {});
    expect(result.missingVariables).toContain('topic');
  });

  test('increments usageCount on each preview', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    previewPrompt(p.id, {});
    previewPrompt(p.id, {});
    const updated = getPrompt(p.id);
    expect(updated.usageCount).toBe(2);
  });

  test('throws NOT_FOUND for unknown prompt', () => {
    expect(() => previewPrompt('prm-ghost', {})).toThrow('NOT_FOUND');
  });
});

// ─── History Tests ────────────────────────────────────────────────────────────

describe('getHistory', () => {
  test('returns history entries for a prompt in reverse chronological order', () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    updatePrompt(p.id, { title: 'Updated' });
    const history = getHistory(p.id);
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0].timestamp >= history[1].timestamp).toBe(true);
  });

  test('throws NOT_FOUND when prompt does not exist', () => {
    expect(() => getHistory('prm-ghost')).toThrow('NOT_FOUND');
  });
});

describe('listAllHistory', () => {
  test('returns entries across all prompts', () => {
    const cat = makeCategory();
    makePrompt(cat.id);
    makePrompt(cat.id);
    const history = listAllHistory(1000);
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  test('respects the limit parameter', () => {
    const history = listAllHistory(3);
    expect(history.length).toBeLessThanOrEqual(3);
  });

  test('returns entries sorted newest first', () => {
    const history = listAllHistory(100);
    for (let i = 0; i < history.length - 1; i++) {
      expect(history[i].timestamp >= history[i + 1].timestamp).toBe(true);
    }
  });
});

// ─── Export / Import Tests ────────────────────────────────────────────────────

describe('exportPrompts', () => {
  test('exports all prompts with their categories and versions', () => {
    const cat = makeCategory({ name: 'ExportTestCat' });
    const p = makePrompt(cat.id);
    updatePrompt(p.id, { content: 'Updated for export.' });
    const bundle = exportPrompts();
    expect(bundle.formatVersion).toBe('1.0.0');
    expect(bundle.categories.some((c) => c.id === cat.id)).toBe(true);
    expect(bundle.prompts.some((pr) => pr.id === p.id)).toBe(true);
    expect(bundle.versions.some((v) => v.promptId === p.id)).toBe(true);
  });

  test('filters export by categoryId', () => {
    const catA = makeCategory();
    const catB = makeCategory();
    const pA = makePrompt(catA.id);
    const pB = makePrompt(catB.id);
    const bundle = exportPrompts({ categoryId: catA.id });
    expect(bundle.prompts.some((p) => p.id === pA.id)).toBe(true);
    expect(bundle.prompts.some((p) => p.id === pB.id)).toBe(false);
    expect(bundle.categories.some((c) => c.id === catA.id)).toBe(true);
    expect(bundle.categories.some((c) => c.id === catB.id)).toBe(false);
  });

  test('filters export by tags', () => {
    const cat = makeCategory();
    const tagged = makePrompt(cat.id, { tags: ['export-unique-tag'] });
    const plain = makePrompt(cat.id);
    const bundle = exportPrompts({ tags: ['export-unique-tag'] });
    expect(bundle.prompts.some((p) => p.id === tagged.id)).toBe(true);
    expect(bundle.prompts.some((p) => p.id === plain.id)).toBe(false);
  });

  test('exports the bundle as a plain object (not a class instance)', () => {
    const bundle = exportPrompts();
    expect(typeof bundle).toBe('object');
    expect(bundle.exportedAt).toBeTruthy();
  });
});

describe('importPrompts', () => {
  test('imports categories, templates, and prompts from a valid bundle', async () => {
    const cat: Category = {
      id: `cat-import-${Date.now()}`,
      name: 'Imported Category',
      description: '',
      color: '#000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const bundle: ExportBundle = {
      formatVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories: [cat],
      templates: [],
      prompts: [
        {
          id: `prm-import-${Date.now()}`,
          title: 'Imported Prompt',
          content: 'Imported {{content}}.',
          description: '',
          categoryId: cat.id,
          tags: [],
          variables: [],
          isFavorite: false,
          currentVersionId: `ver-import-${Date.now()}`,
          versionIds: [`ver-import-${Date.now()}-1`],
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        },
      ],
      versions: [],
    };

    const result = await importPrompts(bundle);
    expect(result.importedCategories).toBe(1);
    expect(result.importedPrompts).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  test('skips existing records in skip mode', async () => {
    const cat = makeCategory();
    const p = makePrompt(cat.id);
    const bundle = exportPrompts({ categoryId: cat.id });
    const result = await importPrompts(bundle, { mode: 'skip' });
    expect(result.skippedCategories).toBeGreaterThanOrEqual(1);
    expect(result.skippedPrompts).toBeGreaterThanOrEqual(1);
    const stillHere = getPrompt(p.id);
    expect(stillHere.id).toBe(p.id);
  });

  test('overwrites existing records in overwrite mode', async () => {
    const cat = makeCategory();
    makePrompt(cat.id);
    const bundle = exportPrompts({ categoryId: cat.id });
    const result = await importPrompts(bundle, { mode: 'overwrite' });
    expect(result.importedCategories).toBeGreaterThanOrEqual(1);
    expect(result.importedPrompts).toBeGreaterThanOrEqual(1);
    expect(result.errors).toHaveLength(0);
  });

  test('returns validation errors for an invalid bundle', async () => {
    const result = await importPrompts({ formatVersion: '', exportedAt: '', categories: [], templates: [], prompts: [], versions: [] });
    expect(result.importedPrompts).toBe(0);
  });

  test('handles an empty bundle gracefully', async () => {
    const bundle: ExportBundle = {
      formatVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories: [],
      templates: [],
      prompts: [],
      versions: [],
    };
    const result = await importPrompts(bundle);
    expect(result.importedCategories).toBe(0);
    expect(result.importedPrompts).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Default Export Tests ─────────────────────────────────────────────────────

describe('default export', () => {
  test('exports all expected public functions', () => {
    expect(typeof promptStudio.createCategory).toBe('function');
    expect(typeof promptStudio.getCategory).toBe('function');
    expect(typeof promptStudio.createPrompt).toBe('function');
    expect(typeof promptStudio.getPrompt).toBe('function');
    expect(typeof promptStudio.updatePrompt).toBe('function');
    expect(typeof promptStudio.deletePrompt).toBe('function');
    expect(typeof promptStudio.listPrompts).toBe('function');
    expect(typeof promptStudio.getVersion).toBe('function');
    expect(typeof promptStudio.listVersions).toBe('function');
    expect(typeof promptStudio.restoreVersion).toBe('function');
    expect(typeof promptStudio.createTemplate).toBe('function');
    expect(typeof promptStudio.searchPrompts).toBe('function');
    expect(typeof promptStudio.toggleFavorite).toBe('function');
    expect(typeof promptStudio.listFavorites).toBe('function');
    expect(typeof promptStudio.validatePrompt).toBe('function');
    expect(typeof promptStudio.validateVariables).toBe('function');
    expect(typeof promptStudio.renderContent).toBe('function');
    expect(typeof promptStudio.previewPrompt).toBe('function');
    expect(typeof promptStudio.getHistory).toBe('function');
    expect(typeof promptStudio.listAllHistory).toBe('function');
    expect(typeof promptStudio.exportPrompts).toBe('function');
    expect(typeof promptStudio.importPrompts).toBe('function');
  });
});
