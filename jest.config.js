module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ["build", "core", "dist", "examples", "goal-model-examples", "test.ts"],
  moduleDirectories: ["node_modules", "core"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"]
};