/**
 * SkillInvoker — resolves adapters from the registry and executes Skill requests
 * with timeout enforcement and configurable retry logic.
 */

import {
  SkillInvocationError,
  SkillNotFoundError,
  SkillTimeoutError,
} from '../contracts/errors';
import type { SkillRequest, SkillResponse } from '../contracts/request';
import type { ICapabilityRegistry } from '../registry/types';
import type { InvocationMode, ISkillAdapter, ISkillInvoker } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 250;

export class SkillInvoker implements ISkillInvoker {
  constructor(private readonly registry: ICapabilityRegistry) {}

  async invoke<TInput, TOutput>(
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>> {
    const adapter = this.registry.getAdapter(request.skillName);
    if (!adapter) {
      throw new SkillNotFoundError(request.skillName, request.requestId);
    }
    return this._executeWithRetry<TInput, TOutput>(adapter, request);
  }

  async invokeMany<TInput, TOutput>(
    requests: ReadonlyArray<SkillRequest<TInput>>,
    mode: InvocationMode
  ): Promise<SkillResponse<TOutput>[]> {
    if (mode === 'parallel') {
      return Promise.all(requests.map((r) => this.invoke<TInput, TOutput>(r)));
    }
    const results: SkillResponse<TOutput>[] = [];
    for (const req of requests) {
      results.push(await this.invoke<TInput, TOutput>(req));
    }
    return results;
  }

  private async _executeWithRetry<TInput, TOutput>(
    adapter: ISkillAdapter,
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>> {
    const timeoutMs = request.options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxRetries = request.options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    const retryDelayMs = request.options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        await _sleep(retryDelayMs * attempt);
      }
      try {
        return await _withTimeout(
          adapter.invoke<TInput, TOutput>(request),
          timeoutMs,
          adapter.name,
          request.requestId
        );
      } catch (err) {
        if (err instanceof SkillTimeoutError) {
          throw err;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === maxRetries) break;
      }
    }

    throw new SkillInvocationError(
      `Skill "${adapter.name}" failed after ${maxRetries + 1} attempt(s): ${lastError?.message ?? 'unknown'}`,
      request.requestId,
      lastError
    );
  }
}

function _withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  skillName: string,
  requestId?: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new SkillTimeoutError(skillName, ms, requestId));
    }, ms);

    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err: unknown) => { clearTimeout(timer); reject(err); }
    );
  });
}

function _sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
