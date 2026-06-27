# Prompt Studio

## Overview

Prompt Studio is a production prompt management system for Nata Studio OS. It provides a complete lifecycle for AI prompts: create, organise, version, search, preview, and share. Prompts support `{{variable}}` placeholders with declared types, defaults, and required flags. The Workflow Engine orchestrates multi-step import jobs, ensuring category and template references are resolved before prompts are written.

## Usage

```typescript
import promptStudio from './src/index';

// Create a category
const cat = promptStudio.createCategory({ name: 'Marketing', color: '#f59e0b' });

// Create a prompt with variables
const prompt = promptStudio.createPrompt({
  title: 'Product Launch Email',
  content: 'Write a {{tone}} email for the launch of {{product}} targeting {{audience}}.',
  categoryId: cat.id,
  tags: ['email', 'launch'],
  variables: [
    { name: 'product',  description: 'Product name',    required: true },
    { name: 'tone',     description: 'Writing tone',    required: false, defaultValue: 'professional' },
    { name: 'audience', description: 'Target audience', required: true },
  ],
});

// Preview with variable substitution
const preview = promptStudio.previewPrompt(prompt.id, {
  product: 'Nova AI',
  audience: 'enterprise buyers',
});
console.log(preview.rendered);
// → "Write a professional email for the launch of Nova AI targeting enterprise buyers."
```

## Parameters

### `createCategory(input)`

| Name          | Type     | Required | Default       | Description                        |
|---------------|----------|----------|---------------|------------------------------------|
| `name`        | `string` | Yes      | —             | Category display name              |
| `description` | `string` | No       | `""`          | Short description                  |
| `color`       | `string` | No       | `"#6366f1"`   | Hex color for UI display           |

### `getCategory(id)` / `updateCategory(id, patch)` / `deleteCategory(id)` / `listCategories()`

Standard lookup and mutation operations. `deleteCategory` throws `CATEGORY_IN_USE` when prompts still reference the category.

### `createPrompt(input)`

| Name          | Type                 | Required | Default | Description                          |
|---------------|----------------------|----------|---------|--------------------------------------|
| `title`       | `string`             | Yes      | —       | Prompt title (max 200 chars)         |
| `content`     | `string`             | Yes      | —       | Prompt body with `{{variable}}` tags |
| `categoryId`  | `CategoryId`         | Yes      | —       | Must reference an existing category  |
| `description` | `string`             | No       | `""`    | Optional summary                     |
| `tags`        | `string[]`           | No       | `[]`    | Normalized to lowercase              |
| `variables`   | `PromptVariable[]`   | No       | `[]`    | Declared variable definitions        |
| `metadata`    | `Record<string,any>` | No       | `{}`    | Arbitrary key-value pairs            |

### `updatePrompt(id, patch, changeNote?)`

Updates mutable fields. When `content` changes, a new version is created automatically. `changeNote` is stored in the version record.

### `getVersion(id)` / `listVersions(promptId)` / `restoreVersion(promptId, versionId)`

Version history operations. `restoreVersion` creates a new version with the restored content rather than modifying history.

### `createTemplate(input)`

| Name                 | Type                 | Required | Default | Description                        |
|----------------------|----------------------|----------|---------|------------------------------------|
| `name`               | `string`             | Yes      | —       | Template display name              |
| `structure`          | `string`             | Yes      | —       | Template body with `{{placeholders}}` |
| `categoryId`         | `CategoryId`         | No       | `""`    | Default category for created prompts |
| `suggestedVariables` | `PromptVariable[]`   | No       | `[]`    | Recommended variable definitions   |
| `description`        | `string`             | No       | `""`    | Template description               |
| `tags`               | `string[]`           | No       | `[]`    | Normalized to lowercase            |

### `createPromptFromTemplate(templateId, variableValues, overrides?)`

Renders the template's structure with `variableValues`, then calls `createPrompt`. `overrides` can replace title, tags, categoryId, or variables.

### `searchPrompts(query, options?)`

| Name              | Type         | Required | Default          | Description                           |
|-------------------|--------------|----------|------------------|---------------------------------------|
| `query`           | `string`     | Yes      | —                | Search keywords (empty returns all)   |
| `options.categoryId` | `CategoryId` | No    | —                | Restrict to a single category         |
| `options.tags`    | `string[]`   | No       | —                | Must match at least one tag           |
| `options.favoritesOnly` | `boolean` | No    | `false`          | Return only favorited prompts         |
| `options.limit`   | `number`     | No       | (all)            | Maximum results to return             |

Title matches score 3×, description and tag matches 2×, content matches 1×.

### `validatePrompt(content, variables)`

