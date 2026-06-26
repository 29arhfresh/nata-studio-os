export type WorkflowEventType =
  | 'workflow:started'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'step:started'
  | 'step:completed'
  | 'step:failed'
  | 'step:skipped';

export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: string;
  stepId?: string;
  payload?: unknown;
  timestamp: number;
}

export type EventHandler = (event: WorkflowEvent) => void;

/** Typed pub/sub bus for workflow lifecycle events. */
export class EventBus {
  private handlers: Map<WorkflowEventType, Set<EventHandler>> = new Map();

  /** Subscribes a handler and returns an unsubscribe function. */
  subscribe(eventType: WorkflowEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => this.unsubscribe(eventType, handler);
  }

  /** Subscribes a handler that fires exactly once then removes itself. */
  once(eventType: WorkflowEventType, handler: EventHandler): void {
    const wrapper: EventHandler = (event) => {
      this.unsubscribe(eventType, wrapper);
      handler(event);
    };
    this.subscribe(eventType, wrapper);
  }

  /** Removes a previously subscribed handler. */
  unsubscribe(eventType: WorkflowEventType, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  /** Synchronously delivers an event to all subscribed handlers. */
  emit(event: WorkflowEvent): void {
    this.handlers.get(event.type)?.forEach((h) => h(event));
  }

  /** Removes all subscriptions from the bus. */
  clear(): void {
    this.handlers.clear();
  }
}
