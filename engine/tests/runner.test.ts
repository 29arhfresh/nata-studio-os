import { executeStep } from '../src/runner';
import { EventBus } from '../src/events/bus';
import type { WorkflowContext } from '../src/context';
import type { StepDefinition } from '../src/types';

function makeCtx(): WorkflowContext {
  return {
    runId: 'run-1',
    workflowId: 'wf-1',
    startedAt: new Date(),
    input: { x: 'hello' },
    steps: {},
    metadata: {},
  };
}

const syncPolicy = { maxAttempts: 1, backoffMs: 0 };
const retryPolicy = { maxAttempts: 3, backoffMs: 1 };

describe('executeStep', () => {
  it('executes adapter and writes output to context', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const step: StepDefinition = {
      stepId: 'greet',
      adapter: ({ name }: { name: string }) => `Hello, ${name}`,
      inputMap: { name: 'workflow.input.x' },
      outputKey: 'greeting',
    };

    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('completed');
    expect(state.output).toBe('Hello, hello');
    expect(ctx.steps['greet'].output).toBe('Hello, hello');
  });

  it('resolves async adapter', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const step: StepDefinition = {
      stepId: 'async-step',
      adapter: async () => ({ result: 42 }),
      inputMap: {},
      outputKey: 'result',
    };

    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('completed');
    expect((state.output as { result: number }).result).toBe(42);
  });

  it('skips step when condition returns false', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const step: StepDefinition = {
      stepId: 'conditional',
      adapter: () => 'should not run',
      inputMap: {},
      outputKey: 'out',
      condition: () => false,
    };

    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('skipped');
    expect(state.output).toBeUndefined();
  });

  it('executes step when condition returns true', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const step: StepDefinition = {
      stepId: 'conditional',
      adapter: () => 'ran',
      inputMap: {},
      outputKey: 'out',
      condition: () => true,
    };

    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('completed');
  });

  it('returns failed state when adapter throws (abort strategy)', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const step: StepDefinition = {
      stepId: 'broken',
      adapter: () => { throw new Error('boom'); },
      inputMap: {},
      outputKey: 'out',
    };

    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('failed');
    expect(state.error?.code).toBe('ADAPTER_ERROR');
  });

  it('returns skipped state when adapter throws and onError is skip', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const step: StepDefinition = {
      stepId: 'skippable',
      adapter: () => { throw new Error('fail'); },
      inputMap: {},
      outputKey: 'out',
      onError: 'skip',
    };

    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('skipped');
  });

  it('retries on failure and succeeds on second attempt', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    let calls = 0;
    const step: StepDefinition = {
      stepId: 'flaky',
      adapter: () => {
        calls++;
        if (calls < 2) throw new Error('transient');
        return 'ok';
      },
      inputMap: {},
      outputKey: 'out',
    };

    const state = await executeStep(step, ctx, retryPolicy, bus);
    expect(state.status).toBe('completed');
    expect(state.output).toBe('ok');
    expect(calls).toBe(2);
  });

  it('returns MAX_RETRIES_EXCEEDED after exhausting attempts', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    let calls = 0;
    const step: StepDefinition = {
      stepId: 'always-fails',
      adapter: () => { calls++; throw new Error('persistent'); },
      inputMap: {},
      outputKey: 'out',
    };

    const state = await executeStep(step, ctx, retryPolicy, bus);
    expect(state.status).toBe('failed');
    expect(state.error?.code).toBe('MAX_RETRIES_EXCEEDED');
    expect(calls).toBe(3);
  });

  it('returns MISSING_CONTEXT_PATH without retrying when path is missing', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    let calls = 0;
    const step: StepDefinition = {
      stepId: 'no-path',
      adapter: () => { calls++; return 'ok'; },
      inputMap: { x: 'workflow.input.does_not_exist' },
      outputKey: 'out',
    };

    const state = await executeStep(step, ctx, retryPolicy, bus);
    expect(state.status).toBe('failed');
    expect(state.error?.code).toBe('MISSING_CONTEXT_PATH');
    expect(calls).toBe(0);
  });

  it('emits step.started, step.completed events on success', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const emitted: string[] = [];
    bus.subscribeAll((e) => { emitted.push(e.type); });

    const step: StepDefinition = { stepId: 'ev', adapter: () => 1, inputMap: {}, outputKey: 'out' };
    await executeStep(step, ctx, syncPolicy, bus);

    expect(emitted).toContain('step.started');
    expect(emitted).toContain('step.completed');
  });

  it('emits step.failed on terminal failure', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const emitted: string[] = [];
    bus.subscribeAll((e) => { emitted.push(e.type); });

    const step: StepDefinition = {
      stepId: 'ev-fail',
      adapter: () => { throw new Error('x'); },
      inputMap: {},
      outputKey: 'out',
    };
    await executeStep(step, ctx, syncPolicy, bus);

    expect(emitted).toContain('step.failed');
  });

  it('emits step.retrying on each retry attempt', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const emitted: string[] = [];
    bus.subscribeAll((e) => { emitted.push(e.type); });

    let calls = 0;
    const step: StepDefinition = {
      stepId: 'retry-ev',
      adapter: () => { if (++calls < 3) throw new Error('x'); return 'ok'; },
      inputMap: {},
      outputKey: 'out',
    };
    await executeStep(step, ctx, retryPolicy, bus);

    expect(emitted.filter((t) => t === 'step.retrying')).toHaveLength(2);
  });

  it('skips step and emits step.skipped when condition throws', async () => {
    const ctx = makeCtx();
    const bus = new EventBus();
    const emitted: string[] = [];
    bus.subscribeAll((e) => { emitted.push(e.type); });

    const step: StepDefinition = {
      stepId: 'cond-throw',
      adapter: () => 'ok',
      inputMap: {},
      outputKey: 'out',
      condition: () => { throw new Error('bad condition'); },
      onError: 'skip',
    };
    const state = await executeStep(step, ctx, syncPolicy, bus);
    expect(state.status).toBe('skipped');
    expect(emitted).toContain('step.skipped');
  });
});
