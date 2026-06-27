/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  collectCoverageFrom: [
    'engine/src/**/*.ts',
    'agent/src/**/*.ts',
    'skills/*/src/**/*.ts',
  ],
  coverageThreshold: {
    global: { lines: 80 },
  },
};
