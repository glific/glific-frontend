module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/config/*.{ts,tsx}',
    '!src/serviceWorker.ts',
    '!src/react-app-env.d.ts',
    '!src/index.tsx',
    '!src/types/**/*.{ts,tsx}',
  ],
  coverageReporters: ['text', 'html', 'lcov'],
};
