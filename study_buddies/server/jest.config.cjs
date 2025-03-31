module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    testMatch: ['<rootDir>/test/*.test.js'],
    transform: {
      '^.+\.js$': 'babel-jest'
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(mongodb-memory-server)/)'
    ],
    testPathIgnorePatterns: ['/node_modules/'],
    testTimeout: 30000
  };