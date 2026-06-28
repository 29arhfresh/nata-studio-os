/**
 * Agent Orchestrator 2.0 — intelligent runtime of Nata Studio OS.
 *
 * ─── OVERVIEW ────────────────────────────────────────────────────────────────
 *
 * This module supersedes the prototype in skills/agent-orchestrator/src/index.ts.
 * The prototype established the routing → plan → execute → quality-gate →
 * memory-handoff pipeline shape. v2 preserves that shape but makes three
 * structural changes:
 *
 *   1. REGISTRY: skill metadata is read from CapabilityRegistry (injected),
 *      not from a hardcoded SKILL_REGISTRY constant inside the orchestrator.
 *      (Requirement 3)
 *
 *   2. EXECUTION: skills are invoked through SkillInvoker (injected), not
 *      simulated with a mock that always returns qualityScore=0.9.
 *      (Requirement 4)
 *
 *   3. PLANNING: the orchestrator plans by detecting CAPABILITIES in the
 *      intent, resolving each to the best registered skill, then ordering
 *      skills by capability dependency rules. No skill name appears in the
 *      routing or planning logic itself — only in CapabilityRegistry queries
 *      and SkillInvoker calls.
 *      (Requirement 5)
 *
 * ─── DEPENDENCY INJECTION (Req 6 — Loose Coupling) ──────────────────────────
 *
 * AgentOrchestratorV2 is a class whose constructor accepts CapabilityRegistry
 * and SkillInvoker. Tests inject mocks; production code passes the pair
 * returned by createIntegrationLayer(). The orchestrator never imports skill
 * modules directly.
 *
 * ─── WORKFLOW ENGINE INTEGRATION ─────────────────────────────────────────────
 *
 * The execution phase builds a WorkflowDefinition — the WorkflowEngine's
 * native contract — where each step's handler calls skillInvoker.invoke().
 * WorkflowEngine owns: DAG validation, sequential scheduling, timeout
 * enforcement, and event emission. DataRouter routes (derived from
 * CAPABILITY_DEPS edges) carry each skill's output to its dependents.
 * After workflowEngine.run(), invocationResults is derived from
 * workflowResult.stepResults — no parallel tracking structure.
 *
 * This satisfies the principle "use the Integration Layer as the execution
 * boundary": the orchestrator decides WHAT to run; the WorkflowEngine decides
 * HOW steps run; SkillInvoker decides WHICH handler executes.
 * (Requirement 1 — Workflow Engine is not modified)
 *
 * ─── CAPABILITY-BASED DEPENDENCY ORDERING ────────────────────────────────────
 *
 * The prototype hardcoded dependency edges between specific skill names
 * (index.ts lines 369–416). v2 expresses the same semantics as rules between
 * CAPABILITY TYPES (CAPABILITY_DEPS). When a plan contains two skills that
 * cover capabilities with a declared ordering, the dependency edge is derived
 * automatically — without naming the skills. This means a new skill that
 * provides 'brand-strategy' automatically runs before any skill providing
 * 'image-generation', without touching the orchestrator.
 */

import workflowEngine, {
  type WorkflowDefinition,
  type WorkflowResult,
  type StepInput,
  type DataRoute,
} from '../../workflow-engine/src/index';

import type { CapabilityRegistry } from '../../../integration/src/capability-registry';
import type { SkillInvoker } from '../../../integration/src/skill-invoker';
import type {
  SkillCapability,
  SkillRegistration,
  InvocationContext,
  InvocationResult,
} from '../../../integration/src/types';

// ─── Public Types ─────────────────────────────────────────────────────────────

export type { SkillCapability } from '../../../integration/src/types';

export type ExecutionPolicy = 'sequential' | 'parallel' | 'conditional' | 'fallback-chain';
export type ConflictResolutionStrategy = 'priority' | 'merge' | 'abort' | 'user-prompt';
export type QualityGateStatus = 'pass' | 'fail' | 'warn';

