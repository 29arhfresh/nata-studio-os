/**
 * Structural interfaces for the three production Skills.
 *
 * These are intentionally defined here — not imported from the Skill source files —
 * so the Integration Layer stays decoupled from internal Skill implementations.
 * TypeScript's structural typing guarantees that the real Skill modules satisfy
 * these interfaces without any runtime coupling.
 */

// ─── Memory System ────────────────────────────────────────────────────────────

export interface MemoryStoreInput {
  tier: string;
  scope: string;
  key: string;
  value: unknown;
  ttlSeconds?: number;
  tags?: string[];
  source: string;
  projectId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface MemorySearchQuery {
  query: string;
  tiers?: string[];
  scope?: string;
  tags?: string[];
  limit?: number;
  minQualityScore?: number;
  includeExpired?: boolean;
  projectId?: string;
  sessionId?: string;
  strategy?: string;
}

export interface MemoryContextRestoreOptions {
  scope: string;
  sessionId?: string;
  projectId?: string;
  limit?: number;
  tiers?: string[];
}

export interface MemoryHandoffOptions {
  fromSkill: string;
  toSkill: string;
  sessionId: string;
  keys?: string[];
}

export interface IMemorySystem {
  store(input: MemoryStoreInput): { id: string; key: string; qualityScore: number; createdAt: string };
  search(query: MemorySearchQuery): { items: Array<{ item: unknown; relevanceScore: number }>; totalMatches: number; durationMs: number };
  restoreContext(options: MemoryContextRestoreOptions): { items: Array<{ item: unknown; relevanceScore: number }>; tokenEstimate: number; restoredAt: string };
  handoff(options: MemoryHandoffOptions): { transferred: number; failed: string[]; handoffId: string; handedOffAt: string };
}

// ─── Creative Director ────────────────────────────────────────────────────────

export interface CreativeBriefInput {
  brand: string;
  objective: string;
  tone: string[];
  references?: string[];
  deliverables: string[];
  audience?: {
    ageRange: string;
    geography: string;
    interests: string[];
    income: string;
  };
  constraints?: {
    mandatoryColors: string[];
    forbiddenElements: string[];
  };
}

export interface MoodboardInput {
  concept: string;
  palette?: {
    primary: string;
    accent: string;
    neutral: string;
    rationale: string;
  };
  typography?: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };
  mood: string[];
  format?: string;
}

export interface ArtDirectionInput {
  brief: unknown;
  deliverableType: string;
  compositionRule?: string;
  lightingStyle?: string;
}

export interface CreativeScoringInput {
  deliverable: string;
  brandAlignment: number;
  compositionQuality: number;
  colorConsistency: number;
  storytellingClarity: number;
  technicalExecution: number;
}

export interface ICreativeDirector {
  buildCreativeBrief(input: CreativeBriefInput): unknown;
  buildMoodboard(input: MoodboardInput): unknown;
  buildArtDirection(input: ArtDirectionInput): unknown;
  scoreCreative(input: CreativeScoringInput): unknown;
}

// ─── Prompt Architect ─────────────────────────────────────────────────────────

export interface PromptBrief {
  taskObjective: string;
  taskType: string;
  persona?: string;
  context?: string;
  constraints?: string[];
  outputFormat: string;
  outputSchema?: string;
  examples?: Array<{ input: string; output: string; label?: string }>;
  evaluationCriteria?: string[];
  targetModel?: string;
  maxTokens?: number;
}

export interface BuiltPrompt {
  id: string;
  version: string;
  systemPrompt: string;
  userTemplate: string;
  qualityScore: number;
  qualityVerdict: string;
  estimatedTokens: number;
}

export interface TestCase {
  id: string;
  description: string;
  expectedOutputPattern?: string;
  expectedOutputContains?: string[];
  mustNotContain?: string[];
}

export interface IPromptArchitect {
  buildPrompt(brief: PromptBrief): BuiltPrompt;
  evaluatePrompt(prompt: BuiltPrompt, testCases: TestCase[]): unknown;
  compressPrompt(text: string, maxTokens: number): { original: string; compressed: string; originalTokens: number; compressedTokens: number; reductionPercent: number };
  versionPrompt(prompt: BuiltPrompt, changeType: string, summary: string): unknown;
}
