/**
 * Test suite for Agent Orchestrator 2.0.
 *
 * Testing strategy:
 *   — CapabilityRegistry and SkillInvoker are always constructed fresh per
 *     describe block to prevent cross-test state leakage.
 *   — SkillInvoker handlers are stubs that return deterministic InvocationOutcome
 *     values; no actual skills are imported or executed.
 *   — orchestrate() is tested with and without registered handlers to validate
 *     both the happy path and the error-result path.
 *   — Quality gate and memory handoff are tested against the outputs produced
 *     by stub handlers, verifying the pipeline end-to-end.
 */

import AgentOrchestratorV2, {
  type OrchestratorV2Request,
  type CapabilityPlan,
} from '../src/index';

import { CapabilityRegistry } from '../../../integration/src/capability-registry';
import { SkillInvoker } from '../../../integration/src/skill-invoker';
import { seedDefaultRegistrations } from '../../../integration/src/seed';
import type { InvocationContext, InvocationOutcome, SkillCapability } from '../../../integration/src/types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeRegistry(): CapabilityRegistry {
  const registry = new CapabilityRegistry();
  seedDefaultRegistrations(registry);
  return registry;
}

function makeInvoker(registry: CapabilityRegistry): SkillInvoker {
  return new SkillInvoker(registry);
}

/** Stub handler that always succeeds with the given output. */
function successHandler(output: unknown, qualityScore = 0.9) {
  return async (_input: unknown, _ctx: InvocationContext): Promise<InvocationOutcome> => ({
    output,
    qualityScore,
    metadata: { stub: true },
  });
}

/** Stub handler that always returns a low quality score. */
function lowQualityHandler(output: unknown) {
  return successHandler(output, 0.4);
}

/** Stub handler that throws an error. */
function failingHandler(message = 'simulated failure') {
  return async (): Promise<InvocationOutcome> => {
    throw new Error(message);
  };
}

function makeOrchestrator(registry: CapabilityRegistry, invoker: SkillInvoker) {
  return new AgentOrchestratorV2(registry, invoker);
}

function makeRequest(overrides: Partial<OrchestratorV2Request> = {}): OrchestratorV2Request {
  return {
    intent: 'Generate a product image for our brand campaign',
    ...overrides,
  };
}

// ─── CapabilityRegistry ───────────────────────────────────────────────────────

describe('CapabilityRegistry', () => {
  let registry: CapabilityRegistry;

  beforeEach(() => { registry = makeRegistry(); });

  it('seeds all seven built-in skills', () => {
    expect(registry.size()).toBe(7);
  });

  it('resolves image-generation to ai-image-director', () => {
    const [best] = registry.resolve('image-generation');
    expect(best.name).toBe('ai-image-director');
  });

  it('resolves brand-strategy to creative-director', () => {
    const [best] = registry.resolve('brand-strategy');
    expect(best.name).toBe('creative-director');
  });

  it('resolves candidates in descending priority order', () => {
    const results = registry.resolve('character-consistency');
    const priorities = results.map((r) => r.priority);
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i - 1]).toBeGreaterThanOrEqual(priorities[i]);
    }
  });

  it('returns an empty array for an unregistered capability', () => {
    expect(registry.resolve('orchestration')).toHaveLength(0);
  });

  it('resolveMany returns entries for each requested capability', () => {
    const caps: SkillCapability[] = ['image-generation', 'brand-strategy'];
    const result = registry.resolveMany(caps);
    expect(result.has('image-generation')).toBe(true);
    expect(result.has('brand-strategy')).toBe(true);
  });

  it('find returns the skill registration by name', () => {
    const reg = registry.find('project-manager');
    expect(reg).toBeDefined();
    expect(reg!.capabilities).toContain('project-planning');
  });

  it('find returns undefined for an unknown skill', () => {
    expect(registry.find('nonexistent')).toBeUndefined();
  });

  it('has returns true for a registered skill', () => {
    expect(registry.has('memory-system')).toBe(true);
  });

  it('unregister removes the skill', () => {
    registry.unregister('memory-system');
    expect(registry.has('memory-system')).toBe(false);
  });

  it('register overwrites an existing entry', () => {
    registry.register({
      name: 'ai-image-director',
      version: '9.9.9',
      capabilities: ['image-generation'],
      priority: 99,
      maxConcurrency: 1,
      timeoutMs: 1_000,
      requiresContext: false,
    });
    const reg = registry.find('ai-image-director');
    expect(reg!.version).toBe('9.9.9');
    expect(reg!.priority).toBe(99);
  });

  it('register throws on empty skill name', () => {
    expect(() =>
      registry.register({
        name: '',
        version: '1.0.0',
        capabilities: ['image-generation'],
        priority: 50,
        maxConcurrency: 1,
        timeoutMs: 1_000,
        requiresContext: false,
      }),
    ).toThrow('REGISTRY_INVALID');
  });

  it('register throws when no capabilities declared', () => {
    expect(() =>
      registry.register({
        name: 'empty-skill',
        version: '1.0.0',
        capabilities: [],
        priority: 50,
        maxConcurrency: 1,
        timeoutMs: 1_000,
        requiresContext: false,
      }),
    ).toThrow('REGISTRY_INVALID');
  });

  it('register throws when priority is out of range', () => {
    expect(() =>
      registry.register({
        name: 'bad-priority',
        version: '1.0.0',
        capabilities: ['image-generation'],
        priority: 150,
        maxConcurrency: 1,
        timeoutMs: 1_000,
        requiresContext: false,
      }),
    ).toThrow('REGISTRY_INVALID');
  });

  it('capabilities() returns the union of all declared capabilities', () => {
    const caps = registry.capabilities();
    expect(caps).toContain('image-generation');
    expect(caps).toContain('brand-strategy');
    expect(caps).toContain('project-planning');
  });
});

