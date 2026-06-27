import {
  AdapterError,
  AggregationError,
  CapabilityNotAvailableError,
  ContextInvalidError,
  IntegrationError,
  RegistryError,
  SkillInvocationError,
  SkillNotFoundError,
  SkillTimeoutError,
  isIntegrationError,
} from '../../src/contracts/errors';

describe('IntegrationError', () => {
  it('is an instance of Error', () => {
    const err = new IntegrationError('msg', 'REGISTRY_ERROR');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(IntegrationError);
  });

  it('sets code, message, and name', () => {
    const err = new IntegrationError('something failed', 'SKILL_NOT_FOUND');
    expect(err.code).toBe('SKILL_NOT_FOUND');
    expect(err.message).toBe('something failed');
    expect(err.name).toBe('IntegrationError');
  });

  it('stores optional requestId and cause', () => {
    const cause = new Error('root cause');
    const err = new IntegrationError('msg', 'SKILL_TIMEOUT', 'req-1', cause);
    expect(err.requestId).toBe('req-1');
    expect(err.cause).toBe(cause);
  });
});

describe('SkillNotFoundError', () => {
  it('extends IntegrationError with SKILL_NOT_FOUND code', () => {
    const err = new SkillNotFoundError('memory-system', 'req-2');
    expect(err).toBeInstanceOf(IntegrationError);
    expect(err.code).toBe('SKILL_NOT_FOUND');
    expect(err.name).toBe('SkillNotFoundError');
    expect(err.message).toContain('memory-system');
    expect(err.requestId).toBe('req-2');
  });
});

describe('SkillInvocationError', () => {
  it('wraps a cause and sets SKILL_INVOCATION_FAILED', () => {
    const cause = new Error('network error');
    const err = new SkillInvocationError('invoke failed', 'req-3', cause);
    expect(err.code).toBe('SKILL_INVOCATION_FAILED');
    expect(err.cause).toBe(cause);
    expect(err.requestId).toBe('req-3');
  });
});

describe('SkillTimeoutError', () => {
  it('records timeoutMs', () => {
    const err = new SkillTimeoutError('slow-skill', 5000, 'req-4');
    expect(err.code).toBe('SKILL_TIMEOUT');
    expect(err.timeoutMs).toBe(5000);
    expect(err.message).toContain('5000');
    expect(err.message).toContain('slow-skill');
  });
});

describe('AggregationError', () => {
  it('uses AGGREGATION_FAILED code', () => {
    const err = new AggregationError('cannot merge');
    expect(err.code).toBe('AGGREGATION_FAILED');
    expect(err.name).toBe('AggregationError');
  });
});

describe('CapabilityNotAvailableError', () => {
  it('includes capability name in message', () => {
    const err = new CapabilityNotAvailableError('image-generation', 'req-5');
    expect(err.code).toBe('CAPABILITY_NOT_AVAILABLE');
    expect(err.message).toContain('image-generation');
  });
});

describe('ContextInvalidError', () => {
  it('includes reason in message', () => {
    const err = new ContextInvalidError('sessionId is empty');
    expect(err.code).toBe('CONTEXT_INVALID');
    expect(err.message).toContain('sessionId is empty');
  });
});

describe('RegistryError', () => {
  it('uses REGISTRY_ERROR code', () => {
    const err = new RegistryError('already registered');
    expect(err.code).toBe('REGISTRY_ERROR');
    expect(err.name).toBe('RegistryError');
  });
});

describe('AdapterError', () => {
  it('uses ADAPTER_ERROR code', () => {
    const err = new AdapterError('operation failed', 'req-6');
    expect(err.code).toBe('ADAPTER_ERROR');
    expect(err.requestId).toBe('req-6');
  });
});

describe('isIntegrationError', () => {
  it('returns true for IntegrationError instances', () => {
    expect(isIntegrationError(new SkillNotFoundError('x'))).toBe(true);
    expect(isIntegrationError(new SkillTimeoutError('x', 1000))).toBe(true);
  });

  it('returns false for plain Error', () => {
    expect(isIntegrationError(new Error('plain'))).toBe(false);
  });

  it('returns false for non-errors', () => {
    expect(isIntegrationError(null)).toBe(false);
    expect(isIntegrationError('string')).toBe(false);
    expect(isIntegrationError(42)).toBe(false);
  });
});
