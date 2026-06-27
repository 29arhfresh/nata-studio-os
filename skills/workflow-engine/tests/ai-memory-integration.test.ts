import workflowEngine from '../src/index';
import type { PhaseBWorkflowDefinition, PhaseBStepInput } from '../src/phase-b-types';

describe('AIMemory Integration', () => {
  it('memoryWrites from a step are committed before afterStep hook fires', async () => {
    let memoryWrittenBeforeAfterStep = false;
    workflowEngine.registerPlugin({
      manifest: { name: 'ami-observer', version: '1.0.0', description: '' },
      afterStep: (ctx) => {
        if (ctx.stepId === 'writer') {
          memoryWrittenBeforeAfterStep = true;
        }
      },
    });
    const def: PhaseBWorkflowDefinition = {
      id: `ami-wf-order-${Date.now()}`,
      steps: [{
        id: 'writer', dependsOn: [],
        handler: async () => ({ result: 'written' }),
        memoryWrites: [{ outputKey: 'result', memoryKey: 'wf-result', tier: 'short-term' }],
      }],
      plugins: ['ami-observer'],
    };
    await workflowEngine.run(def);
    expect(memoryWrittenBeforeAfterStep).toBe(true);
    workflowEngine.unregisterPlugin('ami-observer');
  });

  it('committed memory writes appear in PhaseBWorkflowResult.memoryWrites', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami-wf-result-${Date.now()}`,
      steps: [{
        id: 'writer', dependsOn: [],
        handler: async () => ({ out: 'hello' }),
        memoryWrites: [{ outputKey: 'out', memoryKey: 'saved', tier: 'short-term' }],
      }],
    };
    const result = await workflowEngine.run(def);
    expect(result.memoryWrites).toBeDefined();
    expect(result.memoryWrites!.some((r) => r.key === 'saved' && r.value === 'hello')).toBe(true);
  });

  it('MemoryReader in step input can read records written by a prior run on the same engine instance', async () => {
    const scope = `ami-scope-${Date.now()}`;
    const defWriter: PhaseBWorkflowDefinition = {
      id: `ami-wf-writer-${Date.now()}`,
      steps: [{
        id: 'writer', dependsOn: [],
        handler: async () => ({ out: 'cross-run-value' }),
        memoryWrites: [{ outputKey: 'out', memoryKey: 'cross-key', tier: 'long-term' }],
      }],
      memoryScope: scope,
    };
    await workflowEngine.run(defWriter);

    let readValue: unknown;
    const defReader: PhaseBWorkflowDefinition = {
      id: `ami-wf-reader-${Date.now()}`,
      steps: [{
        id: 'reader', dependsOn: [],
        handler: async (input) => {
          readValue = (input as PhaseBStepInput).memory.get('cross-key')?.value;
          return null;
        },
      }],
      memoryScope: scope,
    };
    await workflowEngine.run(defReader);
    expect(readValue).toBe('cross-run-value');
  });

  it('memoryContext keys are accessible via input.context (seeded into ContextStore)', async () => {
    let capturedContext: Record<string, unknown> = {};
    const def: PhaseBWorkflowDefinition = {
      id: `ami-wf-memctx-${Date.now()}`,
      steps: [{
        id: 'reader', dependsOn: [],
        handler: async (input) => {
          capturedContext = (input as PhaseBStepInput).context;
          return null;
        },
      }],
    };
    await workflowEngine.run(def, { memoryContext: { seeded: 'yes' } });
    expect(capturedContext['seeded']).toBe('yes');
  });

  it('memory writes for a step that fails are not committed', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami-wf-fail-write-${Date.now()}`,
      steps: [{
        id: 'fail-writer', dependsOn: [],
        handler: async () => { throw new Error('fail'); },
        memoryWrites: [{ outputKey: 'out', memoryKey: 'fail-key', tier: 'short-term' }],
      }],
    };
    const result = await workflowEngine.run(def);
    expect(result.memoryWrites).toBeDefined();
    expect(result.memoryWrites!.some((r) => r.key === 'fail-key')).toBe(false);
  });

  it('memory writes from steps that completed before a mid-workflow failure are present in result.memoryWrites', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `ami-wf-partial-${Date.now()}`,
      steps: [
        {
          id: 'ok', dependsOn: [],
          handler: async () => ({ result: 'ok-value' }),
          memoryWrites: [{ outputKey: 'result', memoryKey: 'ok-key', tier: 'short-term' }],
        },
        {
          id: 'fail', dependsOn: ['ok'],
          handler: async () => { throw new Error('fail'); },
        },
      ],
    };
    const result = await workflowEngine.run(def);
    expect(result.status).toBe('failed');
    expect(result.memoryWrites!.some((r) => r.key === 'ok-key')).toBe(true);
  });
});
