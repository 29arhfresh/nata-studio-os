import { resolveInputMap } from '../src/router';
import type { WorkflowContext } from '../src/context';

function makeCtx(overrides: Partial<WorkflowContext> = {}): WorkflowContext {
  return {
    runId: 'run-1',
    workflowId: 'wf-1',
    startedAt: new Date(),
    input: { brand: 'Nata', audience: { age: '25-40' } },
    steps: {
      'step-a': {
        stepId: 'step-a',
        status: 'completed',
        startedAt: new Date(),
        output: { tone: ['minimal', 'bold'], palette: { primary: '#1A1A1A' } },
        retryCount: 0,
      },
    },
    metadata: {},
    ...overrides,
  };
}

describe('resolveInputMap', () => {
  it('resolves a workflow.input path', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ brand: 'workflow.input.brand' }, ctx, 'step-b');
    expect(result.brand).toBe('Nata');
  });

  it('resolves a nested workflow.input path', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ age: 'workflow.input.audience.age' }, ctx, 'step-b');
    expect(result.age).toBe('25-40');
  });

  it('resolves a steps output path', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ tone: 'steps.step-a.output.tone' }, ctx, 'step-b');
    expect(result.tone).toEqual(['minimal', 'bold']);
  });

  it('resolves a deep nested steps path', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ primary: 'steps.step-a.output.palette.primary' }, ctx, 'step-b');
    expect(result.primary).toBe('#1A1A1A');
  });

  it('resolves the entire step output when path ends at output', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ everything: 'steps.step-a.output' }, ctx, 'step-b');
    expect(result.everything).toEqual({ tone: ['minimal', 'bold'], palette: { primary: '#1A1A1A' } });
  });

  it('injects literal values unchanged', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ type: { $literal: 'hero-image' } }, ctx, 'step-b');
    expect(result.type).toBe('hero-image');
  });

  it('injects literal null correctly', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({ val: { $literal: null } }, ctx, 'step-b');
    expect(result.val).toBeNull();
  });

  it('throws MISSING_CONTEXT_PATH when path is undefined', () => {
    const ctx = makeCtx();
    expect(() => resolveInputMap({ x: 'workflow.input.missing' }, ctx, 'step-b'))
      .toThrow('MISSING_CONTEXT_PATH');
  });

  it('throws MISSING_CONTEXT_PATH for a non-existent step', () => {
    const ctx = makeCtx();
    expect(() => resolveInputMap({ x: 'steps.ghost.output' }, ctx, 'step-b'))
      .toThrow('MISSING_CONTEXT_PATH');
  });

  it('resolves multiple fields in one call', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({
      brand: 'workflow.input.brand',
      tone: 'steps.step-a.output.tone',
      fixed: { $literal: 42 },
    }, ctx, 'step-b');
    expect(result.brand).toBe('Nata');
    expect(result.tone).toEqual(['minimal', 'bold']);
    expect(result.fixed).toBe(42);
  });

  it('returns empty object for empty inputMap', () => {
    const ctx = makeCtx();
    const result = resolveInputMap({}, ctx, 'step-b');
    expect(result).toEqual({});
  });
});
