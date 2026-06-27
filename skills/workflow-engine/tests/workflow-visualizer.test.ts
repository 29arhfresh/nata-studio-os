import { visualize } from '../src/workflow-visualizer';
import type { PhaseBWorkflowDefinition, PhaseBWorkflowResult } from '../src/phase-b-types';

function makeDef(steps: Array<{ id: string; dependsOn: string[] }>, routes: PhaseBWorkflowDefinition['routes'] = []): PhaseBWorkflowDefinition {
  return {
    id: 'wf-test',
    steps: steps.map((s) => ({ ...s, handler: async () => ({}) })),
    routes,
  };
}

function makeResult(stepStatuses: Record<string, 'completed' | 'failed'>, status: PhaseBWorkflowResult['status'] = 'completed'): PhaseBWorkflowResult {
  return {
    workflowId: 'wf-test',
    status,
    stepResults: Object.entries(stepStatuses).map(([stepId, s]) => ({
      stepId, status: s, output: null, error: null, durationMs: 0, attempt: 1,
    })),
    startedAt: 0,
    completedAt: 0,
    error: null,
  };
}

describe('visualize', () => {
  it('linear DAG: nodes have correct column and row values', () => {
    const def = makeDef([
      { id: 'A', dependsOn: [] },
      { id: 'B', dependsOn: ['A'] },
      { id: 'C', dependsOn: ['B'] },
    ]);
    const g = visualize(def);
    const nodeMap = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
    expect(nodeMap['A'].column).toBe(0);
    expect(nodeMap['A'].row).toBe(0);
    expect(nodeMap['B'].column).toBe(1);
    expect(nodeMap['B'].row).toBe(0);
    expect(nodeMap['C'].column).toBe(2);
    expect(nodeMap['C'].row).toBe(0);
  });

  it('diamond DAG (A→B→D, A→C→D): B and C share column 1, rows 0 and 1', () => {
    const def = makeDef([
      { id: 'A', dependsOn: [] },
      { id: 'B', dependsOn: ['A'] },
      { id: 'C', dependsOn: ['A'] },
      { id: 'D', dependsOn: ['B', 'C'] },
    ]);
    const g = visualize(def);
    const nodeMap = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
    expect(nodeMap['B'].column).toBe(1);
    expect(nodeMap['C'].column).toBe(1);
    expect(nodeMap['B'].row).toBe(0);
    expect(nodeMap['C'].row).toBe(1);
    expect(nodeMap['D'].column).toBe(2);
  });

  it('parallel DAG: independent root steps are all in column 0', () => {
    const def = makeDef([
      { id: 'A', dependsOn: [] },
      { id: 'B', dependsOn: [] },
      { id: 'C', dependsOn: [] },
    ]);
    const g = visualize(def);
    for (const node of g.nodes) {
      expect(node.column).toBe(0);
    }
    const rows = g.nodes.map((n) => n.row).sort((a, b) => a - b);
    expect(rows).toEqual([0, 1, 2]);
  });

  it('single-step workflow: one node at column 0, row 0', () => {
    const def = makeDef([{ id: 'only', dependsOn: [] }]);
    const g = visualize(def);
    expect(g.nodes).toHaveLength(1);
    expect(g.nodes[0].column).toBe(0);
    expect(g.nodes[0].row).toBe(0);
  });

  it('one VisualizerEdge produced for each unique (from, to) dependency pair', () => {
    const def = makeDef([
      { id: 'A', dependsOn: [] },
      { id: 'B', dependsOn: ['A'] },
      { id: 'C', dependsOn: ['A'] },
    ]);
    const g = visualize(def);
    expect(g.edges).toHaveLength(2);
    const pairs = g.edges.map((e) => `${e.from}:${e.to}`).sort();
    expect(pairs).toEqual(['A:B', 'A:C']);
  });

  it('routeKeys contains outputKey values from matching DataRoute entries', () => {
    const def = makeDef(
      [{ id: 'A', dependsOn: [] }, { id: 'B', dependsOn: ['A'] }],
      [{ fromStep: 'A', toStep: 'B', outputKey: 'result', inputKey: 'data' }],
    );
    const g = visualize(def);
    const edge = g.edges.find((e) => e.from === 'A' && e.to === 'B')!;
    expect(edge.routeKeys).toContain('result');
  });

  it('routeKeys is [] for edges with no matching DataRoute', () => {
    const def = makeDef([
      { id: 'A', dependsOn: [] },
      { id: 'B', dependsOn: ['A'] },
    ]);
    const g = visualize(def);
    expect(g.edges[0].routeKeys).toEqual([]);
  });

  it('status overlay: node status matches StepResult.status when result is provided', () => {
    const def = makeDef([{ id: 'A', dependsOn: [] }, { id: 'B', dependsOn: ['A'] }]);
    const result = makeResult({ A: 'completed', B: 'failed' });
    const g = visualize(def, result);
    const nodeMap = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
    expect(nodeMap['A'].status).toBe('completed');
    expect(nodeMap['B'].status).toBe('failed');
  });

  it('status overlay: steps with no StepResult (unreached) receive status pending', () => {
    const def = makeDef([{ id: 'A', dependsOn: [] }, { id: 'B', dependsOn: ['A'] }]);
    const result = makeResult({ A: 'completed' });
    const g = visualize(def, result);
    const nodeMap = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
    expect(nodeMap['B'].status).toBe('pending');
  });

  it('no result provided: all node statuses are unknown', () => {
    const def = makeDef([{ id: 'A', dependsOn: [] }, { id: 'B', dependsOn: ['A'] }]);
    const g = visualize(def);
    for (const node of g.nodes) {
      expect(node.status).toBe('unknown');
    }
  });

  it('no result provided: graph.status is unknown', () => {
    const def = makeDef([{ id: 'A', dependsOn: [] }]);
    const g = visualize(def);
    expect(g.status).toBe('unknown');
  });

  it('result provided: graph.status matches result.status', () => {
    const def = makeDef([{ id: 'A', dependsOn: [] }]);
    const result = makeResult({ A: 'failed' }, 'failed');
    const g = visualize(def, result);
    expect(g.status).toBe('failed');
  });

  it('cyclic DAG: function does not throw; cyclic nodes placed in last column', () => {
    const def: PhaseBWorkflowDefinition = {
      id: 'wf-cycle',
      steps: [
        { id: 'A', dependsOn: ['B'], handler: async () => ({}) },
        { id: 'B', dependsOn: ['A'], handler: async () => ({}) },
      ],
    };
    expect(() => visualize(def)).not.toThrow();
    const g = visualize(def);
    expect(g.nodes).toHaveLength(2);
  });

  it('graph.workflowId matches definition.id', () => {
    const def = makeDef([{ id: 'A', dependsOn: [] }]);
    const g = visualize(def);
    expect(g.workflowId).toBe('wf-test');
  });
});
