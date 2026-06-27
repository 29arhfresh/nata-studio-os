/**
 * Integration Layer — transforms independent Skills into one coherent operating system.
 *
 * Modules:
 *   contracts/     — shared request/response types, context object, error hierarchy
 *   registry/      — capability registry and Skill discovery
 *   invocation/    — Skill invoker, result aggregator, adapter interface
 *   adapters/      — bridges to Memory System, Creative Director, Prompt Architect
 *   observability/ — logger, tracer, and metrics interfaces with default implementations
 */

// ─── Contracts ────────────────────────────────────────────────────────────────
export type { ContextSnapshot, SharedContext, ContextPatch } from './contracts/context';
export { createContext, patchContext, buildSnapshot } from './contracts/context';

export type { InvocationOptions, SkillRequest, ResponseMetadata, SkillResponse } from './contracts/request';
export { createRequest, createResponse } from './contracts/request';

export type { IntegrationErrorCode } from './contracts/errors';
export {
  IntegrationError,
  SkillNotFoundError,
  SkillInvocationError,
  SkillTimeoutError,
  AggregationError,
  CapabilityNotAvailableError,
  ContextInvalidError,
  RegistryError,
  AdapterError,
  isIntegrationError,
} from './contracts/errors';

// ─── Registry ────────────────────────────────────────────────────────────────
export type { OperationDescriptor, SkillManifest, DiscoveryQuery, ICapabilityRegistry } from './registry/types';
export { CapabilityRegistry } from './registry/registry';

// ─── Invocation ───────────────────────────────────────────────────────────────
export type {
  ISkillAdapter,
  InvocationMode,
  ISkillInvoker,
  MergeStrategy,
  AggregationMetadata,
  AggregatedResult,
  IResultAggregator,
} from './invocation/types';
export { SkillInvoker } from './invocation/invoker';
export { ResultAggregator, wrapError } from './invocation/aggregator';

// ─── Adapters ────────────────────────────────────────────────────────────────
export type {
  IMemorySystem,
  MemoryStoreInput,
  MemorySearchQuery,
  MemoryContextRestoreOptions,
  MemoryHandoffOptions,
  ICreativeDirector,
  CreativeBriefInput,
  MoodboardInput,
  ArtDirectionInput,
  CreativeScoringInput,
  IPromptArchitect,
  PromptBrief,
  BuiltPrompt,
  TestCase,
} from './adapters/types';
export type { MemoryOperation } from './adapters/memory-system-adapter';
export { MemorySystemAdapter } from './adapters/memory-system-adapter';
export type { CreativeOperation } from './adapters/creative-director-adapter';
export { CreativeDirectorAdapter } from './adapters/creative-director-adapter';
export type { PromptOperation, EvaluateInput, CompressInput, VersionInput } from './adapters/prompt-architect-adapter';
export { PromptArchitectAdapter } from './adapters/prompt-architect-adapter';

// ─── Observability ────────────────────────────────────────────────────────────
export type { LogLevel, LogMeta, LogEntry, ILogger } from './observability/logger';
export { NoopLogger, ConsoleLogger } from './observability/logger';
export type { SpanContext, ISpan, ITracer } from './observability/tracer';
export { NoopSpan, NoopTracer } from './observability/tracer';
export type { MetricType, MetricSnapshot, IMetricsCollector } from './observability/metrics';
export { InMemoryMetrics, NoopMetrics } from './observability/metrics';
