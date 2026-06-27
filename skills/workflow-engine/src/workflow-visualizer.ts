import { resolveDag } from './dag-resolver';
import type {
  PhaseBWorkflowDefinition,
  PhaseBWorkflowResult,
  VisualizerGraph,
  VisualizerNode,
  VisualizerEdge,
  VisualizerNodeStatus,
} from './phase-b-types';

export function visualize(
  definition: PhaseBWorkflowDefinition,
  result?: PhaseBWorkflowResult,
): VisualizerGraph {
  const depths = computeDepths(definition);
  const maxCol = depths.size > 0 ? Math.max(...depths.values()) : -1;
  const fallbackCol = maxCol + 1;

  const columnCounters = new Map<number, number>();
  const nodes: VisualizerNode[] = definition.steps.map((step) => {
    const column = depths.has(step.id) ? depths.get(step.id)! : fallbackCol;
    const row = columnCounters.get(column) ?? 0;
    columnCounters.set(column, row + 1);

    let status: VisualizerNodeStatus = 'unknown';
    if (result) {
      const stepResult = result.stepResults.find((r) => r.stepId === step.id);
      status = stepResult ? (stepResult.status as VisualizerNodeStatus) : 'pending';
    }

    return { id: step.id, label: step.id, status, column, row };
  });

  const edgeEntries: { from: string; to: string; routeKeys: string[] }[] = [];
  for (const step of definition.steps) {
    for (const dep of step.dependsOn) {
      const existing = edgeEntries.find((e) => e.from === dep && e.to === step.id);
      if (!existing) edgeEntries.push({ from: dep, to: step.id, routeKeys: [] });
    }
  }
  for (const route of definition.routes ?? []) {
    const entry = edgeEntries.find((e) => e.from === route.fromStep && e.to === route.toStep);
    if (entry) entry.routeKeys.push(route.outputKey);
  }
  const edges: VisualizerEdge[] = edgeEntries;

  return {
    workflowId: definition.id,
    nodes,
    edges,
    status: result ? result.status : 'unknown',
  };
}

function computeDepths(definition: PhaseBWorkflowDefinition): Map<string, number> {
  const depths = new Map<string, number>();
  const stepMap = new Map(definition.steps.map((s) => [s.id, s]));

  let resolvedOrder: string[];
  try {
    resolvedOrder = resolveDag(definition.steps).order;
  } catch {
    resolvedOrder = [];
  }

  for (const id of resolvedOrder) {
    const step = stepMap.get(id);
    if (!step) continue;
    if (step.dependsOn.length === 0) {
      depths.set(id, 0);
    } else {
      const knownDepths = step.dependsOn
        .filter((dep) => depths.has(dep))
        .map((dep) => depths.get(dep)!);
      depths.set(id, knownDepths.length > 0 ? Math.max(...knownDepths) + 1 : 0);
    }
  }

  return depths;
}
