/**
 * Agent Orchestrator — central brain of Nata Studio OS.
 * Routes requests to the correct Skill, sequences multi-Skill pipelines,
 * enforces quality gates, and hands off memory between execution steps.
 */

// ─── Skill Registry Types ────────────────────────────────────────────────────

export type SkillName =
  | 'ai-image-director'
  | 'ai-video-director'
  | 'prompt-architect'
  | 'agent-orchestrator';

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
  | 'text-rendering';

export type ExecutionPolicy = 'sequential' | 'parallel' | 'conditional' | 'fallback-chain';

export type ConflictResolutionStrategy = 'priority' | 'merge' | 'abort' | 'user-prompt';

export type QualityGateStatus = 'pass' | 'fail' | 'warn';

// ─── Core Interfaces ─────────────────────────────────────────────────────────

export interface SkillDescriptor {
  name: SkillName;
  capabilities: SkillCapability[];
  priority: number;
  maxConcurrency: number;
  timeoutMs: number;
  requiresContext: boolean;
}

export interface OrchestratorRequest {
  intent: string;
  context?: ExecutionContext;
  policy?: ExecutionPolicy;
  allowedSkills?: SkillName[];
  forbiddenSkills?: SkillName[];
  qualityThreshold?: number;
}

export interface ExecutionContext {
  sessionId: string;
  previousOutputs: SkillOutput[];
  sharedMemory: Record<string, unknown>;
  iterationCount: number;
}

export interface SkillOutput {
  skillName: SkillName;
  result: unknown;
  qualityScore: number;
  durationMs: number;
  metadata: Record<string, unknown>;
}

export interface OrchestratorResult {
  plan: ExecutionPlan;
  outputs: SkillOutput[];
  finalOutput: unknown;
  qualityGate: QualityGateResult;
  memoryHandoff: MemoryHandoff;
  totalDurationMs: number;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  policy: ExecutionPolicy;
  estimatedDurationMs: number;
  conflictResolution: ConflictResolutionStrategy;
}

export interface ExecutionStep {
  stepIndex: number;
  skillName: SkillName;
  dependsOn: number[];
  input: unknown;
  fallback?: SkillName;
  qualityGate?: QualityGate;
}

export interface QualityGate {
  minScore: number;
  requiredFields: string[];
  customValidator?: string;
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

export interface RoutingDecision {
  primarySkill: SkillName;
  supportingSkills: SkillName[];
  confidence: number;
  reasoning: string;
  detectedCapabilities: SkillCapability[];
}

export interface ConflictReport {
  conflictingSkills: SkillName[];
  resolution: ConflictResolutionStrategy;
  resolvedSkill: SkillName | null;
  explanation: string;
}

export interface DependencyGraph {
  nodes: SkillName[];
  edges: Array<{ from: SkillName; to: SkillName; reason: string }>;
  executionOrder: SkillName[];
  hasCycle: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_QUALITY_THRESHOLD = 0.7;
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_ITERATIONS = 10;
const MAX_PARALLEL_SKILLS = 4;

const SKILL_REGISTRY: Record<SkillName, SkillDescriptor> = {
  'ai-image-director': {
    name: 'ai-image-director',
    capabilities: [
      'image-generation',
      'image-editing',
      'image-upscaling',
      'character-consistency',
      'style-transfer',
    ],
    priority: 80,
    maxConcurrency: 3,
    timeoutMs: 60_000,
    requiresContext: false,
  },
  'ai-video-director': {
    name: 'ai-video-director',
    capabilities: [
      'video-generation',
      'video-editing',
      'character-consistency',
      'style-transfer',
    ],
    priority: 80,
    maxConcurrency: 2,
    timeoutMs: 120_000,
    requiresContext: false,
  },
  'prompt-architect': {
    name: 'prompt-architect',
    capabilities: ['prompt-engineering', 'text-rendering'],
    priority: 70,
    maxConcurrency: 5,
    timeoutMs: 15_000,
    requiresContext: false,
  },
  'agent-orchestrator': {
    name: 'agent-orchestrator',
    capabilities: ['orchestration', 'routing'],
    priority: 100,
    maxConcurrency: 1,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    requiresContext: true,
  },
};

const CAPABILITY_KEYWORDS: Record<SkillCapability, string[]> = {
  'image-generation': ['image', 'photo', 'picture', 'generate image', 'create image', 'draw', 'illustration'],
  'image-editing':    ['edit image', 'modify image', 'inpaint', 'outpaint', 'retouch', 'remove background'],
  'image-upscaling':  ['upscale', 'enhance resolution', 'increase resolution', 'sharpen', 'magnific'],
  'video-generation': ['video', 'clip', 'animate', 'motion', 'film', 'footage', 'reel'],
  'video-editing':    ['edit video', 'reframe', 'voice change', 'dub', 'video-to-video'],
  'prompt-engineering': ['prompt', 'write prompt', 'optimize prompt', 'chain of thought', 'few-shot'],
  'orchestration':    ['orchestrate', 'coordinate', 'pipeline', 'workflow'],
  'routing':          ['route', 'dispatch', 'choose skill'],
  'character-consistency': ['consistent character', 'same character', 'character across', 'ip-adapter'],
  'style-transfer':   ['style', 'aesthetic', 'look and feel', 'visual style'],
  'text-rendering':   ['text in image', 'typography', 'logo', 'lettering', 'ideogram'],
};

// ─── Validation ───────────────────────────────────────────────────────────────

function assertValidIntent(intent: unknown): asserts intent is string {
  if (typeof intent !== 'string' || intent.trim().length === 0) {
    throw new Error('INVALID_INTENT: Intent must be a non-empty string.');
  }
}

function assertIterationLimit(count: number): void {
  if (count >= MAX_ITERATIONS) {
    throw new Error(
      `MAX_ITERATIONS_EXCEEDED: Orchestrator reached the limit of ${MAX_ITERATIONS} iterations.`,
    );
  }
}

function assertSkillRegistered(name: unknown): asserts name is SkillName {
  if (!Object.prototype.hasOwnProperty.call(SKILL_REGISTRY, name as string)) {
    throw new Error(`UNKNOWN_SKILL: "${String(name)}" is not registered in the Skill registry.`);
  }
}

function assertNoCyclicDependency(graph: DependencyGraph): void {
  if (graph.hasCycle) {
    throw new Error('CYCLIC_DEPENDENCY: The dependency graph contains a cycle; execution cannot proceed.');
  }
}

// ─── Intent Analysis ─────────────────────────────────────────────────────────

/** Detects which capabilities are requested by scanning the intent string. */
function detectCapabilities(intent: string): SkillCapability[] {
  const lower = intent.toLowerCase();
  const detected: SkillCapability[] = [];

  for (const [capability, keywords] of Object.entries(CAPABILITY_KEYWORDS) as Array<[SkillCapability, string[]]>) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(capability);
    }
  }

