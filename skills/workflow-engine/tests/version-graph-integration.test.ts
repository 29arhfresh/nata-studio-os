import workflowEngine from '../src/index';
import type { PhaseBWorkflowDefinition } from '../src/phase-b-types';

describe('VersionGraph Integration', () => {
  it('versionTracking: true commits the definition and sets versionId in the result', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `vgi-wf-${Date.now()}`,
      steps: [{ id: 's', dependsOn: [], handler: async () => ({}) }],
      versionTracking: true,
    };
    const result = await workflowEngine.run(def);
    expect(result.versionId).toBeDefined();
    expect(result.versionId!).toMatch(/^ver-/);
  });

  it('the committed VersionNode is retrievable via workflowEngine.getVersion(result.versionId)', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `vgi-wf-get-${Date.now()}`,
      steps: [{ id: 's', dependsOn: [], handler: async () => ({}) }],
      versionTracking: true,
    };
    const result = await workflowEngine.run(def);
    const node = workflowEngine.getVersion(result.versionId!);
    expect(node).toBeDefined();
    expect(node!.workflowId).toBe(def.id);
  });

  it('a failed workflow run has a committed VersionNode in version history', async () => {
    const wfId = `vgi-wf-fail-${Date.now()}`;
    const def: PhaseBWorkflowDefinition = {
      id: wfId,
      steps: [{ id: 's', dependsOn: [], handler: async () => { throw new Error('fail'); } }],
      versionTracking: true,
    };
    const result = await workflowEngine.run(def);
    expect(result.status).toBe('failed');
    expect(result.versionId).toBeDefined();
    const history = workflowEngine.getHistory(wfId);
    expect(history.some((n) => n.versionId === result.versionId)).toBe(true);
  });

  it('versionTracking: false or absent: no commit occurs and result.versionId is undefined', async () => {
    const def: PhaseBWorkflowDefinition = {
      id: `vgi-wf-notrack-${Date.now()}`,
      steps: [{ id: 's', dependsOn: [], handler: async () => ({}) }],
    };
    const result = await workflowEngine.run(def);
    expect(result.versionId).toBeUndefined();
  });

  it('multiple runs of the same workflowId produce a linked version chain via parentVersionId', async () => {
    const wfId = `vgi-wf-chain-${Date.now()}`;
    const def: PhaseBWorkflowDefinition = {
      id: wfId,
      steps: [{ id: 's', dependsOn: [], handler: async () => ({}) }],
      versionTracking: true,
    };
    const r1 = await workflowEngine.run(def);
    const r2 = await workflowEngine.run(def);
    const v2Node = workflowEngine.getVersion(r2.versionId!);
    expect(v2Node!.parentVersionId).toBe(r1.versionId);
  });
});
