# Examples — Memory System

Annotated real-world usage patterns organized by task type.

---

## 1. Session Startup — Restoring Context

**Scenario**: A new session starts. The AI Video Director needs to know the brand style and recent project decisions from the previous session.

```typescript
import memorySystem from './src/index';

// Restore all relevant context for the project at session start
const context = memorySystem.restoreContext({
  scope: 'project',
  projectId: 'proj-nata-brand-film',
  tiers: ['long-term', 'project'],
  limit: 25,
});

console.log(`Restored ${context.items.length} memory items`);
context.items.forEach(({ item, relevanceScore }) => {
  console.log(`  [${relevanceScore.toFixed(2)}] ${item.key} (${item.tier})`);
});

// Output:
//   [0.95] brand-visual-style (long-term)
//   [0.91] approved-color-palette (project)
//   [0.87] director-notes-v3 (project)
//   ...
```

---

## 2. Short-Term Memory — Tracking Active Preferences

**Scenario**: A user selects a style during an image generation session. The preference should persist for the duration of the session but not beyond.

```typescript
import memorySystem from './src/index';

// Store a transient user preference
const pref = memorySystem.store({
  tier: 'short-term',
  scope: 'session',
  key: 'active-visual-style',
  value: {
    mood: 'neon cyberpunk',
    contrast: 'high',
    saturation: 'vivid',
  },
  ttlSeconds: 7200, // 2 hours
  tags: ['preference', 'style', 'image'],
  source: 'ai-image-director',
  sessionId: 'sess-20260626-001',
  metadata: { setByUser: true },
});

console.log(`Stored: ${pref.id}, expires: ${pref.expiresAt}`);

// Retrieve it later in the same session
const retrieved = memorySystem.get(pref.id);
console.log(retrieved.value); // { mood: 'neon cyberpunk', ... }

// A different session cannot retrieve this item
const crossSessionSearch = memorySystem.search({
  query: 'active visual style',
  scope: 'session',
  sessionId: 'sess-different-session',
});
console.log(crossSessionSearch.items.length); // 0 — scope isolation enforced
```

---

## 3. Long-Term Memory — Storing Approved Outputs

**Scenario**: Creative director approves a color palette. It should be stored permanently and available to all Skills working on the same project.

```typescript
import memorySystem from './src/index';

// Store an approved palette as long-term project memory
const palette = memorySystem.store({
  tier: 'long-term',
  scope: 'project',
  key: 'approved-brand-palette-v2',
  value: {
    primary: '#0a0a0a',
    accent: '#ff4d00',
    neutral: '#f5f5f5',
    approvalVersion: 2,
  },
  tags: ['brand', 'palette', 'approved', 'color'],
  source: 'creative-director',
  projectId: 'proj-nata-brand-film',
  metadata: {
    approvedBy: 'creative-director',
    approvedAt: '2026-06-26',
    replacedVersion: 'approved-brand-palette-v1',
  },
});

console.log(`Long-term item stored: ${palette.id}`);
console.log(`Quality score: ${palette.qualityScore}`); // 0.85+ due to rich metadata
```

---

## 4. Semantic Memory Search

**Scenario**: The Prompt Architect needs any stored information about brand style before generating a prompt.

```typescript
import memorySystem from './src/index';

// Semantic search across tiers and scopes
const results = memorySystem.search({
  query: 'brand visual style color mood approved',
  tiers: ['long-term', 'project'],
  scope: 'project',
  tags: ['brand'],
  limit: 5,
  minQualityScore: 0.6,
  projectId: 'proj-nata-brand-film',
});

console.log(`Found ${results.totalMatches} matches in ${results.durationMs}ms`);
results.items.forEach(({ item, relevanceScore }) => {
  console.log(`  [${relevanceScore.toFixed(2)}] ${item.key}`);
  console.log(`       ${JSON.stringify(item.value).substring(0, 80)}...`);
});
```

---

## 5. Cross-Skill Context Handoff

**Scenario**: AI Image Director finishes its work and hands off the active style context to Prompt Architect to maintain consistency.

```typescript
import memorySystem from './src/index';

// Perform the handoff
const result = memorySystem.handoff({
  fromSkill: 'ai-image-director',
  toSkill: 'prompt-architect',
  sessionId: 'sess-20260626-001',
  keys: [
    'active-visual-style',
    'approved-brand-palette-v2',
    'current-aspect-ratio',
  ],
});

if (result.failed.length > 0) {
  console.error(`Handoff failed for keys: ${result.failed.join(', ')}`);
} else {
  console.log(`Successfully transferred ${result.transferred} items to prompt-architect`);
}
```