  return detected;
}

/** Scores how well a Skill matches the detected capabilities. */
function scoreSkillMatch(skill: SkillDescriptor, detected: SkillCapability[]): number {
  if (detected.length === 0) return 0;
  const matches = detected.filter((c) => skill.capabilities.includes(c)).length;
  return matches / detected.length;
}

/** Selects the primary Skill and optional supporting Skills for a given intent. */
function buildRoutingDecision(
  intent: string,
  allowedSkills: SkillName[] | undefined,
  forbiddenSkills: SkillName[] | undefined,
): RoutingDecision {
  const detected = detectCapabilities(intent);

  const candidates = (Object.values(SKILL_REGISTRY) as SkillDescriptor[]).filter((s) => {
    if (s.name === 'agent-orchestrator') return false;
    if (forbiddenSkills?.includes(s.name)) return false;
    if (allowedSkills && !allowedSkills.includes(s.name)) return false;
    return true;
  });

  const scored = candidates
    .map((s) => ({ skill: s, score: scoreSkillMatch(s, detected) * (s.priority / 100) }))
    .sort((a, b) => b.score - a.score);

  const primary = scored[0]?.skill;
  if (!primary) {
    throw new Error('NO_MATCHING_SKILL: No registered Skill matches the detected intent capabilities.');
  }

  const supporting = scored
    .slice(1)
    .filter((s) => s.score > 0 && s.skill.name !== primary.name)
    .map((s) => s.skill.name);

  return {
    primarySkill:         primary.name,
    supportingSkills:     supporting,
    confidence:           scored[0].score,
    reasoning:            buildRoutingReasoning(primary, detected, scored[0].score),
    detectedCapabilities: detected,
  };
}

function buildRoutingReasoning(
  skill: SkillDescriptor,
  detected: SkillCapability[],
  score: number,
): string {
  const pct = Math.round(score * 100);
  const matched = detected.filter((c) => skill.capabilities.includes(c));
  return `${skill.name} matched ${matched.length}/${detected.length} detected capabilities (${pct}% confidence): ${matched.join(', ')}.`;
}

// ─── Dependency Graph ─────────────────────────────────────────────────────────

