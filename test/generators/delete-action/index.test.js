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

const theGeneratorPath = require.resolve('../../../generators/delete-action')
const Generator = require('yeoman-generator')

jest.mock('../../../lib/utils')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  function writeFakeActionFile (dir, actionName, isDirPath = false) {
    const actionContent = 'function main(){};module.exports = main'
    const actionPath = `actions/${actionName}/index.js`
    const manifestContent = `packages:
  __APP_PACKAGE__:
    actions:
      ${actionName}:
        function: ${isDirPath ? path.dirname(actionPath) : actionPath}
`
    // we use real fs, dir is provided by yeoman-test helpers and will be cleaned up
    fs.ensureDirSync(path.join(dir, path.dirname(actionPath)))
    fs.writeFileSync(path.join(dir, actionPath), actionContent)
    fs.writeFileSync(path.join(dir, 'manifest.yml'), manifestContent)
  }

  test('no manifest.yml', async () => {
    await expect(
      helpers.run(theGeneratorPath)
    ).rejects.toThrow('you have no actions in your project')
  })

  test('--skip-prompt is provided but not --action-name', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .withOptions({ 'skip-prompt': true })
    ).rejects.toThrow('--skip-prompt option provided but missing --action-name')
  })

  test('prompts with a non existing actionName', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
        .withPrompts({ actionName: 'notexisting' })
    ).rejects.toThrow('action name \'notexisting\' does not exist')
  })

  test('--skip-prompt --action-name=notexisting', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
        .withOptions({ 'skip-prompt': true, 'action-name': 'notexisting' })
    ).rejects.toThrow('action name \'notexisting\' does not exist')
  })

  test('prompts action name `fakeName` and prompts yes to delete confirmation', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
        .withPrompts({ actionName: 'fakeName', deleteAction: true })
    ).resolves.toEqual(expect.any(String))

    assert.noFile('actions/fakeName/index.js')
    assert.file('manifest.yml')
    assert.noFileContent('manifest.yml', 'fakeName')
    assert.noFileContent('manifest.yml', 'function: actions/fakeName/index.js')
  })

  test('prompts action name `fakeName` and prompts false to delete confirmation', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
        .withPrompts({ actionName: 'fakeName', deleteAction: false })
    ).resolves.toEqual(expect.any(String))

    assert.file('actions/fakeName/index.js')
    assert.file('manifest.yml')
    assert.fileContent('manifest.yml', 'fakeName')
    assert.fileContent('manifest.yml', 'function: actions/fakeName/index.js')
  })

  test('--action-name=fakeName and prompts yes to delete confirmation', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .withOptions({ 'action-name': 'fakeName' })
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
        .withPrompts({ deleteAction: true })
    ).resolves.toEqual(expect.any(String))

    assert.noFile('actions/fakeName/index.js')
    assert.file('manifest.yml')
    assert.noFileContent('manifest.yml', 'fakeName')
    assert.noFileContent('manifest.yml', 'function: actions/fakeName/index.js')
  })

  test('--action-name=fakeName and prompts false to delete confirmation', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .withOptions({ 'action-name': 'fakeName' })
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
        .withPrompts({ deleteAction: false })
    ).resolves.toEqual(expect.any(String))

    assert.file('actions/fakeName/index.js')
    assert.file('manifest.yml')
    assert.fileContent('manifest.yml', 'fakeName')
    assert.fileContent('manifest.yml', 'function: actions/fakeName/index.js')
  })

  test('--skip-prompt --action-name=fakeName', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .withOptions({ 'skip-prompt': true, 'action-name': 'fakeName' })
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName')
        })
    ).resolves.toEqual(expect.any(String))

    assert.noFile('actions/fakeName/index.js')
    assert.file('manifest.yml')
    assert.noFileContent('manifest.yml', 'fakeName')
    assert.noFileContent('manifest.yml', 'function: actions/fakeName/index.js')
  })

  test('--skip-prompt --action-name=fakeName AND action.function points to dir in manifest', async () => {
    await expect(
      helpers.run(theGeneratorPath)
        .withOptions({ 'skip-prompt': true, 'action-name': 'fakeName' })
        .inTmpDir(dir => {
          writeFakeActionFile(dir, 'fakeName', true)
        })
    ).resolves.toEqual(expect.any(String))

    assert.noFile('actions/fakeName/index.js')
    assert.file('manifest.yml')
    assert.noFileContent('manifest.yml', 'fakeName')
    assert.noFileContent('manifest.yml', 'function: actions/fakeName/index.js')
  })
})
