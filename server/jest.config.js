/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
  // Includes the first-run mongodb-memory-server binary download.
  testTimeout: 180000,
};