---

## 6. Session Memory Summarization

**Scenario**: A session is ending. Summarize short-term and session memory before closing so the next session can restore the key context.

```typescript
import memorySystem from './src/index';

// Summarize the session
const summary = memorySystem.summarize({
  scope: 'session',
  sessionId: 'sess-20260626-001',
  maxItems: 50,
});

console.log(`Session summary (≈${summary.tokenEstimate} tokens, ${summary.itemCount} items):`);
console.log(summary.text);

// Store the summary in long-term memory for future restoration
memorySystem.store({
  tier: 'long-term',
  scope: 'project',
  key: `session-summary-${new Date().toISOString().split('T')[0]}`,
  value: summary.text,
  tags: ['session-summary', 'context'],
  source: 'memory-system',
  projectId: 'proj-nata-brand-film',
  metadata: {
    sessionId: 'sess-20260626-001',
    itemCount: summary.itemCount,
    tokenEstimate: summary.tokenEstimate,
  },
});
```

---

## 7. Memory Pruning

**Scenario**: A scheduled maintenance job removes expired and low-quality items to keep the memory store lean.

```typescript
import memorySystem from './src/index';

// Step 1: dry run to review what would be removed
const dryRun = memorySystem.prune({
  expiredOnly: false,
  tier: 'short-term',
  minQualityScore: 0.3,
  dryRun: true,
});

console.log(`Dry run: would remove ${dryRun.candidates.length} items`);
dryRun.candidates.forEach((c) => {
  console.log(`  ${c.key} — ${c.reason}`);
});

// Step 2: apply the prune after review
const result = memorySystem.prune({
  expiredOnly: false,
  tier: 'short-term',
  minQualityScore: 0.3,
  dryRun: false,
});

console.log(`Pruned ${result.removed} items (${result.retained} retained, ${result.skipped} skipped)`);
```

---

## 8. Memory Quality Re-scoring

**Scenario**: After a bulk import of project decisions, all imported items need their quality scores recalculated.

```typescript
import memorySystem from './src/index';

// Import a batch of project decisions
const importResult = memorySystem.importItems([
  {
    tier: 'project',
    scope: 'project',
    key: 'camera-rig-decision',
    value: 'Blackmagic Cinema Camera 6K with Sigma Art lenses',
    tags: ['equipment', 'camera', 'decision'],
    source: 'production-notes',
    projectId: 'proj-nata-brand-film',
    metadata: { decidedAt: '2026-06-25' },
  },
  {
    tier: 'project',
    scope: 'project',
    key: 'shoot-location',
    value: 'Studio B, Nata HQ — controlled lighting environment',
    tags: ['location', 'production', 'decision'],
    source: 'production-notes',
    projectId: 'proj-nata-brand-film',
    metadata: { decidedAt: '2026-06-25' },
  },
]);

console.log(`Imported: ${importResult.imported}, Failed: ${importResult.failed}`);

// Re-score all items after import
const rescored = memorySystem.reScore();
console.log(`Re-scored ${rescored} items`);

// Check current index health
const s = memorySystem.stats();
console.log(`Total items: ${s.totalItems}, Avg quality: ${s.avgQualityScore.toFixed(2)}`);
```

---

## 9. Memory Index Health Report

**Scenario**: Generating a health dashboard before a team review session.

```typescript
import memorySystem from './src/index';

const s = memorySystem.stats();

console.log('=== Memory System Health Report ===\n');
console.log(`Total items       : ${s.totalItems}`);
console.log(`Avg quality score : ${s.avgQualityScore.toFixed(2)}`);
console.log(`Total tags        : ${s.totalTags}`);
console.log(`Expired items     : ${s.expiredItems}`);
console.log('\nBy Tier:');
Object.entries(s.byTier).forEach(([tier, count]) => {
  console.log(`  ${tier}: ${count}`);
});
console.log('\nBy Scope:');
Object.entries(s.byScope).forEach(([scope, count]) => {
  console.log(`  ${scope}: ${count}`);
});
console.log(`\nLast indexed at   : ${s.lastIndexedAt}`);
```
