import workflowEngine from '../src/index';
import type { PhaseBWorkflowDefinition, PhaseBStepInput } from '../src/phase-b-types';

const CONN_NAME = 'ci-conn';

afterEach(() => {
  try { workflowEngine.unregisterConnector(CONN_NAME); } catch { /* ignore */ }
  try { workflowEngine.unregisterConnector('ci-conn-b'); } catch { /* ignore */ }
  try { workflowEngine.unregisterConnector('ci-conn-dispose'); } catch { /* ignore */ }
});

describe('Connector Integration', () => {
  it('a step with requiredConnectors receives matching handles in input.connectors', async () => {
    let capturedConnectors: Record<string, unknown> = {};
    workflowEngine.registerConnector(
      { name: CONN_NAME, type: 'http' },
      (cfg) => ({ name: cfg.name, type: cfg.type, call: async () => ({}) }),
    );
    const def: PhaseBWorkflowDefinition = {
      id: 'ci-wf-receives',
      steps: [{
        id: 'step', dependsOn: [],
        requiredConnectors: [CONN_NAME],
        handler: async (input) => {
          capturedConnectors = (input as PhaseBStepInput).connectors;
          return null;
        },
      }],
      connectors: [CONN_NAME],
    };
    await workflowEngine.run(def);
    expect(capturedConnectors[CONN_NAME]).toBeDefined();
    expect((capturedConnectors[CONN_NAME] as { name: string }).name).toBe(CONN_NAME);
  });

  it('a step with no requiredConnectors receives input.connectors: {}', async () => {
    let capturedConnectors: Record<string, unknown> = { something: 'preset' };
    workflowEngine.registerConnector(
      { name: CONN_NAME, type: 'http' },
      (cfg) => ({ name: cfg.name, type: cfg.type, call: async () => ({}) }),
    );
    const def: PhaseBWorkflowDefinition = {
      id: 'ci-wf-empty',
      steps: [{
        id: 'step', dependsOn: [],
        handler: async (input) => {
          capturedConnectors = (input as PhaseBStepInput).connectors;
          return null;
        },
      }],
      connectors: [CONN_NAME],
    };
    await workflowEngine.run(def);
    expect(Object.keys(capturedConnectors)).toHaveLength(0);
  });

  it('handle.dispose?.() is awaited on all run-scoped handles after the run completes (success path)', async () => {
    let disposeCalled = false;
    workflowEngine.registerConnector(
      { name: 'ci-conn-dispose', type: 'http' },
      () => ({
        name: 'ci-conn-dispose', type: 'http' as const,
        call: async () => ({}),
        dispose: async () => { disposeCalled = true; },
      }),
    );
    const def: PhaseBWorkflowDefinition = {
      id: 'ci-wf-dispose-success',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({}) }],
      connectors: ['ci-conn-dispose'],
    };
    await workflowEngine.run(def);
    expect(disposeCalled).toBe(true);
  });

  it('handle.dispose?.() is awaited on all run-scoped handles after step failure', async () => {
    let disposeCalled = false;
    workflowEngine.registerConnector(
      { name: 'ci-conn-dispose', type: 'http' },
      () => ({
        name: 'ci-conn-dispose', type: 'http' as const,
        call: async () => ({}),
        dispose: async () => { disposeCalled = true; },
      }),
    );
    const def: PhaseBWorkflowDefinition = {
      id: 'ci-wf-dispose-fail',
      steps: [{ id: 'step', dependsOn: [], handler: async () => { throw new Error('fail'); } }],
      connectors: ['ci-conn-dispose'],
    };
    await workflowEngine.run(def);
    expect(disposeCalled).toBe(true);
  });

  it('a dispose() that throws does not alter the returned PhaseBWorkflowResult', async () => {
    workflowEngine.registerConnector(
      { name: 'ci-conn-dispose', type: 'http' },
      () => ({
        name: 'ci-conn-dispose', type: 'http' as const,
        call: async () => ({}),
        dispose: async () => { throw new Error('dispose-error'); },
      }),
    );
    const def: PhaseBWorkflowDefinition = {
      id: 'ci-wf-dispose-throw',
      steps: [{ id: 'step', dependsOn: [], handler: async () => ({ x: 1 }) }],
      connectors: ['ci-conn-dispose'],
    };
    const result = await workflowEngine.run(def);
    expect(result.status).toBe('completed');
    expect(result.error).toBeNull();
  });

  it('a connector name in requiredConnectors that is not registered fails validate()', () => {
    const result = workflowEngine.validate({
      id: 'ci-wf-missing-conn',
      steps: [{
        id: 'step', dependsOn: [],
        handler: async () => ({}),
        requiredConnectors: ['not-registered'],
      }],
    } as PhaseBWorkflowDefinition);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not-registered'))).toBe(true);
  });
});
