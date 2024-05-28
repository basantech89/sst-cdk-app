import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  displayName: 'nodejs-layer',
  testMatch: ['<rootDir>/__tests__/*.test.ts']
}

export default config
