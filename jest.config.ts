const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [] as string[],
  testMatch: ['<rootDir>/assets/**/*.(spec|test).ts'],
  modulePathIgnorePatterns: ['/node_modules/'],
};

// noinspection JSUnusedGlobalSymbols
export default jestConfig;
