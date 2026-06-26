import type { StepStatus } from './types';

/** Tracks per-step execution state and determines which steps are ready to run. */
export class Scheduler {
  private stepStatus: Map<string, StepStatus>;
  private dependsOn: Map<string, string[]>;

  constructor(steps: ReadonlyArray<{ id: string; dependsOn: string[] }>) {
    this.stepStatus = new Map();
    this.dependsOn = new Map();
    for (const step of steps) {
      this.stepStatus.set(step.id, 'pending');
      this.dependsOn.set(step.id, [...step.dependsOn]);
    }
  }

  /**
   * Returns the ids of all steps whose dependencies are fully completed
   * and that are still in pending state.
   */
  getReadySteps(): string[] {
    const ready: string[] = [];
    for (const [id, status] of this.stepStatus) {
      if (status !== 'pending') continue;
      const deps = this.dependsOn.get(id) ?? [];
      const allDepsCompleted = deps.every(
        (dep) => this.stepStatus.get(dep) === 'completed',
      );
      if (allDepsCompleted) ready.push(id);
    }
    return ready;
  }

  /** Transitions a step from pending to running. */
  markRunning(stepId: string): void {
    this.assertKnownStep(stepId);
    this.stepStatus.set(stepId, 'running');
  }

  /** Transitions a step to completed. */
  markCompleted(stepId: string): void {
    this.assertKnownStep(stepId);
    this.stepStatus.set(stepId, 'completed');
  }

  /** Transitions a step to failed. */
  markFailed(stepId: string): void {
    this.assertKnownStep(stepId);
    this.stepStatus.set(stepId, 'failed');
  }

  /** Transitions a step to skipped. */
  markSkipped(stepId: string): void {
    this.assertKnownStep(stepId);
    this.stepStatus.set(stepId, 'skipped');
  }

  /** Returns the current status of a step. */
  getStatus(stepId: string): StepStatus {
    this.assertKnownStep(stepId);
    return this.stepStatus.get(stepId)!;
  }

  /** Returns true when every step has reached a terminal state. */
  isComplete(): boolean {
    for (const status of this.stepStatus.values()) {
      if (status === 'pending' || status === 'running') return false;
    }
    return true;
  }

  /** Returns true when at least one step has failed. */
  hasFailed(): boolean {
    for (const status of this.stepStatus.values()) {
      if (status === 'failed') return true;
    }
    return false;
  }

  private assertKnownStep(stepId: string): void {
    if (!this.stepStatus.has(stepId)) {
      throw new Error(`UNKNOWN_STEP: Step "${stepId}" is not registered in the scheduler.`);
    }
  }
}