export interface OrchestratorV2Request {
  intent: string;
  context?: OrchestratorContext;
  policy?: ExecutionPolicy;
  allowedSkills?: string[];
  forbiddenSkills?: string[];
  qualityThreshold?: number;
}

export interface OrchestratorContext {
  sessionId: string;
  previousOutputs: InvocationResult[];
  sharedMemory: Record<string, unknown>;
  iterationCount: number;
}

export interface CapabilityPlan {
  /** Capabilities detected in the intent, in detection order. */
  detectedCapabilities: SkillCapability[];
  /** Map from each detected capability to the best registered skill for it. */
  capabilityAssignment: Map<SkillCapability, SkillRegistration>;
  /** Deduplicated ordered list of skills to invoke (topological order). */
  skillSequence: SkillRegistration[];
  /** Routing confidence score (average match ratio across detected capabilities). */
  confidence: number;
  reasoning: string;
}

export interface QualityGateResult {
  status: QualityGateStatus;
  score: number;
  failedChecks: string[];
  warnings: string[];
}

export interface MemoryHandoff {
  sessionId: string;
  exportedKeys: string[];
  snapshot: Record<string, unknown>;
}

export interface OrchestratorV2Result {
  capabilityPlan: CapabilityPlan;
  workflowResult: WorkflowResult;
  invocationResults: InvocationResult[];
  finalOutput: unknown;
  qualityGate: QualityGateResult;
  memoryHandoff: MemoryHandoff;
  totalDurationMs: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_QUALITY_THRESHOLD = 0.7;
const MAX_ITERATIONS = 10;

/**
 * Capability keyword map — same vocabulary as v1 (index.ts lines 237–262).
 *
 * ARCHITECTURAL DECISION: The keyword map belongs to the orchestrator, not the
 * integration layer. Intent analysis is an orchestrator concern; the registry
 * cares only about what skills declare, not how intents are parsed. If a future
 * NLP-based intent analyser is introduced, only this map needs to change.
 */
const CAPABILITY_KEYWORDS: Record<SkillCapability, string[]> = {
  'image-generation':   ['image', 'photo', 'picture', 'generate image', 'create image', 'draw', 'illustration'],
  'image-editing':      ['edit image', 'modify image', 'inpaint', 'outpaint', 'retouch', 'remove background'],
  'image-upscaling':    ['upscale', 'enhance resolution', 'increase resolution', 'sharpen', 'magnific'],
  'video-generation':   ['video', 'clip', 'animate', 'motion', 'film', 'footage', 'reel'],
  'video-editing':      ['edit video', 'reframe', 'voice change', 'dub', 'video-to-video'],
  'prompt-engineering': ['prompt', 'write prompt', 'optimize prompt', 'chain of thought', 'few-shot'],
  'orchestration':      ['orchestrate', 'coordinate', 'pipeline', 'workflow'],
  'routing':            ['route', 'dispatch', 'choose skill'],
  'character-consistency': ['consistent character', 'same character', 'character across', 'ip-adapter'],
  'style-transfer':     ['style', 'aesthetic', 'look and feel', 'visual style'],
  'text-rendering':     ['text in image', 'typography', 'logo', 'lettering', 'ideogram'],
  'brand-strategy':     ['brand', 'creative brief', 'brand strategy', 'visual identity', 'tone of voice', 'brand guidelines', 'brand direction'],
  'visual-direction':   ['art direction', 'visual direction', 'color strategy', 'composition direction', 'aesthetic direction'],
  'moodboard':          ['moodboard', 'mood board', 'visual references', 'visual concept', 'look and feel board'],
  'creative-scoring':   ['score creative', 'evaluate creative', 'creative review', 'creative quality', 'rate creative', 'quality score'],
  'knowledge-indexing': ['knowledge', 'index entry', 'store knowledge', 'knowledge base', 'add knowledge', 'document knowledge'],
  'semantic-search':    ['search knowledge', 'find knowledge', 'retrieve knowledge', 'knowledge search', 'look up'],
  'context-assembly':   ['assemble context', 'build context', 'gather context', 'context for prompt', 'relevant context'],
  'memory-management':  ['remember', 'save to memory', 'store in memory', 'memory', 'persist context', 'recall'],
  'context-handoff':    ['handoff', 'transfer context', 'pass context', 'session handoff', 'continue from'],
  'project-planning':   ['create project', 'new project', 'plan project', 'project setup', 'project brief'],
  'task-management':    ['task', 'todo', 'backlog', 'sprint', 'assign task', 'create task', 'milestone'],
  'roadmap-generation': ['roadmap', 'timeline', 'project schedule', 'delivery plan', 'project roadmap'],
  'risk-management':    ['risk', 'blocker', 'mitigation', 'dependency risk', 'identify risk'],
};

/**
 * Capability-level dependency ordering rules.
 *
 * ARCHITECTURAL DECISION: This replaces the skill-name-specific if/then rules
 * in the prototype (index.ts lines 369–416). By expressing ordering in terms of
 * capabilities (not skill names), any skill that provides a capability
 * automatically inherits its position in the execution order, with no
 * orchestrator change required.
 *
 * Read: "capability A must execute before capability B when both are in the
 * plan." The key is the LATER capability; the value array lists capabilities
 * that must have run first.
 *
 * Example: 'image-generation' requires 'brand-strategy' and 'prompt-engineering'
 * to have completed first (if they are in the plan). This enforces the creative
 * pipeline: knowledge → brand strategy → prompt engineering → generation.
 */
const CAPABILITY_DEPS: Partial<Record<SkillCapability, SkillCapability[]>> = {
  'image-generation':  ['brand-strategy', 'visual-direction', 'prompt-engineering', 'context-assembly'],
  'video-generation':  ['brand-strategy', 'visual-direction', 'prompt-engineering', 'context-assembly'],
  'image-upscaling':   ['image-generation'],
  'video-editing':     ['video-generation'],
  'visual-direction':  ['brand-strategy', 'context-assembly'],
  'moodboard':         ['brand-strategy'],
  'creative-scoring':  ['brand-strategy'],
  'prompt-engineering':['context-assembly', 'memory-management'],
  'task-management':   ['project-planning'],
  'roadmap-generation':['project-planning'],
  'risk-management':   ['project-planning'],
  'context-handoff':   ['memory-management'],
  'brand-strategy':    ['context-assembly', 'memory-management'],
};

// ─── Intent Analysis ──────────────────────────────────────────────────────────

function detectCapabilities(intent: string): SkillCapability[] {
  const lower = intent.toLowerCase();
  const detected: SkillCapability[] = [];
  for (const [cap, keywords] of Object.entries(CAPABILITY_KEYWORDS) as Array<[SkillCapability, string[]]>) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(cap);
    }
  }
  return detected;
}

