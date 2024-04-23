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

const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const fs = require('fs-extra')

jest.mock('fs-extra')

let yeomanTestHelpers
beforeAll(async () => {
  yeomanTestHelpers = (await import('yeoman-test')).default
})

const theGeneratorPath = require.resolve('../../../generators/add-vscode-config')
const Generator = require('yeoman-generator')

beforeEach(() => {
  fs.lstatSync.mockReset()
  fs.existsSync.mockReset()
})

test('exports a yeoman generator', () => {
  expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
})

test('no missing options (defaults))', async () => {
  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath)
  await expect(result).resolves.not.toThrow()

  assert.file('.vscode/launch.json') // destination file is written
  assert.JSONFileContent('.vscode/launch.json', fixtureJson('add-vscode-config/launch.json'))
})

test('option destination-file is set', async () => {
  const options = {
    'destination-file': 'foo/bar.json'
  }

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = yeomanTestHelpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()

  assert.file(options['destination-file']) // destination file is written
  assert.JSONFileContent(options['destination-file'], fixtureJson('add-vscode-config/launch.json'))
})

test('vscode launch configuration exists', async () => {
  const options = {
    'destination-file': 'foo/bar.json'
  }

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  fs.existsSync.mockReturnValue(true) // destination file exists

  const result = yeomanTestHelpers
    .run(theGeneratorPath)
    .withOptions(options)
    .withPrompts({ overwriteVsCodeConfig: false })
  await expect(result).resolves.not.toThrow()

  const destFile = options['destination-file']
  assert.noFile(destFile) // destination file is not written
})
