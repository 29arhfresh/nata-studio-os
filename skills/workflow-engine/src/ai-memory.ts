import { randomUUID } from 'crypto';
import type { MemoryRecord, MemoryQuery, MemoryReader } from './phase-b-types';

export class AIMemory {
  private readonly records = new Map<string, MemoryRecord>();
  private insertOrder: string[] = [];

  store(record: Omit<MemoryRecord, 'id' | 'createdAt'>): MemoryRecord {
    const id = `mem-${randomUUID()}`;
    const full: MemoryRecord = { ...record, id, createdAt: Date.now() };
    this.records.set(id, full);
    this.insertOrder.push(id);
    return full;
  }

  retrieve(query: MemoryQuery): MemoryRecord[] {
    let results = this.insertOrder
      .map((id) => this.records.get(id)!)
      .filter((rec) => {
        if (query.key !== undefined && rec.key !== query.key) return false;
        if (query.tier !== undefined && rec.tier !== query.tier) return false;
        if (query.scope !== undefined && rec.scope !== query.scope) return false;
        if (query.tags !== undefined) {
          for (const tag of query.tags) {
            if (!rec.tags.includes(tag)) return false;
          }
        }
        return true;
      });

    if (query.limit !== undefined) results = results.slice(0, query.limit);
    return results;
  }

  get(key: string, scope?: string): MemoryRecord | undefined {
    const matches = this.insertOrder
      .map((id) => this.records.get(id)!)
      .filter((rec) => rec.key === key && (scope === undefined || rec.scope === scope));
    return matches.length > 0 ? matches[matches.length - 1] : undefined;
  }

  delete(id: string): void {
    if (!this.records.has(id)) {
      throw new Error(`MEMORY_RECORD_NOT_FOUND: Memory record "${id}" does not exist.`);
    }
    this.records.delete(id);
    const idx = this.insertOrder.indexOf(id);
    if (idx !== -1) this.insertOrder.splice(idx, 1);
  }

  prune(): number {
    const now = Date.now();
    let count = 0;
    for (const id of [...this.insertOrder]) {
      const rec = this.records.get(id)!;
      if (rec.ttlMs !== undefined && rec.createdAt + rec.ttlMs < now) {
        this.records.delete(id);
        const idx = this.insertOrder.indexOf(id);
        if (idx !== -1) this.insertOrder.splice(idx, 1);
        count++;
      }
    }
    return count;
  }

  reader(scope?: string): MemoryReader {
    return {
      retrieve: (query: MemoryQuery) =>
        this.retrieve(scope !== undefined ? { ...query, scope } : query),
      get: (key: string) => this.get(key, scope),
    };
  }

  clear(scope?: string): void {
    for (const id of [...this.insertOrder]) {
      const rec = this.records.get(id)!;
      if (rec.scope === scope) {
        this.records.delete(id);
        const idx = this.insertOrder.indexOf(id);
        if (idx !== -1) this.insertOrder.splice(idx, 1);
      }
    }
  }

  clearAll(): void {
    this.records.clear();
    this.insertOrder = [];
  }
}
