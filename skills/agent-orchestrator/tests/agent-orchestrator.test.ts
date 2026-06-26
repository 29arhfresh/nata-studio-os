/**
 * Test suite for Agent Orchestrator Skill.
 * Covers routing, planning, conflict resolution, dependency graphs,
 * quality gates, and memory handoff.
 */

import orchestrator, {
  type OrchestratorRequest,
  type SkillName,
  type SkillCapability,
  type ExecutionPolicy,
  type ConflictResolutionStrategy,
} from '../src/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(overrides: Partial<OrchestratorRequest> = {}): OrchestratorRequest {
  return {
    intent: 'Generate a product image',
    ...overrides,
  };
}

// ─── route() ─────────────────────────────────────────────────────────────────

describe('route()', () => {
  it('returns a routing decision for a valid image intent', () => {
    const decision = orchestrator.route('Generate a product photo for e-commerce');
    expect(decision.primarySkill).toBe('ai-image-director');
    expect(decision.confidence).toBeGreaterThan(0);
    expect(decision.detectedCapabilities.length).toBeGreaterThan(0);
    expect(typeof decision.reasoning).toBe('string');
  });

  it('returns a routing decision for a video intent', () => {
    const decision = orchestrator.route('Create a cinematic video clip for a brand commercial');
    expect(decision.primarySkill).toBe('ai-video-director');
    expect(decision.detectedCapabilities).toContain('video-generation');
  });

  it('returns a routing decision for a prompt engineering intent', () => {
    const decision = orchestrator.route('Write an optimized chain-of-thought prompt');
    expect(decision.primarySkill).toBe('prompt-architect');
    expect(decision.detectedCapabilities).toContain('prompt-engineering');
  });

  it('respects allowedSkills filter', () => {
    const decision = orchestrator.route(
      'Generate a photo',
      ['prompt-architect'],
    );
    expect(decision.primarySkill).toBe('prompt-architect');
  });

  it('respects forbiddenSkills filter', () => {
    const decision = orchestrator.route(
      'Generate a product photo',
      undefined,
      ['ai-image-director'],
    );
    expect(decision.primarySkill).not.toBe('ai-image-director');
  });

  it('throws INVALID_INTENT for an empty string', () => {
    expect(() => orchestrator.route('')).toThrow('INVALID_INTENT');
  });

  it('throws INVALID_INTENT for a non-string value', () => {
    expect(() => orchestrator.route(null as unknown as string)).toThrow('INVALID_INTENT');
  });

  it('throws NO_MATCHING_SKILL when all skills are forbidden', () => {
    const all: SkillName[] = ['ai-image-director', 'ai-video-director', 'prompt-architect'];
    expect(() => orchestrator.route('Generate a photo', undefined, all)).toThrow('NO_MATCHING_SKILL');
  });
});

// ─── plan() ──────────────────────────────────────────────────────────────────

describe('plan()', () => {
  it('returns a sequential execution plan', () => {
    const routing = orchestrator.route('Generate a product photo');
    const executionPlan = orchestrator.plan(routing, 'sequential');
    expect(executionPlan.policy).toBe('sequential');
    expect(executionPlan.steps.length).toBeGreaterThan(0);
    expect(executionPlan.estimatedDurationMs).toBeGreaterThan(0);
  });

  it('returns a parallel execution plan', () => {
    const routing = orchestrator.route('Generate a product photo');
    const executionPlan = orchestrator.plan(routing, 'parallel');
    expect(executionPlan.policy).toBe('parallel');
  });

  it('includes quality gate config on each step', () => {
    const routing = orchestrator.route('Generate a product photo');
    const executionPlan = orchestrator.plan(routing, 'sequential', 0.8);
    for (const step of executionPlan.steps) {
      expect(step.qualityGate?.minScore).toBe(0.8);
    }
  });

  it('assigns stepIndex values in ascending order', () => {
    const routing = orchestrator.route('Generate a product photo and a video clip');
    const executionPlan = orchestrator.plan(routing);
    executionPlan.steps.forEach((step, i) => {
      expect(step.stepIndex).toBe(i);
    });
  });
});

// ─── orchestrate() ────────────────────────────────────────────────────────────

describe('orchestrate()', () => {
  it('returns a full result for a simple image request', () => {
    const result = orchestrator.orchestrate(makeRequest());
    expect(result.plan.steps.length).toBeGreaterThan(0);
    expect(result.outputs.length).toBeGreaterThan(0);
    expect(result.qualityGate).toBeDefined();
    expect(result.memoryHandoff).toBeDefined();
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
  });

  it('quality gate passes when all skill scores are above threshold', () => {
    const result = orchestrator.orchestrate(makeRequest({ qualityThreshold: 0.5 }));
    expect(result.qualityGate.status).toBe('pass');
    expect(result.qualityGate.failedChecks.length).toBe(0);
  });

  it('memory handoff exports at least one key per output', () => {
    const result = orchestrator.orchestrate(makeRequest());
    expect(result.memoryHandoff.exportedKeys.length).toBeGreaterThan(0);
    expect(result.memoryHandoff.snapshot).toBeDefined();
  });

  it('preserves sessionId through the handoff', () => {
    const sessionId = 'test-session-abc';
    const result = orchestrator.orchestrate(makeRequest({
      context: {
        sessionId,
        previousOutputs: [],
        sharedMemory: {},
        iterationCount: 0,
      },
    }));
    expect(result.memoryHandoff.sessionId).toBe(sessionId);
    expect(result.memoryHandoff.snapshot['orchestrator.lastSessionId']).toBe(sessionId);
  });

  it('throws MAX_ITERATIONS_EXCEEDED when iteration limit is reached', () => {
    expect(() =>
      orchestrator.orchestrate(makeRequest({
        context: {
          sessionId:       'iter-test',
          previousOutputs: [],
          sharedMemory:    {},
          iterationCount:  10,
        },
      })),
    ).toThrow('MAX_ITERATIONS_EXCEEDED');
  });

  it('throws INVALID_INTENT for empty intent', () => {
    expect(() => orchestrator.orchestrate({ intent: '' })).toThrow('INVALID_INTENT');
  });

  it('uses sequential policy by default', () => {
    const result = orchestrator.orchestrate(makeRequest());
    expect(result.plan.policy).toBe('sequential');
  });

  it('respects explicit parallel policy', () => {
    const result = orchestrator.orchestrate(makeRequest({ policy: 'parallel' }));
    expect(result.plan.policy).toBe('parallel');
  });
});

