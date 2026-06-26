export interface StepNode {
  id: string;
  dependsOn: string[];
}

export interface ResolvedDag {
  order: string[];
  hasCycle: boolean;
  cycleNodes: string[];
}

/**
 * Resolves a set of steps into a topological execution order.
 * Throws when a step declares a dependency on an unknown step id.
 * Returns hasCycle: true with the offending node ids when a cycle is found.
 */
export function resolveDag(steps: StepNode[]): ResolvedDag {
  const ids = steps.map((s) => s.id);
  const idSet = new Set(ids);

  for (const step of steps) {
    for (const dep of step.dependsOn) {
      if (!idSet.has(dep)) {
        throw new Error(
          `UNKNOWN_DEPENDENCY: Step "${step.id}" depends on unknown step "${dep}".`,
        );
      }
    }
  }

  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  for (const id of ids) {
    inDegree[id] = 0;
    adj[id] = [];
  }

  for (const step of steps) {
    for (const dep of step.dependsOn) {
      adj[dep].push(step.id);
      inDegree[step.id]++;
    }
  }

  const queue = ids.filter((id) => inDegree[id] === 0);
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (order.length < ids.length) {
    const cycleNodes = ids.filter((id) => !order.includes(id));
    return { order, hasCycle: true, cycleNodes };
  }

  return { order, hasCycle: false, cycleNodes: [] };
}
