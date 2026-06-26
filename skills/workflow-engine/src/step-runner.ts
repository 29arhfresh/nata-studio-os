const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 0;

export interface StepInput {
  stepId: string;
  workflowId: string;
  context: Record<string, unknown>;
  data: Record<string, unknown>;
}

export interface StepResult {
  stepId: string;
  status: 'completed' | 'failed';
  output: unknown;
  error: string | null;
  durationMs: number;
  attempt: number;
}

export type StepHandler = (input: StepInput) => Promise<unknown> | unknown;

/** Executes a step handler with configurable timeout and retry logic. */
export class StepRunner {
  /** Runs a handler, retrying up to maxRetries times on failure. */
  async run(
    stepId: string,
    handler: StepHandler,
    input: StepInput,
    options: { timeoutMs?: number; maxRetries?: number } = {},
  ): Promise<StepResult> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    let lastError = '';
    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt++;
      const startMs = Date.now();
      try {
        const output = await this.executeWithTimeout(handler, input, timeoutMs);
        return {
          stepId,
          status: 'completed',
          output,
          error: null,
          durationMs: Date.now() - startMs,
          attempt,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt > maxRetries) {
          return {
            stepId,
            status: 'failed',
            output: null,
            error: lastError,
            durationMs: Date.now() - startMs,
            attempt,
          };
        }
      }
    }

    return { stepId, status: 'failed', output: null, error: lastError, durationMs: 0, attempt };
  }

  private executeWithTimeout(
    handler: StepHandler,
    input: StepInput,
    timeoutMs: number,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`STEP_TIMEOUT: Step "${input.stepId}" exceeded ${timeoutMs}ms.`));
      }, timeoutMs);

      Promise.resolve()
        .then(() => handler(input))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err: unknown) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}