// ─── Capability-Based Planning ────────────────────────────────────────────────

/**
 * Resolves each detected capability to the best available registered skill,
 * respecting allowedSkills and forbiddenSkills filters.
 *
 * ARCHITECTURAL DECISION: Resolution is capability-first, not skill-first.
 * The orchestrator asks "what can cover this capability?" and the registry
 * answers. The orchestrator never names skills directly in this path.
 */
function resolveCapabilitiesToSkills(
  capabilities: SkillCapability[],
  registry: CapabilityRegistry,
  allowedSkills?: string[],
  forbiddenSkills?: string[],
): Map<SkillCapability, SkillRegistration> {
  const assignment = new Map<SkillCapability, SkillRegistration>();

  for (const cap of capabilities) {
    const candidates = registry.resolve(cap).filter((reg) => {
      if (forbiddenSkills?.includes(reg.name)) return false;
      if (allowedSkills && !allowedSkills.includes(reg.name)) return false;
      return true;
    });

    if (candidates.length > 0) {
      // First candidate is highest priority (resolve() returns sorted).
      assignment.set(cap, candidates[0]);
    }
  }

  return assignment;
}

/**
 * Kahn's algorithm on a list of SkillRegistrations with edges derived from
 * CAPABILITY_DEPS. Returns null if a cycle is detected (which would indicate
 * a bug in CAPABILITY_DEPS, not in user input).
 */
