export type WorkflowErrorCode =
  | 'MISSING_CONTEXT_PATH'
  | 'ADAPTER_ERROR'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'STEP_TIMEOUT'
  | 'MAX_RETRIES_EXCEEDED'
  | 'CONDITION_EVALUATION_FAILED'
  | 'WORKFLOW_CYCLE_DETECTED';

export interface WorkflowError {
  code: WorkflowErrorCode;
  stepId: string;
  message: string;
  cause?: unknown;
  retryable: boolean;
}

export function makeError(
  code: WorkflowErrorCode,
  stepId: string,
  message: string,
  opts?: { cause?: unknown; retryable?: boolean },
): WorkflowError {
  return {
    code,
    stepId,
    message,
    cause: opts?.cause,
    retryable: opts?.retryable ?? false,
  };
}
