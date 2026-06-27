/**
 * SharedContext — the canonical context object that travels with every Skill request.
 * Carries identity (session, project, trace), a versioned memory snapshot, and metadata.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContextSnapshot {
  readonly keys: readonly string[];
  readonly values: Readonly<Record<string, unknown>>;
  readonly version: number;
}

export interface SharedContext {
  readonly sessionId: string;
  readonly projectId?: string;
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly memory: ContextSnapshot;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export interface ContextPatch {
  readonly memory?: Partial<Record<string, unknown>>;
  readonly metadata?: Partial<Record<string, unknown>>;
  readonly spanId?: string;
  readonly parentSpanId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _makeId(): string {
  const hex = (n: number): string => n.toString(16).padStart(8, '0');
  return `${hex(Date.now() >>> 0)}-${hex(Math.trunc(Math.random() * 0xffffffff))}`;
}

const _EMPTY_SNAPSHOT: ContextSnapshot = Object.freeze({
  keys: Object.freeze([]) as readonly string[],
  values: Object.freeze({}) as Readonly<Record<string, unknown>>,
  version: 0,
});

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createContext(params: {
  sessionId: string;
  projectId?: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
}): SharedContext {
  if (!params.sessionId) {
    throw new TypeError('sessionId is required');
  }
  return Object.freeze({
    sessionId: params.sessionId,
    projectId: params.projectId,
    traceId: params.traceId ?? _makeId(),
    spanId: params.spanId ?? _makeId(),
    memory: _EMPTY_SNAPSHOT,
    metadata: Object.freeze({ ...(params.metadata ?? {}) }),
    timestamp: Date.now(),
  });
}

// ─── Patch ────────────────────────────────────────────────────────────────────

export function patchContext(ctx: SharedContext, patch: ContextPatch): SharedContext {
  const nextMemory: ContextSnapshot = patch.memory
    ? buildSnapshot({
        ...Object.fromEntries(
          ctx.memory.keys.map((k) => [k, ctx.memory.values[k]])
        ),
        ...patch.memory,
      }, ctx.memory.version + 1)
    : ctx.memory;

  return Object.freeze({
    ...ctx,
    spanId: patch.spanId ?? ctx.spanId,
    parentSpanId: patch.parentSpanId ?? ctx.parentSpanId,
    memory: nextMemory,
    metadata: patch.metadata
      ? Object.freeze({ ...ctx.metadata, ...patch.metadata })
      : ctx.metadata,
    timestamp: Date.now(),
  });
}

// ─── Snapshot Builder ─────────────────────────────────────────────────────────

export function buildSnapshot(
  values: Record<string, unknown>,
  version = 0
): ContextSnapshot {
  const keys = Object.keys(values).sort();
  return Object.freeze({
    keys: Object.freeze(keys) as readonly string[],
    values: Object.freeze({ ...values }) as Readonly<Record<string, unknown>>,
    version,
  });
}