// ─── SkillInvoker ─────────────────────────────────────────────────────────────

describe('SkillInvoker', () => {
  let registry: CapabilityRegistry;
  let invoker: SkillInvoker;

  beforeEach(() => {
    registry = makeRegistry();
    invoker = makeInvoker(registry);
  });

  it('returns an error result for an unregistered skill', async () => {
    const result = await invoker.invoke({ skillName: 'ghost-skill', input: {} });
    expect(result.error).toMatch('UNKNOWN_SKILL');
    expect(result.qualityScore).toBe(0);
  });

  it('returns an error result when a handler is missing', async () => {
    const result = await invoker.invoke({ skillName: 'ai-image-director', input: {} });
    expect(result.error).toMatch('NO_HANDLER');
    expect(result.qualityScore).toBe(0);
  });

  it('invokes a registered handler and returns its output', async () => {
    invoker.registerHandler('ai-image-director', successHandler({ url: 'http://example.com/img.png' }));
    const result = await invoker.invoke({
      skillName: 'ai-image-director',
      input: { prompt: 'a red apple' },
    });
    expect(result.error).toBeUndefined();
    expect(result.output).toEqual({ url: 'http://example.com/img.png' });
    expect(result.qualityScore).toBe(0.9);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('uses qualityScore from the handler outcome', async () => {
    invoker.registerHandler('ai-image-director', successHandler({}, 0.75));
    const result = await invoker.invoke({ skillName: 'ai-image-director', input: {} });
    expect(result.qualityScore).toBe(0.75);
  });

  it('returns an error result when a handler throws', async () => {
    invoker.registerHandler('ai-image-director', failingHandler('network error'));
    const result = await invoker.invoke({ skillName: 'ai-image-director', input: {} });
    expect(result.error).toMatch('network error');
    expect(result.qualityScore).toBe(0);
  });

  it('invokes by capability and returns the best-priority handler', async () => {
    invoker.registerHandler('ai-image-director', successHandler({ url: 'img.png' }));
    const result = await invoker.invokeByCapability('image-generation', { prompt: 'apple' });
    expect(result.skillName).toBe('ai-image-director');
    expect(result.error).toBeUndefined();
  });

  it('returns error when no handler supports the capability', async () => {
    const result = await invoker.invokeByCapability('image-generation', {});
    expect(result.error).toMatch('NO_CAPABLE_SKILL');
  });

  it('falls back to next candidate if first handler fails', async () => {
    registry.register({
      name: 'image-backup',
      version: '1.0.0',
      capabilities: ['image-generation'],
      priority: 50,
      maxConcurrency: 1,
      timeoutMs: 5_000,
      requiresContext: false,
    });
    invoker.registerHandler('ai-image-director', failingHandler('primary down'));
    invoker.registerHandler('image-backup', successHandler({ url: 'backup.png' }));
    const result = await invoker.invokeByCapability('image-generation', {});
    expect(result.skillName).toBe('image-backup');
    expect(result.output).toEqual({ url: 'backup.png' });
  });

  it('respects timeoutMs override and returns error on timeout', async () => {
    invoker.registerHandler('ai-image-director', async () => {
      await new Promise((r) => setTimeout(r, 200));
      return { output: 'late', qualityScore: 0.9 };
    });
    const result = await invoker.invoke({
      skillName: 'ai-image-director',
      input: {},
      timeoutMs: 50,
    });
    expect(result.error).toMatch('SKILL_TIMEOUT');
  });

  it('hasHandler returns true after registration', () => {
    invoker.registerHandler('ai-image-director', successHandler({}));
    expect(invoker.hasHandler('ai-image-director')).toBe(true);
  });

  it('hasHandler returns false before registration', () => {
    expect(invoker.hasHandler('ai-image-director')).toBe(false);
  });
});

// ─── AgentOrchestratorV2.planByCapability() ──────────────────────────────────

describe('AgentOrchestratorV2.planByCapability()', () => {
  let registry: CapabilityRegistry;
  let invoker: SkillInvoker;
  let orchestrator: AgentOrchestratorV2;

  beforeEach(() => {
    registry = makeRegistry();
    invoker = makeInvoker(registry);
    orchestrator = makeOrchestrator(registry, invoker);
  });

  it('detects image-generation from an image intent', () => {
    const plan = orchestrator.planByCapability('Generate a product photo');
    expect(plan.detectedCapabilities).toContain('image-generation');
  });

  it('assigns ai-image-director for image-generation', () => {
    const plan = orchestrator.planByCapability('Generate a product photo');
    const assignment = plan.capabilityAssignment.get('image-generation');
    expect(assignment?.name).toBe('ai-image-director');
  });

  it('detects brand-strategy from a brand intent', () => {
    const plan = orchestrator.planByCapability('Create a creative brief for our brand campaign');
    expect(plan.detectedCapabilities).toContain('brand-strategy');
  });

  it('orders creative-director before ai-image-director when both are needed', () => {
    const plan = orchestrator.planByCapability(
      'Create a brand brief then generate images for the campaign',
    );
    const names = plan.skillSequence.map((s) => s.name);
    const cdIndex = names.indexOf('creative-director');
    const imgIndex = names.indexOf('ai-image-director');
    if (cdIndex >= 0 && imgIndex >= 0) {
      expect(cdIndex).toBeLessThan(imgIndex);
    }
  });

  it('deduplicates skills that cover multiple detected capabilities', () => {
    const plan = orchestrator.planByCapability(
      'Generate image and edit image and upscale image',
    );
    const names = plan.skillSequence.map((s) => s.name);
    const unique = new Set(names);
    expect(names.length).toBe(unique.size);
  });

  it('throws INVALID_INTENT for an empty string', () => {
    expect(() => orchestrator.planByCapability('')).toThrow('INVALID_INTENT');
  });

  it('throws INVALID_INTENT for a non-string', () => {
    expect(() => orchestrator.planByCapability(null as unknown as string)).toThrow('INVALID_INTENT');
  });

  it('throws NO_CAPABILITIES_DETECTED for an unrecognisable intent', () => {
    expect(() => orchestrator.planByCapability('xxxxxxxxxxxxxxx')).toThrow('NO_CAPABILITIES_DETECTED');
  });

  it('throws NO_MATCHING_SKILL when all skills for detected caps are forbidden', () => {
    expect(() =>
      orchestrator.planByCapability(
        'Generate a product photo',
        undefined,
        ['ai-image-director'],
      ),
    ).toThrow();
  });

  it('respects allowedSkills filter', () => {
    // Use an intent whose detected capability (prompt-engineering) is covered
    // by prompt-architect so the filter does not result in an empty assignment.
    const plan = orchestrator.planByCapability(
      'Write an optimized chain-of-thought prompt for the campaign',
      ['prompt-architect'],
    );
    const names = plan.skillSequence.map((s) => s.name);
    expect(names).toContain('prompt-architect');
    names.forEach((n) => expect(n).toBe('prompt-architect'));
  });

  it('includes a human-readable reasoning string', () => {
    const plan = orchestrator.planByCapability('Generate a product photo');
    expect(typeof plan.reasoning).toBe('string');
    expect(plan.reasoning.length).toBeGreaterThan(0);
  });

  it('confidence is between 0 and 1', () => {
    const plan = orchestrator.planByCapability('Generate a product photo');
    expect(plan.confidence).toBeGreaterThan(0);
    expect(plan.confidence).toBeLessThanOrEqual(1);
  });
});

// ─── AgentOrchestratorV2.orchestrate() ───────────────────────────────────────

describe('AgentOrchestratorV2.orchestrate()', () => {
  let registry: CapabilityRegistry;
  let invoker: SkillInvoker;
  let orchestrator: AgentOrchestratorV2;

  beforeEach(() => {
    registry = makeRegistry();
    invoker = makeInvoker(registry);
    orchestrator = makeOrchestrator(registry, invoker);
    // Register stub handlers for all seeded skills.
    invoker.registerHandler('ai-image-director', successHandler({ url: 'img.png' }));
    invoker.registerHandler('ai-video-director', successHandler({ url: 'vid.mp4' }));
    invoker.registerHandler('creative-director', successHandler({ brief: 'brand brief' }));
    invoker.registerHandler('prompt-architect', successHandler({ prompt: 'built prompt' }));
    invoker.registerHandler('knowledge-manager', successHandler({ context: 'knowledge ctx' }));
    invoker.registerHandler('memory-system', successHandler({ stored: true }));
    invoker.registerHandler('project-manager', successHandler({ projectId: 'prj-1' }));
  });

  it('returns a full result for an image intent', async () => {
    const result = await orchestrator.orchestrate(makeRequest());
    expect(result.capabilityPlan.skillSequence.length).toBeGreaterThan(0);
    expect(result.invocationResults.length).toBeGreaterThan(0);
    expect(result.workflowResult).toBeDefined();
    expect(result.qualityGate).toBeDefined();
    expect(result.memoryHandoff).toBeDefined();
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
  });

  it('quality gate passes when all handler scores are above threshold', async () => {
    const result = await orchestrator.orchestrate(makeRequest({ qualityThreshold: 0.5 }));
    expect(result.qualityGate.status).toBe('pass');
    expect(result.qualityGate.failedChecks).toHaveLength(0);
  });

  it('quality gate fails when scores are below threshold', async () => {
    invoker.registerHandler('ai-image-director', lowQualityHandler({ url: 'img.png' }));
    const result = await orchestrator.orchestrate(
      makeRequest({ qualityThreshold: 0.8, forbiddenSkills: ['creative-director', 'prompt-architect', 'knowledge-manager', 'memory-system'] }),
    );
    expect(result.qualityGate.status).toBe('fail');
    expect(result.qualityGate.failedChecks.length).toBeGreaterThan(0);
  });

  it('memory handoff exports at least one key per invocation result', async () => {
    const result = await orchestrator.orchestrate(makeRequest());
    expect(result.memoryHandoff.exportedKeys.length).toBeGreaterThan(0);
    expect(result.memoryHandoff.snapshot).toBeDefined();
    expect(result.memoryHandoff.exportedKeys).toContain('orchestrator.lastSessionId');
  });

  it('preserves sessionId through the memory handoff', async () => {
    const sessionId = 'my-test-session-42';
    const result = await orchestrator.orchestrate(makeRequest({
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

  it('throws INVALID_INTENT for an empty intent string', async () => {
    await expect(orchestrator.orchestrate({ intent: '' })).rejects.toThrow('INVALID_INTENT');
  });

  it('throws MAX_ITERATIONS_EXCEEDED at the iteration limit', async () => {
    await expect(
      orchestrator.orchestrate(makeRequest({
        context: {
          sessionId: 'iter-test',
          previousOutputs: [],
          sharedMemory: {},
          iterationCount: 10,
        },
      })),
    ).rejects.toThrow('MAX_ITERATIONS_EXCEEDED');
  });

  it('finalOutput is the output of the last skill in the sequence', async () => {
    const result = await orchestrator.orchestrate(makeRequest());
    const lastResult = result.invocationResults[result.invocationResults.length - 1];
    expect(result.finalOutput).toEqual(lastResult.output);
  });

  it('invocation results reflect failed skill invocations', async () => {
    invoker.registerHandler('ai-image-director', failingHandler('model error'));
    const result = await orchestrator.orchestrate(
      makeRequest({
        forbiddenSkills: ['creative-director', 'prompt-architect', 'knowledge-manager', 'memory-system'],
      }),
    );
    const imgResult = result.invocationResults.find((r) => r.skillName === 'ai-image-director');
    expect(imgResult?.error).toBeDefined();
  });

  it('respects forbiddenSkills in the plan', async () => {
    const result = await orchestrator.orchestrate(makeRequest({
      forbiddenSkills: ['creative-director'],
    }));
    const names = result.invocationResults.map((r) => r.skillName);
    expect(names).not.toContain('creative-director');
  });
});

// ─── AgentOrchestratorV2 registry queries ────────────────────────────────────

describe('AgentOrchestratorV2 registry queries', () => {
  let registry: CapabilityRegistry;
  let invoker: SkillInvoker;
  let orchestrator: AgentOrchestratorV2;

  beforeEach(() => {
    registry = makeRegistry();
    invoker = makeInvoker(registry);
    orchestrator = makeOrchestrator(registry, invoker);
  });

  it('listSkills returns all registered skills when no filter is given', () => {
    const skills = orchestrator.listSkills();
    expect(skills.length).toBe(7);
    const names = skills.map((s) => s.name);
    expect(names).toContain('ai-image-director');
    expect(names).toContain('creative-director');
  });

  it('listSkills filters by capability', () => {
    const imageSkills = orchestrator.listSkills('image-generation');
    expect(imageSkills.every((s) => s.capabilities.includes('image-generation'))).toBe(true);
    expect(imageSkills.length).toBeGreaterThan(0);
  });

  it('describeSkill returns the registration for a known skill', () => {
    const reg = orchestrator.describeSkill('knowledge-manager');
    expect(reg).toBeDefined();
    expect(reg!.capabilities).toContain('semantic-search');
  });

  it('describeSkill returns undefined for an unknown skill', () => {
    expect(orchestrator.describeSkill('ghost')).toBeUndefined();
  });

  it('listCapabilities includes all capabilities from all skills', () => {
    const caps = orchestrator.listCapabilities();
    expect(caps).toContain('image-generation');
    expect(caps).toContain('brand-strategy');
    expect(caps).toContain('project-planning');
    expect(caps).toContain('memory-management');
  });

  it('detectCapabilities returns capabilities matched in the intent', () => {
    const caps = orchestrator.detectCapabilities('Generate a product image and video');
    expect(caps).toContain('image-generation');
    expect(caps).toContain('video-generation');
  });

  it('detectCapabilities returns empty array for unknown intent', () => {
    expect(orchestrator.detectCapabilities('zzzzzzzzzzz')).toHaveLength(0);
  });
});

// ─── Capability-based dependency ordering ─────────────────────────────────────

describe('Capability-based dependency ordering', () => {
  let registry: CapabilityRegistry;
  let invoker: SkillInvoker;
  let orchestrator: AgentOrchestratorV2;

  beforeEach(() => {
    registry = makeRegistry();
    invoker = makeInvoker(registry);
    orchestrator = makeOrchestrator(registry, invoker);
  });

  it('prompt-architect appears before ai-image-director when both are needed', () => {
    const plan = orchestrator.planByCapability(
      'Write an optimized prompt and then generate the product image',
    );
    const names = plan.skillSequence.map((s) => s.name);
    const promptIdx = names.indexOf('prompt-architect');
    const imageIdx = names.indexOf('ai-image-director');
    if (promptIdx >= 0 && imageIdx >= 0) {
      expect(promptIdx).toBeLessThan(imageIdx);
    }
  });

  it('creative-director appears before ai-video-director when both are needed', () => {
    const plan = orchestrator.planByCapability(
      'Create a brand brief then generate a video for the campaign',
    );
    const names = plan.skillSequence.map((s) => s.name);
    const cdIdx = names.indexOf('creative-director');
    const vdIdx = names.indexOf('ai-video-director');
    if (cdIdx >= 0 && vdIdx >= 0) {
      expect(cdIdx).toBeLessThan(vdIdx);
    }
  });

  it('a newly registered higher-priority skill is automatically preferred', () => {
    registry.register({
      name: 'turbo-image-skill',
      version: '1.0.0',
      capabilities: ['image-generation'],
      priority: 95,
      maxConcurrency: 4,
      timeoutMs: 30_000,
      requiresContext: false,
    });
    const plan = orchestrator.planByCapability('Generate a product photo');
    const assignment = plan.capabilityAssignment.get('image-generation');
    expect(assignment?.name).toBe('turbo-image-skill');
  });
});