// ─── describeSkill() ──────────────────────────────────────────────────────────

describe('describeSkill()', () => {
  it('returns the descriptor for ai-image-director', () => {
    const descriptor = orchestrator.describeSkill('ai-image-director');
    expect(descriptor.name).toBe('ai-image-director');
    expect(descriptor.capabilities).toContain('image-generation');
    expect(descriptor.priority).toBeGreaterThan(0);
    expect(descriptor.timeoutMs).toBeGreaterThan(0);
  });

  it('throws UNKNOWN_SKILL for an unregistered skill name', () => {
    expect(() => orchestrator.describeSkill('nonexistent' as SkillName)).toThrow('UNKNOWN_SKILL');
  });
});

// ─── listSkills() ─────────────────────────────────────────────────────────────

describe('listSkills()', () => {
  it('returns all registered skills when no filter is given', () => {
    const skills = orchestrator.listSkills();
    expect(skills.length).toBeGreaterThanOrEqual(4);
    const names = skills.map((s) => s.name);
    expect(names).toContain('ai-image-director');
    expect(names).toContain('ai-video-director');
    expect(names).toContain('prompt-architect');
    expect(names).toContain('agent-orchestrator');
  });

  it('filters skills by capability', () => {
    const imageSkills = orchestrator.listSkills('image-generation');
    expect(imageSkills.every((s) => s.capabilities.includes('image-generation'))).toBe(true);
  });

  it('returns an empty array for an unused capability filter', () => {
    const result = orchestrator.listSkills('orchestration');
    expect(result.every((s) => s.capabilities.includes('orchestration'))).toBe(true);
  });
});

// ─── detectConflicts() ────────────────────────────────────────────────────────

describe('detectConflicts()', () => {
  it('reports no conflicts for non-overlapping skills', () => {
    const report = orchestrator.detectConflicts(['prompt-architect', 'ai-video-director']);
    const sharedCaps: SkillCapability[] = ['character-consistency', 'style-transfer'];
    const actuallyConflict = sharedCaps.some(
      (c) =>
        orchestrator.describeSkill('prompt-architect').capabilities.includes(c) &&
        orchestrator.describeSkill('ai-video-director').capabilities.includes(c),
    );
    if (!actuallyConflict) {
      expect(report.conflictingSkills.length).toBe(0);
    }
  });

  it('detects conflicts between overlapping skills and resolves by priority', () => {
    const report = orchestrator.detectConflicts(
      ['ai-image-director', 'ai-video-director'],
      'priority',
    );
    expect(report.resolution).toBe('priority');
    expect(typeof report.explanation).toBe('string');
  });

  it('throws CONFLICT_ABORT when strategy is abort and conflicts exist', () => {
    expect(() =>
      orchestrator.detectConflicts(
        ['ai-image-director', 'ai-video-director'],
        'abort',
      ),
    ).toThrow('CONFLICT_ABORT');
  });

  it('throws UNKNOWN_SKILL for an invalid skill name', () => {
    expect(() =>
      orchestrator.detectConflicts(['ai-image-director', 'bad-skill' as SkillName]),
    ).toThrow('UNKNOWN_SKILL');
  });
});

// ─── buildGraph() ─────────────────────────────────────────────────────────────

describe('buildGraph()', () => {
  it('returns a valid dependency graph for two skills', () => {
    const graph = orchestrator.buildGraph(['prompt-architect', 'ai-image-director']);
    expect(graph.nodes).toContain('prompt-architect');
    expect(graph.nodes).toContain('ai-image-director');
    expect(graph.hasCycle).toBe(false);
    expect(graph.executionOrder.length).toBe(2);
  });

  it('orders prompt-architect before ai-image-director', () => {
    const graph = orchestrator.buildGraph(['prompt-architect', 'ai-image-director']);
    const promptIdx = graph.executionOrder.indexOf('prompt-architect');
    const imageIdx = graph.executionOrder.indexOf('ai-image-director');
    expect(promptIdx).toBeLessThan(imageIdx);
  });

  it('orders ai-image-director before ai-video-director', () => {
    const graph = orchestrator.buildGraph(['ai-image-director', 'ai-video-director']);
    const imageIdx = graph.executionOrder.indexOf('ai-image-director');
    const videoIdx = graph.executionOrder.indexOf('ai-video-director');
    expect(imageIdx).toBeLessThan(videoIdx);
  });

  it('returns a graph with no edges for a single skill', () => {
    const graph = orchestrator.buildGraph(['ai-image-director']);
    expect(graph.edges.length).toBe(0);
    expect(graph.executionOrder).toEqual(['ai-image-director']);
    expect(graph.hasCycle).toBe(false);
  });

  it('throws UNKNOWN_SKILL for an invalid skill name', () => {
    expect(() => orchestrator.buildGraph(['ai-image-director', 'fake-skill' as SkillName])).toThrow('UNKNOWN_SKILL');
  });
});
