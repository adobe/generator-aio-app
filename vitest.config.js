/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { defineConfig } from 'vitest/config'

export default defineConfig({
  // yeoman-generator is ESM-only and its class identity must be a single instance
  // so that `x instanceof Generator` and composeWith work across all packages
  resolve: { dedupe: ['yeoman-generator'] },
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    setupFiles: ['./test/vitest.setup.js'],
    // only run the real test suites under test/ (mirrors jest testPathIgnorePatterns
    // which ignored generators/ template payloads and playground/)
    include: ['test/**/*.test.js'],
    exclude: ['node_modules/**', 'generators/**', 'playground/**'],
    coverage: {
      provider: 'v8',
      all: true,
      // lcov is REQUIRED for codecov
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      // mirror jest collectCoverageFrom
      include: ['lib/**/*.js', 'generators/**/*.js'],
      exclude: ['generators/**/templates/**', 'generators/**/common-templates/**'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
      }
    }
  }
})