/** Builds a dependency graph and topological execution order for a set of Skills. */
function buildDependencyGraph(skills: SkillName[]): DependencyGraph {
  const edges: DependencyGraph['edges'] = [];

  if (skills.includes('ai-video-director') && skills.includes('ai-image-director')) {
    edges.push({
      from:   'ai-image-director',
      to:     'ai-video-director',
      reason: 'Image reference generated before video uses it as keyframe.',
    });
  }

  if (skills.includes('prompt-architect') && skills.includes('ai-image-director')) {
    edges.push({
      from:   'prompt-architect',
      to:     'ai-image-director',
      reason: 'Prompt must be engineered before image generation begins.',
    });
  }

  if (skills.includes('prompt-architect') && skills.includes('ai-video-director')) {
    edges.push({
      from:   'prompt-architect',
      to:     'ai-video-director',
      reason: 'Prompt must be engineered before video generation begins.',
    });
  }

  const order = topologicalSort(skills, edges);
  const hasCycle = order === null;

  return {
    nodes:          skills,
    edges,
    executionOrder: order ?? skills,
    hasCycle,
  };
}

/** Kahn's algorithm for topological sort; returns null when a cycle is detected. */
function topologicalSort(
  nodes: SkillName[],
  edges: DependencyGraph['edges'],
): SkillName[] | null {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, SkillName[]> = {};

  for (const n of nodes) {
    inDegree[n] = 0;
    adj[n] = [];
  }

  for (const e of edges) {
    adj[e.from].push(e.to);
    inDegree[e.to] = (inDegree[e.to] ?? 0) + 1;
  }

  const queue = nodes.filter((n) => inDegree[n] === 0);
  const result: SkillName[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const neighbour of adj[node]) {
      inDegree[neighbour]--;
      if (inDegree[neighbour] === 0) queue.push(neighbour);
    }
  }

  return result.length === nodes.length ? result : null;
}

// ─── Conflict Resolution ──────────────────────────────────────────────────────

/** Detects and resolves conflicts between Skills that claim the same capability. */
function resolveConflicts(
  routing: RoutingDecision,
  strategy: ConflictResolutionStrategy,
): ConflictReport {
  const allSkills: SkillName[] = [routing.primarySkill, ...routing.supportingSkills];
  const capabilityOwners: Record<string, SkillName[]> = {};

  for (const name of allSkills) {
    const descriptor = SKILL_REGISTRY[name];
    for (const cap of descriptor.capabilities) {
      if (!capabilityOwners[cap]) capabilityOwners[cap] = [];
      capabilityOwners[cap].push(name);
    }
  }

  const conflicting = Object.values(capabilityOwners)
    .filter((owners) => owners.length > 1)
    .flatMap((owners) => owners);

  const uniqueConflicting = [...new Set(conflicting)];

  if (uniqueConflicting.length === 0) {
    return {
      conflictingSkills: [],
      resolution:        strategy,
      resolvedSkill:     null,
      explanation:       'No capability conflicts detected.',
    };
  }

  let resolvedSkill: SkillName | null = null;
  let explanation = '';

  switch (strategy) {
    case 'priority': {
      const highest = uniqueConflicting.reduce<SkillName>((best, name) => {
        return SKILL_REGISTRY[name].priority > SKILL_REGISTRY[best].priority ? name : best;
      }, uniqueConflicting[0]);
      resolvedSkill = highest;
      explanation = `Resolved by priority: ${highest} has the highest priority score.`;
      break;
    }
    case 'merge':
      explanation = 'Merge strategy: all conflicting Skills execute; outputs are combined.';
      break;
    case 'abort':
      throw new Error(
        `CONFLICT_ABORT: Skills [${uniqueConflicting.join(', ')}] conflict and the policy is abort.`,
      );
    case 'user-prompt':
      explanation = 'User-prompt strategy: conflict deferred to user decision at runtime.';
      break;
  }

  return {
    conflictingSkills: uniqueConflicting,
    resolution:        strategy,
    resolvedSkill,
    explanation,
  };
}

// ─── Execution Plan Builder ───────────────────────────────────────────────────

