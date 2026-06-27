import workflowEngine from '../src/index';
import type { PhaseBWorkflowDefinition, PhaseBStepInput, Plugin } from '../src/phase-b-types';

describe('Full Pipeline Integration', () => {
  afterEach(() => {
    try { workflowEngine.unregisterPlugin('fp-plugin'); } catch { /* ignore */ }
    try { workflowEngine.unregisterConnector('fp-conn'); } catch { /* ignore */ }
  });

  it('a run with all Phase B features enabled completes without error', async () => {
    workflowEngine.registerPlugin({
      manifest: { name: 'fp-plugin', version: '1.0.0', description: '' },
      beforeWorkflow: async () => {},
      afterWorkflow: async () => {},
      beforeStep: async () => {},
      afterStep: async () => {},
    });
    workflowEngine.registerConnector(
      { name: 'fp-conn', type: 'http' },
      (cfg) => ({ name: cfg.name, type: cfg.type, call: async () => ({}) }),
    );

    const def: PhaseBWorkflowDefinition = {
      id: `fp-wf-all-${Date.now()}`,
      steps: [{
        id: 'all-features', dependsOn: [],
        requiredConnectors: ['fp-conn'],
        handler: async () => ({ output: 'result' }),
        emitsAsset: { type: 'document', tags: ['report'] },
        memoryWrites: [{ outputKey: 'output', memoryKey: 'pipeline-result', tier: 'short-term' }],
      }],
      plugins: ['fp-plugin'],
      connectors: ['fp-conn'],
      versionTracking: true,
      memoryScope: `fp-scope-${Date.now()}`,
    };

    const result = await workflowEngine.run(def);
    expect(result.status).toBe('completed');
    expect(result.graph).toBeDefined();
    expect(result.versionId).toMatch(/^ver-/);
    expect(result.assetRefs!.some((r) => r.tags.includes('report'))).toBe(true);
    expect(result.memoryWrites!.some((r) => r.key === 'pipeline-result')).toBe(true);
  });

  it('within a single step: beforeStep → handler → asset register → memory write → afterStep', async () => {
    const events: string[] = [];

    workflowEngine.registerPlugin({
      manifest: { name: 'fp-plugin', version: '1.0.0', description: '' },
      beforeStep: () => { events.push('beforeStep'); },
      afterStep: (ctx) => {
        if (ctx.result?.status === 'completed') {
          events.push('afterStep');
        }
      },
    });

    const def: PhaseBWorkflowDefinition = {
      id: `fp-wf-order-${Date.now()}`,
      steps: [{
        id: 'ordered', dependsOn: [],
        handler: async () => {
          events.push('handler');
          return { val: 'data' };
        },
        emitsAsset: { type: 'image' },
        memoryWrites: [{ outputKey: 'val', memoryKey: 'order-key', tier: 'short-term' }],
      }],
      plugins: ['fp-plugin'],
    };

    const result = await workflowEngine.run(def);
    expect(result.assetRefs).toHaveLength(1);
    expect(result.memoryWrites).toHaveLength(1);
    expect(events).toEqual(['beforeStep', 'handler', 'afterStep']);
  });

  it('across the full run: beforeWorkflow → (per-step loop) → afterWorkflow → visualize → connector disposal', async () => {
    const events: string[] = [];

    workflowEngine.registerPlugin({
      manifest: { name: 'fp-plugin', version: '1.0.0', description: '' },
      beforeWorkflow: () => { events.push('beforeWorkflow'); },
      afterWorkflow: () => { events.push('afterWorkflow'); },
      beforeStep: () => { events.push('beforeStep'); },
      afterStep: () => { events.push('afterStep'); },
    });

    let disposed = false;
    workflowEngine.registerConnector(
      { name: 'fp-conn', type: 'http' },
      () => ({
        name: 'fp-conn', type: 'http' as const,
        call: async () => ({}),
        dispose: async () => {
          events.push('dispose');
          disposed = true;
        },
      }),
    );

    const def: PhaseBWorkflowDefinition = {
      id: `fp-wf-fullorder-${Date.now()}`,
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: ['fp-plugin'],
      connectors: ['fp-conn'],
    };

    const result = await workflowEngine.run(def);
    expect(result.graph).toBeDefined();
    expect(disposed).toBe(true);
    expect(events[0]).toBe('beforeWorkflow');
    const afterWorkflowIdx = events.indexOf('afterWorkflow');
    const disposeIdx = events.indexOf('dispose');
    expect(afterWorkflowIdx).toBeGreaterThan(events.indexOf('afterStep'));
    expect(disposeIdx).toBeGreaterThan(afterWorkflowIdx);
  });

  it('a run that fails on step 2 of 3: assets/memory from step 1 captured; step 3 never runs; afterWorkflow and visualize called', async () => {
    const afterStepIds: string[] = [];
    let afterWorkflowCalled = false;

    workflowEngine.registerPlugin({
      manifest: { name: 'fp-plugin', version: '1.0.0', description: '' },
      afterStep: (ctx) => { if (ctx.stepId) afterStepIds.push(ctx.stepId); },
      afterWorkflow: () => { afterWorkflowCalled = true; },
    });

    const def: PhaseBWorkflowDefinition = {
      id: `fp-wf-fail-partial-${Date.now()}`,
      steps: [
        {
          id: 'step-1', dependsOn: [],
          handler: async () => ({ produced: 'value' }),
          emitsAsset: { type: 'image' },
          memoryWrites: [{ outputKey: 'produced', memoryKey: 'step1-out', tier: 'short-term' }],
        },
        {
          id: 'step-2', dependsOn: ['step-1'],
          handler: async () => { throw new Error('step-2 fails'); },
        },
        {
          id: 'step-3', dependsOn: ['step-2'],
          handler: async () => 'never reached',
        },
      ],
      plugins: ['fp-plugin'],
    };

    const result = await workflowEngine.run(def);

    expect(result.status).toBe('failed');
    expect(result.assetRefs!.some((r) => r.stepId === 'step-1')).toBe(true);
    expect(result.memoryWrites!.some((r) => r.key === 'step1-out')).toBe(true);
    expect(result.stepResults.some((r) => r.stepId === 'step-3')).toBe(false);
    expect(afterStepIds).toContain('step-2');
    expect(afterWorkflowCalled).toBe(true);
    expect(result.graph).toBeDefined();
    const graphNodes = Object.fromEntries(result.graph!.nodes.map((n) => [n.id, n]));
    expect(graphNodes['step-1'].status).toBe('completed');
    expect(graphNodes['step-2'].status).toBe('failed');
    expect(graphNodes['step-3'].status).toBe('pending');
  });
});
