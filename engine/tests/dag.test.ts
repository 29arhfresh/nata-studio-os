import { buildExecutionGraph } from '../src/dag/resolver';
import type { WorkflowDefinition } from '../src/types';

const noop = () => ({});

function def(steps: WorkflowDefinition['steps']): WorkflowDefinition {
  return { workflowId: 'test', name: 'Test', version: '1.0.0', steps };
}

describe('buildExecutionGraph', () => {
  it('returns empty graph for zero steps', () => {
    const g = buildExecutionGraph(def([]));
    expect(g.levels.size).toBe(0);
    expect(g.roots).toHaveLength(0);
  });

  it('assigns level 0 to a single root step', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a' },
    ]));
    expect(g.levels.get('a')).toBe(0);
    expect(g.roots).toContain('a');
  });

  it('infers sequential edge from inputMap path', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a' },
      { stepId: 'b', adapter: noop, inputMap: { x: 'steps.a.output' }, outputKey: 'b' },
    ]));
    expect(g.levels.get('a')).toBe(0);
    expect(g.levels.get('b')).toBe(1);
    expect(g.deps.get('b')).toContain('a');
  });

  it('infers deep output path references', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'brief', adapter: noop, inputMap: {}, outputKey: 'brief' },
      { stepId: 'prompt', adapter: noop, inputMap: { tone: 'steps.brief.output.tone' }, outputKey: 'prompt' },
    ]));
    expect(g.levels.get('prompt')).toBe(1);
  });

  it('assigns same level to independent parallel steps', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'root', adapter: noop, inputMap: {}, outputKey: 'root' },
      { stepId: 'p1', adapter: noop, inputMap: { x: 'steps.root.output' }, outputKey: 'p1' },
      { stepId: 'p2', adapter: noop, inputMap: { x: 'steps.root.output' }, outputKey: 'p2' },
    ]));
    expect(g.levels.get('p1')).toBe(1);
    expect(g.levels.get('p2')).toBe(1);
  });

  it('handles fan-out + fan-in (diamond) correctly', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a' },
      { stepId: 'b', adapter: noop, inputMap: { x: 'steps.a.output' }, outputKey: 'b' },
      { stepId: 'c', adapter: noop, inputMap: { x: 'steps.a.output' }, outputKey: 'c' },
      { stepId: 'd', adapter: noop, inputMap: { x: 'steps.b.output', y: 'steps.c.output' }, outputKey: 'd' },
    ]));
    expect(g.levels.get('a')).toBe(0);
    expect(g.levels.get('b')).toBe(1);
    expect(g.levels.get('c')).toBe(1);
    expect(g.levels.get('d')).toBe(2);
  });

  it('respects explicit dependsOn over inputMap inference', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a' },
      { stepId: 'b', adapter: noop, inputMap: {}, outputKey: 'b', dependsOn: ['a'] },
    ]));
    expect(g.levels.get('b')).toBe(1);
    expect(g.deps.get('b')).toContain('a');
  });

  it('ignores self-references in inputMap', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: { self: 'steps.a.output' }, outputKey: 'a' },
    ]));
    expect(g.levels.get('a')).toBe(0);
    expect(g.deps.get('a')).not.toContain('a');
  });

  it('ignores references to unknown stepIds', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: { x: 'steps.ghost.output' }, outputKey: 'a' },
    ]));
    expect(g.levels.get('a')).toBe(0);
  });

  it('throws WORKFLOW_CYCLE_DETECTED for a direct cycle', () => {
    expect(() =>
      buildExecutionGraph(def([
        { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a', dependsOn: ['b'] },
        { stepId: 'b', adapter: noop, inputMap: {}, outputKey: 'b', dependsOn: ['a'] },
      ])),
    ).toThrow('WORKFLOW_CYCLE_DETECTED');
  });

  it('throws WORKFLOW_CYCLE_DETECTED for an indirect cycle', () => {
    expect(() =>
      buildExecutionGraph(def([
        { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a', dependsOn: ['c'] },
        { stepId: 'b', adapter: noop, inputMap: {}, outputKey: 'b', dependsOn: ['a'] },
        { stepId: 'c', adapter: noop, inputMap: {}, outputKey: 'c', dependsOn: ['b'] },
      ])),
    ).toThrow('WORKFLOW_CYCLE_DETECTED');
  });

  it('treats literal values in inputMap as non-edges', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: { x: { $literal: 'hello' } }, outputKey: 'a' },
    ]));
    expect(g.levels.get('a')).toBe(0);
    expect(g.deps.get('a')).toHaveLength(0);
  });

  it('identifies multiple roots when steps are independent', () => {
    const g = buildExecutionGraph(def([
      { stepId: 'a', adapter: noop, inputMap: {}, outputKey: 'a' },
      { stepId: 'b', adapter: noop, inputMap: {}, outputKey: 'b' },
    ]));
    expect(g.roots).toContain('a');
    expect(g.roots).toContain('b');
  });
});
