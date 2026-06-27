import { EventBus } from './event-bus';
import { ContextStore } from './context-store';
import { DataRouter } from './data-router';
import { resolveDag } from './dag-resolver';
import { Scheduler } from './scheduler';
import { StepRunner } from './step-runner';
import { AssetManager } from './asset-manager';
import { PluginSystem } from './plugin-system';
import { ConnectorManager } from './connector-manager';
import { AIMemory } from './ai-memory';
import { VersionGraph } from './version-graph';
import { visualize as visualizeGraph } from './workflow-visualizer';
import type { WorkflowStatus } from './types';
import type { EventHandler } from './event-bus';
import type { DataRoute } from './data-router';
import type { StepHandler, StepResult } from './step-runner';
import type {
  AssetType,
  AssetEmission,
  AssetRef,
  AssetRecord,
  AssetQuery,
  ConnectorType,
  ConnectorConfig,
  ConnectorHandle,
  ConnectorMap,
  ConnectorFactory,
  MemoryTier,
  MemoryRecord,
  MemoryQuery,
  MemoryWriteSpec,
  MemoryReader,
  SerializableStepDefinition,
  SerializableWorkflowDefinition,
  VersionNode,
  VersionDiff,
  VisualizerNodeStatus,
  VisualizerNode,
  VisualizerEdge,
  VisualizerGraph,
  PluginManifest,
  PluginHookContext,
  PluginHook,
  Plugin,
  PhaseBStepInput,
  PhaseBStepDefinition,
  PhaseBWorkflowDefinition,
  PhaseBWorkflowRunOptions,
  PhaseBWorkflowResult,
} from './phase-b-types';

// ─── Phase A Re-exports ───────────────────────────────────────────────────────

export type { WorkflowEventType, WorkflowEvent, EventHandler } from './event-bus';
export type { DataRoute } from './data-router';
export type { StepNode, ResolvedDag } from './dag-resolver';
export type { StepHandler, StepInput, StepResult } from './step-runner';
export type { WorkflowStatus, StepStatus } from './types';
export { EventBus } from './event-bus';
export { ContextStore } from './context-store';
export { DataRouter } from './data-router';
export { resolveDag } from './dag-resolver';
export { Scheduler } from './scheduler';
export { StepRunner } from './step-runner';

// ─── Phase B Re-exports ───────────────────────────────────────────────────────

export { AssetManager } from './asset-manager';
export { PluginSystem } from './plugin-system';
export { ConnectorManager } from './connector-manager';
export { AIMemory } from './ai-memory';
export { VersionGraph } from './version-graph';
export { visualize } from './workflow-visualizer';

