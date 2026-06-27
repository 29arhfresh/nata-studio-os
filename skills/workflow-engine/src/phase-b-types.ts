import type { StepHandler, StepResult } from './step-runner';
import type { DataRoute } from './data-router';
import type { WorkflowStatus } from './types';
import type { EventHandler } from './event-bus';

// ─── Asset Types ──────────────────────────────────────────────────────────────

export type AssetType = 'image' | 'video' | 'audio' | 'model-3d' | 'document' | 'other';

export interface AssetEmission {
  type:  AssetType;
  tags?: string[];
}

export interface AssetRef {
  assetId:      string;
  type:         AssetType;
  workflowId:   string;
  stepId:       string;
  tags:         string[];
  registeredAt: number;
  meta?:        Record<string, unknown>;
}

export interface AssetRecord extends AssetRef {
  value: unknown;
}

export interface AssetQuery {
  type?:       AssetType;
  tags?:       string[];
  workflowId?: string;
  stepId?:     string;
}

// ─── Connector Types ──────────────────────────────────────────────────────────

export type ConnectorType = 'http' | 'ai-model' | 'storage' | 'database' | 'custom';

export interface ConnectorConfig {
  name:         string;
  type:         ConnectorType;
  endpoint?:    string;
  credentials?: Record<string, string>;
  timeoutMs?:   number;
  meta?:        Record<string, unknown>;
}

export interface ConnectorHandle {
  name:      string;
  type:      ConnectorType;
  call(method: string, params: Record<string, unknown>): Promise<unknown>;
  dispose?(): Promise<void> | void;
}

export type ConnectorMap     = Record<string, ConnectorHandle>;
export type ConnectorFactory = (config: ConnectorConfig) => ConnectorHandle;

// ─── AI Memory Types ──────────────────────────────────────────────────────────

export type MemoryTier = 'short-term' | 'long-term' | 'project' | 'session';

export interface MemoryRecord {
  id:          string;
  key:         string;
  value:       unknown;
  tier:        MemoryTier;
  tags:        string[];
  ttlMs?:      number;
  workflowId?: string;
  stepId?:     string;
  scope?:      string;
  createdAt:   number;
}

export interface MemoryQuery {
  key?:   string;
  tier?:  MemoryTier;
  tags?:  string[];
  scope?: string;
  limit?: number;
}

export interface MemoryWriteSpec {
  outputKey: string;
  memoryKey: string;
  tier:      MemoryTier;
  tags?:     string[];
  ttlMs?:    number;
}

export interface MemoryReader {
  retrieve(query: MemoryQuery): MemoryRecord[];
  get(key: string): MemoryRecord | undefined;
}

// ─── Version Types ────────────────────────────────────────────────────────────

export interface SerializableStepDefinition {
  id:                  string;
  dependsOn:           string[];
  timeoutMs?:          number;
  maxRetries?:         number;
  requiredConnectors?: string[];
  emitsAsset?:         AssetEmission;
  memoryWrites?:       MemoryWriteSpec[];
}

export interface SerializableWorkflowDefinition {
  id:               string;
  steps:            SerializableStepDefinition[];
  routes?:          DataRoute[];
  plugins?:         string[];
  connectors?:      string[];
  versionTracking?: boolean;
  memoryScope?:     string;
}

export interface VersionNode {
  versionId:        string;
  workflowId:       string;
  snapshot:         SerializableWorkflowDefinition;
  parentVersionId?: string;
  label?:           string;
  tags:             string[];
  committedAt:      number;
}

export interface VersionDiff {
  versionIdA:    string;
  versionIdB:    string;
  stepsAdded:    string[];
  stepsRemoved:  string[];
  stepsChanged:  string[];
  routesAdded:   DataRoute[];
  routesRemoved: DataRoute[];
}

// ─── Visualizer Types ─────────────────────────────────────────────────────────

export type VisualizerNodeStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'unknown';

export interface VisualizerNode {
  id:     string;
  label:  string;
  status: VisualizerNodeStatus;
  column: number;
  row:    number;
}

export interface VisualizerEdge {
  from:      string;
  to:        string;
  routeKeys: string[];
}

export interface VisualizerGraph {
  workflowId: string;
  nodes:      VisualizerNode[];
  edges:      VisualizerEdge[];
  status:     WorkflowStatus | 'unknown';
}

// ─── Plugin Types ─────────────────────────────────────────────────────────────

export interface PluginManifest {
  name:        string;
  version:     string;
  description: string;
}

export interface PluginHookContext {
  workflowId: string;
  stepId?:    string;
  input?:     PhaseBStepInput;
  result?:    StepResult;
}

export type PluginHook = (context: PluginHookContext) => Promise<void> | void;

export interface Plugin {
  manifest:        PluginManifest;
  beforeWorkflow?: PluginHook;
  afterWorkflow?:  PluginHook;
  beforeStep?:     PluginHook;
  afterStep?:      PluginHook;
}

// ─── Phase B Step Input ───────────────────────────────────────────────────────

export interface PhaseBStepInput {
  stepId:     string;
  workflowId: string;
  context:    Record<string, unknown>;
  data:       Record<string, unknown>;
  connectors: ConnectorMap;
  memory:     MemoryReader;
}

// ─── Phase B Step Definition ──────────────────────────────────────────────────

export interface PhaseBStepDefinition {
  id:                  string;
  dependsOn:           string[];
  handler:             StepHandler;
  timeoutMs?:          number;
  maxRetries?:         number;
  requiredConnectors?: string[];
  emitsAsset?:         AssetEmission;
  memoryWrites?:       MemoryWriteSpec[];
}

// ─── Phase B Workflow Definition ──────────────────────────────────────────────

export interface PhaseBWorkflowDefinition {
  id:               string;
  steps:            PhaseBStepDefinition[];
  routes?:          DataRoute[];
  plugins?:         string[];
  connectors?:      string[];
  versionTracking?: boolean;
  memoryScope?:     string;
}

// ─── Phase B Run Options ──────────────────────────────────────────────────────

export interface PhaseBWorkflowRunOptions {
  context?:       Record<string, unknown>;
  onEvent?:       EventHandler;
  memoryContext?: Record<string, unknown>;
}

// ─── Phase B Workflow Result ──────────────────────────────────────────────────

export interface PhaseBWorkflowResult {
  workflowId:    string;
  status:        WorkflowStatus;
  stepResults:   StepResult[];
  startedAt:     number;
  completedAt:   number;
  error:         string | null;
  graph?:        VisualizerGraph;
  versionId?:    string;
  memoryWrites?: MemoryRecord[];
  assetRefs?:    AssetRef[];
}
