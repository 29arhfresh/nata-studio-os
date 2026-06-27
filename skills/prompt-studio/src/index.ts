/**
 * Prompt Studio — production prompt management system for Nata Studio OS.
 * Manages prompt library, categories, tags, variables, versions, templates,
 * search, favorites, export/import, validation, preview, and history.
 */

import workflowEngine from '../../workflow-engine/src/index';
import type {
  StepInput,
  StepResult,
  WorkflowResult,
  StepDefinition,
} from '../../workflow-engine/src/index';
import type { DataRoute } from '../../workflow-engine/src/index';

// ─── ID Types ─────────────────────────────────────────────────────────────────

export type PromptId = string;
export type CategoryId = string;
export type VersionId = string;
export type TemplateId = string;
export type HistoryId = string;

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type HistoryAction =
  | 'created'
  | 'updated'
  | 'versioned'
  | 'restored'
  | 'used'
  | 'favorited'
  | 'unfavorited'
  | 'deleted';

export interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: PromptId;
  title: string;
  content: string;
  description: string;
  categoryId: CategoryId;
  tags: string[];
  variables: PromptVariable[];
  isFavorite: boolean;
  currentVersionId: VersionId;
  versionIds: VersionId[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface PromptVersion {
  id: VersionId;
  promptId: PromptId;
  versionNumber: number;
  content: string;
  variables: PromptVariable[];
  changeNote: string;
  createdAt: string;
}

export interface PromptTemplate {
  id: TemplateId;
  name: string;
  description: string;
  structure: string;
  suggestedVariables: PromptVariable[];
  categoryId: CategoryId;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: HistoryId;
  promptId: PromptId;
  action: HistoryAction;
  detail: string;
  timestamp: string;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
}

export interface CreatePromptInput {
  title: string;
  content: string;
  description?: string;
  categoryId: CategoryId;
  tags?: string[];
  variables?: PromptVariable[];
  metadata?: Record<string, unknown>;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  structure: string;
  suggestedVariables?: PromptVariable[];
  categoryId?: CategoryId;
  tags?: string[];
}

export interface SearchOptions {
  categoryId?: CategoryId;
  tags?: string[];
  favoritesOnly?: boolean;
  limit?: number;
}

// ─── Result Types ─────────────────────────────────────────────────────────────

export interface SearchResult {
  prompt: Prompt;
  score: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  extractedVariables: string[];
}

export interface PreviewResult {
  rendered: string;
  missingVariables: string[];
  usedDefaultValues: string[];
}

export interface ExportBundle {
  formatVersion: string;
  exportedAt: string;
  categories: Category[];
  templates: PromptTemplate[];
  prompts: Prompt[];
  versions: PromptVersion[];
}

export interface ImportOptions {
  mode?: 'skip' | 'overwrite';
}

export interface ImportResult {
  importedCategories: number;
  importedTemplates: number;
  importedPrompts: number;
  importedVersions: number;
  skippedCategories: number;
  skippedTemplates: number;
  skippedPrompts: number;
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMAT_VERSION = '1.0.0';
const MAX_TITLE_LENGTH = 200;
const MAX_VARIABLE_NAME_LENGTH = 50;
const MAX_HISTORY_PER_PROMPT = 1000;
const DEFAULT_CATEGORY_COLOR = '#6366f1';
const DEFAULT_HISTORY_LIMIT = 50;
const SEARCH_TITLE_WEIGHT = 3;
const SEARCH_DESCRIPTION_WEIGHT = 2;
const SEARCH_TAG_WEIGHT = 2;
const SEARCH_CONTENT_WEIGHT = 1;
const VARIABLE_REGEX_SOURCE = '\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}';
const VARIABLE_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// ─── In-Memory Stores ─────────────────────────────────────────────────────────

const _categories = new Map<CategoryId, Category>();
const _prompts = new Map<PromptId, Prompt>();
const _versions = new Map<VersionId, PromptVersion>();
const _templates = new Map<TemplateId, PromptTemplate>();
const _history = new Map<HistoryId, HistoryEntry>();

// ─── Private Helpers ──────────────────────────────────────────────────────────

function _generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function _nowIso(): string {
  return new Date().toISOString();
}

function _extractVariableNames(content: string): string[] {
  const regex = new RegExp(VARIABLE_REGEX_SOURCE, 'g');
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    found.add(match[1]);
  }
  return [...found];
}

function _addHistory(promptId: PromptId, action: HistoryAction, detail: string): void {
  const entry: HistoryEntry = {
    id: _generateId('hst'),
    promptId,
    action,
    detail,
    timestamp: _nowIso(),
  };
  _history.set(entry.id, entry);

  const promptEntries = [..._history.values()].filter((h) => h.promptId === promptId);
  if (promptEntries.length > MAX_HISTORY_PER_PROMPT) {
    const oldest = promptEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];
    _history.delete(oldest.id);
  }
}

