/** Per-workflow namespaced key-value store for execution context. */
export class ContextStore {
  private store: Map<string, Map<string, unknown>> = new Map();

  /** Sets a value under a workflow-scoped key. */
  set(workflowId: string, key: string, value: unknown): void {
    if (!this.store.has(workflowId)) {
      this.store.set(workflowId, new Map());
    }
    this.store.get(workflowId)!.set(key, value);
  }

  /** Retrieves a value by workflow id and key; returns undefined if absent. */
  get(workflowId: string, key: string): unknown {
    return this.store.get(workflowId)?.get(key);
  }

  /** Returns true when a workflow-scoped key exists. */
  has(workflowId: string, key: string): boolean {
    return this.store.get(workflowId)?.has(key) ?? false;
  }

  /** Returns all key-value pairs for a workflow as a plain object. */
  getAll(workflowId: string): Record<string, unknown> {
    const namespace = this.store.get(workflowId);
    if (!namespace) return {};
    return Object.fromEntries(namespace.entries());
  }

  /** Deletes all context stored for a specific workflow. */
  clear(workflowId: string): void {
    this.store.delete(workflowId);
  }

  /** Deletes all context for every workflow. */
  clearAll(): void {
    this.store.clear();
  }
}
