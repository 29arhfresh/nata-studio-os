/**
 * ILogger interface with structured log entries.
 * Ships with NoopLogger (tests/silent contexts) and ConsoleLogger (development/production).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  [key: string]: unknown;
  skillName?: string;
  requestId?: string;
  traceId?: string;
  spanId?: string;
  durationMs?: number;
  error?: Error;
}

export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly meta: LogMeta;
  readonly timestamp: number;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ILogger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  child(meta: LogMeta): ILogger;
}

// ─── NoopLogger ───────────────────────────────────────────────────────────────

export class NoopLogger implements ILogger {
  debug(_message: string, _meta?: LogMeta): void { /* no-op */ }
  info(_message: string, _meta?: LogMeta): void { /* no-op */ }
  warn(_message: string, _meta?: LogMeta): void { /* no-op */ }
  error(_message: string, _meta?: LogMeta): void { /* no-op */ }
  child(_meta: LogMeta): ILogger { return this; }
}

// ─── ConsoleLogger ────────────────────────────────────────────────────────────

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class ConsoleLogger implements ILogger {
  private readonly _baseMeta: LogMeta;
  private readonly _minLevel: LogLevel;

  constructor(minLevel: LogLevel = 'info', baseMeta: LogMeta = {}) {
    this._minLevel = minLevel;
    this._baseMeta = baseMeta;
  }

  debug(message: string, meta?: LogMeta): void {
    this._emit('debug', message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this._emit('info', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this._emit('warn', message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this._emit('error', message, meta);
  }

  child(meta: LogMeta): ILogger {
    return new ConsoleLogger(this._minLevel, { ...this._baseMeta, ...meta });
  }

  private _emit(level: LogLevel, message: string, meta?: LogMeta): void {
    if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[this._minLevel]) return;

    const entry: LogEntry = {
      level,
      message,
      meta: { ...this._baseMeta, ...(meta ?? {}) },
      timestamp: Date.now(),
    };

    const line = JSON.stringify({
      ts: new Date(entry.timestamp).toISOString(),
      level: entry.level,
      msg: entry.message,
      ...entry.meta,
    });

    if (level === 'error' || level === 'warn') {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}