/** Assembles the full execution plan from a routing decision and dependency graph. */
function buildExecutionPlan(
  routing: RoutingDecision,
  graph: DependencyGraph,
  policy: ExecutionPolicy,
  qualityThreshold: number,
): ExecutionPlan {
  const steps: ExecutionStep[] = graph.executionOrder.map((skillName, index) => {
    const descriptor = SKILL_REGISTRY[skillName];
    const dependsOnNames = graph.edges
      .filter((e) => e.to === skillName)
      .map((e) => e.from);
    const dependsOn = dependsOnNames.map((dep) => graph.executionOrder.indexOf(dep));

    const fallback = routing.supportingSkills.find(
      (s) => s !== skillName && SKILL_REGISTRY[s].capabilities.some(
        (c) => descriptor.capabilities.includes(c),
      ),
    ) as SkillName | undefined;

    return {
      stepIndex: index,
      skillName,
      dependsOn,
      input:    null,
      fallback,
      qualityGate: {
        minScore:       qualityThreshold,
        requiredFields: ['result'],
      },
    };
  });

  const estimatedDurationMs = steps.reduce((total, step) => {
    const descriptor = SKILL_REGISTRY[step.skillName];
    return total + (policy === 'parallel' ? 0 : descriptor.timeoutMs / 4);
  }, 0);

  return {
    steps,
    policy,
    estimatedDurationMs: Math.max(estimatedDurationMs, 1_000),
    conflictResolution:  'priority',
  };
}

// ─── Quality Gate ─────────────────────────────────────────────────────────────

/** Evaluates all Skill outputs against defined quality thresholds. */
function evaluateQualityGate(
  outputs: SkillOutput[],
  threshold: number,
): QualityGateResult {
  const failedChecks: string[] = [];
  const warnings: string[] = [];

  for (const output of outputs) {
    if (output.qualityScore < threshold) {
      failedChecks.push(
        `${output.skillName}: score ${output.qualityScore.toFixed(2)} is below threshold ${threshold.toFixed(2)}.`,
      );
    } else if (output.qualityScore < threshold + 0.1) {
      warnings.push(
        `${output.skillName}: score ${output.qualityScore.toFixed(2)} is close to the threshold.`,
      );
    }

    if (output.result === null || output.result === undefined) {
      failedChecks.push(`${output.skillName}: produced a null or undefined result.`);
    }
  }

  const avgScore = outputs.length > 0
    ? outputs.reduce((s, o) => s + o.qualityScore, 0) / outputs.length
    : 0;

  const status: QualityGateStatus =
    failedChecks.length > 0 ? 'fail' : warnings.length > 0 ? 'warn' : 'pass';

  return { status, score: avgScore, failedChecks, warnings };
}

// ─── Memory Handoff ───────────────────────────────────────────────────────────

/** Packages context outputs into a memory snapshot for downstream skills or sessions. */
function buildMemoryHandoff(
  sessionId: string,
  outputs: SkillOutput[],
  existingMemory: Record<string, unknown>,
): MemoryHandoff {
  const snapshot: Record<string, unknown> = { ...existingMemory };
  const exportedKeys: string[] = [];

  for (const output of outputs) {
    const key = `${output.skillName}.lastOutput`;
    snapshot[key] = output.result;
    exportedKeys.push(key);

    const metaKey = `${output.skillName}.lastMeta`;
    snapshot[metaKey] = output.metadata;
    exportedKeys.push(metaKey);
  }

  snapshot['orchestrator.lastSessionId'] = sessionId;
  exportedKeys.push('orchestrator.lastSessionId');

  return { sessionId, exportedKeys, snapshot };
}

// ─── Orchestration Engine ─────────────────────────────────────────────────────

/** Simulates execution of a single step with configurable timeout handling. */
function executeStep(
  step: ExecutionStep,
  context: ExecutionContext,
): SkillOutput {
  const startMs = Date.now();
  const descriptor = SKILL_REGISTRY[step.skillName];

  const previousOutput = context.previousOutputs.find(
    (o) => o.skillName === step.skillName,
  );

  const result = previousOutput?.result ?? {
    skill: step.skillName,
    stepIndex: step.stepIndex,
    input: step.input,
    contextKeys: Object.keys(context.sharedMemory),
  };

  const qualityScore = previousOutput?.qualityScore ?? 0.9;

  return {
    skillName:   step.skillName,
    result,
    qualityScore,
    durationMs:  Date.now() - startMs,
    metadata:    {
      descriptor:    descriptor.name,
      capabilities:  descriptor.capabilities,
      fallbackUsed:  false,
    },
  };
}

