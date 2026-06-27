import { ConnectorManager } from '../src/connector-manager';
import type { ConnectorConfig, ConnectorFactory, ConnectorHandle } from '../src/phase-b-types';

function makeConfig(name: string): ConnectorConfig {
  return { name, type: 'http', endpoint: `https://${name}.example.com` };
}

function makeFactory(): ConnectorFactory {
  return (config) => ({
    name: config.name,
    type: config.type,
    call: async () => ({}),
  });
}

function makeHandle(name: string): ConnectorHandle {
  return { name, type: 'http', call: async () => ({}) };
}

describe('ConnectorManager', () => {
  let manager: ConnectorManager;

  beforeEach(() => {
    manager = new ConnectorManager();
  });

  it('register stores config and factory under config.name', () => {
    const config = makeConfig('svc');
    manager.register(config, makeFactory());
    expect(manager.getConfig('svc')).toEqual(config);
  });

  it('register throws CONNECTOR_ALREADY_REGISTERED for a duplicate name', () => {
    manager.register(makeConfig('svc'), makeFactory());
    expect(() => manager.register(makeConfig('svc'), makeFactory())).toThrow(
      'CONNECTOR_ALREADY_REGISTERED',
    );
  });

  it('unregister removes the registration', () => {
    manager.register(makeConfig('svc'), makeFactory());
    manager.unregister('svc');
    expect(manager.has('svc')).toBe(false);
  });

  it('unregister throws CONNECTOR_NOT_FOUND for an unknown name', () => {
    expect(() => manager.unregister('ghost')).toThrow('CONNECTOR_NOT_FOUND');
  });

  it('has returns true for a registered name', () => {
    manager.register(makeConfig('svc'), makeFactory());
    expect(manager.has('svc')).toBe(true);
  });

  it('has returns false for an unknown name', () => {
    expect(manager.has('ghost')).toBe(false);
  });

  it('getConfig returns the stored config for a registered name', () => {
    const config = makeConfig('svc');
    manager.register(config, makeFactory());
    expect(manager.getConfig('svc')).toEqual(config);
  });

  it('getConfig returns undefined for an unknown name', () => {
    expect(manager.getConfig('ghost')).toBeUndefined();
  });

  it('resolve([]) returns {}', () => {
    expect(manager.resolve([])).toEqual({});
  });

  it('resolve(names) calls the factory with the stored config for each name', () => {
    const receivedConfigs: ConnectorConfig[] = [];
    const factory: ConnectorFactory = (cfg) => {
      receivedConfigs.push(cfg);
      return makeHandle(cfg.name);
    };
    const config = makeConfig('svc');
    manager.register(config, factory);
    manager.resolve(['svc']);
    expect(receivedConfigs).toHaveLength(1);
    expect(receivedConfigs[0]).toEqual(config);
  });

  it('resolve(names) returns a ConnectorMap keyed by connector name', () => {
    manager.register(makeConfig('a'), makeFactory());
    manager.register(makeConfig('b'), makeFactory());
    const map = manager.resolve(['a', 'b']);
    expect(Object.keys(map).sort()).toEqual(['a', 'b']);
    expect(map['a'].name).toBe('a');
    expect(map['b'].name).toBe('b');
  });

  it('resolve(names) invokes the factory on each call; handles are not cached', () => {
    let callCount = 0;
    const factory: ConnectorFactory = (cfg) => {
      callCount++;
      return makeHandle(cfg.name);
    };
    manager.register(makeConfig('svc'), factory);
    manager.resolve(['svc']);
    manager.resolve(['svc']);
    expect(callCount).toBe(2);
  });

  it('resolve(names) throws CONNECTOR_NOT_FOUND for any unknown name', () => {
    expect(() => manager.resolve(['ghost'])).toThrow('CONNECTOR_NOT_FOUND');
  });

  it('listNames returns all registered names', () => {
    manager.register(makeConfig('a'), makeFactory());
    manager.register(makeConfig('b'), makeFactory());
    expect(manager.listNames().sort()).toEqual(['a', 'b']);
  });
});
