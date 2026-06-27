import workflowEngine from '../src/index';
import type { Plugin, PhaseBWorkflowDefinition } from '../src/phase-b-types';

function makePlugin(name: string, hooks: Partial<Omit<Plugin, 'manifest'>> = {}): Plugin {
  return {
    manifest: { name, version: '1.0.0', description: `Plugin ${name}` },
    ...hooks,
  };
}

function makeSimpleDef(id: string, pluginNames: string[] = []): PhaseBWorkflowDefinition {
  return {
    id,
    steps: [
      { id: 'step-a', dependsOn: [], handler: async () => ({ out: 1 }) },
      { id: 'step-b', dependsOn: ['step-a'], handler: async () => ({ out: 2 }) },
    ],
    plugins: pluginNames,
  };
}

describe('Plugin Lifecycle Integration', () => {
  afterEach(() => {
    try { workflowEngine.unregisterPlugin('test-plugin'); } catch { /* ignore */ }
    try { workflowEngine.unregisterPlugin('plugin-a'); } catch { /* ignore */ }
    try { workflowEngine.unregisterPlugin('plugin-b'); } catch { /* ignore */ }
    try { workflowEngine.unregisterPlugin('bad-before'); } catch { /* ignore */ }
    try { workflowEngine.unregisterPlugin('bad-after'); } catch { /* ignore */ }
    try { workflowEngine.unregisterPlugin('global-only'); } catch { /* ignore */ }
  });

  it('beforeWorkflow and afterWorkflow hooks called exactly once per run', async () => {
    let beforeCount = 0, afterCount = 0;
    workflowEngine.registerPlugin(makePlugin('test-plugin', {
      beforeWorkflow: () => { beforeCount++; },
      afterWorkflow: () => { afterCount++; },
    }));
    await workflowEngine.run(makeSimpleDef('pi-wf-once', ['test-plugin']));
    expect(beforeCount).toBe(1);
    expect(afterCount).toBe(1);
  });

  it('beforeStep called once per step before the handler executes', async () => {
    const beforeIds: string[] = [];
    workflowEngine.registerPlugin(makePlugin('test-plugin', {
      beforeStep: (ctx) => { if (ctx.stepId) beforeIds.push(ctx.stepId); },
    }));
    await workflowEngine.run(makeSimpleDef('pi-wf-before', ['test-plugin']));
    expect(beforeIds).toEqual(['step-a', 'step-b']);
  });

  it('afterStep called once per step after the handler returns (both completed and failed)', async () => {
    const afterIds: string[] = [];
    workflowEngine.registerPlugin(makePlugin('test-plugin', {
      afterStep: (ctx) => { if (ctx.stepId) afterIds.push(ctx.stepId); },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-after-fail',
      steps: [
        { id: 'ok', dependsOn: [], handler: async () => ({}) },
        { id: 'bad', dependsOn: ['ok'], handler: async () => { throw new Error('fail'); } },
      ],
      plugins: ['test-plugin'],
    };
    await workflowEngine.run(def);
    expect(afterIds).toContain('ok');
    expect(afterIds).toContain('bad');
  });

  it('hooks are called in installation order across multiple installed plugins', async () => {
    const calls: string[] = [];
    workflowEngine.registerPlugin(makePlugin('plugin-a', {
      beforeStep: () => { calls.push('a'); },
    }));
    workflowEngine.registerPlugin(makePlugin('plugin-b', {
      beforeStep: () => { calls.push('b'); },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-order',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: ['plugin-a', 'plugin-b'],
    };
    await workflowEngine.run(def);
    expect(calls).toEqual(['a', 'b']);
  });

  it('a plugin listed in definition.plugins that is not installed fails validate()', () => {
    const result = workflowEngine.validate({
      id: 'pi-wf-not-installed',
      steps: [{ id: 's', dependsOn: [], handler: async () => ({}) }],
      plugins: ['not-installed'],
    } as PhaseBWorkflowDefinition);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not-installed'))).toBe(true);
  });

  it('a beforeStep hook that throws fails the workflow and prevents further steps', async () => {
    workflowEngine.registerPlugin(makePlugin('bad-before', {
      beforeStep: () => { throw new Error('hook boom'); },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-hook-fail',
      steps: [
        { id: 'step-a', dependsOn: [], handler: async () => ({}) },
        { id: 'step-b', dependsOn: ['step-a'], handler: async () => ({}) },
      ],
      plugins: ['bad-before'],
    };
    const result = await workflowEngine.run(def);
    expect(result.status).toBe('failed');
    expect(result.error).toContain('PLUGIN_HOOK_ERROR');
    expect(result.stepResults.filter((r) => r.stepId === 'step-b')).toHaveLength(0);
  });

  it('afterWorkflow is not called when a plugin hook throws', async () => {
    let afterWorkflowCalled = false;
    workflowEngine.registerPlugin(makePlugin('bad-before', {
      beforeStep: () => { throw new Error('hook boom'); },
      afterWorkflow: () => { afterWorkflowCalled = true; },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-no-after-workflow',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: ['bad-before'],
    };
    await workflowEngine.run(def);
    expect(afterWorkflowCalled).toBe(false);
  });

  it('visualize is not called when a plugin hook throws; graph is absent from the result', async () => {
    workflowEngine.registerPlugin(makePlugin('bad-before', {
      beforeStep: () => { throw new Error('hook boom'); },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-no-graph',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: ['bad-before'],
    };
    const result = await workflowEngine.run(def);
    expect(result.graph).toBeUndefined();
  });

  it('connector disposal is not called when a plugin hook throws', async () => {
    let disposeCalled = false;
    workflowEngine.registerConnector(
      { name: 'pi-conn', type: 'http' },
      () => ({
        name: 'pi-conn', type: 'http',
        call: async () => ({}),
        dispose: async () => { disposeCalled = true; },
      }),
    );
    workflowEngine.registerPlugin(makePlugin('bad-before', {
      beforeStep: () => { throw new Error('hook boom'); },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-no-disposal',
      steps: [{ id: 'step', dependsOn: ['step-placeholder'], handler: async () => ({}) }],
      plugins: ['bad-before'],
      connectors: ['pi-conn'],
    };
    // Fix the step def to not have invalid dep
    const validDef: PhaseBWorkflowDefinition = {
      id: 'pi-wf-no-disposal',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: ['bad-before'],
      connectors: ['pi-conn'],
    };
    await workflowEngine.run(validDef);
    expect(disposeCalled).toBe(false);
    workflowEngine.unregisterConnector('pi-conn');
  });

  it('plugins not listed in definition.plugins are not invoked even if installed and enabled', async () => {
    let globalCalled = false;
    workflowEngine.registerPlugin(makePlugin('global-only', {
      beforeStep: () => { globalCalled = true; },
    }));
    const def: PhaseBWorkflowDefinition = {
      id: 'pi-wf-not-listed',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      plugins: [],
    };
    await workflowEngine.run(def);
    expect(globalCalled).toBe(false);
  });
});
