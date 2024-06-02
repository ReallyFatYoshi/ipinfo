/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  testEnvironment: 'node',
};