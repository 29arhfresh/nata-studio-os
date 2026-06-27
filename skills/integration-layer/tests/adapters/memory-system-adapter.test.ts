import { AdapterError } from '../../src/contracts/errors';
import { createContext } from '../../src/contracts/context';
import { createRequest } from '../../src/contracts/request';
import { MemorySystemAdapter } from '../../src/adapters/memory-system-adapter';
import type { IMemorySystem } from '../../src/adapters/types';

const ctx = createContext({ sessionId: 'ms-test', traceId: 'tr', spanId: 'sp' });

function makeSkill(overrides: Partial<IMemorySystem> = {}): IMemorySystem {
  return {
    store: jest.fn().mockReturnValue({ id: 'ms-1', key: 'k', qualityScore: 0.9, createdAt: '' }),
    search: jest.fn().mockReturnValue({ items: [], totalMatches: 0, durationMs: 1 }),
    restoreContext: jest.fn().mockReturnValue({ items: [], tokenEstimate: 0, restoredAt: '' }),
    handoff: jest.fn().mockReturnValue({ transferred: 2, failed: [], handoffId: 'h-1', handedOffAt: '' }),
    ...overrides,
  };
}

describe('MemorySystemAdapter', () => {
  it('has name = memory-system', () => {
    const adapter = new MemorySystemAdapter(makeSkill());
    expect(adapter.name).toBe('memory-system');
  });

  describe('store operation', () => {
    it('delegates to skill.store', async () => {
      const skill = makeSkill();
      const adapter = new MemorySystemAdapter(skill);
      const req = createRequest({
        skillName: 'memory-system', operation: 'store',
        input: { tier: 'short-term', scope: 'session', key: 'x', value: 'v', source: 'test' },
        context: ctx,
      });
      const res = await adapter.invoke(req);
      expect(skill.store).toHaveBeenCalledTimes(1);
      expect((res.output as { id: string }).id).toBe('ms-1');
    });

    it('response metadata includes durationMs', async () => {
      const adapter = new MemorySystemAdapter(makeSkill());
      const req = createRequest({ skillName: 'memory-system', operation: 'store', input: {}, context: ctx });
      const res = await adapter.invoke(req);
      expect(res.metadata.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('search operation', () => {
    it('delegates to skill.search', async () => {
      const skill = makeSkill();
      const adapter = new MemorySystemAdapter(skill);
      const req = createRequest({
        skillName: 'memory-system', operation: 'search',
        input: { query: 'brand strategy', limit: 5 },
        context: ctx,
      });
      await adapter.invoke(req);
      expect(skill.search).toHaveBeenCalledWith({ query: 'brand strategy', limit: 5 });
    });
  });

  describe('restore-context operation', () => {
    it('delegates to skill.restoreContext', async () => {
      const skill = makeSkill();
      const adapter = new MemorySystemAdapter(skill);
      const req = createRequest({
        skillName: 'memory-system', operation: 'restore-context',
        input: { scope: 'session', sessionId: 'sess-1' },
        context: ctx,
      });
      await adapter.invoke(req);
      expect(skill.restoreContext).toHaveBeenCalledWith({ scope: 'session', sessionId: 'sess-1' });
    });
  });

  describe('handoff operation', () => {
    it('delegates to skill.handoff', async () => {
      const skill = makeSkill();
      const adapter = new MemorySystemAdapter(skill);
      const req = createRequest({
        skillName: 'memory-system', operation: 'handoff',
        input: { fromSkill: 'creative-director', toSkill: 'prompt-architect', sessionId: 'sess-1' },
        context: ctx,
      });
      const res = await adapter.invoke(req);
      const out = res.output as { transferred: number };
      expect(out.transferred).toBe(2);
    });
  });

  it('throws AdapterError on unknown operation', async () => {
    const adapter = new MemorySystemAdapter(makeSkill());
    const req = createRequest({ skillName: 'memory-system', operation: 'explode', input: {}, context: ctx });
    await expect(adapter.invoke(req)).rejects.toThrow(AdapterError);
  });

  it('throws AdapterError when skill throws', async () => {
    const skill = makeSkill({ store: jest.fn().mockImplementation(() => { throw new Error('disk full'); }) });
    const adapter = new MemorySystemAdapter(skill);
    const req = createRequest({ skillName: 'memory-system', operation: 'store', input: {}, context: ctx });
    await expect(adapter.invoke(req)).rejects.toThrow(AdapterError);
  });
});
