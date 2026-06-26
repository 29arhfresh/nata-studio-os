# Examples — Knowledge Manager

Annotated real-world usage patterns organized by task type.

---

## 1. Bootstrapping a Domain Knowledge Base

**Scenario**: The AI Video Director Skill needs a searchable reference of cinematographic terms.

```typescript
import knowledgeManager from './src/index';

// Add foundational concepts
const shotTypes = knowledgeManager.create({
  title: 'Cinematic Shot Types',
  content: `
ECU (extreme close-up): isolates a single detail — an eye, a button.
CU (close-up): fills the frame with a face or object.
MCU (medium close-up): frames from the chest up.
MS (medium shot): frames from the waist up.
MLS (medium long shot): frames from the knees up.
LS (long shot): shows the full body with environment context.
EWS (extreme wide shot): establishes location; subject is small in frame.
  `.trim(),
  type: 'reference',
  status: 'active',
  tags: ['cinematography', 'shots', 'framing', 'video-production'],
  author: 'ai-video-director',
  version: '0.1.0',
  relationships: [],
  citations: [{ source: 'Film Grammar Handbook, 4th ed.', accessedAt: '2026-06-26' }],
  metadata: { domain: 'video', difficulty: 'beginner' },
});

// Add a related concept that depends on the first
const depthOfField = knowledgeManager.create({
  title: 'Depth of Field Fundamentals',
  content: `
Depth of field (DoF) is the range of distance in a scene that appears acceptably sharp.
Shallow DoF: wide aperture (f/1.4–f/2.8), isolates subject from background.
Deep DoF: narrow aperture (f/8–f/16), keeps foreground and background in focus.
Focal length and sensor size both affect DoF — longer lenses and larger sensors produce shallower DoF.
  `.trim(),
  type: 'concept',
  status: 'active',
  tags: ['cinematography', 'optics', 'camera-settings', 'video-production'],
  author: 'ai-video-director',
  version: '0.1.0',
  relationships: [{ targetId: shotTypes.id, type: 'related-to', weight: 0.7 }],
  citations: [],
  metadata: { domain: 'video', difficulty: 'intermediate' },
});

console.log(`Indexed: ${shotTypes.title} (id: ${shotTypes.id})`);
console.log(`Indexed: ${depthOfField.title} (id: ${depthOfField.id})`);
```

---

## 2. Searching and Assembling Context for an AI Prompt

**Scenario**: The Prompt Architect Skill needs relevant cinematography knowledge before generating a video prompt.

```typescript
import knowledgeManager from './src/index';

// Search for relevant entries
const results = knowledgeManager.search({
  query: 'camera framing and depth of field for portrait video',
  strategy: 'hybrid',
  tags: ['cinematography'],
  limit: 5,
  minQualityScore: 0.5,
});

console.log(`Found ${results.totalMatches} matches in ${results.durationMs}ms`);
results.entries.forEach(({ entry, relevanceScore }) => {
  console.log(`  [${relevanceScore.toFixed(2)}] ${entry.title}`);
});

// Assemble into a context block for an LLM call
const ctx = knowledgeManager.assembleContext(
  'camera framing and depth of field for portrait video',
  'hybrid',
);

console.log(`Assembled context (≈${ctx.tokenEstimate} tokens):\n`);
console.log(ctx.assembledText);
// Output:
// ## Cinematic Shot Types
// ECU (extreme close-up): isolates a single detail...
// ---
// ## Depth of Field Fundamentals
// Depth of field (DoF) is the range of distance...
```

---

## 3. Updating Knowledge and Inspecting Version History

**Scenario**: A new shot type needs to be added to an existing reference entry.

```typescript
import knowledgeManager from './src/index';

// Assume shotTypes.id from Example 1 is known
const SHOT_TYPES_ID = 'km-1234567-abcdefg'; // replace with actual ID

// Update with a change summary
const updated = knowledgeManager.update(
  SHOT_TYPES_ID,
  {
    content: `
ECU (extreme close-up): isolates a single detail — an eye, a button.
CU (close-up): fills the frame with a face or object.
MCU (medium close-up): frames from the chest up.
MS (medium shot): frames from the waist up.
MLS (medium long shot): frames from the knees up.
LS (long shot): shows the full body with environment context.
EWS (extreme wide shot): establishes location; subject is small in frame.
INSERT: tight shot of a specific object to show detail or action (e.g., hands on keyboard).
    `.trim(),
    version: '0.2.0',
  },
  'Added INSERT shot type definition.',
  'ai-video-director',
);

console.log(`Updated to version: ${updated.version}`);

// Retrieve the full version history
const history = knowledgeManager.getHistory(SHOT_TYPES_ID);
console.log(`Total versions: ${history.versions.length}`);
history.versions.forEach((v) => {
  console.log(`  [${v.version}] ${v.changedAt} by ${v.changedBy}: ${v.changeSummary}`);
});
```

