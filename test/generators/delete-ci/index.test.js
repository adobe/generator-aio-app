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

const path = require('path')
const fs = require('fs-extra')
const helpers = require('yeoman-test')
const assert = require('yeoman-assert')

const theGeneratorPath = require.resolve('../../../generators/delete-ci')
const Generator = require('yeoman-generator')

jest.mock('../../../lib/utils')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  function writeFakeCIFiles (dir) {
    const actionPath = '.github/workflows/action.yml'
    const actionContent = ''

    // we use real fs, dir is provided by yeoman-test helpers and will be cleaned up
    fs.ensureDirSync(path.join(dir, path.dirname(actionPath)))
    fs.writeFileSync(path.join(dir, actionPath), actionContent)
  }

  test('no .github folder', async () => {
    await expect(
      helpers.run(theGeneratorPath)
    ).rejects.toThrow('you have no CI in your project')
  })

  test('prompts yes to delete confirmation', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        writeFakeCIFiles(dir)
      })
      .withPrompts({ deleteCI: true })

    assert.noFile('.github/workflows/action.yml')
    expect(fs.existsSync(path.join(dir, '.github'))).toEqual(false)
  })

  test('prompts false to delete confirmation', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        writeFakeCIFiles(dir)
      })
      .withPrompts({ deleteCI: false })

    assert.file('.github/workflows/action.yml')
    expect(fs.existsSync(path.join(dir, '.github'))).toEqual(true)
  })

  test('--skip-prompt', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        writeFakeCIFiles(dir)
      })
      .withOptions({ 'skip-prompt': true })

    assert.noFile('.github/workflows/action.yml')
    expect(fs.existsSync(path.join(dir, '.github'))).toEqual(false)
  })
})
