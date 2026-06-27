import { WorkflowEngine } from '../src/index';
import type { WorkflowDefinition } from '../src/types';

function engine() {
  return new WorkflowEngine();
}

describe('WorkflowEngine — linear pipeline', () => {
  it('runs a single-step workflow and returns completed status', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'single',
      name: 'Single',
      version: '1.0.0',
      steps: [
        {
          stepId: 'greet',
          adapter: ({ name }: { name: string }) => `Hello, ${name}`,
          inputMap: { name: 'workflow.input.name' },
          outputKey: 'greeting',
        },
      ],
    }, { name: 'World' });

    expect(result.status).toBe('completed');
    expect(result.context.steps['greet'].output).toBe('Hello, World');
  });

  it('passes output of step A into step B', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'chain',
      name: 'Chain',
      version: '1.0.0',
      steps: [
        {
          stepId: 'step-a',
          adapter: ({ x }: { x: number }) => x * 2,
          inputMap: { x: 'workflow.input.value' },
          outputKey: 'doubled',
        },
        {
          stepId: 'step-b',
          adapter: ({ n }: { n: number }) => n + 10,
          inputMap: { n: 'steps.step-a.output' },
          outputKey: 'result',
        },
      ],
    }, { value: 5 });

    expect(result.status).toBe('completed');
    expect(result.context.steps['step-a'].output).toBe(10);
    expect(result.context.steps['step-b'].output).toBe(20);
  });

  it('handles a three-step chain correctly', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'three',
      name: 'Three',
      version: '1.0.0',
      steps: [
        { stepId: 'a', adapter: () => 1, inputMap: {}, outputKey: 'a' },
        { stepId: 'b', adapter: ({ v }: { v: number }) => v + 1, inputMap: { v: 'steps.a.output' }, outputKey: 'b' },
        { stepId: 'c', adapter: ({ v }: { v: number }) => v + 1, inputMap: { v: 'steps.b.output' }, outputKey: 'c' },
      ],
    }, {});

    expect(result.context.steps['c'].output).toBe(3);
  });
});

describe('WorkflowEngine — parallel execution', () => {
  it('runs independent steps concurrently', async () => {
    const e = engine();
    const order: string[] = [];

    const result = await e.runWorkflow({
      workflowId: 'parallel',
      name: 'Parallel',
      version: '1.0.0',
      steps: [
        { stepId: 'p1', adapter: () => { order.push('p1'); return 'a'; }, inputMap: {}, outputKey: 'p1' },
        { stepId: 'p2', adapter: () => { order.push('p2'); return 'b'; }, inputMap: {}, outputKey: 'p2' },
      ],
    }, {});

    expect(result.status).toBe('completed');
    expect(result.context.steps['p1'].output).toBe('a');
    expect(result.context.steps['p2'].output).toBe('b');
    // Both ran (order non-deterministic, but both must appear).
    expect(order).toContain('p1');
    expect(order).toContain('p2');
  });

  it('runs fan-out + fan-in (diamond) correctly', async () => {
    const e = engine();

    const result = await e.runWorkflow({
      workflowId: 'diamond',
      name: 'Diamond',
      version: '1.0.0',
      steps: [
        { stepId: 'root', adapter: () => 10, inputMap: {}, outputKey: 'root' },
        { stepId: 'left', adapter: ({ v }: { v: number }) => v * 2, inputMap: { v: 'steps.root.output' }, outputKey: 'left' },
        { stepId: 'right', adapter: ({ v }: { v: number }) => v * 3, inputMap: { v: 'steps.root.output' }, outputKey: 'right' },
        {
          stepId: 'merge',
          adapter: ({ l, r }: { l: number; r: number }) => l + r,
          inputMap: { l: 'steps.left.output', r: 'steps.right.output' },
          outputKey: 'merged',
        },
      ],
    }, {});

    expect(result.status).toBe('completed');
    expect(result.context.steps['merge'].output).toBe(50); // 20 + 30
  });
});

describe('WorkflowEngine — error handling', () => {
  it('returns failed status when a step fails with abort strategy', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'err-abort',
      name: 'Err',
      version: '1.0.0',
      steps: [
        { stepId: 'fail', adapter: () => { throw new Error('boom'); }, inputMap: {}, outputKey: 'out' },
        { stepId: 'after', adapter: () => 'should not run', inputMap: {}, outputKey: 'after', dependsOn: ['fail'] },
      ],
    }, {});

    expect(result.status).toBe('failed');
    expect(result.error?.code).toBe('ADAPTER_ERROR');
    expect(result.context.steps['after']).toBeUndefined();
  });

  it('returns partial status when a step is skipped via onError:skip', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'skip-test',
      name: 'Skip',
      version: '1.0.0',
      steps: [
        { stepId: 'ok', adapter: () => 'good', inputMap: {}, outputKey: 'ok' },
        { stepId: 'skip-me', adapter: () => { throw new Error('skip'); }, inputMap: {}, outputKey: 'skipped', onError: 'skip' },
      ],
    }, {});

    expect(result.status).toBe('partial');
    expect(result.context.steps['ok'].status).toBe('completed');
    expect(result.context.steps['skip-me'].status).toBe('skipped');
  });

  it('stops at first failure and does not execute dependent steps', async () => {
    const e = engine();
    const ran: string[] = [];

    const result = await e.runWorkflow({
      workflowId: 'cascade',
      name: 'Cascade',
      version: '1.0.0',
      steps: [
        { stepId: 'a', adapter: () => { ran.push('a'); throw new Error('a fails'); }, inputMap: {}, outputKey: 'a' },
        { stepId: 'b', adapter: () => { ran.push('b'); return 'b'; }, inputMap: { x: 'steps.a.output' }, outputKey: 'b' },
      ],
    }, {});

    expect(result.status).toBe('failed');
    expect(ran).toContain('a');
    expect(ran).not.toContain('b');
  });
});

