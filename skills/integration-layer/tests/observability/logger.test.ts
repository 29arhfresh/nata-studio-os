import { ConsoleLogger, NoopLogger } from '../../src/observability/logger';

describe('NoopLogger', () => {
  const logger = new NoopLogger();

  it('does not throw for any log level', () => {
    expect(() => logger.debug('msg')).not.toThrow();
    expect(() => logger.info('msg')).not.toThrow();
    expect(() => logger.warn('msg')).not.toThrow();
    expect(() => logger.error('msg')).not.toThrow();
  });

  it('child() returns itself', () => {
    expect(logger.child({ skillName: 'test' })).toBe(logger);
  });
});

describe('ConsoleLogger', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const consoleErrSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleSpy.mockClear();
    consoleErrSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleErrSpy.mockRestore();
  });

  it('logs info to console.log', () => {
    const logger = new ConsoleLogger('info');
    logger.info('hello');
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(line.level).toBe('info');
    expect(line.msg).toBe('hello');
  });

  it('logs error to console.error', () => {
    const logger = new ConsoleLogger('debug');
    logger.error('oops');
    expect(consoleErrSpy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(consoleErrSpy.mock.calls[0][0] as string);
    expect(line.level).toBe('error');
  });

  it('respects minLevel — suppresses messages below threshold', () => {
    const logger = new ConsoleLogger('warn');
    logger.debug('nope');
    logger.info('nope');
    expect(consoleSpy).not.toHaveBeenCalled();
    logger.warn('yes');
    expect(consoleErrSpy).toHaveBeenCalledTimes(1);
  });

  it('child() inherits and merges meta', () => {
    const logger = new ConsoleLogger('info', { skillName: 'parent' });
    const child = logger.child({ requestId: 'req-1' });
    child.info('child message');
    const line = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(line.skillName).toBe('parent');
    expect(line.requestId).toBe('req-1');
  });

  it('includes meta in log output', () => {
    const logger = new ConsoleLogger('debug');
    logger.debug('test', { traceId: 'tr-1', spanId: 'sp-1' });
    const line = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(line.traceId).toBe('tr-1');
    expect(line.spanId).toBe('sp-1');
  });

  it('includes a ts field in ISO 8601 format', () => {
    const logger = new ConsoleLogger('info');
    logger.info('with timestamp');
    const line = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(typeof line.ts).toBe('string');
    expect(() => new Date(line.ts as string).toISOString()).not.toThrow();
  });
});
