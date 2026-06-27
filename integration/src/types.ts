/**
 * Integration Layer — shared type definitions.
 *
 * ARCHITECTURAL DECISION: Types are defined independently of any skill,
 * including agent-orchestrator. The integration layer is a dependency of the
 * orchestrator, not a dependency of skills. Defining types here avoids circular
 * imports and gives every consumer a single canonical source.
 *
 * These types mirror and extend the capability vocabulary from Agent Orchestrator
 * v1, but live here so that CapabilityRegistry and SkillInvoker — both new in
 * this milestone — can be typed without importing from a skill directory.
 */

// ─── Capability Taxonomy ──────────────────────────────────────────────────────

/**
 * All capabilities that a skill may declare.
 * Capabilities are the unit of capability-based routing: the orchestrator
 * detects which capabilities an intent requires, then queries the registry
 * to find which skills supply them.
 *
 * ARCHITECTURAL DECISION: The capability set is an open union defined once
 * here. Adding a new capability requires a single edit in this file, not
 * edits in every skill or in the orchestrator.
 */
export type SkillCapability =
  | 'image-generation'
  | 'image-editing'
  | 'image-upscaling'
  | 'video-generation'
  | 'video-editing'
  | 'prompt-engineering'
  | 'orchestration'
  | 'routing'
  | 'character-consistency'
  | 'style-transfer'
  | 'text-rendering'
  | 'brand-strategy'
  | 'visual-direction'
  | 'moodboard'
  | 'creative-scoring'
  | 'knowledge-indexing'
  | 'semantic-search'
  | 'context-assembly'
  | 'memory-management'
  | 'context-handoff'
  | 'project-planning'
  | 'task-management'
  | 'roadmap-generation'
  | 'risk-management';

// ─── Registry Types ───────────────────────────────────────────────────────────

/**
 * Metadata a skill declares when registering into CapabilityRegistry.
 *
 * ARCHITECTURAL DECISION: SkillRegistration is plain data (no methods, no
 * imports from skill code). This keeps the registry decoupled from skill
 * implementations, satisfying Requirement 6 (loose coupling). Skills do not
 * need to import or know about CapabilityRegistry to be registered into it.
 */
export interface SkillRegistration {
  /** Unique skill name matching skill.json "name" field. */
  name: string;
  /** Semantic version matching skill.json "version" field. */
  version: string;
  /** The capabilities this skill can fulfil. Must be non-empty. */
  capabilities: SkillCapability[];
  /**
   * Routing priority 0–100. When multiple skills cover the same capability,
   * the highest-priority skill is selected first.
   */
  priority: number;
  /** Maximum simultaneous invocations; enforced by the caller, not the registry. */
  maxConcurrency: number;
  /** Default timeout for invocations (ms). SkillInvoker uses this as fallback. */
  timeoutMs: number;
  /**
   * True if the skill requires a populated InvocationContext.sharedMemory to
   * function correctly. The orchestrator uses this to gate invocation order.
   */
  requiresContext: boolean;
  /** Optional classification tags (from skill.json). */
  tags?: string[];
}

// ─── Invocation Types ─────────────────────────────────────────────────────────

/**
 * Runtime context threaded through every SkillInvoker call.
 * Matches ExecutionContext from Agent Orchestrator v1 but renamed to avoid
 * coupling the integration layer to the orchestrator's type vocabulary.
 */
export interface InvocationContext {
  sessionId: string;
  previousOutputs: InvocationResult[];
  sharedMemory: Record<string, unknown>;
  iterationCount: number;
}

/** Structured request passed to SkillInvoker.invoke(). */
export interface InvocationRequest {
  /** Explicit skill name. Mutually exclusive with capability-only routing. */
  skillName: string;
  /**
   * Optional capability hint. When set and the skill name is the result of
   * capability resolution, this helps SkillInvoker log which capability
   * triggered the invocation for observability.
   */
  capability?: SkillCapability;
  /** Skill-specific input payload. */
  input: unknown;
  /** Context available to the handler. Defaults to an empty session context. */
  context?: InvocationContext;
  /** Per-call timeout override; falls back to SkillRegistration.timeoutMs. */
  timeoutMs?: number;
}

/**
 * What a SkillHandlerFn must return. qualityScore and metadata are optional;
 * SkillInvoker fills in safe defaults if they are absent.
 */
export interface InvocationOutcome {
  output: unknown;
  /** 0–1 confidence score; defaults to 0.9 if not provided. */
  qualityScore?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Normalised result returned by SkillInvoker after every invocation attempt.
 *
 * ARCHITECTURAL DECISION: SkillInvoker never throws on execution errors.
 * Instead it returns a result with error set and qualityScore=0. This keeps
 * the orchestrator in control of fallback/retry decisions rather than
 * embedding that logic inside the invoker.
 */
export interface InvocationResult {
  skillName: string;
  output: unknown;
  /** 0.0 on error, otherwise the value from InvocationOutcome. */
  qualityScore: number;
  durationMs: number;
  metadata: Record<string, unknown>;
  /** Non-null only when the invocation failed. */
  error?: string;
}

/**
 * Function signature every skill handler must implement.
 * The handler is the only coupling point between the integration layer and a
 * skill's TypeScript code. It may be sync or async.
 */
export type SkillHandlerFn = (
  input: unknown,
  context: InvocationContext,
) => Promise<InvocationOutcome> | InvocationOutcome;
