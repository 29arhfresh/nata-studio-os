# Knowledge Export Template

Use this template to plan and execute a knowledge export. Complete every section before calling `exportEntries()`.

---

## Export Overview

**Export purpose**:
- [ ] Backup / disaster recovery
- [ ] Handoff to another system or team
- [ ] Training data preparation
- [ ] Audit or compliance snapshot
- [ ] Migration to a new knowledge store

**Target format**: `json` (only format currently supported)

**Export date**: _______________________________________________

**Exported by**: _______________________________________________

---

## Scope Definition

Decide what to include in the export. Apply filters from most specific to least specific.

### Option A: Export by ID (most specific)

```json
{
  "ids": ["km-xxxxxxx", "km-yyyyyyy"]
}
```

Use when exporting a known set of specific entries.

---

### Option B: Export by Tag

```json
{
  "tags": ["cinematography", "video-production"]
}
```

Use when exporting a topic domain. Returns all active entries with at least one of the listed tags.

---

### Option C: Export by Type

```json
{
  "types": ["reference", "standard"]
}
```

Use when exporting a category of knowledge regardless of topic.

---

### Option D: Full Export (no filters)

```json
{}
```

Use for complete backups. Includes all entries regardless of status.

---

## Export Configuration

```json
{
  "ids":                   [],
  "tags":                  [],
  "types":                 [],
  "format":                "json",
  "includeRelationships":  true,
  "includeCitations":      true
}
```

**Include relationships**: Set to `true` when the consumer needs to reconstruct the knowledge graph.

**Include citations**: Set to `true` for audit exports or academic handoffs. Set to `false` for lightweight operational exports.

---

## Export Execution

```typescript
import knowledgeManager from '../src/index';
import { writeFileSync } from 'fs';

const result = knowledgeManager.exportEntries({
  format: 'json',
  tags: ['your-tag'],
  includeRelationships: true,
  includeCitations: true,
});

const filename = `knowledge-export-${result.exportedAt}.json`;
writeFileSync(`./${filename}`, result.content, 'utf-8');
console.log(`Exported ${result.entryCount} entries to ${filename}`);
```

---

## Post-Export Record

Fill in after the export completes.

| Metric | Value |
|---|---|
| Entries exported | |
| Export file name | |
| Export file size (approx.) | |
| Includes relationships | Yes / No |
| Includes citations | Yes / No |
| Export timestamp | |

---

## Post-Export Checklist

- [ ] Export file is valid JSON (parse it to confirm)
- [ ] Entry count matches expectations (`stats()` for reference)
- [ ] Export file is stored in a secure location
- [ ] Export file name includes the timestamp for version identification
- [ ] If this export is for migration: a test import on the target system has been completed
- [ ] If this export is for backup: the file is stored off the primary system

---

## Re-Import Validation (for migration exports)

After exporting, verify the data is round-trip safe:

```typescript
import knowledgeManager from '../src/index';
import { readFileSync } from 'fs';

const content = readFileSync('./your-export-file.json', 'utf-8');

// Dry-run: validate all entries without writing
const parsed = JSON.parse(content);
let validCount = 0;
let invalidCount = 0;

for (const entry of parsed) {
  const result = knowledgeManager.validate(entry);
  if (result.isValid) {
    validCount++;
  } else {
    invalidCount++;
    console.log(`Invalid: ${entry.title}`, result.errors);
  }
}

console.log(`Valid: ${validCount} | Invalid: ${invalidCount}`);
```
