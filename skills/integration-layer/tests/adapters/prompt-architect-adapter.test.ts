import { AdapterError } from '../../src/contracts/errors';
import { createContext } from '../../src/contracts/context';
import { createRequest } from '../../src/contracts/request';
import { PromptArchitectAdapter } from '../../src/adapters/prompt-architect-adapter';
import type { BuiltPrompt, IPromptArchitect, TestCase } from '../../src/adapters/types';

const ctx = createContext({ sessionId: 'pa-test', traceId: 'tr', spanId: 'sp' });

const stubPrompt: BuiltPrompt = {
  id: 'p-1',
  version: '1.0.0',
  systemPrompt: 'You are a helpful assistant.',
  userTemplate: 'Answer: {{question}}',
  qualityScore: 0.88,
  qualityVerdict: 'pass',
  estimatedTokens: 120,
};

function makeSkill(overrides: Partial<IPromptArchitect> = {}): IPromptArchitect {
  return {
    buildPrompt: jest.fn().mockReturnValue(stubPrompt),
    evaluatePrompt: jest.fn().mockReturnValue({ verdict: 'pass', score: 0.9, testCaseResults: [] }),
    compressPrompt: jest.fn().mockReturnValue({ original: 'long', compressed: 'short', originalTokens: 100, compressedTokens: 60, reductionPercent: 40 }),
    versionPrompt: jest.fn().mockReturnValue({ ...stubPrompt, version: '1.1.0', changeType: 'minor' }),
    ...overrides,
  };
}

describe('PromptArchitectAdapter', () => {
  it('has name = prompt-architect', () => {
    expect(new PromptArchitectAdapter(makeSkill()).name).toBe('prompt-architect');
  });

  describe('build-prompt operation', () => {
    it('calls buildPrompt and extracts qualityScore', async () => {
      const skill = makeSkill();
      const adapter = new PromptArchitectAdapter(skill);
      const brief = { taskObjective: 'summarise text', taskType: 'document-analysis', outputFormat: 'prose' };
      const req = createRequest({ skillName: 'prompt-architect', operation: 'build-prompt', input: brief, context: ctx });
      const res = await adapter.invoke<typeof brief, BuiltPrompt>(req);
      expect(skill.buildPrompt).toHaveBeenCalledWith(brief);
      expect(res.output.qualityScore).toBe(0.88);
      expect(res.metadata.qualityScore).toBe(0.88);
    });
  });

  describe('evaluate-prompt operation', () => {
    it('passes prompt and testCases to evaluatePrompt', async () => {
      const skill = makeSkill();
      const adapter = new PromptArchitectAdapter(skill);
      const testCases: TestCase[] = [{ id: 'tc-1', description: 'basic check' }];
      const input = { prompt: stubPrompt, testCases };
      const req = createRequest({ skillName: 'prompt-architect', operation: 'evaluate-prompt', input, context: ctx });
      await adapter.invoke(req);
      expect(skill.evaluatePrompt).toHaveBeenCalledWith(stubPrompt, testCases);
    });
  });

  describe('compress-prompt operation', () => {
    it('passes text and maxTokens to compressPrompt', async () => {
      const skill = makeSkill();
      const adapter = new PromptArchitectAdapter(skill);
      const input = { text: 'a very long prompt...', maxTokens: 60 };
      const req = createRequest({ skillName: 'prompt-architect', operation: 'compress-prompt', input, context: ctx });
      const res = await adapter.invoke<typeof input, { reductionPercent: number }>(req);
      expect(skill.compressPrompt).toHaveBeenCalledWith('a very long prompt...', 60);
      expect(res.output.reductionPercent).toBe(40);
    });
  });

  describe('version-prompt operation', () => {
    it('passes prompt, changeType, and summary to versionPrompt', async () => {
      const skill = makeSkill();
      const adapter = new PromptArchitectAdapter(skill);
      const input = { prompt: stubPrompt, changeType: 'minor', summary: 'Clarified output format' };
      const req = createRequest({ skillName: 'prompt-architect', operation: 'version-prompt', input, context: ctx });
      await adapter.invoke(req);
      expect(skill.versionPrompt).toHaveBeenCalledWith(stubPrompt, 'minor', 'Clarified output format');
    });
  });

  it('throws AdapterError for unknown operation', async () => {
    const adapter = new PromptArchitectAdapter(makeSkill());
    const req = createRequest({ skillName: 'prompt-architect', operation: 'magic', input: {}, context: ctx });
    await expect(adapter.invoke(req)).rejects.toThrow(AdapterError);
  });

  it('throws AdapterError when skill throws', async () => {
    const skill = makeSkill({
      buildPrompt: jest.fn().mockImplementation(() => { throw new Error('schema error'); }),
    });
    const adapter = new PromptArchitectAdapter(skill);
    const req = createRequest({ skillName: 'prompt-architect', operation: 'build-prompt', input: {}, context: ctx });
    await expect(adapter.invoke(req)).rejects.toThrow(AdapterError);
  });
});