function topoSortSkills(
  skills: SkillRegistration[],
  capabilityAssignment: Map<SkillCapability, SkillRegistration>,
): SkillRegistration[] | null {
  const nameToReg = new Map(skills.map((s) => [s.name, s]));
  const inDegree = new Map<string, number>(skills.map((s) => [s.name, 0]));
  const adj = new Map<string, string[]>(skills.map((s) => [s.name, []]));

  for (const [cap, reg] of capabilityAssignment) {
    const prereqs = CAPABILITY_DEPS[cap] ?? [];
    for (const prereqCap of prereqs) {
      const prereqSkill = capabilityAssignment.get(prereqCap);
      if (!prereqSkill || prereqSkill.name === reg.name) continue;
      // Edge: prereqSkill → reg (prereq must run first)
      if (!adj.get(prereqSkill.name)?.includes(reg.name)) {
        adj.get(prereqSkill.name)!.push(reg.name);
        inDegree.set(reg.name, (inDegree.get(reg.name) ?? 0) + 1);
      }
    }
  }

  const queue = skills.filter((s) => inDegree.get(s.name) === 0);
  const result: SkillRegistration[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const neighbourName of adj.get(node.name) ?? []) {
      const newDegree = (inDegree.get(neighbourName) ?? 0) - 1;
      inDegree.set(neighbourName, newDegree);
      if (newDegree === 0) {
        const neighbourReg = nameToReg.get(neighbourName);
        if (neighbourReg) queue.push(neighbourReg);
      }
    }
  }

  return result.length === skills.length ? result : null;
}

/**
 * Builds a CapabilityPlan from detected capabilities and registry state.
 * This is the full intent-analysis → skill-selection → ordering pipeline.
 */
function buildCapabilityPlan(
  intent: string,
  registry: CapabilityRegistry,
  allowedSkills?: string[],
  forbiddenSkills?: string[],
): CapabilityPlan {
  const detectedCapabilities = detectCapabilities(intent);

  if (detectedCapabilities.length === 0) {
    throw new Error(
      'NO_CAPABILITIES_DETECTED: The intent did not match any known capability keywords. ' +
      'Provide a more specific intent describing what you want to accomplish.',
    );
  }

  const capabilityAssignment = resolveCapabilitiesToSkills(
    detectedCapabilities,
    registry,
    allowedSkills,
    forbiddenSkills,
  );

  if (capabilityAssignment.size === 0) {
    throw new Error(
      'NO_MATCHING_SKILL: Capabilities were detected but no registered skill (after applying ' +
      'allowed/forbidden filters) can fulfil any of them.',
    );
  }

  // Deduplicate: multiple capabilities may map to the same skill.
  const skillByName = new Map<string, SkillRegistration>();
  for (const reg of capabilityAssignment.values()) {
    skillByName.set(reg.name, reg);
  }
  const uniqueSkills = Array.from(skillByName.values());

  // Order by capability dependencies.
  const ordered = topoSortSkills(uniqueSkills, capabilityAssignment);
  if (!ordered) {
    // Cyclic capability deps are a static configuration bug.
    throw new Error('CYCLIC_CAPABILITY_DEPS: Capability dependency graph contains a cycle.');
  }

  const confidence =
    capabilityAssignment.size / detectedCapabilities.length;

  const skillNames = ordered.map((s) => s.name).join(' → ');
  const coveredCaps = Array.from(capabilityAssignment.keys()).join(', ');
  const reasoning =
    `Detected ${detectedCapabilities.length} capabilities; ` +
    `${capabilityAssignment.size} covered by registered skills. ` +
    `Execution sequence: ${skillNames}. ` +
    `Covered capabilities: ${coveredCaps}.`;

  return {
    detectedCapabilities,
    capabilityAssignment,
    skillSequence: ordered,
    confidence,
    reasoning,
  };
}

// ─── Execution ────────────────────────────────────────────────────────────────