function _createVersion(source: Prompt, changeNote: string): PromptVersion {
  const lastId = source.versionIds[source.versionIds.length - 1];
  const lastVersion = lastId ? _versions.get(lastId) : undefined;
  const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  const version: PromptVersion = {
    id: _generateId('ver'),
    promptId: source.id,
    versionNumber,
    content: source.content,
    variables: [...source.variables],
    changeNote,
    createdAt: _nowIso(),
  };

  _versions.set(version.id, version);
  return version;
}

function _renderContent(content: string, values: Record<string, string>): string {
  const regex = new RegExp(VARIABLE_REGEX_SOURCE, 'g');
  return content.replace(regex, (_, name: string) =>
    values[name] !== undefined ? values[name] : `{{${name}}}`,
  );
}

function _scorePrompt(prompt: Prompt, tokens: string[]): number {
  let score = 0;
  const title = prompt.title.toLowerCase();
  const description = prompt.description.toLowerCase();
  const content = prompt.content.toLowerCase();

  for (const token of tokens) {
    if (title.includes(token)) score += SEARCH_TITLE_WEIGHT;
    if (description.includes(token)) score += SEARCH_DESCRIPTION_WEIGHT;
    if (content.includes(token)) score += SEARCH_CONTENT_WEIGHT;
    for (const tag of prompt.tags) {
      if (tag === token) score += SEARCH_TAG_WEIGHT;
    }
  }

  return score;
}

// ─── Category Operations ──────────────────────────────────────────────────────

/** Creates a new category in the library. */
export function createCategory(input: CreateCategoryInput): Category {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Category name is required.');
  }

  const category: Category = {
    id: _generateId('cat'),
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    color: input.color ?? DEFAULT_CATEGORY_COLOR,
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
  };

  _categories.set(category.id, category);
  return category;
}

/** Returns a category by ID. */
export function getCategory(id: CategoryId): Category {
  const cat = _categories.get(id);
  if (!cat) throw new Error(`NOT_FOUND: No category with id "${id}".`);
  return cat;
}

/** Updates mutable category fields. */
export function updateCategory(
  id: CategoryId,
  patch: Partial<Omit<Category, 'id' | 'createdAt'>>,
): Category {
  const cat = getCategory(id);
  if (patch.name !== undefined && patch.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Category name must not be empty.');
  }

  const merged: Category = {
    ...cat,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : cat.name,
    id,
    updatedAt: _nowIso(),
  };

  _categories.set(id, merged);
  return merged;
}

/** Deletes a category. Fails if any prompt still references it. */
export function deleteCategory(id: CategoryId): void {
  getCategory(id);
  const usedBy = [..._prompts.values()].filter((p) => p.categoryId === id);
  if (usedBy.length > 0) {
    throw new Error(
      `CATEGORY_IN_USE: Category "${id}" is referenced by ${usedBy.length} prompt(s).`,
    );
  }
  _categories.delete(id);
}