describe('WorkflowEngine — conditional steps', () => {
  it('skips step when condition is false and returns partial', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'cond',
      name: 'Cond',
      version: '1.0.0',
      steps: [
        { stepId: 'always', adapter: () => 'yes', inputMap: {}, outputKey: 'always' },
        {
          stepId: 'sometimes',
          adapter: () => 'conditional',
          inputMap: {},
          outputKey: 'sometimes',
          condition: (ctx) => (ctx.input['flag'] as boolean) === true,
        },
      ],
    }, { flag: false });

    expect(result.status).toBe('partial');
    expect(result.context.steps['always'].status).toBe('completed');
    expect(result.context.steps['sometimes'].status).toBe('skipped');
  });

  it('executes conditional step when condition is true', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'cond-true',
      name: 'CondTrue',
      version: '1.0.0',
      steps: [
        {
          stepId: 'gate',
          adapter: () => 'ran',
          inputMap: {},
          outputKey: 'gate',
          condition: () => true,
        },
      ],
    }, {});

    expect(result.status).toBe('completed');
    expect(result.context.steps['gate'].output).toBe('ran');
  });
});

describe('WorkflowEngine — registry', () => {
  it('registers and runs a workflow by ID', async () => {
    const e = engine();
    const def: WorkflowDefinition = {
      workflowId: 'reg-test',
      name: 'Registered',
      version: '1.0.0',
      steps: [{ stepId: 's', adapter: () => 99, inputMap: {}, outputKey: 's' }],
    };
    e.defineWorkflow(def);

    const result = await e.runWorkflow('reg-test', {});
    expect(result.status).toBe('completed');
    expect(result.context.steps['s'].output).toBe(99);
  });

  it('throws when running an unregistered workflow ID', async () => {
    const e = engine();
    await expect(e.runWorkflow('does-not-exist', {})).rejects.toThrow('not registered');
  });
});

describe('WorkflowEngine — events', () => {
  it('emits workflow.started and workflow.completed for a successful run', async () => {
    const e = engine();
    const types: string[] = [];
    e.bus.subscribeAll((ev) => { types.push(ev.type); });

    await e.runWorkflow({
      workflowId: 'ev-test',
      name: 'Ev',
      version: '1.0.0',
      steps: [{ stepId: 's', adapter: () => 1, inputMap: {}, outputKey: 's' }],
    }, {});

    expect(types).toContain('workflow.started');
    expect(types).toContain('workflow.completed');
  });

  it('emits workflow.failed on error', async () => {
    const e = engine();
    const types: string[] = [];
    e.bus.subscribeAll((ev) => { types.push(ev.type); });

    await e.runWorkflow({
      workflowId: 'ev-fail',
      name: 'EvFail',
      version: '1.0.0',
      steps: [{ stepId: 'f', adapter: () => { throw new Error('x'); }, inputMap: {}, outputKey: 'f' }],
    }, {});

    expect(types).toContain('workflow.failed');
  });

  it('replays all events for a given runId', async () => {
    const e = engine();
    const result = await e.runWorkflow({
      workflowId: 'replay',
      name: 'Replay',
      version: '1.0.0',
      steps: [{ stepId: 's', adapter: () => 1, inputMap: {}, outputKey: 's' }],
    }, {});

    const events = e.bus.replay(result.runId);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].runId).toBe(result.runId);
  });

  it('throws WORKFLOW_CYCLE_DETECTED at defineWorkflow time', () => {
    const e = engine();
    expect(() =>
      e.defineWorkflow({
        workflowId: 'cycle',
        name: 'Cycle',
        version: '1.0.0',
        steps: [
          { stepId: 'a', adapter: () => 1, inputMap: {}, outputKey: 'a', dependsOn: ['b'] },
          { stepId: 'b', adapter: () => 2, inputMap: {}, outputKey: 'b', dependsOn: ['a'] },
        ],
      }),
    ).toThrow('WORKFLOW_CYCLE_DETECTED');
  });
});