/**
 * Converts a CapabilityPlan into a WorkflowDefinition and runs it through
 * the WorkflowEngine.
 *
 * ARCHITECTURAL DECISION (Req 1 — Do not modify Workflow Engine):
 * The orchestrator is a CONSUMER of WorkflowEngine.run(). It builds a
 * WorkflowDefinition whose step handlers call skillInvoker.invoke(). This
 * keeps WorkflowEngine completely unmodified while giving the orchestrator
 * DAG validation, sequential scheduling, timeout enforcement, and event
 * emission for free.
 *
 * DEPENDENCY EDGES: The same CAPABILITY_DEPS map that drives topoSortSkills()
 * also drives step.dependsOn[] and DataRouter routes. Both are computed in a
 * single pass over the plan — no second source of routing truth.
 *
 * STEP OUTPUT ROUTING: Each DataRouter route carries InvocationResult.output
 * (outputKey: 'output') from an upstream step to the downstream handler as
 * stepInput.data.input (inputKey: 'input'). Routes mirror actual CAPABILITY_DEPS
 * edges, not a sequential chain, so the WorkflowDefinition's DAG accurately
 * represents the plan's dependency structure.
 *
 * RESULT COLLECTION: workflowResult.stepResults is the single source of
 * execution state. Each handler returns InvocationResult directly; WorkflowEngine
 * stores it as the step's output. After run() returns, invocationResults is
 * derived from stepResults — no parallel tracking structure is required.
 * (SkillInvoker never throws: all errors are returned as InvocationResult.error
 * fields, so every step always produces a non-null output.)
 */
async function executePlan(
  plan: CapabilityPlan,
  invoker: SkillInvoker,
  context: OrchestratorContext,
  intent: string,
): Promise<{ workflowResult: WorkflowResult; invocationResults: InvocationResult[] }> {
  const workflowId = `orchestrator-v2-${context.sessionId}`;

  // Pre-compute dependency edges in one pass.
  // Key: skill name → set of prerequisite skill names that appear earlier in
  // the topological sequence. Used for both step.dependsOn[] and routes[].
  const prereqNamesForStep = new Map<string, Set<string>>();
  for (const [index, reg] of plan.skillSequence.entries()) {
    const prereqs = new Set<string>();
    for (const [cap, assignedReg] of plan.capabilityAssignment) {
      if (assignedReg.name !== reg.name) continue;
      for (const prereqCap of (CAPABILITY_DEPS[cap] ?? [])) {
        const prereqReg = plan.capabilityAssignment.get(prereqCap);
        if (prereqReg && prereqReg.name !== reg.name) {
          const prereqIndex = plan.skillSequence.findIndex((s) => s.name === prereqReg.name);
          if (prereqIndex >= 0 && prereqIndex < index) {
            prereqs.add(prereqReg.name);
          }
        }
      }
    }
    prereqNamesForStep.set(reg.name, prereqs);
  }

  // invocationContext is shared across all step handlers. previousOutputs
  // carries outputs from prior orchestration sessions (not within-session
  // steps — that data flows via DataRouter routes).
  const invocationContext: InvocationContext = {
    sessionId:       context.sessionId,
    previousOutputs: context.previousOutputs,
    sharedMemory:    context.sharedMemory,
    iterationCount:  context.iterationCount,
  };

  const steps = plan.skillSequence.map((reg) => {
    const prereqs = prereqNamesForStep.get(reg.name) ?? new Set<string>();
    return {
      id:        reg.name,
      dependsOn: Array.from(prereqs),
      timeoutMs: reg.timeoutMs,
      handler:   async (stepInput: StepInput) =>
        invoker.invoke({
          skillName: reg.name,
          // data.input is set by DataRouter from the upstream step's output.
          // Falls back to context.intent for root steps (no predecessors).
          input:   stepInput.data.input ?? stepInput.context.intent,
          context: invocationContext,
        }),
    };
  });

  // Build routes from CAPABILITY_DEPS edges — not a sequential chain.
  // outputKey 'output' reads InvocationResult.output (the skill's actual output).
  // inputKey 'input' delivers it as stepInput.data.input to the downstream handler.
  const routes: DataRoute[] = [];
  for (const reg of plan.skillSequence) {
    for (const prereqName of (prereqNamesForStep.get(reg.name) ?? [])) {
      routes.push({
        fromStep:  prereqName,
        toStep:    reg.name,
        outputKey: 'output',
        inputKey:  'input',
      });
    }
  }

  const definition: WorkflowDefinition = {
    id: workflowId,
    steps,
    routes,
  };

  // Seed the workflow context with the user's intent and shared memory.
  // Every step can read intent via stepInput.context.intent as a fallback
  // when it has no routed predecessor data.
  const workflowContext: Record<string, unknown> = {
    intent,
    ...context.sharedMemory,
  };

  const workflowResult = await workflowEngine.run(definition, {
    context: workflowContext,
  });

  // Derive invocation results from WorkflowEngine's step results.
  // StepResult.output is the value returned by the handler, which is always
  // InvocationResult (SkillInvoker catches all errors before they can propagate).
  const invocationResults = workflowResult.stepResults.map(
    (sr) => sr.output as InvocationResult,
  );

  return { workflowResult, invocationResults };
}

