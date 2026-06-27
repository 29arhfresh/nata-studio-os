import { randomUUID } from 'crypto';
import type {
  VersionNode,
  VersionDiff,
  SerializableWorkflowDefinition,
  SerializableStepDefinition,
  PhaseBWorkflowDefinition,
  PhaseBStepDefinition,
} from './phase-b-types';
import type { DataRoute } from './data-router';

export class VersionGraph {
  private readonly versions = new Map<string, VersionNode>();
  private readonly histories = new Map<string, string[]>();

  commit(
    definition: PhaseBWorkflowDefinition,
    options?: { label?: string; tags?: string[] },
  ): VersionNode {
    const versionId = `ver-${randomUUID()}`;
    const { id: workflowId } = definition;
    const history = this.histories.get(workflowId) ?? [];
    const parentVersionId = history.length > 0 ? history[history.length - 1] : undefined;

    const node: VersionNode = {
      versionId,
      workflowId,
      snapshot: this.serialize(definition),
      parentVersionId,
      label: options?.label,
      tags: options?.tags ?? [],
      committedAt: Date.now(),
    };

    this.versions.set(versionId, node);
    history.push(versionId);
    this.histories.set(workflowId, history);

    return node;
  }

  getVersion(versionId: string): VersionNode | undefined {
    return this.versions.get(versionId);
  }

  getHistory(workflowId: string): VersionNode[] {
    return (this.histories.get(workflowId) ?? []).map((id) => this.versions.get(id)!);
  }

  getLatest(workflowId: string): VersionNode | undefined {
    const history = this.histories.get(workflowId);
    if (!history || history.length === 0) return undefined;
    return this.versions.get(history[history.length - 1]);
  }

  tag(versionId: string, label: string): void {
    const node = this.versions.get(versionId);
    if (!node) throw new Error(`VERSION_NOT_FOUND: Version "${versionId}" does not exist.`);
    node.label = label;
  }

  diff(versionIdA: string, versionIdB: string): VersionDiff {
    const a = this.versions.get(versionIdA);
    if (!a) throw new Error(`VERSION_NOT_FOUND: Version "${versionIdA}" does not exist.`);
    const b = this.versions.get(versionIdB);
    if (!b) throw new Error(`VERSION_NOT_FOUND: Version "${versionIdB}" does not exist.`);

    const stepsA = new Map(a.snapshot.steps.map((s) => [s.id, s]));
    const stepsB = new Map(b.snapshot.steps.map((s) => [s.id, s]));

    const stepsAdded: string[] = [];
    const stepsRemoved: string[] = [];
    const stepsChanged: string[] = [];

    for (const id of stepsB.keys()) {
      if (!stepsA.has(id)) stepsAdded.push(id);
    }
    for (const [id, stepA] of stepsA) {
      if (!stepsB.has(id)) {
        stepsRemoved.push(id);
      } else if (this.stepChanged(stepA, stepsB.get(id)!)) {
        stepsChanged.push(id);
      }
    }

    const routesA = a.snapshot.routes ?? [];
    const routesB = b.snapshot.routes ?? [];
    const routesAdded = routesB.filter((r) => !routesA.some((ra) => this.routeEquals(ra, r)));
    const routesRemoved = routesA.filter((r) => !routesB.some((rb) => this.routeEquals(rb, r)));

    return { versionIdA, versionIdB, stepsAdded, stepsRemoved, stepsChanged, routesAdded, routesRemoved };
  }

  listWorkflows(): string[] {
    return [...this.histories.keys()];
  }

  clear(workflowId?: string): void {
    if (workflowId === undefined) {
      this.versions.clear();
      this.histories.clear();
    } else {
      for (const id of this.histories.get(workflowId) ?? []) {
        this.versions.delete(id);
      }
      this.histories.delete(workflowId);
    }
  }

  private serialize(definition: PhaseBWorkflowDefinition): SerializableWorkflowDefinition {
    return {
      id: definition.id,
      steps: definition.steps.map((step) => this.serializeStep(step)),
      routes: definition.routes,
      plugins: definition.plugins,
      connectors: definition.connectors,
      versionTracking: definition.versionTracking,
      memoryScope: definition.memoryScope,
    };
  }

  private serializeStep(step: PhaseBStepDefinition): SerializableStepDefinition {
    return {
      id: step.id,
      dependsOn: step.dependsOn,
      timeoutMs: step.timeoutMs,
      maxRetries: step.maxRetries,
      requiredConnectors: step.requiredConnectors,
      emitsAsset: step.emitsAsset,
      memoryWrites: step.memoryWrites,
    };
  }

  private stepChanged(a: SerializableStepDefinition, b: SerializableStepDefinition): boolean {
    return JSON.stringify([
      a.dependsOn, a.timeoutMs, a.maxRetries,
      a.requiredConnectors, a.emitsAsset, a.memoryWrites,
    ]) !== JSON.stringify([
      b.dependsOn, b.timeoutMs, b.maxRetries,
      b.requiredConnectors, b.emitsAsset, b.memoryWrites,
    ]);
  }

  private routeEquals(a: DataRoute, b: DataRoute): boolean {
    return (
      a.fromStep === b.fromStep &&
      a.toStep === b.toStep &&
      a.outputKey === b.outputKey &&
      a.inputKey === b.inputKey
    );
  }
}
