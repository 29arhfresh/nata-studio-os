import { AssetManager } from '../src/asset-manager';
import type { AssetQuery } from '../src/phase-b-types';

describe('AssetManager', () => {
  let manager: AssetManager;

  beforeEach(() => {
    manager = new AssetManager();
  });

  const baseRef = {
    type: 'image' as const,
    workflowId: 'wf-1',
    stepId: 'step-1',
    tags: [],
  };

  it('register generates a unique assetId with prefix asset-', () => {
    const rec = manager.register('data', baseRef);
    expect(rec.assetId).toMatch(/^asset-[0-9a-f-]{36}$/);
  });

  it('register sets registeredAt to a recent timestamp', () => {
    const before = Date.now();
    const rec = manager.register('data', baseRef);
    expect(rec.registeredAt).toBeGreaterThanOrEqual(before);
    expect(rec.registeredAt).toBeLessThanOrEqual(Date.now());
  });

  it('register returns the complete AssetRecord including value', () => {
    const rec = manager.register({ url: 'http://example.com/img.png' }, baseRef);
    expect(rec.value).toEqual({ url: 'http://example.com/img.png' });
    expect(rec.type).toBe('image');
    expect(rec.workflowId).toBe('wf-1');
    expect(rec.stepId).toBe('step-1');
  });

  it('get returns the correct record for a known assetId', () => {
    const rec = manager.register('value', baseRef);
    const found = manager.get(rec.assetId);
    expect(found).toEqual(rec);
  });

  it('get returns undefined for an unknown assetId', () => {
    expect(manager.get('asset-unknown')).toBeUndefined();
  });

  it('query with no filters returns all non-archived records', () => {
    manager.register('a', baseRef);
    manager.register('b', baseRef);
    expect(manager.query({})).toHaveLength(2);
  });

  it('query with type filter returns only matching records', () => {
    manager.register('img', { ...baseRef, type: 'image' });
    manager.register('vid', { ...baseRef, type: 'video' });
    const results = manager.query({ type: 'image' });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('image');
  });

  it('query with tags filter uses intersection matching', () => {
    manager.register('a', { ...baseRef, tags: ['alpha', 'beta'] });
    manager.register('b', { ...baseRef, tags: ['alpha'] });
    manager.register('c', { ...baseRef, tags: ['gamma'] });
    const results = manager.query({ tags: ['alpha', 'beta'] });
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe('a');
  });

  it('query with workflowId filter returns only matching records', () => {
    manager.register('a', { ...baseRef, workflowId: 'wf-1' });
    manager.register('b', { ...baseRef, workflowId: 'wf-2' });
    const results = manager.query({ workflowId: 'wf-2' });
    expect(results).toHaveLength(1);
    expect(results[0].workflowId).toBe('wf-2');
  });

  it('query with multiple filters ANDs all conditions', () => {
    manager.register('a', { ...baseRef, type: 'image', workflowId: 'wf-1' });
    manager.register('b', { ...baseRef, type: 'video', workflowId: 'wf-1' });
    manager.register('c', { ...baseRef, type: 'image', workflowId: 'wf-2' });
    const results = manager.query({ type: 'image', workflowId: 'wf-1' });
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe('a');
  });

  it('tag appends new tags to an existing record', () => {
    const rec = manager.register('data', { ...baseRef, tags: ['old'] });
    manager.tag(rec.assetId, ['new1', 'new2']);
    const updated = manager.get(rec.assetId)!;
    expect(updated.tags).toContain('old');
    expect(updated.tags).toContain('new1');
    expect(updated.tags).toContain('new2');
  });

  it('tag ignores duplicate tags silently', () => {
    const rec = manager.register('data', { ...baseRef, tags: ['dup'] });
    manager.tag(rec.assetId, ['dup', 'dup']);
    expect(manager.get(rec.assetId)!.tags.filter((t) => t === 'dup')).toHaveLength(1);
  });

  it('tag throws ASSET_NOT_FOUND for an unknown assetId', () => {
    expect(() => manager.tag('asset-ghost', ['x'])).toThrow('ASSET_NOT_FOUND');
  });

  it('archive removes the record from getAll results', () => {
    const rec = manager.register('data', baseRef);
    manager.archive(rec.assetId);
    expect(manager.getAll()).toHaveLength(0);
  });

  it('archive causes get to return undefined for that assetId', () => {
    const rec = manager.register('data', baseRef);
    manager.archive(rec.assetId);
    expect(manager.get(rec.assetId)).toBeUndefined();
  });

  it('archive throws ASSET_NOT_FOUND for an unknown assetId', () => {
    expect(() => manager.archive('asset-ghost')).toThrow('ASSET_NOT_FOUND');
  });

  it('getAll returns records in registration order', () => {
    const r1 = manager.register('first', baseRef);
    const r2 = manager.register('second', baseRef);
    const all = manager.getAll();
    expect(all[0].assetId).toBe(r1.assetId);
    expect(all[1].assetId).toBe(r2.assetId);
  });

  it('getAll excludes archived records', () => {
    const r1 = manager.register('keep', baseRef);
    const r2 = manager.register('drop', baseRef);
    manager.archive(r2.assetId);
    const all = manager.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].assetId).toBe(r1.assetId);
  });

  it('clear removes all records including archived ones', () => {
    const r1 = manager.register('a', baseRef);
    manager.archive(r1.assetId);
    manager.register('b', baseRef);
    manager.clear();
    expect(manager.getAll()).toHaveLength(0);
    expect(manager.query({})).toHaveLength(0);
  });

  it('register after clear starts fresh with no prior records', () => {
    manager.register('before', baseRef);
    manager.clear();
    const rec = manager.register('after', baseRef);
    expect(manager.getAll()).toHaveLength(1);
    expect(manager.getAll()[0].assetId).toBe(rec.assetId);
  });
});
