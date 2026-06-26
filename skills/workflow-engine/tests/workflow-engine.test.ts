/**
 * Test suite for Workflow Engine — Phase A.
 * Each describe block covers one component in build order.
 */

import { EventBus } from '../src/event-bus';
import type { WorkflowEvent, WorkflowEventType } from '../src/event-bus';
import { ContextStore } from '../src/context-store';

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
