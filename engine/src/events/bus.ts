import type { WorkflowEvent, WorkflowEventType, EventHandler, Unsubscribe } from './types';

let _idCounter = 0;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly allHandlers = new Set<EventHandler>();
  private readonly log = new Map<string, WorkflowEvent[]>();

  publish<T>(event: Omit<WorkflowEvent<T>, 'eventId' | 'timestamp'>): void {
    const full: WorkflowEvent<T> = {
      ...event,
      eventId: `evt-${++_idCounter}`,
      timestamp: new Date(),
    };

    const runLog = this.log.get(full.runId) ?? [];
    runLog.push(full as WorkflowEvent);
    this.log.set(full.runId, runLog);

    const typeHandlers = this.handlers.get(full.type);
    if (typeHandlers) {
      for (const h of typeHandlers) void h(full as WorkflowEvent);
    }
    for (const h of this.allHandlers) void h(full as WorkflowEvent);
  }

  subscribe<T>(
    type: WorkflowEventType | WorkflowEventType[],
    handler: EventHandler<T>,
  ): Unsubscribe {
    const types = Array.isArray(type) ? type : [type];
    for (const t of types) {
      if (!this.handlers.has(t)) this.handlers.set(t, new Set());
      this.handlers.get(t)!.add(handler as EventHandler);
    }
    return () => {
      for (const t of types) this.handlers.get(t)?.delete(handler as EventHandler);
    };
  }

  subscribeAll(handler: EventHandler): Unsubscribe {
    this.allHandlers.add(handler);
    return () => { this.allHandlers.delete(handler); };
  }

  replay(runId: string): WorkflowEvent[] {
    return [...(this.log.get(runId) ?? [])];
  }

  clearLog(runId: string): void {
    this.log.delete(runId);
  }
}
