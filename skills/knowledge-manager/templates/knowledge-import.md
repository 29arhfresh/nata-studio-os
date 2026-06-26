# Knowledge Import Template

Use this template to plan and execute a bulk knowledge import. Complete every section before calling `importEntries()`.

---

## Import Overview

**Source system**: _______________________________________________

**Source format**: `json` (only format currently supported)

**Number of entries to import** (estimated): _______________________________________________

**Import date**: _______________________________________________

**Imported by**: _______________________________________________

---

## Source Data Requirements

Before importing, verify the source data meets these requirements:

### Required Fields (per entry)

| Field | Type | Allowed Values | Notes |
|---|---|---|---|
| `title` | `string` | Non-empty, ≤ 200 chars | Must be unique or a known duplicate |
| `content` | `string` | Non-empty | Full content body |
| `type` | `string` | `concept`, `procedure`, `reference`, `example`, `decision`, `glossary`, `faq`, `standard` | Use `defaultType` fallback if missing |
| `author` | `string` | Non-empty | Creator identifier |

### Optional Fields

| Field | Default if Missing | Notes |
|---|---|---|
| `status` | `draft` | Set to `active` only after review |
| `tags` | `defaultTags` value | Supplement with import-specific tags |
| `version` | `0.1.0` | Use the source version if available |
| `relationships` | `[]` | Add after import once IDs are known |
| `citations` | `[]` | Add source metadata if available |
| `metadata` | `{}` | Include origin fields for provenance |

---

## Import Configuration

```json
{
  "source": "<!-- identifier for the source system -->",
  "format": "json",
  "content": "<!-- will be populated programmatically -->",
  "defaultType": "<!-- concept | procedure | reference | etc. -->",
  "defaultTags": ["imported", "<!-- source-specific-tag -->"],
  "validateBeforeImport": true
}
```

---

## Pre-Import Checklist

- [ ] Source data is valid JSON and is a root-level array `[...]`
- [ ] Each entry has `title`, `content`, `type` (or `defaultType` is set), and `author`
- [ ] Tags are all lowercase and hyphen-separated
- [ ] No sensitive data (credentials, PII) is present in the content
- [ ] `validateBeforeImport` is set to `true` for first-time imports
- [ ] A duplicate detection run is planned after import
- [ ] A `reScore()` run is planned after import

---

## Import Execution

```typescript
import knowledgeManager from '../src/index';
import { readFileSync } from 'fs';

const raw = readFileSync('./path/to/source.json', 'utf-8');

const result = knowledgeManager.importEntries({
  source: 'your-source-name',
  format: 'json',
  content: raw,
  defaultType: 'concept',
  defaultTags: ['imported'],
  validateBeforeImport: true,
});
```

---

## Post-Import Record

Fill in after the import completes.

| Metric | Value |
|---|---|
| Entries imported successfully | |
| Entries skipped | |
| Entries failed | |
| Total errors | |

**Error summary** (paste key error messages here):

```
Line X: <error message>
Line Y: <error message>
```

---

## Post-Import Checklist

- [ ] `result.failed` is zero or all failures are understood and acceptable
- [ ] `reScore()` called — average quality score is acceptable
- [ ] `detectDuplicates()` called — duplicate groups reviewed and resolved
- [ ] Sample of imported entries verified with `search()` to confirm discoverability
- [ ] Import metadata recorded in the entries' `metadata.importSource` field
- [ ] Failed entries have been corrected in the source and will be re-imported