---

## 4. Detecting and Resolving Duplicates

**Scenario**: After a bulk import, duplicate entries may have been created.

```typescript
import knowledgeManager from './src/index';

// Run duplicate detection
const report = knowledgeManager.detectDuplicates();

if (!report.hasDuplicates) {
  console.log('No duplicates detected.');
} else {
  console.log(`Found ${report.groups.length} duplicate group(s):`);

  for (const group of report.groups) {
    const representative = knowledgeManager.get(group.representativeId);
    console.log(`\nRepresentative: "${representative.title}" (${group.representativeId})`);
    console.log(`  Similarity score: ${group.similarityScore.toFixed(2)}`);
    console.log(`  Duplicates to review:`);

    for (const dupId of group.duplicateIds) {
      const dup = knowledgeManager.get(dupId);
      console.log(`    - "${dup.title}" (${dupId})`);
      // Archive the duplicate after confirming the representative is complete
      knowledgeManager.archive(dupId, 'knowledge-manager-cleanup');
    }
  }
}
```

---

## 5. Bulk Import from External Documentation

**Scenario**: Importing a curated JSON knowledge dump from an external system.

```typescript
import knowledgeManager from './src/index';
import { readFileSync } from 'fs';

const raw = readFileSync('./knowledge-export.json', 'utf-8');

const result = knowledgeManager.importEntries({
  source: 'external-docs-system',
  format: 'json',
  content: raw,
  defaultType: 'reference',
  defaultTags: ['imported', 'external'],
  validateBeforeImport: true,
});

console.log(`Import complete:`);
console.log(`  Imported : ${result.imported}`);
console.log(`  Skipped  : ${result.skipped}`);
console.log(`  Failed   : ${result.failed}`);

if (result.errors.length > 0) {
  console.log('\nErrors:');
  result.errors.forEach(({ line, message }) => {
    console.log(`  Line ${line}: ${message}`);
  });
}

// Re-score all entries after import
const rescored = knowledgeManager.reScore();
console.log(`\nRe-scored ${rescored} entries.`);
```

---

## 6. Tag Management and Taxonomy Cleanup

**Scenario**: Standardizing a tag that was entered inconsistently across entries.

```typescript
import knowledgeManager from './src/index';

// List all current tags with usage counts
const tags = knowledgeManager.listTags();
console.log('Current tag registry:');
Object.entries(tags)
  .sort(([, a], [, b]) => b - a)
  .forEach(([tag, count]) => console.log(`  ${tag}: ${count}`));

// Rename a misspelled or legacy tag across all entries
const affected = knowledgeManager.renameTag('vidoe-production', 'video-production', 'taxonomy-cleanup');
console.log(`\nRenamed tag on ${affected} entries.`);

// Verify the change
const updatedTags = knowledgeManager.listTags();
console.log(`'vidoe-production' count: ${updatedTags['vidoe-production'] ?? 0}`);
console.log(`'video-production' count: ${updatedTags['video-production'] ?? 0}`);
```

---

## 7. Knowledge Health Report

**Scenario**: Generating a health summary before a team review session.

```typescript
import knowledgeManager from './src/index';

const s = knowledgeManager.stats();
const duplicates = knowledgeManager.detectDuplicates();
const tags = knowledgeManager.listTags();

console.log('=== Knowledge Base Health Report ===\n');
console.log(`Total entries     : ${s.totalEntries}`);
console.log(`Avg quality score : ${s.avgQualityScore.toFixed(2)}`);
console.log(`Total tags        : ${s.totalTags}`);
console.log(`Total relationships: ${s.totalRelationships}`);
console.log('\nStatus breakdown:');
Object.entries(s.byStatus).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});
console.log('\nType breakdown:');
Object.entries(s.byType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});
console.log(`\nDuplicates detected: ${duplicates.hasDuplicates ? duplicates.groups.length + ' group(s)' : 'none'}`);
console.log(`Last indexed at   : ${s.lastIndexedAt}`);
```

---

## 8. Export for Backup or Handoff

**Scenario**: Exporting all active video-production knowledge before a system migration.

```typescript
import knowledgeManager from './src/index';
import { writeFileSync } from 'fs';

const exported = knowledgeManager.exportEntries({
  format: 'json',
  tags: ['video-production'],
  includeRelationships: true,
  includeCitations: true,
});

writeFileSync(`./backup-${exported.exportedAt}.json`, exported.content, 'utf-8');

console.log(`Exported ${exported.entryCount} entries to backup file.`);
```