// ─── Quality Gate ─────────────────────────────────────────────────────────────

function evaluateQualityGate(
  results: InvocationResult[],
  threshold: number,
): QualityGateResult {
  const failedChecks: string[] = [];
  const warnings: string[] = [];

  for (const result of results) {
    if (result.error) {
      failedChecks.push(`${result.skillName}: invocation failed — ${result.error}`);
      continue;
    }
    if (result.output === null || result.output === undefined) {
      failedChecks.push(`${result.skillName}: produced a null or undefined output.`);
    }
    if (result.qualityScore < threshold) {
      failedChecks.push(
        `${result.skillName}: quality score ${result.qualityScore.toFixed(2)} is below threshold ${threshold.toFixed(2)}.`,
      );
    } else if (result.qualityScore < threshold + 0.1) {
      warnings.push(
        `${result.skillName}: quality score ${result.qualityScore.toFixed(2)} is close to threshold.`,
      );
    }
  }

  const avgScore =
    results.length > 0
      ? results.reduce((s, r) => s + r.qualityScore, 0) / results.length
      : 0;

  const status: QualityGateStatus =
    failedChecks.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass';

  return { status, score: avgScore, failedChecks, warnings };
}

// ─── Memory Handoff ───────────────────────────────────────────────────────────

function buildMemoryHandoff(
  sessionId: string,
  results: InvocationResult[],
  existingMemory: Record<string, unknown>,
): MemoryHandoff {
  const snapshot: Record<string, unknown> = { ...existingMemory };
  const exportedKeys: string[] = [];

  for (const result of results) {
    const key = `${result.skillName}.lastOutput`;
    snapshot[key] = result.output;
    exportedKeys.push(key);

    if (Object.keys(result.metadata).length > 0) {
      const metaKey = `${result.skillName}.lastMeta`;
      snapshot[metaKey] = result.metadata;
      exportedKeys.push(metaKey);
    }
  }

  snapshot['orchestrator.lastSessionId'] = sessionId;
  exportedKeys.push('orchestrator.lastSessionId');

  return { sessionId, exportedKeys, snapshot };
}

// ─── AgentOrchestratorV2 Class ────────────────────────────────────────────────

/**
 * AgentOrchestratorV2 — the intelligent runtime coordinator.
 *
 * ARCHITECTURAL DECISION: Implemented as a class (not a module-level object)
 * so that CapabilityRegistry and SkillInvoker are injected at construction
 * time, enabling full testability without module-level mocking. The v1
 * prototype used a module-level singleton object with hardcoded dependencies;
 * v2 inverts that relationship.
 *
 * The public API intentionally mirrors v1's surface (orchestrate, route, plan,
 * listSkills) so callers can migrate with minimal changes. New capabilities
 * (planByCapability, invokeByCapability) are additive.
 */
