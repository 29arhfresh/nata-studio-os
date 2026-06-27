import type { WorkflowDefinition, StepDefinition } from '../types';
import { isLiteral } from '../types';
import { makeError } from '../errors';
import type { ExecutionGraph } from './graph';

function inferDeps(steps: StepDefinition[]): Map<string, string[]> {
  const stepIds = new Set(steps.map((s) => s.stepId));
  const deps = new Map<string, string[]>();

  for (const step of steps) {
    const seen = new Set<string>();

    // Explicit edges declared by the caller.
    for (const dep of step.dependsOn ?? []) {
      if (stepIds.has(dep) && dep !== step.stepId) seen.add(dep);
    }

    // Inferred from inputMap paths like "steps.<stepId>.output.*".
    for (const value of Object.values(step.inputMap)) {
      if (isLiteral(value)) continue;
      const parts = value.split('.');
      if (parts[0] === 'steps' && parts[1] && stepIds.has(parts[1]) && parts[1] !== step.stepId) {
        seen.add(parts[1]);
      }
    }

    deps.set(step.stepId, [...seen]);
  }

  return deps;
}

function detectCycle(deps: Map<string, string[]>): string[] | null {
  const visited = new Set<string>();
  const onStack = new Set<string>();

  function dfs(node: string, path: string[]): string[] | null {
    if (onStack.has(node)) return [...path, node];
    if (visited.has(node)) return null;
    visited.add(node);
    onStack.add(node);
    for (const dep of deps.get(node) ?? []) {
      const cycle = dfs(dep, [...path, node]);
      if (cycle) return cycle;
    }
    onStack.delete(node);
    return null;
  }

  for (const node of deps.keys()) {
    if (!visited.has(node)) {
      const cycle = dfs(node, []);
      if (cycle) return cycle;
    }
  }
  return null;
}

function computeLevels(stepIds: string[], deps: Map<string, string[]>): Map<string, number> {
  const levels = new Map<string, number>();

  function levelOf(id: string): number {
    if (levels.has(id)) return levels.get(id)!;
    const d = deps.get(id) ?? [];
    const level = d.length === 0 ? 0 : Math.max(...d.map(levelOf)) + 1;
    levels.set(id, level);
    return level;
  }

  for (const id of stepIds) levelOf(id);
  return levels;
}

export function buildExecutionGraph(def: WorkflowDefinition): ExecutionGraph {
  if (def.steps.length === 0) {
    return { levels: new Map(), deps: new Map(), roots: [] };
  }

  const deps = inferDeps(def.steps);

  const cycle = detectCycle(deps);
  if (cycle) {
    throw makeError(
      'WORKFLOW_CYCLE_DETECTED',
      '',
      `WORKFLOW_CYCLE_DETECTED: cycle in workflow "${def.workflowId}": ${cycle.join(' → ')}`,
    );
  }

  const levels = computeLevels(def.steps.map((s) => s.stepId), deps);
  const roots = def.steps
    .filter((s) => (deps.get(s.stepId) ?? []).length === 0)
    .map((s) => s.stepId);

  return { levels, deps, roots };
}