export type {
  AssetType, AssetEmission, AssetRef, AssetRecord, AssetQuery,
  ConnectorType, ConnectorConfig, ConnectorHandle, ConnectorMap, ConnectorFactory,
  MemoryTier, MemoryRecord, MemoryQuery, MemoryWriteSpec, MemoryReader,
  SerializableStepDefinition, SerializableWorkflowDefinition,
  VersionNode, VersionDiff,
  VisualizerNodeStatus, VisualizerNode, VisualizerEdge, VisualizerGraph,
  PluginManifest, PluginHookContext, PluginHook, Plugin,
  PhaseBStepInput, PhaseBStepDefinition, PhaseBWorkflowDefinition,
  PhaseBWorkflowRunOptions, PhaseBWorkflowResult,
} from './phase-b-types';

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface StepDefinition {
  id: string;
  dependsOn: string[];
  handler: StepHandler;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface WorkflowDefinition {
  id: string;
  steps: StepDefinition[];
  routes?: DataRoute[];
}

export interface WorkflowRunOptions {
  context?: Record<string, unknown>;
  onEvent?: EventHandler;
}

export interface WorkflowResult {
  workflowId: string;
  status: WorkflowStatus;
  stepResults: StepResult[];
  startedAt: number;
  completedAt: number;
  error: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_STEP_TIMEOUT_MS = 30_000;

const ALL_EVENT_TYPES = [
  'workflow:started', 'workflow:completed', 'workflow:failed',
  'step:started', 'step:completed', 'step:failed', 'step:skipped',
] as const;

const VALID_ASSET_TYPES = new Set<AssetType>([
  'image', 'video', 'audio', 'model-3d', 'document', 'other',
]);

const VALID_MEMORY_TIERS = new Set<MemoryTier>([
  'short-term', 'long-term', 'project', 'session',
]);

// ─── Singleton Runtime Services ───────────────────────────────────────────────

const pluginSystem     = new PluginSystem();
const connectorManager = new ConnectorManager();
const aiMemory         = new AIMemory();
const assetManager     = new AssetManager();
const versionGraph     = new VersionGraph();

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(definition: WorkflowDefinition): ValidationResult {
  const errors: string[] = [];

  if (!definition.id || typeof definition.id !== 'string') {
    errors.push('Workflow id must be a non-empty string.');
  }
  if (!Array.isArray(definition.steps) || definition.steps.length === 0) {
    errors.push('Workflow must have at least one step.');
    return { valid: false, errors };
  }

  const ids = new Set<string>();
  for (const step of definition.steps) {
    if (!step.id || typeof step.id !== 'string') {
      errors.push('Each step must have a non-empty string id.');
    } else if (ids.has(step.id)) {
      errors.push(`Duplicate step id: "${step.id}".`);
    } else {
      ids.add(step.id);
    }
    if (typeof step.handler !== 'function') {
      errors.push(`Step "${step.id ?? '?'}" must have a handler function.`);
    }
    if (!Array.isArray(step.dependsOn)) {
      errors.push(`Step "${step.id ?? '?'}" must have a dependsOn array.`);
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  try {
    const dag = resolveDag(definition.steps);
    if (dag.hasCycle) {
      errors.push(`Cycle detected involving steps: ${dag.cycleNodes.join(', ')}.`);
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  // ─── Phase B checks ───────────────────────────────────────────────────────
  const def = definition as PhaseBWorkflowDefinition;

  for (const step of def.steps as PhaseBStepDefinition[]) {
    for (const connName of step.requiredConnectors ?? []) {
      if (!connectorManager.has(connName)) {
        errors.push(`Step "${step.id}" requires connector "${connName}" which is not registered.`);
      }
    }
    if (step.emitsAsset !== undefined && !VALID_ASSET_TYPES.has(step.emitsAsset.type)) {
      errors.push(`Step "${step.id}" emitsAsset.type "${step.emitsAsset.type}" is not a valid AssetType.`);
    }
    for (const spec of step.memoryWrites ?? []) {
      if (!VALID_MEMORY_TIERS.has(spec.tier)) {
        errors.push(`Step "${step.id}" memoryWrite tier "${spec.tier}" is not a valid MemoryTier.`);
      }
    }
  }

  for (const pluginName of def.plugins ?? []) {
    if (!pluginSystem.isEnabled(pluginName)) {
      errors.push(`Plugin "${pluginName}" is not installed or is disabled.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Execution ────────────────────────────────────────────────────────────────

async function run(
  definition: WorkflowDefinition | PhaseBWorkflowDefinition,
  options: WorkflowRunOptions | PhaseBWorkflowRunOptions = {},
): Promise<PhaseBWorkflowResult> {
  const validation = validate(definition);
  if (!validation.valid) {
    throw new Error(`INVALID_WORKFLOW: ${validation.errors.join(' ')}`);
  }

  const def = definition as PhaseBWorkflowDefinition;
  const opts = options as PhaseBWorkflowRunOptions;
  const activePlugins: readonly string[] = def.plugins ?? [];

  // [B] Before workflow hook
  await pluginSystem.runBeforeWorkflow({ workflowId: def.id }, activePlugins);

  // [B] Resolve run-scoped connector map
  const connectorMap = connectorManager.resolve(def.connectors ?? []);

  // [B] Create memory reader
  const memoryReader = aiMemory.reader(def.memoryScope);

  // [B] Accumulator collections
  const collectedAssetRefs: AssetRef[] = [];
  const collectedMemoryWrites: MemoryRecord[] = [];

  // Phase A components (per-run)
  const bus    = new EventBus();
  const store  = new ContextStore();
  const router = new DataRouter();
  const runner = new StepRunner();
  const startedAt = Date.now();

  if (opts.onEvent) {
    for (const t of ALL_EVENT_TYPES) bus.subscribe(t, opts.onEvent);
  }

  for (const [key, value] of Object.entries(opts.context ?? {})) {
    store.set(def.id, key, value);
  }
  // [B] Seed ContextStore from memoryContext
  for (const [key, value] of Object.entries(opts.memoryContext ?? {})) {
    store.set(def.id, key, value);
  }

  for (const route of def.routes ?? []) {
    router.addRoute(route);
  }

  const dag = resolveDag(def.steps);
  const scheduler = new Scheduler(def.steps);
  const stepOutputs = new Map<string, Record<string, unknown>>();
  const stepResults: StepResult[] = [];

  // [B] Version tracking — commit before execution loop
  let versionId: string | undefined;
  if (def.versionTracking === true) {
    versionId = versionGraph.commit(def).versionId;
  }

  bus.emit({ type: 'workflow:started', workflowId: def.id, timestamp: Date.now() });

  // Helper: dispose all handles in the run-scoped connector map (errors swallowed)
  const disposeConnectors = async (): Promise<void> => {
    for (const handle of Object.values(connectorMap)) {
      try { await handle.dispose?.(); } catch { /* swallow */ }
    }
  };

  // Helper: complete the failure path after step loop + afterStep have been handled
  const handleStepFailure = async (error: string | null): Promise<PhaseBWorkflowResult> => {
    const completedAt = Date.now();
    bus.emit({ type: 'workflow:failed', workflowId: def.id, timestamp: completedAt });
    store.clear(def.id);
    await pluginSystem.runAfterWorkflow({ workflowId: def.id }, activePlugins);
    const partial: PhaseBWorkflowResult = {
      workflowId: def.id,
      status: 'failed',
      stepResults,
      startedAt,
      completedAt,
      error,
      versionId,
      memoryWrites: collectedMemoryWrites,
      assetRefs: collectedAssetRefs,
    };
    const graph = visualizeGraph(def, partial);
    await disposeConnectors();
    return { ...partial, graph };
  };

  // Helper: early return on PLUGIN_HOOK_ERROR (no afterWorkflow, visualize, or disposal)
  const hookFailureResult = (err: unknown): PhaseBWorkflowResult => {
    const completedAt = Date.now();
    store.clear(def.id);
    return {
      workflowId: def.id,
      status: 'failed',
      stepResults,
      startedAt,
      completedAt,
      error: err instanceof Error ? err.message : String(err),
      versionId,
      memoryWrites: collectedMemoryWrites,
      assetRefs: collectedAssetRefs,
    };
  };

  // ─── Execution loop ───────────────────────────────────────────────────────

  while (!scheduler.isComplete()) {
    const ready = scheduler.getReadySteps();
    if (ready.length === 0) break;

    for (const stepId of ready) {
      const stepDef = def.steps.find((s) => s.id === stepId) as PhaseBStepDefinition;
      const routedData = router.resolveInputs(stepId, stepOutputs);
      const context = store.getAll(def.id);

      // [B] Scope connector map to this step's declared requirements
      const stepConnectors: ConnectorMap = {};
      for (const name of stepDef.requiredConnectors ?? []) {
        if (connectorMap[name]) stepConnectors[name] = connectorMap[name];
      }

      // [B] Build PhaseBStepInput
      const input: PhaseBStepInput = {
        stepId,
        workflowId: def.id,
        context,
        data: routedData,
        connectors: stepConnectors,
        memory: memoryReader,
      };

      // [B] beforeStep hook
      try {
        await pluginSystem.runBeforeStep({ workflowId: def.id, stepId, input }, activePlugins);
      } catch (hookErr) {
        return hookFailureResult(hookErr);
      }

      bus.emit({ type: 'step:started', workflowId: def.id, stepId, timestamp: Date.now() });
      scheduler.markRunning(stepId);

      const result = await runner.run(
        stepId,
        stepDef.handler,
        input,
        {
          timeoutMs: stepDef.timeoutMs ?? DEFAULT_STEP_TIMEOUT_MS,
          maxRetries: stepDef.maxRetries ?? 0,
        },
      );

      stepResults.push(result);

      if (result.status === 'completed') {
        const output =
          result.output !== null && typeof result.output === 'object'
            ? (result.output as Record<string, unknown>)
            : { value: result.output };
        stepOutputs.set(stepId, output);
        scheduler.markCompleted(stepId);
        bus.emit({
          type: 'step:completed',
          workflowId: def.id,
          stepId,
          payload: result.output,
          timestamp: Date.now(),
        });

        // [B] Register asset if declared
        if (stepDef.emitsAsset) {
          const rec = assetManager.register(result.output, {
            type: stepDef.emitsAsset.type,
            tags: stepDef.emitsAsset.tags ?? [],
            workflowId: def.id,
            stepId,
          });
          collectedAssetRefs.push(rec);
        }

        // [B] Flush declared memory writes (before afterStep hook)
        for (const spec of stepDef.memoryWrites ?? []) {
          const value = output[spec.outputKey];
          if (value !== undefined) {
            const rec = aiMemory.store({
              key: spec.memoryKey,
              value,
              tier: spec.tier,
              tags: spec.tags ?? [],
              ttlMs: spec.ttlMs,
              workflowId: def.id,
              stepId,
              scope: def.memoryScope,
            });
            collectedMemoryWrites.push(rec);
          }
        }

        // [B] afterStep hook (success)
        try {
          await pluginSystem.runAfterStep({ workflowId: def.id, stepId, result }, activePlugins);
        } catch (hookErr) {
          return hookFailureResult(hookErr);
        }
      } else {
        scheduler.markFailed(stepId);
        bus.emit({
          type: 'step:failed',
          workflowId: def.id,
          stepId,
          payload: result.error,
          timestamp: Date.now(),
        });

        // [B] afterStep hook (failure) — hook error aborts without afterWorkflow/visualize/disposal
        try {
          await pluginSystem.runAfterStep({ workflowId: def.id, stepId, result }, activePlugins);
        } catch (hookErr) {
          return hookFailureResult(hookErr);
        }

        return handleStepFailure(result.error);
      }
    }
  }

  void dag;

  const completedAt = Date.now();
  const finalStatus: WorkflowStatus = scheduler.hasFailed() ? 'failed' : 'completed';

  bus.emit({
    type: finalStatus === 'completed' ? 'workflow:completed' : 'workflow:failed',
    workflowId: def.id,
    timestamp: completedAt,
  });
  store.clear(def.id);

  // [B] afterWorkflow hook
  await pluginSystem.runAfterWorkflow({ workflowId: def.id }, activePlugins);

  const finalResult: PhaseBWorkflowResult = {
    workflowId: def.id,
    status: finalStatus,
    stepResults,
    startedAt,
    completedAt,
    error: null,
    versionId,
    memoryWrites: collectedMemoryWrites,
    assetRefs: collectedAssetRefs,
  };

  // [B] Visualize
  const graph = visualizeGraph(def, finalResult);

  // [B] Dispose connectors
  await disposeConnectors();

  return { ...finalResult, graph };
}

// ─── Default Export ───────────────────────────────────────────────────────────

const workflowEngine = {
  run,
  validate,
  registerPlugin:      (plugin: Plugin) => pluginSystem.install(plugin),
  unregisterPlugin:    (pluginName: string) => pluginSystem.uninstall(pluginName),
  registerConnector:   (config: ConnectorConfig, factory: ConnectorFactory) =>
    connectorManager.register(config, factory),
  unregisterConnector: (name: string) => connectorManager.unregister(name),
  visualize:           (definition: PhaseBWorkflowDefinition, result?: PhaseBWorkflowResult) =>
    visualizeGraph(definition, result),
  commitVersion:       (definition: PhaseBWorkflowDefinition, options?: { label?: string; tags?: string[] }) =>
    versionGraph.commit(definition, options),
  getVersion:          (versionId: string) => versionGraph.getVersion(versionId),
  getHistory:          (workflowId: string) => versionGraph.getHistory(workflowId),
  diffVersions:        (versionIdA: string, versionIdB: string) => versionGraph.diff(versionIdA, versionIdB),
};

export default workflowEngine;