export class AgentOrchestratorV2 {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly invoker: SkillInvoker,
  ) {}

  // ─── Planning (sync) ────────────────────────────────────────────────────────

  /**
   * Analyses an intent and returns a CapabilityPlan without executing anything.
   * Useful for previewing what the orchestrator would do, or for dry-run UIs.
   *
   * ARCHITECTURAL DECISION: Separating planning from execution enables callers
   * to inspect the plan, modify allowedSkills/forbiddenSkills, and replan
   * before committing to execution. v1 conflated routing+planning into a single
   * synchronous pipeline with no inspection point.
   */
  planByCapability(
    intent: string,
    allowedSkills?: string[],
    forbiddenSkills?: string[],
  ): CapabilityPlan {
    this.assertValidIntent(intent);
    return buildCapabilityPlan(intent, this.registry, allowedSkills, forbiddenSkills);
  }

  // ─── Execution (async) ──────────────────────────────────────────────────────

  /**
   * Full pipeline: detect capabilities → resolve skills → order by deps →
   * execute via WorkflowEngine → quality-gate → memory handoff.
   *
   * ASYNC: orchestrate() is async because SkillInvoker.invoke() is async
   * (real I/O). This is the key behavioural change from v1, which was
   * synchronous because execution was simulated.
   */
  async orchestrate(request: OrchestratorV2Request): Promise<OrchestratorV2Result> {
    this.assertValidIntent(request.intent);

    const context: OrchestratorContext = request.context ?? {
      sessionId:       `session-${Date.now()}`,
      previousOutputs: [],
      sharedMemory:    {},
      iterationCount:  0,
    };

    this.assertIterationLimit(context.iterationCount);

    const qualityThreshold = request.qualityThreshold ?? DEFAULT_QUALITY_THRESHOLD;

    const capabilityPlan = buildCapabilityPlan(
      request.intent,
      this.registry,
      request.allowedSkills,
      request.forbiddenSkills,
    );

    const startMs = Date.now();

    const { workflowResult, invocationResults } = await executePlan(
      capabilityPlan,
      this.invoker,
      context,
      request.intent,
    );

    const qualityGate = evaluateQualityGate(invocationResults, qualityThreshold);
    const memoryHandoff = buildMemoryHandoff(
      context.sessionId,
      invocationResults,
      context.sharedMemory,
    );

    const finalOutput =
      invocationResults.length > 0
        ? invocationResults[invocationResults.length - 1].output
        : null;

    return {
      capabilityPlan,
      workflowResult,
      invocationResults,
      finalOutput,
      qualityGate,
      memoryHandoff,
      totalDurationMs: Date.now() - startMs,
    };
  }

  // ─── Registry Queries (sync) ────────────────────────────────────────────────

  /** Returns all registered skills, optionally filtered by capability. */
  listSkills(filterByCapability?: SkillCapability): SkillRegistration[] {
    if (!filterByCapability) return this.registry.list();
    return this.registry.resolve(filterByCapability);
  }

  /** Returns the registration for a single skill, or undefined if not registered. */
  describeSkill(name: string): SkillRegistration | undefined {
    return this.registry.find(name);
  }

  /** Returns all capabilities that at least one registered skill declares. */
  listCapabilities(): SkillCapability[] {
    return this.registry.capabilities();
  }

  /**
   * Detects which capabilities are implied by an intent string.
   * Exposed as a public method to allow callers to preview what the
   * orchestrator would detect before committing to a full plan.
   */
  detectCapabilities(intent: string): SkillCapability[] {
    return detectCapabilities(intent);
  }

  // ─── Guards ──────────────────────────────────────────────────────────────────

  private assertValidIntent(intent: unknown): asserts intent is string {
    if (typeof intent !== 'string' || intent.trim().length === 0) {
      throw new Error('INVALID_INTENT: Intent must be a non-empty string.');
    }
  }

  private assertIterationLimit(count: number): void {
    if (count >= MAX_ITERATIONS) {
      throw new Error(
        `MAX_ITERATIONS_EXCEEDED: Orchestrator reached the limit of ${MAX_ITERATIONS} iterations.`,
      );
    }
  }
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default AgentOrchestratorV2;
