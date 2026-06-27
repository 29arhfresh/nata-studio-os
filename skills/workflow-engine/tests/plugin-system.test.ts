import { PluginSystem } from '../src/plugin-system';
import type { Plugin, PluginHookContext } from '../src/phase-b-types';

function makePlugin(name: string, hooks: Partial<Omit<Plugin, 'manifest'>> = {}): Plugin {
  return {
    manifest: { name, version: '1.0.0', description: `Plugin ${name}` },
    ...hooks,
  };
}

describe('PluginSystem', () => {
  let ps: PluginSystem;

  beforeEach(() => {
    ps = new PluginSystem();
  });

  const ctx: PluginHookContext = { workflowId: 'wf-1' };

  it('install registers a plugin and enables it by default', () => {
    ps.install(makePlugin('alpha'));
    expect(ps.isEnabled('alpha')).toBe(true);
  });

  it('install throws PLUGIN_ALREADY_INSTALLED for a duplicate manifest.name', () => {
    ps.install(makePlugin('alpha'));
    expect(() => ps.install(makePlugin('alpha'))).toThrow('PLUGIN_ALREADY_INSTALLED');
  });

  it('uninstall removes the plugin', () => {
    ps.install(makePlugin('alpha'));
    ps.uninstall('alpha');
    expect(ps.getManifest('alpha')).toBeUndefined();
  });

  it('uninstall throws PLUGIN_NOT_FOUND for an unknown name', () => {
    expect(() => ps.uninstall('ghost')).toThrow('PLUGIN_NOT_FOUND');
  });

  it('disable prevents hooks from running without removing the plugin', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('alpha', { beforeStep: () => { calls.push('alpha'); } }));
    ps.disable('alpha');
    await ps.runBeforeStep(ctx);
    expect(calls).toHaveLength(0);
    expect(ps.getManifest('alpha')).toBeDefined();
  });

  it('enable restores hook execution for a disabled plugin', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('alpha', { beforeStep: () => { calls.push('alpha'); } }));
    ps.disable('alpha');
    ps.enable('alpha');
    await ps.runBeforeStep(ctx);
    expect(calls).toHaveLength(1);
  });

  it('enable throws PLUGIN_NOT_FOUND for an unknown name', () => {
    expect(() => ps.enable('ghost')).toThrow('PLUGIN_NOT_FOUND');
  });

  it('disable throws PLUGIN_NOT_FOUND for an unknown name', () => {
    expect(() => ps.disable('ghost')).toThrow('PLUGIN_NOT_FOUND');
  });

  it('isEnabled returns true after install, false after disable, true after re-enable', () => {
    ps.install(makePlugin('alpha'));
    expect(ps.isEnabled('alpha')).toBe(true);
    ps.disable('alpha');
    expect(ps.isEnabled('alpha')).toBe(false);
    ps.enable('alpha');
    expect(ps.isEnabled('alpha')).toBe(true);
  });

  it('getManifest returns the manifest for an installed plugin', () => {
    const plugin = makePlugin('alpha');
    ps.install(plugin);
    expect(ps.getManifest('alpha')).toEqual(plugin.manifest);
  });

  it('getManifest returns undefined for an unknown name', () => {
    expect(ps.getManifest('ghost')).toBeUndefined();
  });

  it('listPlugins returns manifests of all installed plugins in installation order', () => {
    ps.install(makePlugin('alpha'));
    ps.install(makePlugin('beta'));
    ps.install(makePlugin('gamma'));
    const names = ps.listPlugins().map((m) => m.name);
    expect(names).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('runBeforeStep calls each enabled plugin beforeStep hook in installation order', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('a', { beforeStep: () => { calls.push('a'); } }));
    ps.install(makePlugin('b', { beforeStep: () => { calls.push('b'); } }));
    await ps.runBeforeStep(ctx);
    expect(calls).toEqual(['a', 'b']);
  });

  it('runBeforeStep skips plugins with no beforeStep hook', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('no-hook'));
    ps.install(makePlugin('with-hook', { beforeStep: () => { calls.push('called'); } }));
    await ps.runBeforeStep(ctx);
    expect(calls).toEqual(['called']);
  });

  it('runBeforeStep skips disabled plugins', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('a', { beforeStep: () => { calls.push('a'); } }));
    ps.install(makePlugin('b', { beforeStep: () => { calls.push('b'); } }));
    ps.disable('a');
    await ps.runBeforeStep(ctx);
    expect(calls).toEqual(['b']);
  });

  it('runAfterStep calls each enabled plugin afterStep hook', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('a', { afterStep: () => { calls.push('a'); } }));
    await ps.runAfterStep(ctx);
    expect(calls).toEqual(['a']);
  });

  it('runBeforeWorkflow calls each enabled plugin beforeWorkflow hook', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('a', { beforeWorkflow: () => { calls.push('a'); } }));
    await ps.runBeforeWorkflow(ctx);
    expect(calls).toEqual(['a']);
  });

  it('runAfterWorkflow calls each enabled plugin afterWorkflow hook', async () => {
    const calls: string[] = [];
    ps.install(makePlugin('a', { afterWorkflow: () => { calls.push('a'); } }));
    await ps.runAfterWorkflow(ctx);
    expect(calls).toEqual(['a']);
  });

  it('a hook that throws causes the run* call to reject with PLUGIN_HOOK_ERROR', async () => {
    ps.install(makePlugin('bad', {
      beforeStep: () => { throw new Error('boom'); },
    }));
    await expect(ps.runBeforeStep(ctx)).rejects.toThrow('PLUGIN_HOOK_ERROR');
  });

  it('run* resolves immediately when no plugins are installed', async () => {
    await expect(ps.runBeforeStep(ctx)).resolves.toBeUndefined();
    await expect(ps.runAfterWorkflow(ctx)).resolves.toBeUndefined();
  });

  it('run* resolves immediately when all installed plugins lack the relevant hook', async () => {
    ps.install(makePlugin('no-hooks'));
    await expect(ps.runBeforeStep(ctx)).resolves.toBeUndefined();
  });
});
