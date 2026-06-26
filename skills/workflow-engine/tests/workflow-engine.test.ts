/**
 * Test suite for Workflow Engine — Phase A.
 * Each describe block covers one component in build order.
 */

import { EventBus } from '../src/event-bus';
import type { WorkflowEvent, WorkflowEventType } from '../src/event-bus';
import { ContextStore } from '../src/context-store';
import { DataRouter } from '../src/data-router';
import type { DataRoute } from '../src/data-router';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEvent(
  overrides: Partial<WorkflowEvent> = {},
): WorkflowEvent {
  return {
    type: 'workflow:started',
    workflowId: 'wf-test',
    timestamp: Date.now(),
    ...overrides,
  };
}

// ─── 1. EventBus ─────────────────────────────────────────────────────────────

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('delivers an event to a subscribed handler', () => {
    const received: WorkflowEvent[] = [];
    bus.subscribe('workflow:started', (e) => received.push(e));
    const event = makeEvent();
    bus.emit(event);
    expect(received).toHaveLength(1);
    expect(received[0]).toBe(event);
  });

  it('delivers to multiple handlers on the same event type', () => {
    const calls: number[] = [];
    bus.subscribe('step:completed', () => calls.push(1));
    bus.subscribe('step:completed', () => calls.push(2));
    bus.emit(makeEvent({ type: 'step:completed' }));
    expect(calls).toEqual([1, 2]);
  });

  it('does not deliver to handlers on a different event type', () => {
    const received: WorkflowEvent[] = [];
    bus.subscribe('workflow:failed', (e) => received.push(e));
    bus.emit(makeEvent({ type: 'workflow:started' }));
    expect(received).toHaveLength(0);
  });

  it('unsubscribes via the returned function', () => {
    const received: WorkflowEvent[] = [];
    const unsub = bus.subscribe('step:started', (e) => received.push(e));
    unsub();
    bus.emit(makeEvent({ type: 'step:started' }));
    expect(received).toHaveLength(0);
  });

  it('unsubscribes via unsubscribe() directly', () => {
    const received: WorkflowEvent[] = [];
    const handler = (e: WorkflowEvent): void => { received.push(e); };
    bus.subscribe('step:failed', handler);
    bus.unsubscribe('step:failed', handler);
    bus.emit(makeEvent({ type: 'step:failed' }));
    expect(received).toHaveLength(0);
  });

  it('once() fires exactly once', () => {
    const received: WorkflowEvent[] = [];
    bus.once('workflow:completed', (e) => received.push(e));
    bus.emit(makeEvent({ type: 'workflow:completed' }));
    bus.emit(makeEvent({ type: 'workflow:completed' }));
    expect(received).toHaveLength(1);
  });

  it('clear() removes all subscriptions', () => {
    const received: WorkflowEvent[] = [];
    bus.subscribe('step:skipped', (e) => received.push(e));
    bus.clear();
    bus.emit(makeEvent({ type: 'step:skipped' }));
    expect(received).toHaveLength(0);
  });

  it('emitting with no subscribers does not throw', () => {
    expect(() => bus.emit(makeEvent({ type: 'workflow:failed' }))).not.toThrow();
  });

  it('includes stepId and payload in delivered event', () => {
    const received: WorkflowEvent[] = [];
    bus.subscribe('step:completed', (e) => received.push(e));
    bus.emit(makeEvent({ type: 'step:completed', stepId: 'step-1', payload: { ok: true } }));
    expect(received[0].stepId).toBe('step-1');
    expect(received[0].payload).toEqual({ ok: true });
  });

  it('handles all defined event types without error', () => {
    const types: WorkflowEventType[] = [
      'workflow:started', 'workflow:completed', 'workflow:failed',
      'step:started', 'step:completed', 'step:failed', 'step:skipped',
    ];
    for (const type of types) {
      expect(() => bus.emit(makeEvent({ type }))).not.toThrow();
    }
  });
});

// ─── 2. ContextStore ──────────────────────────────────────────────────────────

describe('ContextStore', () => {
  let store: ContextStore;

  beforeEach(() => {
    store = new ContextStore();
  });

  it('sets and gets a value', () => {
    store.set('wf-1', 'userId', 'u-42');
    expect(store.get('wf-1', 'userId')).toBe('u-42');
  });

  it('returns undefined for an unknown key', () => {
    expect(store.get('wf-1', 'missing')).toBeUndefined();
  });

  it('returns undefined for an unknown workflow', () => {
    expect(store.get('no-such-wf', 'key')).toBeUndefined();
  });

  it('has() returns true when key exists', () => {
    store.set('wf-1', 'flag', true);
    expect(store.has('wf-1', 'flag')).toBe(true);
  });

  it('has() returns false when key is absent', () => {
    expect(store.has('wf-1', 'flag')).toBe(false);
  });

  it('has() returns false for an unknown workflow', () => {
    expect(store.has('no-wf', 'key')).toBe(false);
  });

  it('getAll() returns all keys for a workflow', () => {
    store.set('wf-1', 'a', 1);
    store.set('wf-1', 'b', 2);
    expect(store.getAll('wf-1')).toEqual({ a: 1, b: 2 });
  });

  it('getAll() returns an empty object for an unknown workflow', () => {
    expect(store.getAll('no-wf')).toEqual({});
  });

  it('namespaces are isolated between workflows', () => {
    store.set('wf-1', 'x', 'alpha');
    store.set('wf-2', 'x', 'beta');
    expect(store.get('wf-1', 'x')).toBe('alpha');
    expect(store.get('wf-2', 'x')).toBe('beta');
  });

  it('overwrites an existing value', () => {
    store.set('wf-1', 'n', 1);
    store.set('wf-1', 'n', 99);
    expect(store.get('wf-1', 'n')).toBe(99);
  });

  it('clear() removes context for a single workflow', () => {
    store.set('wf-1', 'k', 'v');
    store.set('wf-2', 'k', 'v');
    store.clear('wf-1');
    expect(store.getAll('wf-1')).toEqual({});
    expect(store.get('wf-2', 'k')).toBe('v');
  });

  it('clearAll() removes context for every workflow', () => {
    store.set('wf-1', 'k', 'v');
    store.set('wf-2', 'k', 'v');
    store.clearAll();
    expect(store.getAll('wf-1')).toEqual({});
    expect(store.getAll('wf-2')).toEqual({});
  });

  it('stores objects and arrays without mutation', () => {
    const obj = { nested: { value: 42 } };
    store.set('wf-1', 'obj', obj);
    expect(store.get('wf-1', 'obj')).toBe(obj);
  });
});

