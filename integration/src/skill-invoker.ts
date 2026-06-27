/**
 * SkillInvoker — the execution boundary between Agent Orchestrator 2.0 and skills.
 *
 * ARCHITECTURAL DECISION (Req 4): All skill execution in the new orchestrator
 * is routed through SkillInvoker. This provides a single integration seam where
 * cross-cutting concerns — timeout enforcement, error normalisation, future
 * metrics/tracing — can be added without modifying any skill.
 *
 * HANDLER MODEL: Each skill registers a SkillHandlerFn via registerHandler().
 * This is the only code path that imports skill implementation code, and that
 * import happens at the call site (bootstrap / composition root), not here.
 * SkillInvoker itself imports nothing from skills, preserving loose coupling
 * (Req 6).
 *
 * ERROR SEMANTICS (ARCHITECTURAL DECISION): SkillInvoker never throws on
 * execution failures. It always returns an InvocationResult, with error set and
 * qualityScore=0 for failures. This keeps retry/fallback/abort decisions in the
 * orchestrator where control-flow policy belongs, not buried inside the invoker.
 *
 * CAPABILITY ROUTING: invokeByCapability() lets callers say "I need
 * image-generation" without naming a skill explicitly. The invoker asks the
 * CapabilityRegistry for the highest-priority registered skill that supports
 * the capability, then tries candidates in priority order until one succeeds
 * (Req 5 — capability-based planning at the invocation layer).
 *
 * EVIDENCE: The prototype's executeStep() (index.ts lines 639–671) returned
 * a simulated SkillOutput using a hardcoded mock. SkillInvoker replaces that
 * simulation with real (or test-injectable) handler execution.
 */

import { CapabilityRegistry } from './capability-registry';
import {
  InvocationContext,
  InvocationOutcome,
  InvocationRequest,
  InvocationResult,
  SkillCapability,
  SkillHandlerFn,
} from './types';

const DEFAULT_QUALITY_SCORE = 0.9;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Races a promise against a timeout that rejects with SKILL_TIMEOUT. */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`SKILL_TIMEOUT: Execution exceeded ${timeoutMs}ms.`)),
      timeoutMs,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e as Error); },
    );
  });
}

function defaultContext(): InvocationContext {
  return {
    sessionId: `session-${Date.now()}`,
    previousOutputs: [],
    sharedMemory: {},
    iterationCount: 0,
  };
}

function errorResult(skillName: string, message: string, durationMs = 0): InvocationResult {
  return {
    skillName,
    output: null,
    qualityScore: 0,
    durationMs,
    metadata: {},
    error: message,
  };
}

// ─── SkillInvoker ─────────────────────────────────────────────────────────────

export class SkillInvoker {
  private readonly handlers = new Map<string, SkillHandlerFn>();

  /**
   * CapabilityRegistry is injected (not imported globally).
   * SkillInvoker uses it to:
   *   (a) validate that a skill is known before invocation,
   *   (b) retrieve timeout configuration,
   *   (c) perform capability-based candidate lookup in invokeByCapability().
   */
  constructor(private readonly registry: CapabilityRegistry) {}

  // ─── Handler Registration ──────────────────────────────────────────────────

  /**
   * Associates an invocation handler with a named skill.
   * The handler is the bridge between this integration layer and skill code.
   * A skill that has no handler registered can still be resolved by the
   * registry — it just cannot be invoked until a handler is provided.
   */
  registerHandler(skillName: string, handler: SkillHandlerFn): void {
    this.handlers.set(skillName, handler);
  }

  /** Returns true if an invocation handler is registered for the skill. */
  hasHandler(skillName: string): boolean {
    return this.handlers.has(skillName);
  }

  // ─── Invocation ───────────────────────────────────────────────────────────

  /**
   * Invokes a skill by name with the supplied input and context.
   *
   * Resolution order:
   *   1. Validate the skill is in the CapabilityRegistry.
   *   2. Verify a handler is registered.
   *   3. Execute with timeout derived from the registration or the request override.
   *   4. Normalise to InvocationResult regardless of success or failure.
   */
  async invoke(request: InvocationRequest): Promise<InvocationResult> {
    const reg = this.registry.find(request.skillName);
    if (!reg) {
      return errorResult(
        request.skillName,
        `UNKNOWN_SKILL: "${request.skillName}" is not registered in CapabilityRegistry.`,
      );
    }

    const handler = this.handlers.get(request.skillName);
    if (!handler) {
      return errorResult(
        request.skillName,
        `NO_HANDLER: "${request.skillName}" has no registered invocation handler.`,
      );
    }

    const context = request.context ?? defaultContext();
    const timeoutMs = request.timeoutMs ?? reg.timeoutMs;
    const startMs = Date.now();

    try {
      const rawResult = handler(request.input, context);
      const outcome: InvocationOutcome = await withTimeout(
        rawResult instanceof Promise ? rawResult : Promise.resolve(rawResult),
        timeoutMs,
      );

      return {
        skillName:    request.skillName,
        output:       outcome.output,
        qualityScore: outcome.qualityScore ?? DEFAULT_QUALITY_SCORE,
        durationMs:   Date.now() - startMs,
        metadata:     outcome.metadata ?? {},
      };
    } catch (err: unknown) {
      return errorResult(
        request.skillName,
        err instanceof Error ? err.message : String(err),
        Date.now() - startMs,
      );
    }
  }

  /**
   * Invokes the best available skill for a given capability.
   *
   * Tries candidates in descending priority order. Skips candidates that have
   * no registered handler. Returns the first successful InvocationResult, or
   * an error result if all candidates fail or have no handler.
   *
   * ARCHITECTURAL DECISION: This method is the runtime expression of
   * capability-based planning (Req 5). Rather than the orchestrator naming
   * "ai-image-director" explicitly, it says "I need image-generation" and the
   * invoker resolves the best available skill at execution time. This means a
   * higher-priority skill added later automatically takes over without any
   * orchestrator change.
   */
  async invokeByCapability(
    capability: SkillCapability,
    input: unknown,
    context?: InvocationContext,
  ): Promise<InvocationResult> {
    const candidates = this.registry.resolve(capability);

    for (const reg of candidates) {
      if (!this.handlers.has(reg.name)) continue;
      const result = await this.invoke({
        skillName: reg.name,
        capability,
        input,
        context,
      });
      if (!result.error) return result;
    }

    return errorResult(
      `capability:${capability}`,
      `NO_CAPABLE_SKILL: No registered skill with a handler can fulfil capability "${capability}".`,
    );
  }
}
