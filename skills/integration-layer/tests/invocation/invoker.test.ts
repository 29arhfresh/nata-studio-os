import {
  SkillInvocationError,
  SkillNotFoundError,
  SkillTimeoutError,
} from '../../src/contracts/errors';
import { createContext } from '../../src/contracts/context';
import { createRequest, createResponse } from '../../src/contracts/request';
import { CapabilityRegistry } from '../../src/registry/registry';
import { SkillInvoker } from '../../src/invocation/invoker';
import type { ISkillAdapter } from '../../src/invocation/types';
import type { SkillManifest } from '../../src/registry/types';
import type { SkillRequest, SkillResponse } from '../../src/contracts/request';

const ctx = createContext({ sessionId: 'test-sess', traceId: 'tr', spanId: 'sp' });

function makeManifest(name: string): SkillManifest {
  return {
    name,
    version: '0.1.0',
    description: '',
    capabilities: [],
    operations: [],
    priority: 50,
    maxConcurrency: 2,
    timeoutMs: 30_000,
    tags: [],
  };
}

function makeSuccessAdapter(name: string, output: unknown = { ok: true }): ISkillAdapter {
  return {
    name,
    async invoke<TInput, TOutput>(req: SkillRequest<TInput>): Promise<SkillResponse<TOutput>> {
      return createResponse({ request: req, output: output as TOutput, context: req.context, durationMs: 1 });
    },
  };
}

function makeErrorAdapter(name: string, error: Error): ISkillAdapter {
  return {
    name,
    async invoke<TInput, TOutput>(_req: SkillRequest<TInput>): Promise<SkillResponse<TOutput>> {
      throw error;
    },
  };
}

function makeTimeoutAdapter(name: string, delayMs: number): ISkillAdapter {
  return {
    name,
    async invoke<TInput, TOutput>(req: SkillRequest<TInput>): Promise<SkillResponse<TOutput>> {
      await new Promise((res) => setTimeout(res, delayMs));
      return createResponse({ request: req, output: {} as TOutput, context: req.context, durationMs: delayMs });
    },
  };
}

describe('SkillInvoker.invoke', () => {
  it('returns the adapter response for a registered skill', async () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest('memory-system'), makeSuccessAdapter('memory-system', { id: 'ms-1' }));
    const invoker = new SkillInvoker(reg);
    const req = createRequest({ skillName: 'memory-system', operation: 'store', input: {}, context: ctx });
    const res = await invoker.invoke(req);
    expect(res.output).toEqual({ id: 'ms-1' });
    expect(res.skillName).toBe('memory-system');
  });

  it('throws SkillNotFoundError for unknown skills', async () => {
    const reg = new CapabilityRegistry();
    const invoker = new SkillInvoker(reg);
    const req = createRequest({ skillName: 'unknown', operation: 'op', input: {}, context: ctx });
    await expect(invoker.invoke(req)).rejects.toThrow(SkillNotFoundError);
  });

  it('propagates adapter errors as SkillInvocationError after retries', async () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest('failing'), makeErrorAdapter('failing', new Error('broken')));
    const invoker = new SkillInvoker(reg);
    const req = createRequest({
      skillName: 'failing', operation: 'op', input: {}, context: ctx,
      options: { maxRetries: 1, retryDelayMs: 1 },
    });
    await expect(invoker.invoke(req)).rejects.toThrow(SkillInvocationError);
  });

  it('throws SkillTimeoutError when adapter exceeds timeoutMs', async () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest('slow'), makeTimeoutAdapter('slow', 200));
    const invoker = new SkillInvoker(reg);
    const req = createRequest({
      skillName: 'slow', operation: 'op', input: {}, context: ctx,
      options: { timeoutMs: 50 },
    });
    await expect(invoker.invoke(req)).rejects.toThrow(SkillTimeoutError);
  }, 1000);

  it('succeeds on retry after transient failure', async () => {
    let calls = 0;
    const flakyAdapter: ISkillAdapter = {
      name: 'flaky',
      async invoke<TInput, TOutput>(req: SkillRequest<TInput>): Promise<SkillResponse<TOutput>> {
        calls++;
        if (calls < 2) throw new Error('transient');
        return createResponse({ request: req, output: { recovered: true } as TOutput, context: req.context, durationMs: 1 });
      },
    };
    const reg = new CapabilityRegistry();
    reg.register(makeManifest('flaky'), flakyAdapter);
    const invoker = new SkillInvoker(reg);
    const req = createRequest({
      skillName: 'flaky', operation: 'op', input: {}, context: ctx,
      options: { maxRetries: 2, retryDelayMs: 1 },
    });
    const res = await invoker.invoke<unknown, { recovered: boolean }>(req);
    expect(res.output.recovered).toBe(true);
    expect(calls).toBe(2);
  });
});

describe('SkillInvoker.invokeMany', () => {
  it('executes multiple requests in parallel', async () => {
    const reg = new CapabilityRegistry();
    reg.register(makeManifest('skill-a'), makeSuccessAdapter('skill-a', 'a'));
    reg.register(makeManifest('skill-b'), makeSuccessAdapter('skill-b', 'b'));
    const invoker = new SkillInvoker(reg);
    const requests = [
      createRequest({ skillName: 'skill-a', operation: 'op', input: {}, context: ctx }),
      createRequest({ skillName: 'skill-b', operation: 'op', input: {}, context: ctx }),
    ];
    const results = await invoker.invokeMany(requests, 'parallel');
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.output).sort()).toEqual(['a', 'b'].sort());
  });

  it('executes multiple requests sequentially', async () => {
    const order: string[] = [];
    function makeOrderedAdapter(name: string): ISkillAdapter {
      return {
        name,
        async invoke<TInput, TOutput>(req: SkillRequest<TInput>): Promise<SkillResponse<TOutput>> {
          order.push(name);
          return createResponse({ request: req, output: name as TOutput, context: req.context, durationMs: 1 });
        },
      };
    }
    const reg = new CapabilityRegistry();
    reg.register(makeManifest('first'), makeOrderedAdapter('first'));
    reg.register(makeManifest('second'), makeOrderedAdapter('second'));
    const invoker = new SkillInvoker(reg);
    const requests = [
      createRequest({ skillName: 'first', operation: 'op', input: {}, context: ctx }),
      createRequest({ skillName: 'second', operation: 'op', input: {}, context: ctx }),
    ];
    await invoker.invokeMany(requests, 'sequential');
    expect(order).toEqual(['first', 'second']);
  });

  it('returns an empty array for empty input', async () => {
    const invoker = new SkillInvoker(new CapabilityRegistry());
    expect(await invoker.invokeMany([], 'parallel')).toHaveLength(0);
    expect(await invoker.invokeMany([], 'sequential')).toHaveLength(0);
  });
});
