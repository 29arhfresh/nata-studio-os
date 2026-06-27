import { CapabilityNotAvailableError, RegistryError } from '../../src/contracts/errors';
import { CapabilityRegistry } from '../../src/registry/registry';
import type { SkillManifest } from '../../src/registry/types';
import type { ISkillAdapter } from '../../src/invocation/types';
import type { SkillRequest, SkillResponse } from '../../src/contracts/request';

function makeManifest(overrides: Partial<SkillManifest> = {}): SkillManifest {
  return {
    name: 'memory-system',
    version: '0.1.0',
    description: 'Memory management',
    capabilities: ['memory-management', 'semantic-search'],
    operations: [
      { name: 'store', description: 'Write a value' },
      { name: 'search', description: 'Query memory' },
    ],
    priority: 80,
    maxConcurrency: 4,
    timeoutMs: 30_000,
    tags: ['core', 'memory'],
    ...overrides,
  };
}

function makeAdapter(name: string): ISkillAdapter {
  return {
    name,
    async invoke<TInput, TOutput>(_req: SkillRequest<TInput>): Promise<SkillResponse<TOutput>> {
      throw new Error('not implemented in test');
    },
  };
}

describe('CapabilityRegistry.register', () => {
  it('registers a skill successfully', () => {
    const reg = new CapabilityRegistry();
    const manifest = makeManifest();
    reg.register(manifest, makeAdapter('memory-system'));
    expect(reg.size()).toBe(1);
  });

  it('throws when manifest has no name', () => {
    const reg = new CapabilityRegistry();
    expect(() => reg.register(makeManifest({ name: '' }), makeAdapter(''))).toThrow(RegistryError);
  });

  it('throws when adapter name differs from manifest name', () => {
    const reg = new CapabilityRegistry();
    expect(() =>
      reg.register(makeManifest({ name: 'skill-a' }), makeAdapter('skill-b'))
    ).toThrow(RegistryError);
  });

  it('throws on duplicate registration', () => {
    const reg = new CapabilityRegistry();
    const manifest = makeManifest();
    reg.register(manifest, makeAdapter('memory-system'));
    expect(() => reg.register(manifest, makeAdapter('memory-system'))).toThrow(RegistryError);
  });
});

describe('CapabilityRegistry.unregister', () => {
  it('removes a registered skill', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest(), makeAdapter('memory-system'));
    reg.unregister('memory-system');
    expect(reg.size()).toBe(0);
  });

  it('throws when skill is not registered', () => {
    const reg = new CapabilityRegistry();
    expect(() => reg.unregister('nonexistent')).toThrow(RegistryError);
  });

  it('allows re-registration after unregister', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest(), makeAdapter('memory-system'));
    reg.unregister('memory-system');
    expect(() => reg.register(makeManifest(), makeAdapter('memory-system'))).not.toThrow();
  });
});

describe('CapabilityRegistry.discover', () => {
  function setup(): CapabilityRegistry {
    const reg = new CapabilityRegistry();
    reg.register(
      makeManifest({
        name: 'memory-system',
        capabilities: ['memory-management', 'semantic-search'],
        priority: 80,
        tags: ['core'],
        operations: [{ name: 'store', description: 'Write' }, { name: 'search', description: 'Query' }],
      }),
      makeAdapter('memory-system')
    );
    reg.register(
      makeManifest({
        name: 'creative-director',
        capabilities: ['brand-strategy', 'creative-scoring'],
        priority: 90,
        tags: ['creative'],
        operations: [{ name: 'build-brief', description: 'Build brief' }, { name: 'score-creative', description: 'Score' }],
      }),
      makeAdapter('creative-director')
    );
    reg.register(
      makeManifest({
        name: 'prompt-architect',
        capabilities: ['prompt-engineering'],
        priority: 70,
        tags: ['core'],
        operations: [{ name: 'build-prompt', description: 'Build prompt' }, { name: 'evaluate-prompt', description: 'Evaluate' }],
      }),
      makeAdapter('prompt-architect')
    );
    return reg;
  }

  it('returns all when query is empty', () => {
    const results = setup().discover({});
    expect(results).toHaveLength(3);
  });

  it('filters by capability', () => {
    const results = setup().discover({ capability: 'semantic-search' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('memory-system');
  });

  it('filters by tag', () => {
    const results = setup().discover({ tag: 'core' });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.name).sort()).toEqual(['memory-system', 'prompt-architect'].sort());
  });

  it('filters by operation', () => {
    const results = setup().discover({ operation: 'store' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('memory-system');
  });

  it('filters by minPriority', () => {
    const results = setup().discover({ minPriority: 85 });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('creative-director');
  });

  it('returns results sorted by descending priority', () => {
    const results = setup().discover({});
    expect(results[0].priority).toBeGreaterThanOrEqual(results[1].priority);
    expect(results[1].priority).toBeGreaterThanOrEqual(results[2].priority);
  });

  it('returns empty array when no skill matches', () => {
    const results = setup().discover({ capability: 'nonexistent' });
    expect(results).toHaveLength(0);
  });
});

describe('CapabilityRegistry.findByName', () => {
  it('returns the manifest for a registered skill', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest(), makeAdapter('memory-system'));
    expect(reg.findByName('memory-system')?.name).toBe('memory-system');
  });

  it('returns undefined for unknown skills', () => {
    const reg = new CapabilityRegistry();
    expect(reg.findByName('unknown')).toBeUndefined();
  });
});

describe('CapabilityRegistry.getAdapter', () => {
  it('returns the adapter for a registered skill', () => {
    const reg = new CapabilityRegistry();
    const adapter = makeAdapter('memory-system');
    reg.register(makeManifest(), adapter);
    expect(reg.getAdapter('memory-system')).toBe(adapter);
  });

  it('returns undefined for unknown skills', () => {
    const reg = new CapabilityRegistry();
    expect(reg.getAdapter('unknown')).toBeUndefined();
  });
});

describe('CapabilityRegistry.hasCapability', () => {
  it('returns true when any registered skill has the capability', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest({ capabilities: ['memory-management'] }), makeAdapter('memory-system'));
    expect(reg.hasCapability('memory-management')).toBe(true);
  });

  it('returns false when no skill has the capability', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest(), makeAdapter('memory-system'));
    expect(reg.hasCapability('video-generation')).toBe(false);
  });
});

describe('CapabilityRegistry.requireCapability', () => {
  it('returns manifests when capability is registered', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest({ capabilities: ['memory-management'] }), makeAdapter('memory-system'));
    const results = reg.requireCapability('memory-management');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('memory-system');
  });

  it('throws CapabilityNotAvailableError when no skill provides the capability', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest(), makeAdapter('memory-system'));
    expect(() => reg.requireCapability('video-generation')).toThrow(CapabilityNotAvailableError);
  });

  it('CapabilityNotAvailableError carries the missing capability in its message', () => {
    const reg = new CapabilityRegistry();
    try {
      reg.requireCapability('video-generation');
    } catch (err) {
      expect(err).toBeInstanceOf(CapabilityNotAvailableError);
      expect((err as CapabilityNotAvailableError).message).toContain('video-generation');
    }
  });
});

describe('CapabilityRegistry.listAll', () => {
  it('returns all manifests sorted by priority desc', () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest({ name: 'a', priority: 50 }), makeAdapter('a'));
    reg.register(makeManifest({ name: 'b', priority: 90 }), makeAdapter('b'));
    const all = reg.listAll();
    expect(all[0].name).toBe('b');
    expect(all[1].name).toBe('a');
  });
});