/** Returns all categories sorted alphabetically by name. */
export function listCategories(): Category[] {
  return [..._categories.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Prompt Operations ────────────────────────────────────────────────────────

/** Creates a new prompt and an initial version. */
export function createPrompt(input: CreatePromptInput): Prompt {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Prompt title is required.');
  }
  if (input.title.trim().length > MAX_TITLE_LENGTH) {
    throw new Error(`VALIDATION_FAILED: Prompt title must not exceed ${MAX_TITLE_LENGTH} characters.`);
  }
  if (!input.content || input.content.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Prompt content is required.');
  }
  getCategory(input.categoryId);

  const prompt: Prompt = {
    id: _generateId('prm'),
    title: input.title.trim(),
    content: input.content,
    description: input.description?.trim() ?? '',
    categoryId: input.categoryId,
    tags: input.tags?.map((t) => t.toLowerCase()) ?? [],
    variables: input.variables ?? [],
    isFavorite: false,
    currentVersionId: '',
    versionIds: [],
    usageCount: 0,
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
    metadata: input.metadata ?? {},
  };

  const version = _createVersion(prompt, 'Initial version.');
  prompt.currentVersionId = version.id;
  prompt.versionIds = [version.id];

  _prompts.set(prompt.id, prompt);
  _addHistory(prompt.id, 'created', `Prompt "${prompt.title}" created.`);

  return prompt;
}

/** Returns a prompt by ID. */
export function getPrompt(id: PromptId): Prompt {
  const p = _prompts.get(id);
  if (!p) throw new Error(`NOT_FOUND: No prompt with id "${id}".`);
  return p;
}

/** Updates prompt fields; automatically creates a new version when content changes. */
export function updatePrompt(
  id: PromptId,
  patch: Partial<Omit<Prompt, 'id' | 'createdAt' | 'currentVersionId' | 'versionIds' | 'usageCount'>>,
  changeNote?: string,
): Prompt {
  const prompt = getPrompt(id);

  if (patch.title !== undefined) {
    if (patch.title.trim().length === 0) throw new Error('VALIDATION_FAILED: Prompt title must not be empty.');
    if (patch.title.trim().length > MAX_TITLE_LENGTH) {
      throw new Error(`VALIDATION_FAILED: Prompt title must not exceed ${MAX_TITLE_LENGTH} characters.`);
    }
  }
  if (patch.content !== undefined && patch.content.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Prompt content must not be empty.');
  }
  if (patch.categoryId !== undefined) getCategory(patch.categoryId);

  const contentChanged = patch.content !== undefined && patch.content !== prompt.content;

  const merged: Prompt = {
    ...prompt,
    ...patch,
    title: patch.title !== undefined ? patch.title.trim() : prompt.title,
    tags: patch.tags !== undefined ? patch.tags.map((t) => t.toLowerCase()) : prompt.tags,
    id,
    currentVersionId: prompt.currentVersionId,
    versionIds: prompt.versionIds,
    usageCount: prompt.usageCount,
    updatedAt: _nowIso(),
  };

  if (contentChanged) {
    const version = _createVersion(merged, changeNote ?? 'Content updated.');
    merged.currentVersionId = version.id;
    merged.versionIds = [...merged.versionIds, version.id];
    _addHistory(id, 'versioned', `Version ${version.versionNumber} created.`);
  }

  _prompts.set(id, merged);
  _addHistory(id, 'updated', `Prompt "${merged.title}" updated.`);

  return merged;
}

/** Deletes a prompt and all associated versions and history entries. */
export function deletePrompt(id: PromptId): void {
  const prompt = getPrompt(id);

  for (const versionId of prompt.versionIds) {
    _versions.delete(versionId);
  }
  for (const [hid, entry] of _history.entries()) {
    if (entry.promptId === id) _history.delete(hid);
  }

  _prompts.delete(id);
}

/** Lists prompts with optional filtering by category, tags, or favorite status. */
export function listPrompts(filter?: {
  categoryId?: CategoryId;
  tags?: string[];
  isFavorite?: boolean;
}): Prompt[] {
  let results = [..._prompts.values()];

  if (filter?.categoryId) results = results.filter((p) => p.categoryId === filter.categoryId);
  if (filter?.isFavorite !== undefined) results = results.filter((p) => p.isFavorite === filter.isFavorite);
  if (filter?.tags && filter.tags.length > 0) {
    results = results.filter((p) =>
      filter.tags!.some((t) => p.tags.includes(t.toLowerCase())),
    );
  }

  return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ─── Version Operations ───────────────────────────────────────────────────────

/** Returns a specific version by ID. */
export function getVersion(id: VersionId): PromptVersion {
  const v = _versions.get(id);
  if (!v) throw new Error(`NOT_FOUND: No version with id "${id}".`);
  return v;
}

/** Returns all versions for a prompt, newest first. */
export function listVersions(promptId: PromptId): PromptVersion[] {
  const prompt = getPrompt(promptId);
  return prompt.versionIds
    .map((vid) => _versions.get(vid))
    .filter((v): v is PromptVersion => v !== undefined)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

/** Restores a prompt's content from a previous version, creating a new version record. */
export function restoreVersion(promptId: PromptId, versionId: VersionId): Prompt {
  const version = getVersion(versionId);
  if (version.promptId !== promptId) {
    throw new Error(
      `VALIDATION_FAILED: Version "${versionId}" does not belong to prompt "${promptId}".`,
    );
  }

  const prompt = getPrompt(promptId);
  const source: Prompt = { ...prompt, content: version.content, variables: [...version.variables] };
  const restoredVersion = _createVersion(source, `Restored from version ${version.versionNumber}.`);

  const updated: Prompt = {
    ...prompt,
    content: version.content,
    variables: [...version.variables],
    currentVersionId: restoredVersion.id,
    versionIds: [...prompt.versionIds, restoredVersion.id],
    updatedAt: _nowIso(),
  };

  _prompts.set(promptId, updated);
  _addHistory(promptId, 'restored', `Content restored from version ${version.versionNumber}.`);

  return updated;
}

// ─── Template Operations ──────────────────────────────────────────────────────

/** Creates a reusable prompt template. */
export function createTemplate(input: CreateTemplateInput): PromptTemplate {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Template name is required.');
  }
  if (!input.structure || input.structure.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Template structure is required.');
  }
  if (input.categoryId) getCategory(input.categoryId);

  const template: PromptTemplate = {
    id: _generateId('tpl'),
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    structure: input.structure,
    suggestedVariables: input.suggestedVariables ?? [],
    categoryId: input.categoryId ?? '',
    tags: input.tags?.map((t) => t.toLowerCase()) ?? [],
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
  };

  _templates.set(template.id, template);
  return template;
}

/** Returns a template by ID. */
export function getTemplate(id: TemplateId): PromptTemplate {
  const t = _templates.get(id);
  if (!t) throw new Error(`NOT_FOUND: No template with id "${id}".`);
  return t;
}

/** Updates mutable template fields. */
export function updateTemplate(
  id: TemplateId,
  patch: Partial<Omit<PromptTemplate, 'id' | 'createdAt'>>,
): PromptTemplate {
  const template = getTemplate(id);
  if (patch.name !== undefined && patch.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Template name must not be empty.');
  }
  if (patch.structure !== undefined && patch.structure.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Template structure must not be empty.');
  }
  if (patch.categoryId !== undefined && patch.categoryId !== '') getCategory(patch.categoryId);

  const merged: PromptTemplate = {
    ...template,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : template.name,
    tags: patch.tags !== undefined ? patch.tags.map((t) => t.toLowerCase()) : template.tags,
    id,
    updatedAt: _nowIso(),
  };

  _templates.set(id, merged);
  return merged;
}

/** Deletes a template. */
export function deleteTemplate(id: TemplateId): void {
  getTemplate(id);
  _templates.delete(id);
}

/** Lists templates with optional filtering by category or tags. */
export function listTemplates(filter?: { categoryId?: CategoryId; tags?: string[] }): PromptTemplate[] {
  let results = [..._templates.values()];

  if (filter?.categoryId) results = results.filter((t) => t.categoryId === filter.categoryId);
  if (filter?.tags && filter.tags.length > 0) {
    results = results.filter((t) =>
      filter.tags!.some((tag) => t.tags.includes(tag.toLowerCase())),
    );
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/** Creates a prompt by rendering a template's structure with the provided variable values. */
export function createPromptFromTemplate(
  templateId: TemplateId,
  variableValues: Record<string, string>,
  overrides?: Partial<CreatePromptInput>,
): Prompt {
  const template = getTemplate(templateId);

  const categoryId = overrides?.categoryId ?? template.categoryId;
  if (!categoryId) {
    throw new Error('VALIDATION_FAILED: categoryId is required when template has no default category.');
  }

  const rendered = _renderContent(template.structure, variableValues);

  return createPrompt({
    title: overrides?.title ?? template.name,
    content: rendered,
    description: overrides?.description ?? template.description,
    categoryId,
    tags: overrides?.tags ?? template.tags,
    variables: overrides?.variables ?? template.suggestedVariables,
    metadata: overrides?.metadata,
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

/** Searches prompts by keyword, returning scored results sorted by relevance. */
export function searchPrompts(query: string, options?: SearchOptions): SearchResult[] {
  const q = query.toLowerCase().trim();

  let pool = [..._prompts.values()];

  if (options?.categoryId) pool = pool.filter((p) => p.categoryId === options.categoryId);
  if (options?.favoritesOnly) pool = pool.filter((p) => p.isFavorite);
  if (options?.tags && options.tags.length > 0) {
    pool = pool.filter((p) => options.tags!.some((t) => p.tags.includes(t.toLowerCase())));
  }

  const limit = options?.limit ?? pool.length;

  if (!q) {
    return pool
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit)
      .map((prompt) => ({ prompt, score: 0 }));
  }

  const tokens = q.split(/\s+/).filter(Boolean);

  return pool
    .map((prompt) => ({ prompt, score: _scorePrompt(prompt, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.prompt.updatedAt.localeCompare(a.prompt.updatedAt))
    .slice(0, limit);
}

// ─── Favorites ────────────────────────────────────────────────────────────────

/** Toggles the favorite status of a prompt. */
export function toggleFavorite(promptId: PromptId): Prompt {
  const prompt = getPrompt(promptId);
  const updated: Prompt = { ...prompt, isFavorite: !prompt.isFavorite, updatedAt: _nowIso() };
  _prompts.set(promptId, updated);
  const action: HistoryAction = updated.isFavorite ? 'favorited' : 'unfavorited';
  _addHistory(promptId, action, `Prompt "${prompt.title}" ${updated.isFavorite ? 'added to' : 'removed from'} favorites.`);
  return updated;
}

/** Returns all favorited prompts sorted by most recently updated. */
export function listFavorites(): Prompt[] {
  return [..._prompts.values()]
    .filter((p) => p.isFavorite)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validates prompt content and its declared variable list for consistency. */
export function validatePrompt(content: string, variables: PromptVariable[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Prompt content must not be empty.');
    return { valid: false, errors, warnings, extractedVariables: [] };
  }

  const extractedVariables = _extractVariableNames(content);
  const declaredNames = variables.map((v) => v.name);

  for (const varName of extractedVariables) {
    if (!VARIABLE_NAME_PATTERN.test(varName)) {
      errors.push(`Variable name "${varName}" contains invalid characters.`);
    }
    if (varName.length > MAX_VARIABLE_NAME_LENGTH) {
      errors.push(`Variable name "${varName}" exceeds the ${MAX_VARIABLE_NAME_LENGTH}-character limit.`);
    }
    if (!declaredNames.includes(varName)) {
      warnings.push(`Variable "{{${varName}}}" is used in content but not declared in the variables list.`);
    }
  }

  for (const declared of declaredNames) {
    if (!extractedVariables.includes(declared)) {
      warnings.push(`Variable "${declared}" is declared but not referenced in content.`);
    }
  }

  return { valid: errors.length === 0, errors, warnings, extractedVariables };
}

/** Validates that all required variables have values before rendering. */
export function validateVariables(
  content: string,
  values: Record<string, string>,
  variables: PromptVariable[],
): ValidationResult {
  const base = validatePrompt(content, variables);
  const errors = [...base.errors];

  for (const variable of variables) {
    if (!variable.required) continue;
    const value = values[variable.name];
    const hasValue = value !== undefined && value.trim().length > 0;
    const hasDefault = variable.defaultValue !== undefined && variable.defaultValue.trim().length > 0;
    if (!hasValue && !hasDefault) {
      errors.push(`Required variable "${variable.name}" has no value and no default.`);
    }
  }

  return { ...base, valid: errors.length === 0, errors };
}

// ─── Preview ──────────────────────────────────────────────────────────────────

/** Substitutes variables into a content string and returns the rendered result. */
export function renderContent(content: string, values: Record<string, string>): string {
  return _renderContent(content, values);
}

/** Renders a prompt with variable substitution, applies defaults, and records usage. */
export function previewPrompt(promptId: PromptId, variableValues: Record<string, string>): PreviewResult {
  const prompt = getPrompt(promptId);
  const effectiveValues: Record<string, string> = {};
  const usedDefaultValues: string[] = [];
  const missingVariables: string[] = [];

  for (const variable of prompt.variables) {
    if (variableValues[variable.name] !== undefined) {
      effectiveValues[variable.name] = variableValues[variable.name];
    } else if (variable.defaultValue !== undefined) {
      effectiveValues[variable.name] = variable.defaultValue;
      usedDefaultValues.push(variable.name);
    } else if (variable.required) {
      missingVariables.push(variable.name);
    }
  }

  const rendered = _renderContent(prompt.content, effectiveValues);
  const updated: Prompt = { ...prompt, usageCount: prompt.usageCount + 1 };
  _prompts.set(promptId, updated);
  _addHistory(promptId, 'used', `Prompt previewed with ${Object.keys(variableValues).length} variable(s).`);

  return { rendered, missingVariables, usedDefaultValues };
}

// ─── History ──────────────────────────────────────────────────────────────────

/** Returns the change and usage history for a specific prompt, newest first. */
export function getHistory(promptId: PromptId): HistoryEntry[] {
  getPrompt(promptId);
  return [..._history.values()]
    .filter((h) => h.promptId === promptId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Returns recent history entries across all prompts, newest first. */
export function listAllHistory(limit = DEFAULT_HISTORY_LIMIT): HistoryEntry[] {
  return [..._history.values()]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

// ─── Export / Import ──────────────────────────────────────────────────────────

/** Exports prompts and related data as a portable bundle. */
export function exportPrompts(filter?: { categoryId?: CategoryId; tags?: string[] }): ExportBundle {
  let prompts = [..._prompts.values()];

  if (filter?.categoryId) prompts = prompts.filter((p) => p.categoryId === filter.categoryId);
  if (filter?.tags && filter.tags.length > 0) {
    prompts = prompts.filter((p) => filter.tags!.some((t) => p.tags.includes(t.toLowerCase())));
  }

  const promptIds = new Set(prompts.map((p) => p.id));
  const categoryIds = new Set(prompts.map((p) => p.categoryId));

  const categories = [..._categories.values()].filter((c) => categoryIds.has(c.id));
  const templates = [..._templates.values()].filter(
    (t) => !t.categoryId || categoryIds.has(t.categoryId),
  );
  const versions = [..._versions.values()].filter((v) => promptIds.has(v.promptId));

  return { formatVersion: FORMAT_VERSION, exportedAt: _nowIso(), categories, templates, prompts, versions };
}

function _validateBundle(bundle: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!bundle || typeof bundle !== 'object') {
    return { valid: false, errors: ['Import data must be an object.'] };
  }
  const b = bundle as Record<string, unknown>;
  if (typeof b['formatVersion'] !== 'string') errors.push('formatVersion must be a string.');
  if (!Array.isArray(b['categories'])) errors.push('categories must be an array.');
  if (!Array.isArray(b['templates'])) errors.push('templates must be an array.');
  if (!Array.isArray(b['prompts'])) errors.push('prompts must be an array.');
  if (!Array.isArray(b['versions'])) errors.push('versions must be an array.');
  return { valid: errors.length === 0, errors };
}

function _doImportCategories(
  categories: Category[],
  mode: 'skip' | 'overwrite',
): { categoryMap: Record<string, string>; imported: number; skipped: number } {
  const categoryMap: Record<string, string> = {};
  let imported = 0;
  let skipped = 0;

  for (const cat of categories) {
    categoryMap[cat.id] = cat.id;
    if (_categories.has(cat.id) && mode === 'skip') { skipped++; continue; }
    _categories.set(cat.id, cat);
    imported++;
  }

  return { categoryMap, imported, skipped };
}

function _doImportTemplates(
  templates: PromptTemplate[],
  categoryMap: Record<string, string>,
  mode: 'skip' | 'overwrite',
): { templateMap: Record<string, string>; imported: number; skipped: number } {
  const templateMap: Record<string, string> = {};
  let imported = 0;
  let skipped = 0;

  for (const tpl of templates) {
    templateMap[tpl.id] = tpl.id;
    if (_templates.has(tpl.id) && mode === 'skip') { skipped++; continue; }
    const resolvedCategoryId = tpl.categoryId ? (categoryMap[tpl.categoryId] ?? tpl.categoryId) : '';
    _templates.set(tpl.id, { ...tpl, categoryId: resolvedCategoryId });
    imported++;
  }

  return { templateMap, imported, skipped };
}

function _doImportPrompts(
  bundle: ExportBundle,
  categoryMap: Record<string, string>,
  mode: 'skip' | 'overwrite',
): { imported: number; skipped: number; versionCount: number } {
  let imported = 0;
  let skipped = 0;
  let versionCount = 0;

  for (const prompt of bundle.prompts) {
    if (_prompts.has(prompt.id) && mode === 'skip') { skipped++; continue; }
    const resolvedCategoryId = categoryMap[prompt.categoryId] ?? prompt.categoryId;
    _prompts.set(prompt.id, { ...prompt, categoryId: resolvedCategoryId });
    imported++;

    for (const ver of bundle.versions.filter((v) => v.promptId === prompt.id)) {
      _versions.set(ver.id, ver);
      versionCount++;
    }
  }

  return { imported, skipped, versionCount };
}

// The import workflow uses the Workflow Engine because it has genuine step
// dependencies: templates need category IDs resolved before they can be stored,
// and prompts need both category and template maps to resolve references.
const IMPORT_ROUTES: DataRoute[] = [
  { fromStep: 'validate', toStep: 'import-categories', outputKey: 'valid', inputKey: 'valid' },
  { fromStep: 'import-categories', toStep: 'import-templates', outputKey: 'categoryMap', inputKey: 'categoryMap' },
  { fromStep: 'import-categories', toStep: 'import-prompts', outputKey: 'categoryMap', inputKey: 'categoryMap' },
];

function _buildImportSteps(): StepDefinition[] {
  return [
    {
      id: 'validate',
      dependsOn: [],
      handler: async ({ context }: StepInput) =>
        _validateBundle(context['bundle'] as unknown),
    },
    {
      id: 'import-categories',
      dependsOn: ['validate'],
      handler: async ({ context, data }: StepInput) => {
        if (!data['valid']) return { categoryMap: {}, imported: 0, skipped: 0 };
        return _doImportCategories(
          (context['bundle'] as ExportBundle).categories,
          context['mode'] as 'skip' | 'overwrite',
        );
      },
    },
    {
      id: 'import-templates',
      dependsOn: ['import-categories'],
      handler: async ({ context, data }: StepInput) =>
        _doImportTemplates(
          (context['bundle'] as ExportBundle).templates,
          (data['categoryMap'] ?? {}) as Record<string, string>,
          context['mode'] as 'skip' | 'overwrite',
        ),
    },
    {
      id: 'import-prompts',
      dependsOn: ['import-templates'],
      handler: async ({ context, data }: StepInput) =>
        _doImportPrompts(
          context['bundle'] as ExportBundle,
          (data['categoryMap'] ?? {}) as Record<string, string>,
          context['mode'] as 'skip' | 'overwrite',
        ),
    },
  ];
}

async function _runImportWorkflow(
  bundle: ExportBundle,
  mode: 'skip' | 'overwrite',
): Promise<WorkflowResult> {
  return workflowEngine.run(
    { id: `import-${Date.now()}`, steps: _buildImportSteps(), routes: IMPORT_ROUTES },
    { context: { bundle, mode } },
  );
}

function _extractImportResult(stepResults: StepResult[]): ImportResult {
  const find = (id: string) => stepResults.find((r) => r.stepId === id)?.output;
  const val = find('validate') as { valid: boolean; errors: string[] } | undefined;
  const cat = find('import-categories') as { imported: number; skipped: number } | undefined;
  const tpl = find('import-templates') as { imported: number; skipped: number } | undefined;
  const prm = find('import-prompts') as { imported: number; skipped: number; versionCount: number } | undefined;

  return {
    importedCategories: cat?.imported ?? 0,
    importedTemplates: tpl?.imported ?? 0,
    importedPrompts: prm?.imported ?? 0,
    importedVersions: prm?.versionCount ?? 0,
    skippedCategories: cat?.skipped ?? 0,
    skippedTemplates: tpl?.skipped ?? 0,
    skippedPrompts: prm?.skipped ?? 0,
    errors: val?.errors ?? [],
  };
}

/** Imports a prompt bundle; uses Workflow Engine to orchestrate the multi-step import. */
export async function importPrompts(
  bundle: ExportBundle,
  options?: ImportOptions,
): Promise<ImportResult> {
  const mode = options?.mode ?? 'skip';
  const workflowResult = await _runImportWorkflow(bundle, mode);

  if (workflowResult.status === 'failed') {
    return {
      importedCategories: 0, importedTemplates: 0, importedPrompts: 0,
      importedVersions: 0, skippedCategories: 0, skippedTemplates: 0,
      skippedPrompts: 0, errors: [workflowResult.error ?? 'Import workflow failed.'],
    };
  }

  return _extractImportResult(workflowResult.stepResults);
}

// ─── Default Export ───────────────────────────────────────────────────────────

const promptStudio = {
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
};

export default promptStudio;
