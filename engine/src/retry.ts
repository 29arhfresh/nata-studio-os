import type { WorkflowError } from './errors';
import { makeError } from './errors';
import type { RetryPolicy } from './types';

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 1,
  backoffMs: 200,
};

export function shouldRetry(error: WorkflowError, policy: RetryPolicy): boolean {
  if (!error.retryable) return false;
  return policy.retryOn ? policy.retryOn(error) : true;
}

export function backoffDelay(attempt: number, baseMs: number): number {
  const exponential = baseMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * baseMs * 0.1;
  return Math.round(exponential + jitter);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function maxRetriesExceededError(stepId: string, last: WorkflowError): WorkflowError {
  return makeError(
    'MAX_RETRIES_EXCEEDED',
    stepId,
    `Step "${stepId}" exhausted all retry attempts. Last error: ${last.message}`,
    { cause: last, retryable: false },
  );
}