Returns a `ValidationResult` with `valid`, `errors`, `warnings`, and `extractedVariables`. Warns when content uses undeclared variables or when declared variables are absent from content.

### `validateVariables(content, values, variables)`

Extends `validatePrompt` by also checking that every `required` variable without a `defaultValue` has a non-empty value in `values`.

### `previewPrompt(promptId, variableValues)`

Substitutes variables using provided values, then defaults, then leaves unresolved. Increments `usageCount` and records a `used` history entry. Returns `{ rendered, missingVariables, usedDefaultValues }`.

### `renderContent(content, values)`

Pure function. Substitutes `{{name}}` with `values[name]`; leaves unresolved placeholders unchanged.

### `getHistory(promptId)` / `listAllHistory(limit?)`

Returns `HistoryEntry[]` sorted newest first. `listAllHistory` defaults to 50 entries.

### `exportPrompts(filter?)`

Returns an `ExportBundle` containing all matching prompts, their versions, their categories, and any templates in those categories. Accepts optional `categoryId` and `tags` filters.

### `importPrompts(bundle, options?)`

| Name            | Type                    | Required | Default  | Description                              |
|-----------------|-------------------------|----------|----------|------------------------------------------|
| `bundle`        | `ExportBundle`          | Yes      | —        | Data returned by `exportPrompts`         |
| `options.mode`  | `"skip" \| "overwrite"` | No       | `"skip"` | How to handle ID conflicts               |

Uses the Workflow Engine internally (validate → import-categories → import-templates → import-prompts). Returns an `ImportResult` with counts and any validation errors.

## Examples

### Example 1 — Minimal prompt

```typescript
import promptStudio from './src/index';

const cat = promptStudio.createCategory({ name: 'General' });
const p   = promptStudio.createPrompt({ title: 'Summarise', content: 'Summarise this text: {{text}}', categoryId: cat.id });
const out = promptStudio.previewPrompt(p.id, { text: 'Long article here...' });
console.log(out.rendered); // → "Summarise this text: Long article here..."
```

### Example 2 — Template-based prompt with versioning and export

```typescript
import promptStudio from './src/index';

const cat = promptStudio.createCategory({ name: 'Social Media' });

const tpl = promptStudio.createTemplate({
  name: 'Social Post',
  structure: 'Write a {{length}} {{platform}} post about {{topic}}. Tone: {{tone}}.',
  categoryId: cat.id,
  suggestedVariables: [
    { name: 'length',   description: 'Post length (short/medium/long)', required: false, defaultValue: 'short' },
    { name: 'platform', description: 'Target platform',                  required: true },
    { name: 'topic',    description: 'Main topic',                       required: true },
    { name: 'tone',     description: 'Writing tone',                     required: false, defaultValue: 'engaging' },
  ],
});

const p = promptStudio.createPromptFromTemplate(tpl.id, { platform: 'LinkedIn', topic: 'AI productivity' });

// Later — improve the content and keep history
promptStudio.updatePrompt(p.id, {
  content: 'Craft a {{length}} post for {{platform}} about {{topic}}. Voice: {{tone}}. Include a CTA.',
}, 'Added CTA requirement');

// Search for it
const results = promptStudio.searchPrompts('linkedin productivity');
console.log(results[0].prompt.title); // → "Social Post"

// Export and re-import on another instance
const bundle  = promptStudio.exportPrompts({ categoryId: cat.id });
const outcome = await promptStudio.importPrompts(bundle, { mode: 'skip' });
console.log(outcome.importedPrompts); // → 0 (already present, mode is skip)
```

## Errors

| Error Code            | Thrown by                  | Meaning and remediation                                                 |
|-----------------------|----------------------------|-------------------------------------------------------------------------|
| `VALIDATION_FAILED`   | create/update functions    | A required field is missing, empty, or violates a constraint. Check the message for the specific field. |
| `NOT_FOUND`           | get/update/delete functions | No record exists with the given ID. Verify the ID or check whether the record was deleted. |
| `CATEGORY_IN_USE`     | `deleteCategory`           | The category still has prompts. Move or delete those prompts first. |

## Changelog

### [0.1.0] — 2026-06-27

- Initial implementation of Prompt Studio.
- Prompt library with CRUD, tags, categories, and variables.
- Automatic versioning on content change.
- Template system with `createPromptFromTemplate`.
- Full-text search with weighted scoring (title > description/tags > content).
- Favorite management via `toggleFavorite` and `listFavorites`.
- Validation (`validatePrompt`, `validateVariables`) and preview (`previewPrompt`, `renderContent`).
- History tracking (per-prompt and global) with configurable retention limit.
- Export/import with Workflow Engine integration for multi-step orchestration.
