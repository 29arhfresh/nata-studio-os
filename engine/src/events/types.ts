export type WorkflowEventType =
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'step.skipped'
  | 'step.retrying';

export interface WorkflowEvent<T = unknown> {
  eventId: string;
  type: WorkflowEventType;
  runId: string;
  workflowId: string;
  stepId?: string;
  timestamp: Date;
  payload: T;
}

export type EventHandler<T = unknown> = (event: WorkflowEvent<T>) => void | Promise<void>;
export type Unsubscribe = () => void;
