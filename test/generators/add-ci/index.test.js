/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable jest/expect-expect */ // => use assert

const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const fs = require('fs')
const path = require('path')

const theGeneratorPath = require.resolve('../../../generators/add-ci')
const Generator = require('yeoman-generator')

const installDependencies = jest.spyOn(Generator.prototype, 'installDependencies')
beforeAll(() => {
  // mock implementations
  installDependencies.mockReturnValue(undefined)
})
beforeEach(() => {
  installDependencies.mockClear()
})
afterAll(() => {
  installDependencies.mockRestore()
})

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('should create files under .github', async () => {
    await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), 'FAKECONTENT')
      })

    // added files
    assert.file('.github/workflows/pr_test.yml')
    assert.file('.github/workflows/deploy_prod.yml')
    assert.file('.github/workflows/deploy_stage.yml')
  })
})
