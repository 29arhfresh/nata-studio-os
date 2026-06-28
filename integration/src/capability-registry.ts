/**
 * CapabilityRegistry — single source of truth for skill capability metadata.
 *
 * ARCHITECTURAL DECISION (Req 3): Agent Orchestrator v1 maintained its own
 * SKILL_REGISTRY as a hardcoded constant inside its source file. This created
 * two problems:
 *   (a) Any change to skill metadata required editing the orchestrator.
 *   (b) There was no shared registry other consumers could query.
 *
 * CapabilityRegistry solves both. Skills (or their integration adapters) call
 * register() once at startup. The orchestrator queries the registry at planning
 * time. Other consumers — tests, tooling, dashboards — can query the same
 * registry without depending on the orchestrator.
 *
 * LOOSE COUPLING (Req 6): CapabilityRegistry stores only plain SkillRegistration
 * data. It imports nothing from skill code. A skill can be registered without
 * the skill's TypeScript module being imported.
 *
 * EVIDENCE: The prototype stored skill metadata at
 * skills/agent-orchestrator/src/index.ts lines 159–235 (SKILL_REGISTRY constant).
 * That data has been migrated to integration/src/seed.ts and is now accessed
 * through this class.
 */

import { SkillCapability, SkillRegistration } from './types';

export class CapabilityRegistry {
  private readonly registrations = new Map<string, SkillRegistration>();

  // ─── Mutation ──────────────────────────────────────────────────────────────

  /**
   * Registers a skill with its capabilities.
   * If a skill with the same name is already registered, the entry is replaced.
   * This allows skills to update their metadata at runtime (e.g. after a hot
   * reload or capability upgrade).
   *
   * Throws on invalid input so misconfigured registrations are caught early.
   */
  register(reg: SkillRegistration): void {
    if (!reg.name || reg.name.trim() === '') {
      throw new Error('REGISTRY_INVALID: Skill name must be a non-empty string.');
    }
    if (!Array.isArray(reg.capabilities) || reg.capabilities.length === 0) {
      throw new Error(`REGISTRY_INVALID: Skill "${reg.name}" must declare at least one capability.`);
    }
    if (typeof reg.priority !== 'number' || reg.priority < 0 || reg.priority > 100) {
      throw new Error(
        `REGISTRY_INVALID: Skill "${reg.name}" priority must be a number between 0 and 100.`,
      );
    }
    if (typeof reg.timeoutMs !== 'number' || reg.timeoutMs <= 0) {
      throw new Error(`REGISTRY_INVALID: Skill "${reg.name}" timeoutMs must be a positive number.`);
    }
    // Defensive copy so callers cannot mutate registry internals.
    this.registrations.set(reg.name, {
      ...reg,
      capabilities: [...reg.capabilities],
      tags: reg.tags ? [...reg.tags] : undefined,
    });
  }

  /**
   * Removes a skill from the registry.
   * Returns true if the skill was present, false otherwise.
   */
  unregister(skillName: string): boolean {
    return this.registrations.delete(skillName);
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  /**
   * Returns all registered skills that support the given capability,
   * sorted descending by priority (highest-priority skill first).
   *
   * ARCHITECTURAL DECISION: Sorted output lets callers always pick the first
   * result as the best candidate without re-sorting. Agent Orchestrator 2.0
   * uses this property in its capability→skill resolution step.
   */
  resolve(capability: SkillCapability): SkillRegistration[] {
    return Array.from(this.registrations.values())
      .filter((r) => r.capabilities.includes(capability))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Resolves multiple capabilities in a single pass.
   * Returns a Map from capability to the priority-sorted list of matching skills.
   *
   * ARCHITECTURAL DECISION: Batch resolution is used by the orchestrator's
   * planning phase so it can resolve all intent capabilities in one call.
   * This also makes testing straightforward: assert the map contains the
   * expected skills for each capability.
   */
  resolveMany(
    capabilities: SkillCapability[],
  ): Map<SkillCapability, SkillRegistration[]> {
    const result = new Map<SkillCapability, SkillRegistration[]>();
    for (const cap of capabilities) {
      result.set(cap, this.resolve(cap));
    }
    return result;
  }

  /** Returns the registration for a skill by name, or undefined if not registered. */
  find(skillName: string): SkillRegistration | undefined {
    return this.registrations.get(skillName);
  }

  /** Returns all registered skills in insertion order. */
  list(): SkillRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Returns the set of all capabilities that at least one registered skill
   * declares. Useful for introspection and UI tooling.
   */
  capabilities(): SkillCapability[] {
    const caps = new Set<SkillCapability>();
    for (const reg of this.registrations.values()) {
      for (const cap of reg.capabilities) {
        caps.add(cap);
      }
    }
    return Array.from(caps);
  }

  /** Returns true if a skill with the given name is registered. */
  has(skillName: string): boolean {
    return this.registrations.has(skillName);
  }

  /** Returns the number of registered skills. */
  size(): number {
    return this.registrations.size;
  }
}
