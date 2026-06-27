/**
 * Integration Layer error hierarchy.
 * All errors carry a typed code, optional requestId, and optional cause chain.
 */

// ─── Error Codes ──────────────────────────────────────────────────────────────

export type IntegrationErrorCode =
  | 'SKILL_NOT_FOUND'
  | 'SKILL_INVOCATION_FAILED'
  | 'SKILL_TIMEOUT'
  | 'AGGREGATION_FAILED'
  | 'CAPABILITY_NOT_AVAILABLE'
  | 'CONTEXT_INVALID'
  | 'REGISTRY_ERROR'
  | 'ADAPTER_ERROR';

// ─── Base Error ───────────────────────────────────────────────────────────────

export class IntegrationError extends Error {
  readonly code: IntegrationErrorCode;
  readonly requestId?: string;
  override readonly cause?: Error;

  constructor(
    message: string,
    code: IntegrationErrorCode,
    requestId?: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'IntegrationError';
    this.code = code;
    this.requestId = requestId;
    this.cause = cause;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

// ─── Subtypes ─────────────────────────────────────────────────────────────────

export class SkillNotFoundError extends IntegrationError {
  constructor(skillName: string, requestId?: string) {
    super(`Skill "${skillName}" is not registered`, 'SKILL_NOT_FOUND', requestId);
    this.name = 'SkillNotFoundError';
  }
}

export class SkillInvocationError extends IntegrationError {
  constructor(message: string, requestId?: string, cause?: Error) {
    super(message, 'SKILL_INVOCATION_FAILED', requestId, cause);
    this.name = 'SkillInvocationError';
  }
}

export class SkillTimeoutError extends IntegrationError {
  readonly timeoutMs: number;

  constructor(skillName: string, timeoutMs: number, requestId?: string) {
    super(
      `Skill "${skillName}" timed out after ${timeoutMs}ms`,
      'SKILL_TIMEOUT',
      requestId
    );
    this.name = 'SkillTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class AggregationError extends IntegrationError {
  constructor(message: string, cause?: Error) {
    super(message, 'AGGREGATION_FAILED', undefined, cause);
    this.name = 'AggregationError';
  }
}

export class CapabilityNotAvailableError extends IntegrationError {
  constructor(capability: string, requestId?: string) {
    super(
      `No Skill registered with capability "${capability}"`,
      'CAPABILITY_NOT_AVAILABLE',
      requestId
    );
    this.name = 'CapabilityNotAvailableError';
  }
}

export class ContextInvalidError extends IntegrationError {
  constructor(reason: string, requestId?: string) {
    super(`Invalid context: ${reason}`, 'CONTEXT_INVALID', requestId);
    this.name = 'ContextInvalidError';
  }
}

export class RegistryError extends IntegrationError {
  constructor(message: string, cause?: Error) {
    super(message, 'REGISTRY_ERROR', undefined, cause);
    this.name = 'RegistryError';
  }
}

export class AdapterError extends IntegrationError {
  constructor(message: string, requestId?: string, cause?: Error) {
    super(message, 'ADAPTER_ERROR', requestId, cause);
    this.name = 'AdapterError';
  }
}

// ─── Guard ────────────────────────────────────────────────────────────────────

export function isIntegrationError(err: unknown): err is IntegrationError {
  return err instanceof IntegrationError;
}
