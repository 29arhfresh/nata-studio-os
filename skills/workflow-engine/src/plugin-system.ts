import type { Plugin, PluginManifest, PluginHookContext } from './phase-b-types';

interface PluginEntry {
  plugin:  Plugin;
  enabled: boolean;
}

export class PluginSystem {
  private readonly plugins = new Map<string, PluginEntry>();
  private readonly installOrder: string[] = [];

  install(plugin: Plugin): void {
    const name = plugin.manifest.name;
    if (this.plugins.has(name)) {
      throw new Error(`PLUGIN_ALREADY_INSTALLED: Plugin "${name}" is already installed.`);
    }
    this.plugins.set(name, { plugin, enabled: true });
    this.installOrder.push(name);
  }

  uninstall(pluginName: string): void {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`PLUGIN_NOT_FOUND: Plugin "${pluginName}" is not installed.`);
    }
    this.plugins.delete(pluginName);
    const idx = this.installOrder.indexOf(pluginName);
    if (idx !== -1) this.installOrder.splice(idx, 1);
  }

  enable(pluginName: string): void {
    const entry = this.plugins.get(pluginName);
    if (!entry) throw new Error(`PLUGIN_NOT_FOUND: Plugin "${pluginName}" is not installed.`);
    entry.enabled = true;
  }

  disable(pluginName: string): void {
    const entry = this.plugins.get(pluginName);
    if (!entry) throw new Error(`PLUGIN_NOT_FOUND: Plugin "${pluginName}" is not installed.`);
    entry.enabled = false;
  }

  isEnabled(pluginName: string): boolean {
    return this.plugins.get(pluginName)?.enabled ?? false;
  }

  getManifest(pluginName: string): PluginManifest | undefined {
    return this.plugins.get(pluginName)?.plugin.manifest;
  }

  listPlugins(): PluginManifest[] {
    return this.installOrder.map((name) => this.plugins.get(name)!.plugin.manifest);
  }

  async runBeforeWorkflow(context: PluginHookContext, activePlugins?: readonly string[]): Promise<void> {
    await this.runHook('beforeWorkflow', context, activePlugins);
  }

  async runAfterWorkflow(context: PluginHookContext, activePlugins?: readonly string[]): Promise<void> {
    await this.runHook('afterWorkflow', context, activePlugins);
  }

  async runBeforeStep(context: PluginHookContext, activePlugins?: readonly string[]): Promise<void> {
    await this.runHook('beforeStep', context, activePlugins);
  }

  async runAfterStep(context: PluginHookContext, activePlugins?: readonly string[]): Promise<void> {
    await this.runHook('afterStep', context, activePlugins);
  }

  private async runHook(
    hookName: 'beforeWorkflow' | 'afterWorkflow' | 'beforeStep' | 'afterStep',
    context: PluginHookContext,
    activePlugins?: readonly string[],
  ): Promise<void> {
    for (const name of this.installOrder) {
      const entry = this.plugins.get(name);
      if (!entry || !entry.enabled) continue;
      if (activePlugins !== undefined && !activePlugins.includes(name)) continue;
      const hook = entry.plugin[hookName];
      if (!hook) continue;
      try {
        await hook(context);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`PLUGIN_HOOK_ERROR: Plugin "${name}" hook "${hookName}" threw: ${msg}`);
      }
    }
  }
}
