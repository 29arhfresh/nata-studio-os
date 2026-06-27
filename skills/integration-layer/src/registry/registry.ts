/**
 * CapabilityRegistry — runtime store for Skill manifests and their adapters.
 * Supports registration, discovery by capability/tag/operation, and lookup by name.
 */

import { RegistryError } from '../contracts/errors';
import type { ISkillAdapter } from '../invocation/types';
import type { DiscoveryQuery, ICapabilityRegistry, SkillManifest } from './types';

interface _Entry {
  manifest: SkillManifest;
  adapter: ISkillAdapter;
}

export class CapabilityRegistry implements ICapabilityRegistry {
  private readonly _entries = new Map<string, _Entry>();

  register(manifest: SkillManifest, adapter: ISkillAdapter): void {
    if (!manifest.name) {
      throw new RegistryError('Skill manifest must have a name');
    }
    if (adapter.name !== manifest.name) {
      throw new RegistryError(
        `Adapter name "${adapter.name}" does not match manifest name "${manifest.name}"`
      );
    }
    if (this._entries.has(manifest.name)) {
      throw new RegistryError(
        `Skill "${manifest.name}" is already registered — unregister it first`
      );
    }
    this._entries.set(manifest.name, { manifest, adapter });
  }

  unregister(skillName: string): void {
    if (!this._entries.has(skillName)) {
      throw new RegistryError(`Skill "${skillName}" is not registered`);
    }
    this._entries.delete(skillName);
  }

  discover(query: DiscoveryQuery): SkillManifest[] {
    const results: SkillManifest[] = [];

    for (const { manifest } of this._entries.values()) {
      if (query.minPriority !== undefined && manifest.priority < query.minPriority) {
        continue;
      }
      if (query.capability !== undefined && !manifest.capabilities.includes(query.capability)) {
        continue;
      }
      if (query.tag !== undefined && !manifest.tags.includes(query.tag)) {
        continue;
      }
      if (
        query.operation !== undefined &&
        !manifest.operations.some((op) => op.name === query.operation)
      ) {
        continue;
      }
      results.push(manifest);
    }

    return results.sort((a, b) => b.priority - a.priority);
  }

  findByName(name: string): SkillManifest | undefined {
    return this._entries.get(name)?.manifest;
  }

  getAdapter(skillName: string): ISkillAdapter | undefined {
    return this._entries.get(skillName)?.adapter;
  }

  listAll(): SkillManifest[] {
    return [...this._entries.values()]
      .map((e) => e.manifest)
      .sort((a, b) => b.priority - a.priority);
  }

  hasCapability(capability: string): boolean {
    for (const { manifest } of this._entries.values()) {
      if (manifest.capabilities.includes(capability)) {
        return true;
      }
    }
    return false;
  }

  size(): number {
    return this._entries.size;
  }
}