// ─── 3. DataRouter ────────────────────────────────────────────────────────────

describe('DataRouter', () => {
  let router: DataRouter;

  function makeRoute(overrides: Partial<DataRoute> = {}): DataRoute {
    return {
      fromStep: 'step-a',
      toStep:   'step-b',
      outputKey: 'result',
      inputKey:  'data',
      ...overrides,
    };
  }

  beforeEach(() => {
    router = new DataRouter();
  });

  it('resolveInputs returns empty object when no routes registered', () => {
    expect(router.resolveInputs('step-b', new Map())).toEqual({});
  });

  it('resolveInputs maps an output key to an input key', () => {
    router.addRoute(makeRoute());
    const outputs = new Map([['step-a', { result: 42 }]]);
    expect(router.resolveInputs('step-b', outputs)).toEqual({ data: 42 });
  });

  it('resolveInputs ignores routes not targeting the requested step', () => {
    router.addRoute(makeRoute({ toStep: 'step-c' }));
    const outputs = new Map([['step-a', { result: 'x' }]]);
    expect(router.resolveInputs('step-b', outputs)).toEqual({});
  });

  it('resolveInputs skips a route when the source step has no output', () => {
    router.addRoute(makeRoute());
    expect(router.resolveInputs('step-b', new Map())).toEqual({});
  });

  it('resolveInputs skips a route when outputKey is absent from source output', () => {
    router.addRoute(makeRoute({ outputKey: 'missing' }));
    const outputs = new Map([['step-a', { result: 99 }]]);
    expect(router.resolveInputs('step-b', outputs)).toEqual({});
  });

  it('resolves multiple routes into one input object', () => {
    router.addRoute(makeRoute({ outputKey: 'x', inputKey: 'p' }));
    router.addRoute(makeRoute({ outputKey: 'y', inputKey: 'q' }));
    const outputs = new Map([['step-a', { x: 1, y: 2 }]]);
    expect(router.resolveInputs('step-b', outputs)).toEqual({ p: 1, q: 2 });
  });

  it('routes from different source steps are combined', () => {
    router.addRoute(makeRoute({ fromStep: 'step-a', outputKey: 'a', inputKey: 'x' }));
    router.addRoute(makeRoute({ fromStep: 'step-b', toStep: 'step-c', outputKey: 'b', inputKey: 'y' }));
    const outputs = new Map<string, Record<string, unknown>>([
      ['step-a', { a: 10 }],
      ['step-b', { b: 20 }],
    ]);
    expect(router.resolveInputs('step-c', outputs)).toEqual({ y: 20 });
    expect(router.resolveInputs('step-b', outputs)).toEqual({ x: 10 });
  });

  it('getRoutesTo returns routes targeting a step', () => {
    router.addRoute(makeRoute());
    router.addRoute(makeRoute({ fromStep: 'step-c', toStep: 'step-b', outputKey: 'r', inputKey: 'i' }));
    expect(router.getRoutesTo('step-b')).toHaveLength(2);
    expect(router.getRoutesTo('step-a')).toHaveLength(0);
  });

  it('getRoutesFrom returns routes originating from a step', () => {
    router.addRoute(makeRoute());
    expect(router.getRoutesFrom('step-a')).toHaveLength(1);
    expect(router.getRoutesFrom('step-b')).toHaveLength(0);
  });

  it('removeRoutesFrom removes only routes from that step', () => {
    router.addRoute(makeRoute({ fromStep: 'step-a' }));
    router.addRoute(makeRoute({ fromStep: 'step-c', toStep: 'step-b', outputKey: 'r', inputKey: 'i' }));
    router.removeRoutesFrom('step-a');
    expect(router.getRoutesFrom('step-a')).toHaveLength(0);
    expect(router.getRoutesFrom('step-c')).toHaveLength(1);
  });

  it('addRoute does not share references with the caller', () => {
    const route = makeRoute();
    router.addRoute(route);
    route.outputKey = 'mutated';
    expect(router.getRoutesFrom('step-a')[0].outputKey).toBe('result');
  });
});
