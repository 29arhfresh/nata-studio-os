/**
 * Capability registry types — Skill manifests, discovery queries, and the registry interface.
 */

import type { ISkillAdapter } from '../invocation/types';

// ─── Manifest ────────────────────────────────────────────────────────────────

export interface OperationDescriptor {
  readonly name: string;
  readonly description: string;
}

export interface SkillManifest {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly capabilities: readonly string[];
  readonly operations: readonly OperationDescriptor[];
  readonly priority: number;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly tags: readonly string[];
}

// ─── Discovery ────────────────────────────────────────────────────────────────

export interface DiscoveryQuery {
  readonly capability?: string;
  readonly tag?: string;
  readonly operation?: string;
  readonly minPriority?: number;
}

// ─── Registry Interface ───────────────────────────────────────────────────────

export interface ICapabilityRegistry {
  register(manifest: SkillManifest, adapter: ISkillAdapter): void;
  unregister(skillName: string): void;
  discover(query: DiscoveryQuery): SkillManifest[];
  /** Like discover({ capability }), but throws CapabilityNotAvailableError when empty. */
  requireCapability(capability: string): SkillManifest[];
  findByName(name: string): SkillManifest | undefined;
  getAdapter(skillName: string): ISkillAdapter | undefined;
  listAll(): SkillManifest[];
  hasCapability(capability: string): boolean;
  size(): number;
}
