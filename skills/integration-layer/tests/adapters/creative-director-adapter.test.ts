import { AdapterError } from '../../src/contracts/errors';
import { createContext } from '../../src/contracts/context';
import { createRequest } from '../../src/contracts/request';
import { CreativeDirectorAdapter } from '../../src/adapters/creative-director-adapter';
import type { ICreativeDirector } from '../../src/adapters/types';

const ctx = createContext({ sessionId: 'cd-test', traceId: 'tr', spanId: 'sp' });

function makeSkill(overrides: Partial<ICreativeDirector> = {}): ICreativeDirector {
  return {
    buildCreativeBrief: jest.fn().mockReturnValue({ brand: 'TestBrand', objective: 'launch' }),
    buildMoodboard: jest.fn().mockReturnValue({ concept: 'minimal' }),
    buildArtDirection: jest.fn().mockReturnValue({ compositionRule: 'rule-of-thirds' }),
    scoreCreative: jest.fn().mockReturnValue({ total: 82, grade: 'Strong' }),
    ...overrides,
  };
}

describe('CreativeDirectorAdapter', () => {
  it('has name = creative-director', () => {
    expect(new CreativeDirectorAdapter(makeSkill()).name).toBe('creative-director');
  });

  describe('build-brief operation', () => {
    it('calls buildCreativeBrief with the request input', async () => {
      const skill = makeSkill();
      const adapter = new CreativeDirectorAdapter(skill);
      const input = { brand: 'Nata', objective: 'launch a product', tone: ['bold'], deliverables: ['hero-image'] };
      const req = createRequest({ skillName: 'creative-director', operation: 'build-brief', input, context: ctx });
      const res = await adapter.invoke(req);
      expect(skill.buildCreativeBrief).toHaveBeenCalledWith(input);
      expect((res.output as { brand: string }).brand).toBe('TestBrand');
    });
  });

  describe('build-moodboard operation', () => {
    it('calls buildMoodboard', async () => {
      const skill = makeSkill();
      const adapter = new CreativeDirectorAdapter(skill);
      const input = { concept: 'luxury', mood: ['refined', 'dark'] };
      const req = createRequest({ skillName: 'creative-director', operation: 'build-moodboard', input, context: ctx });
      await adapter.invoke(req);
      expect(skill.buildMoodboard).toHaveBeenCalledWith(input);
    });
  });

  describe('build-art-direction operation', () => {
    it('calls buildArtDirection', async () => {
      const skill = makeSkill();
      const adapter = new CreativeDirectorAdapter(skill);
      const input = { brief: {}, deliverableType: 'hero-image' };
      const req = createRequest({ skillName: 'creative-director', operation: 'build-art-direction', input, context: ctx });
      await adapter.invoke(req);
      expect(skill.buildArtDirection).toHaveBeenCalledWith(input);
    });
  });

  describe('score-creative operation', () => {
    it('calls scoreCreative and extracts qualityScore from total', async () => {
      const skill = makeSkill();
      const adapter = new CreativeDirectorAdapter(skill);
      const input = {
        deliverable: 'hero-image',
        brandAlignment: 9,
        compositionQuality: 8,
        colorConsistency: 8,
        storytellingClarity: 7,
        technicalExecution: 8,
      };
      const req = createRequest({ skillName: 'creative-director', operation: 'score-creative', input, context: ctx });
      const res = await adapter.invoke(req);
      expect(skill.scoreCreative).toHaveBeenCalledWith(input);
      expect(res.metadata.qualityScore).toBeCloseTo(0.82);
    });

    it('qualityScore is undefined when total is absent', async () => {
      const skill = makeSkill({ scoreCreative: jest.fn().mockReturnValue({ grade: 'Strong' }) });
      const adapter = new CreativeDirectorAdapter(skill);
      const req = createRequest({ skillName: 'creative-director', operation: 'score-creative', input: {}, context: ctx });
      const res = await adapter.invoke(req);
      expect(res.metadata.qualityScore).toBeUndefined();
    });
  });

  it('throws AdapterError for unknown operation', async () => {
    const adapter = new CreativeDirectorAdapter(makeSkill());
    const req = createRequest({ skillName: 'creative-director', operation: 'paint-wall', input: {}, context: ctx });
    await expect(adapter.invoke(req)).rejects.toThrow(AdapterError);
  });

  it('throws AdapterError when skill throws', async () => {
    const skill = makeSkill({
      buildCreativeBrief: jest.fn().mockImplementation(() => { throw new Error('brand not found'); }),
    });
    const adapter = new CreativeDirectorAdapter(skill);
    const req = createRequest({ skillName: 'creative-director', operation: 'build-brief', input: {}, context: ctx });
    await expect(adapter.invoke(req)).rejects.toThrow(AdapterError);
  });
});
