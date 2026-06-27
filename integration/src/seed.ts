/**
 * Default skill registrations for all skills shipped with Nata Studio OS.
 *
 * ARCHITECTURAL DECISION: Capability metadata that was previously hardcoded
 * inside Agent Orchestrator v1's SKILL_REGISTRY constant (index.ts lines 159–235)
 * has been migrated here. Centralising this data in the integration layer means:
 *   — The orchestrator never needs to list skills it knows about.
 *   — Any new skill is added here, not in the orchestrator.
 *   — CapabilityRegistry is the single authoritative source.
 *
 * WHY NOT skill.json? The existing skill.json manifests do not carry capability
 * metadata (only name, version, description, author, tags, type, entrypoint,
 * permissions, dependencies). Adding capabilities to skill.json would require
 * modifying existing skills, which Requirement 2 forbids. This seed module
 * provides that mapping without touching any skill.
 *
 * EXTENSIBILITY: Call registry.register() with a new SkillRegistration to add
 * or override entries at runtime (e.g. from a plugin loader).
 */

import { CapabilityRegistry } from './capability-registry';
import { SkillRegistration } from './types';

export const DEFAULT_REGISTRATIONS: SkillRegistration[] = [
  {
    name: 'ai-image-director',
    version: '0.1.0',
    capabilities: [
      'image-generation',
      'image-editing',
      'image-upscaling',
      'character-consistency',
      'style-transfer',
    ],
    priority: 80,
    maxConcurrency: 3,
    timeoutMs: 60_000,
    requiresContext: false,
    tags: ['image', 'ai', 'generation'],
  },
  {
    name: 'ai-video-director',
    version: '0.1.0',
    capabilities: [
      'video-generation',
      'video-editing',
      'character-consistency',
      'style-transfer',
    ],
    priority: 80,
    maxConcurrency: 2,
    timeoutMs: 120_000,
    requiresContext: false,
    tags: ['video', 'ai', 'generation'],
  },
  {
    name: 'prompt-architect',
    version: '0.1.0',
    capabilities: ['prompt-engineering', 'text-rendering'],
    priority: 70,
    maxConcurrency: 5,
    timeoutMs: 15_000,
    requiresContext: false,
    tags: ['prompt', 'engineering'],
  },
  {
    name: 'creative-director',
    version: '0.1.0',
    capabilities: ['brand-strategy', 'visual-direction', 'moodboard', 'creative-scoring'],
    priority: 75,
    maxConcurrency: 2,
    timeoutMs: 20_000,
    requiresContext: true,
    tags: ['creative', 'strategy', 'brand'],
  },
  {
    name: 'knowledge-manager',
    version: '0.1.0',
    capabilities: ['knowledge-indexing', 'semantic-search', 'context-assembly'],
    priority: 60,
    maxConcurrency: 5,
    timeoutMs: 10_000,
    requiresContext: false,
    tags: ['knowledge', 'search', 'context'],
  },
  {
    name: 'memory-system',
    version: '0.1.0',
    capabilities: ['memory-management', 'context-handoff'],
    priority: 65,
    maxConcurrency: 5,
    timeoutMs: 10_000,
    requiresContext: false,
    tags: ['memory', 'context'],
  },
  {
    name: 'project-manager',
    version: '0.1.0',
    capabilities: [
      'project-planning',
      'task-management',
      'roadmap-generation',
      'risk-management',
    ],
    priority: 70,
    maxConcurrency: 3,
    timeoutMs: 15_000,
    requiresContext: false,
    tags: ['project', 'planning', 'management'],
  },
];

/**
 * Seeds a CapabilityRegistry with the built-in skill registrations.
 * Safe to call multiple times; re-registration replaces the existing entry.
 */
export function seedDefaultRegistrations(registry: CapabilityRegistry): void {
  for (const reg of DEFAULT_REGISTRATIONS) {
    registry.register(reg);
  }
}