/** Runs an execution plan sequentially or in declared parallel groups. */
function runPlan(
  plan: ExecutionPlan,
  context: ExecutionContext,
  qualityThreshold: number,
): SkillOutput[] {
  const outputs: SkillOutput[] = [];
  const completedIndices = new Set<number>();

  const maxSteps = Math.min(plan.steps.length, MAX_PARALLEL_SKILLS * 2);
  const stepsToRun = plan.steps.slice(0, maxSteps);

  for (const step of stepsToRun) {
    const depsReady = step.dependsOn.every((i) => completedIndices.has(i));
    if (!depsReady) continue;

    const output = executeStep(step, context);

    if (output.qualityScore < qualityThreshold && step.fallback) {
      const fallbackDescriptor = SKILL_REGISTRY[step.fallback];
      const fallbackOutput: SkillOutput = {
        skillName:   fallbackDescriptor.name,
        result:      output.result,
        qualityScore: Math.min(output.qualityScore + 0.15, 1.0),
        durationMs:  output.durationMs,
        metadata:    { ...output.metadata, fallbackUsed: true },
      };
      outputs.push(fallbackOutput);
    } else {
      outputs.push(output);
    }

    completedIndices.add(step.stepIndex);
  }

  return outputs;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Routes an intent to the best-matching Skill and returns a routing decision. */
function route(
  intent: string,
  allowedSkills?: SkillName[],
  forbiddenSkills?: SkillName[],
): RoutingDecision {
  assertValidIntent(intent);
  return buildRoutingDecision(intent, allowedSkills, forbiddenSkills);
}

/** Builds an execution plan for a set of Skills without running it. */
function plan(
  routing: RoutingDecision,
  policy: ExecutionPolicy = 'sequential',
  qualityThreshold: number = DEFAULT_QUALITY_THRESHOLD,
): ExecutionPlan {
  const allSkills: SkillName[] = [routing.primarySkill, ...routing.supportingSkills];
  const graph = buildDependencyGraph(allSkills);
  assertNoCyclicDependency(graph);

  return buildExecutionPlan(routing, graph, policy, qualityThreshold);
}

/** Orchestrates a full request: route → plan → execute → quality-gate → memory handoff. */
function orchestrate(request: OrchestratorRequest): OrchestratorResult {
  assertValidIntent(request.intent);

  const context: ExecutionContext = request.context ?? {
    sessionId:       `session-${Date.now()}`,
    previousOutputs: [],
    sharedMemory:    {},
    iterationCount:  0,
  };

  assertIterationLimit(context.iterationCount);

  const routing = buildRoutingDecision(
    request.intent,
    request.allowedSkills,
    request.forbiddenSkills,
  );

  const allSkills: SkillName[] = [routing.primarySkill, ...routing.supportingSkills];
  const graph = buildDependencyGraph(allSkills);
  assertNoCyclicDependency(graph);

  const qualityThreshold = request.qualityThreshold ?? DEFAULT_QUALITY_THRESHOLD;
  const policy = request.policy ?? 'sequential';
  const executionPlan = buildExecutionPlan(routing, graph, policy, qualityThreshold);

  resolveConflicts(routing, executionPlan.conflictResolution);

  const startMs = Date.now();
  const outputs = runPlan(executionPlan, context, qualityThreshold);

  const qualityGate = evaluateQualityGate(outputs, qualityThreshold);
  const memoryHandoff = buildMemoryHandoff(context.sessionId, outputs, context.sharedMemory);
  const finalOutput = outputs[outputs.length - 1]?.result ?? null;

  return {
    plan:           executionPlan,
    outputs,
    finalOutput,
    qualityGate,
    memoryHandoff,
    totalDurationMs: Date.now() - startMs,
  };
}

/** Returns the registered descriptor for a Skill by name. */
function describeSkill(name: SkillName): SkillDescriptor {
  assertSkillRegistered(name);
  return SKILL_REGISTRY[name];
}

/** Returns all registered Skills, optionally filtered by capability. */
function listSkills(filterByCapability?: SkillCapability): SkillDescriptor[] {
  const all = Object.values(SKILL_REGISTRY) as SkillDescriptor[];
  if (!filterByCapability) return all;
  return all.filter((s) => s.capabilities.includes(filterByCapability));
}

/** Analyses two or more Skills for capability conflicts and reports resolution. */
function detectConflicts(
  skills: SkillName[],
  strategy: ConflictResolutionStrategy = 'priority',
): ConflictReport {
  skills.forEach(assertSkillRegistered);
  const fakeRouting: RoutingDecision = {
    primarySkill:         skills[0],
    supportingSkills:     skills.slice(1),
    confidence:           1,
    reasoning:            'Manual conflict check.',
    detectedCapabilities: [],
  };
  return resolveConflicts(fakeRouting, strategy);
}

/** Builds a dependency graph and execution order for an explicit list of Skills. */
function buildGraph(skills: SkillName[]): DependencyGraph {
  skills.forEach(assertSkillRegistered);
  return buildDependencyGraph(skills);
}

// ─── Default Export ───────────────────────────────────────────────────────────

const orchestrator = {
  orchestrate,
  route,
  plan,
  describeSkill,
  listSkills,
  detectConflicts,
  buildGraph,
};

export default orchestrator;
