import { randomUUID } from 'crypto';
import type { AssetRef, AssetRecord, AssetQuery } from './phase-b-types';

export class AssetManager {
  private readonly records = new Map<string, AssetRecord>();
  private readonly archived = new Set<string>();
  private order: string[] = [];

  register(value: unknown, ref: Omit<AssetRef, 'assetId' | 'registeredAt'>): AssetRecord {
    const assetId = `asset-${randomUUID()}`;
    const record: AssetRecord = { ...ref, assetId, registeredAt: Date.now(), value };
    this.records.set(assetId, record);
    this.order.push(assetId);
    return record;
  }

  get(assetId: string): AssetRecord | undefined {
    if (this.archived.has(assetId)) return undefined;
    return this.records.get(assetId);
  }

  query(query: AssetQuery): AssetRecord[] {
    return this.order
      .filter((id) => !this.archived.has(id))
      .map((id) => this.records.get(id)!)
      .filter((rec) => {
        if (query.type !== undefined && rec.type !== query.type) return false;
        if (query.workflowId !== undefined && rec.workflowId !== query.workflowId) return false;
        if (query.stepId !== undefined && rec.stepId !== query.stepId) return false;
        if (query.tags !== undefined) {
          for (const tag of query.tags) {
            if (!rec.tags.includes(tag)) return false;
          }
        }
        return true;
      });
  }

  tag(assetId: string, tags: string[]): void {
    if (!this.records.has(assetId)) {
      throw new Error(`ASSET_NOT_FOUND: Asset "${assetId}" is not registered.`);
    }
    const rec = this.records.get(assetId)!;
    for (const tag of tags) {
      if (!rec.tags.includes(tag)) rec.tags.push(tag);
    }
  }

  archive(assetId: string): void {
    if (!this.records.has(assetId)) {
      throw new Error(`ASSET_NOT_FOUND: Asset "${assetId}" is not registered.`);
    }
    this.archived.add(assetId);
  }

  getAll(): AssetRecord[] {
    return this.order
      .filter((id) => !this.archived.has(id))
      .map((id) => this.records.get(id)!);
  }

  clear(): void {
    this.records.clear();
    this.archived.clear();
    this.order = [];
  }
}
