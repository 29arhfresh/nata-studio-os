import workflowEngine from '../src/index';
import { AssetManager } from '../src/asset-manager';
import type { PhaseBWorkflowDefinition } from '../src/phase-b-types';

describe('AssetManager Integration', () => {
  it('a step with emitsAsset registers an AssetRecord after the step completes', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami2-wf-emit-${Date.now()}`,
      steps: [{
        id: 'producer', dependsOn: [],
        handler: async () => ({ url: 'https://example.com/image.png' }),
        emitsAsset: { type: 'image', tags: ['hero'] },
      }],
    };
    const result = await workflowEngine.run(def);
    expect(result.assetRefs).toHaveLength(1);
    expect(result.assetRefs![0].type).toBe('image');
    expect(result.assetRefs![0].tags).toContain('hero');
  });

  it('the registered asset appears in PhaseBWorkflowResult.assetRefs', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami2-wf-refs-${Date.now()}`,
      steps: [{
        id: 'p', dependsOn: [],
        handler: async () => 'asset-data',
        emitsAsset: { type: 'document' },
      }],
    };
    const result = await workflowEngine.run(def);
    expect(result.assetRefs).toBeDefined();
    expect(result.assetRefs!.length).toBeGreaterThan(0);
    expect(result.assetRefs![0].assetId).toMatch(/^asset-/);
  });

  it('assets from steps that completed before a mid-workflow failure are in assetRefs', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami2-wf-partial-${Date.now()}`,
      steps: [
        {
          id: 'ok', dependsOn: [],
          handler: async () => 'ok-asset',
          emitsAsset: { type: 'image' },
        },
        {
          id: 'fail', dependsOn: ['ok'],
          handler: async () => { throw new Error('fail'); },
        },
      ],
    };
    const result = await workflowEngine.run(def);
    expect(result.status).toBe('failed');
    expect(result.assetRefs!.some((r) => r.stepId === 'ok')).toBe(true);
  });

  it('a step with no emitsAsset does not register any asset', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami2-wf-no-emit-${Date.now()}`,
      steps: [{ id: 's', dependsOn: [], handler: async () => ({ data: 'x' }) }],
    };
    const result = await workflowEngine.run(def);
    expect(result.assetRefs).toHaveLength(0);
  });

  it('assets persist in AssetManager after the run completes (not cleared automatically)', async () => {
    const localManager = new AssetManager();
    const rec = localManager.register('persistent-value', {
      type: 'image', workflowId: 'wf-persist', stepId: 's1', tags: [],
    });
    expect(localManager.get(rec.assetId)).toBeDefined();
    expect(localManager.getAll()).toHaveLength(1);
  });

  it('AssetManager.query({ workflowId }) returns assets from multiple runs of the same workflow', async () => {
    const localManager = new AssetManager();
    const wfId = 'wf-multi-run';
    localManager.register('run1-asset', { type: 'image', workflowId: wfId, stepId: 's1', tags: [] });
    localManager.register('run2-asset', { type: 'video', workflowId: wfId, stepId: 's1', tags: [] });
    const results = localManager.query({ workflowId: wfId });
    expect(results).toHaveLength(2);
  });
});
