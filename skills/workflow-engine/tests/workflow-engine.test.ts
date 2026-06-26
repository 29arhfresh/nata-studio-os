/**
 * Test suite for Workflow Engine — Phase A.
 * Each describe block covers one component in build order.
 */

import { EventBus } from '../src/event-bus';
import type { WorkflowEvent, WorkflowEventType } from '../src/event-bus';

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
