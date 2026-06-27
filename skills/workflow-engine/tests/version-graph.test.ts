import { VersionGraph } from '../src/version-graph';
import type { PhaseBWorkflowDefinition } from '../src/phase-b-types';

function makeDefinition(id: string, overrides: Partial<PhaseBWorkflowDefinition> = {}): PhaseBWorkflowDefinition {
  return {
    id,
    steps: [
      { id: 'step-a', dependsOn: [], handler: async () => ({}) },
      { id: 'step-b', dependsOn: ['step-a'], handler: async () => ({}) },
    ],
    routes: [{ fromStep: 'step-a', toStep: 'step-b', outputKey: 'out', inputKey: 'in' }],
    plugins: ['plug'],
    connectors: ['conn'],
    versionTracking: true,
    memoryScope: 'scope-1',
    ...overrides,
  };
}

describe('VersionGraph', () => {
  let graph: VersionGraph;

  beforeEach(() => {
    graph = new VersionGraph();
  });

  it('commit generates a unique versionId with prefix ver-', () => {
    const node = graph.commit(makeDefinition('wf-1'));
    expect(node.versionId).toMatch(/^ver-[0-9a-f-]{36}$/);
  });

  it('commit sets committedAt to a recent timestamp', () => {
    const before = Date.now();
    const node = graph.commit(makeDefinition('wf-1'));
    expect(node.committedAt).toBeGreaterThanOrEqual(before);
    expect(node.committedAt).toBeLessThanOrEqual(Date.now());
  });

  it('commit snapshot excludes step handler fields', () => {
    const node = graph.commit(makeDefinition('wf-1'));
    for (const step of node.snapshot.steps) {
      expect((step as unknown as Record<string, unknown>)['handler']).toBeUndefined();
    }
  });

  it('commit snapshot includes all other step and workflow fields', () => {
    const def = makeDefinition('wf-1', {
      steps: [{
        id: 'step-a', dependsOn: [], handler: async () => ({}),
        timeoutMs: 5000, maxRetries: 2,
        requiredConnectors: ['conn'],
        emitsAsset: { type: 'image' },
        memoryWrites: [{ outputKey: 'k', memoryKey: 'mk', tier: 'short-term' }],
      }],
    });
    const node = graph.commit(def);
    const snap = node.snapshot.steps[0];
    expect(snap.id).toBe('step-a');
    expect(snap.dependsOn).toEqual([]);
    expect(snap.timeoutMs).toBe(5000);
    expect(snap.maxRetries).toBe(2);
    expect(snap.requiredConnectors).toEqual(['conn']);
    expect(snap.emitsAsset).toEqual({ type: 'image' });
    expect(snap.memoryWrites).toEqual([{ outputKey: 'k', memoryKey: 'mk', tier: 'short-term' }]);
  });

  it('first commit for a workflowId has no parentVersionId', () => {
    const node = graph.commit(makeDefinition('wf-1'));
    expect(node.parentVersionId).toBeUndefined();
  });

  it('second commit sets parentVersionId to the first commit versionId', () => {
    const v1 = graph.commit(makeDefinition('wf-1'));
    const v2 = graph.commit(makeDefinition('wf-1'));
    expect(v2.parentVersionId).toBe(v1.versionId);
  });

  it('commit accepts label and tags options and stores them on the node', () => {
    const node = graph.commit(makeDefinition('wf-1'), { label: 'initial', tags: ['stable'] });
    expect(node.label).toBe('initial');
    expect(node.tags).toContain('stable');
  });

  it('getVersion returns the correct node for a known versionId', () => {
    const node = graph.commit(makeDefinition('wf-1'));
    expect(graph.getVersion(node.versionId)).toEqual(node);
  });

  it('getVersion returns undefined for an unknown versionId', () => {
    expect(graph.getVersion('ver-ghost')).toBeUndefined();
  });

  it('getHistory returns nodes in commit order (oldest first)', () => {
    const v1 = graph.commit(makeDefinition('wf-1'));
    const v2 = graph.commit(makeDefinition('wf-1'));
    const history = graph.getHistory('wf-1');
    expect(history[0].versionId).toBe(v1.versionId);
    expect(history[1].versionId).toBe(v2.versionId);
  });

  it('getHistory returns [] for an unknown workflowId', () => {
    expect(graph.getHistory('ghost')).toEqual([]);
  });

  it('getLatest returns the most recently committed node for a workflowId', () => {
    graph.commit(makeDefinition('wf-1'));
    const v2 = graph.commit(makeDefinition('wf-1'));
    expect(graph.getLatest('wf-1')?.versionId).toBe(v2.versionId);
  });

  it('getLatest returns undefined for an unknown workflowId', () => {
    expect(graph.getLatest('ghost')).toBeUndefined();
  });

  it('tag sets the label field on an existing node', () => {
    const node = graph.commit(makeDefinition('wf-1'));
    graph.tag(node.versionId, 'my-label');
    expect(graph.getVersion(node.versionId)?.label).toBe('my-label');
  });

  it('tag throws VERSION_NOT_FOUND for an unknown versionId', () => {
    expect(() => graph.tag('ver-ghost', 'label')).toThrow('VERSION_NOT_FOUND');
  });

  it('diff returns correct stepsAdded, stepsRemoved, stepsChanged', () => {
    const defA = makeDefinition('wf-1', {
      steps: [
        { id: 'shared', dependsOn: [], handler: async () => ({}) },
        { id: 'removed', dependsOn: [], handler: async () => ({}) },
      ],
    });
    const defB = makeDefinition('wf-1', {
      steps: [
        { id: 'shared', dependsOn: [], handler: async () => ({}), timeoutMs: 9000 },
        { id: 'added', dependsOn: [], handler: async () => ({}) },
      ],
    });
    const v1 = graph.commit(defA);
    const v2 = graph.commit(defB);
    const d = graph.diff(v1.versionId, v2.versionId);
    expect(d.stepsAdded).toContain('added');
    expect(d.stepsRemoved).toContain('removed');
    expect(d.stepsChanged).toContain('shared');
  });

  it('diff returns correct routesAdded, routesRemoved', () => {
    const route = { fromStep: 'step-a', toStep: 'step-b', outputKey: 'x', inputKey: 'y' };
    const defA = makeDefinition('wf-1', { routes: [] });
    const defB = makeDefinition('wf-1', { routes: [route] });
    const v1 = graph.commit(defA);
    const v2 = graph.commit(defB);
    const d = graph.diff(v1.versionId, v2.versionId);
    expect(d.routesAdded).toHaveLength(1);
    expect(d.routesRemoved).toHaveLength(0);
  });

  it('diff throws VERSION_NOT_FOUND if either id is unknown', () => {
    const v1 = graph.commit(makeDefinition('wf-1'));
    expect(() => graph.diff(v1.versionId, 'ver-ghost')).toThrow('VERSION_NOT_FOUND');
    expect(() => graph.diff('ver-ghost', v1.versionId)).toThrow('VERSION_NOT_FOUND');
  });

  it('diff can compare versions from different workflowId values', () => {
    const v1 = graph.commit(makeDefinition('wf-a'));
    const v2 = graph.commit(makeDefinition('wf-b'));
    expect(() => graph.diff(v1.versionId, v2.versionId)).not.toThrow();
  });

  it('listWorkflows returns workflowId values in first-commit order', () => {
    graph.commit(makeDefinition('wf-alpha'));
    graph.commit(makeDefinition('wf-beta'));
    graph.commit(makeDefinition('wf-alpha'));
    expect(graph.listWorkflows()).toEqual(['wf-alpha', 'wf-beta']);
  });

  it('clear(workflowId) removes all versions for that workflow', () => {
    graph.commit(makeDefinition('wf-1'));
    graph.commit(makeDefinition('wf-2'));
    graph.clear('wf-1');
    expect(graph.getHistory('wf-1')).toHaveLength(0);
    expect(graph.getHistory('wf-2')).toHaveLength(1);
  });

  it('clear() removes all versions', () => {
    graph.commit(makeDefinition('wf-1'));
    graph.commit(makeDefinition('wf-2'));
    graph.clear();
    expect(graph.listWorkflows()).toHaveLength(0);
  });
});
