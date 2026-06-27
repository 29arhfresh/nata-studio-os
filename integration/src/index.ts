/**
 * Integration Layer — public API.
 *
 * This directory is the execution boundary between Agent Orchestrator 2.0 and
 * the skills it coordinates. Consumers should import from this index; direct
 * imports from integration/src/* are discouraged.
 *
 * ARCHITECTURAL DECISION: The integration layer is not a Skill. It lives at the
 * repository root alongside skills/ rather than inside it. Skills are domain
 * units with entrypoints and manifests; the integration layer is infrastructure
 * shared across all of them. Keeping it at the root makes the dependency
 * direction explicit: orchestrator → integration → (never) → orchestrator.
 */

export { CapabilityRegistry } from './capability-registry';
export { SkillInvoker } from './skill-invoker';
export { seedDefaultRegistrations, DEFAULT_REGISTRATIONS } from './seed';
export type {
  SkillCapability,
  SkillRegistration,
  InvocationContext,
  InvocationRequest,
  InvocationResult,
  InvocationOutcome,
  SkillHandlerFn,
} from './types';

// ─── Factory ─────────────────────────────────────────────────────────────────

import { CapabilityRegistry } from './capability-registry';
import { SkillInvoker } from './skill-invoker';
import { seedDefaultRegistrations } from './seed';

/**
 * Creates a pre-seeded CapabilityRegistry and SkillInvoker pair.
 *
 * ARCHITECTURAL DECISION: Factory function rather than module-level singletons.
 * Each call produces an isolated registry+invoker pair, which means:
 *   — Test cases get their own registry; no cross-test state leakage.
 *   — Multiple orchestrator instances can exist in the same process with
 *     different skill sets (e.g. a production instance and a dry-run instance).
 *
 * Callers add skill handlers via invoker.registerHandler() after creation.
 */
export function createIntegrationLayer(): {
  registry: CapabilityRegistry;
  invoker: SkillInvoker;
} {
  const registry = new CapabilityRegistry();
  seedDefaultRegistrations(registry);
  const invoker = new SkillInvoker(registry);
  return { registry, invoker };
}
