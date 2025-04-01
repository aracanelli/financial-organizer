module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!axios|your-other-module-that-needs-transforming)'
  ],
  moduleNameMapper: {
    '^axios$': '<rootDir>/node_modules/axios/dist/axios.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
}; 