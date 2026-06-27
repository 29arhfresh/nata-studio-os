import workflowEngine from '../src/index';
import type { PhaseBWorkflowDefinition, Plugin } from '../src/phase-b-types';

describe('Visualizer Integration', () => {
  afterEach(() => {
    try { workflowEngine.unregisterPlugin('viz-bad-hook'); } catch { /* ignore */ }
  });

  it('result.graph is present on the success path', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `viz-wf-success-${Date.now()}`,
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
    };
    const result = await workflowEngine.run(def);
    expect(result.graph).toBeDefined();
    expect(result.graph!.workflowId).toBe(def.id);
    expect(result.graph!.nodes).toHaveLength(1);
  });

  it('result.graph is present on the step failure path, with correct statuses', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `viz-wf-fail-${Date.now()}`,
      steps: [
        { id: 'ok', dependsOn: [], handler: async () => ({}) },
        { id: 'fail', dependsOn: ['ok'], handler: async () => { throw new Error('fail'); } },
        { id: 'skipped', dependsOn: ['fail'], handler: async () => ({}) },
      ],
    };
    const result = await workflowEngine.run(def);
    expect(result.graph).toBeDefined();
    const nodes = Object.fromEntries(result.graph!.nodes.map((n) => [n.id, n]));
    expect(nodes['ok'].status).toBe('completed');
    expect(nodes['fail'].status).toBe('failed');
    expect(nodes['skipped'].status).toBe('pending');
  });

  it('result.graph is absent when a plugin hook throws PLUGIN_HOOK_ERROR', async () => {
    workflowEngine.registerPlugin({
      manifest: { name: 'viz-bad-hook', version: '1.0.0', description: '' },
      beforeStep: () => { throw new Error('boom'); },
    } as Plugin);
    const def: PhaseBWorkflowDefinition = {
      id: `viz-wf-hook-fail-${Date.now()}`,
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: ['viz-bad-hook'],
    };
    const result = await workflowEngine.run(def);
    expect(result.graph).toBeUndefined();
  });

  it('result.graph.status matches result.status', async () => {
    const successDef: PhaseBWorkflowDefinition = {
      id: `viz-wf-status-ok-${Date.now()}`,
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
    };
    const successResult = await workflowEngine.run(successDef);
    expect(successResult.graph!.status).toBe(successResult.status);

    const failDef: PhaseBWorkflowDefinition = {
      id: `viz-wf-status-fail-${Date.now()}`,
      steps: [{ id: 'step', dependsOn: [], handler: async () => { throw new Error('fail'); } }],
    };
    const failResult = await workflowEngine.run(failDef);
    expect(failResult.graph!.status).toBe(failResult.status);
  });
});
