import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  verbose: true,
  testTimeout: 60000,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  detectOpenHandles: true,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/app.ts',
    '!src/config/**',
    '!src/tests/**',
    '!src/utils/seed.ts',
    '!src/interfaces/**',
    '!src/types/**',
    '!src/constants/**'
  ]
};

export default config;
