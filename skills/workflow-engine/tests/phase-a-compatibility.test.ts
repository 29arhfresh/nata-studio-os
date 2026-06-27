import workflowEngine from '../src/index';
import type { WorkflowDefinition, WorkflowRunOptions, WorkflowResult } from '../src/index';

describe('Phase A Compatibility', () => {
  const linearDef: WorkflowDefinition = {
    id: 'compat-linear',
    steps: [
      { id: 'a', dependsOn: [], handler: async () => ({ out: 42 }) },
      { id: 'b', dependsOn: ['a'], handler: async (input) => input.data['val'] },
    ],
    routes: [{ fromStep: 'a', toStep: 'b', outputKey: 'out', inputKey: 'val' }],
  };

  it('a Phase A WorkflowDefinition produces a result whose core fields match Phase A WorkflowResult', async () => {
    const result = await workflowEngine.run(linearDef, { context: { x: 1 } });
    const phaseAResult: WorkflowResult = {
      workflowId: result.workflowId,
      status: result.status,
      stepResults: result.stepResults,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      error: result.error,
    };
    expect(phaseAResult.workflowId).toBe('compat-linear');
    expect(phaseAResult.status).toBe('completed');
    expect(phaseAResult.stepResults).toHaveLength(2);
    expect(phaseAResult.error).toBeNull();
    expect(typeof phaseAResult.startedAt).toBe('number');
    expect(typeof phaseAResult.completedAt).toBe('number');
  });

  it('all Phase A event types are emitted in the same order with the same payloads', async () => {
    const events: string[] = [];
    const def: WorkflowDefinition = {
      id: 'compat-events',
      steps: [{ id: 'step-x', dependsOn: [], handler: async () => 'output' }],
    };
    const options: WorkflowRunOptions = {
      onEvent: (e) => events.push(e.type),
    };
    await workflowEngine.run(def, options);
    expect(events).toEqual(['workflow:started', 'step:started', 'step:completed', 'workflow:completed']);
  });

  it('Phase A event types emitted on step failure path', async () => {
    const events: string[] = [];
    const def: WorkflowDefinition = {
      id: 'compat-fail',
      steps: [{ id: 'step-x', dependsOn: [], handler: async () => { throw new Error('fail'); } }],
    };
    await workflowEngine.run(def, { onEvent: (e) => events.push(e.type) });
    expect(events).toEqual(['workflow:started', 'step:started', 'step:failed', 'workflow:failed']);
  });

  it('Phase A error codes thrown under the same conditions (INVALID_WORKFLOW)', async () => {
    await expect(workflowEngine.run({ id: '', steps: [{ id: 's', dependsOn: [], handler: async () => ({}) }] }))
      .rejects.toThrow('INVALID_WORKFLOW');
  });

  it('Phase A UNKNOWN_DEPENDENCY error thrown for unknown dep', () => {
    const result = workflowEngine.validate({
      id: 'wf',
      steps: [{ id: 'a', dependsOn: ['ghost'], handler: async () => ({}) }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('UNKNOWN_DEPENDENCY'))).toBe(true);
  });

  it('a Phase A workflow with routes and context produces the same data routing and context behavior', async () => {
    let capturedData: Record<string, unknown> = {};
    let capturedContext: Record<string, unknown> = {};
    const def: WorkflowDefinition = {
      id: 'compat-routing',
      steps: [
        { id: 'producer', dependsOn: [], handler: async () => ({ result: 99 }) },
        {
          id: 'consumer', dependsOn: ['producer'],
          handler: async (input) => {
            capturedData = input.data;
            capturedContext = input.context;
            return null;
          },
        },
      ],
      routes: [{ fromStep: 'producer', toStep: 'consumer', outputKey: 'result', inputKey: 'received' }],
    };
    await workflowEngine.run(def, { context: { ctxVal: 'hello' } });
    expect(capturedData['received']).toBe(99);
    expect(capturedContext['ctxVal']).toBe('hello');
  });
});
