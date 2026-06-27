import type { ConnectorConfig, ConnectorHandle, ConnectorMap, ConnectorFactory } from './phase-b-types';

interface ConnectorEntry {
  config:  ConnectorConfig;
  factory: ConnectorFactory;
}

export class ConnectorManager {
  private readonly connectors = new Map<string, ConnectorEntry>();

  register(config: ConnectorConfig, factory: ConnectorFactory): void {
    if (this.connectors.has(config.name)) {
      throw new Error(`CONNECTOR_ALREADY_REGISTERED: Connector "${config.name}" is already registered.`);
    }
    this.connectors.set(config.name, { config, factory });
  }

  unregister(name: string): void {
    if (!this.connectors.has(name)) {
      throw new Error(`CONNECTOR_NOT_FOUND: Connector "${name}" is not registered.`);
    }
    this.connectors.delete(name);
  }

  has(name: string): boolean {
    return this.connectors.has(name);
  }

  getConfig(name: string): ConnectorConfig | undefined {
    return this.connectors.get(name)?.config;
  }

  resolve(names: string[]): ConnectorMap {
    const map: ConnectorMap = {};
    for (const name of names) {
      const entry = this.connectors.get(name);
      if (!entry) {
        throw new Error(`CONNECTOR_NOT_FOUND: Connector "${name}" is not registered.`);
      }
      map[name] = entry.factory(entry.config);
    }
    return map;
  }

  listNames(): string[] {
    return [...this.connectors.keys()];
  }
}
