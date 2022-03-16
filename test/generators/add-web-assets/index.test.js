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
const helpers = require('yeoman-test')
const path = require('path')
const fs = require('fs-extra')
const { utils } = require('@adobe/generator-app-common-lib')
const cloneDeep = require('lodash.clonedeep')

const AddWebAssets = require('../../../generators/add-web-assets')
const RawGenerator = require('../../../generators/add-web-assets/raw')
const { addWebAssets: { excReact } } = require('@adobe/generator-app-excshell')
const Generator = require('yeoman-generator')

// spies
const prompt = jest.spyOn(Generator.prototype, 'prompt')
const composeWith = jest.spyOn(Generator.prototype, 'composeWith')
beforeAll(() => {
  // mock implementations
  composeWith.mockReturnValue(undefined)
})
beforeEach(() => {
  prompt.mockClear()
  composeWith.mockClear()
})
afterAll(() => {
  composeWith.mockRestore()
})

const expectedDefaultGenerator = excReact
const expectedPromptChoices = [expect.objectContaining({
  type: 'list',
  name: 'webAssetsGenerator',
  choices: [
    { name: 'React Spectrum 3', value: excReact },
    { name: 'Pure HTML/JS', value: RawGenerator }
  ],
  validate: utils.atLeastOne
})]

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(AddWebAssets.prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('web assets already in project --skip-prompt', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    options['project-name'] = 'fake'
    options['adobe-services'] = 'some,string'
    options['web-src-folder'] = 'web-src'
    await expect(helpers.run(AddWebAssets)
      .withOptions(options)
      .inTmpDir(dir => {
        fs.mkdirSync(path.join(dir, 'web-src'))
      })).rejects.toThrow('you already have web assets in your project, please delete first')
  })

  test('--skip-prompt', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    options['web-src-folder'] = 'web-src'
    let tmpDir
    await helpers.run(AddWebAssets)
      .withOptions(options)
      .inTmpDir(dir => {
        tmpDir = dir
      })

    const expectProjectName = path.basename(tmpDir)

    expect(composeWith).toHaveBeenCalledTimes(1)
    // calls default generator
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': expectProjectName
    }))
  })

  test('--skip-prompt --has-backend false', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    options['web-src-folder'] = 'web-src'
    options['has-backend'] = false
    let tmpDir
    await helpers.run(AddWebAssets)
      .withOptions(options)
      .inTmpDir(dir => {
        tmpDir = dir
      })

    const expectProjectName = path.basename(tmpDir)

    expect(composeWith).toHaveBeenCalledTimes(1)
    // calls default generator
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': expectProjectName,
      'has-backend': false
    }))
  })

  test('--skip-prompt --project-name fake', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    options['web-src-folder'] = 'web-src'
    options['project-name'] = 'fake'
    await helpers.run(AddWebAssets)
      .withOptions(options)

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': 'fake'
    }))
  })

  test('--skip-prompt --project-name fake --adobe-services=some,string', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    options['web-src-folder'] = 'web-src'
    options['project-name'] = 'fake'
    options['adobe-services'] = 'some,string'
    await helpers.run(AddWebAssets)
      .withOptions(options)

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': 'some,string',
      'project-name': 'fake'
    }))
  })

  test('--project-name fake and selected prompt is fake generator "a"', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['web-src-folder'] = 'web-src'
    options['project-name'] = 'fake'
    await helpers.run(AddWebAssets)
      .withOptions(options)
      .withPrompts({ webAssetsGenerator: 'a' })

    // check choices
    expect(prompt).toHaveBeenCalledWith(expectedPromptChoices)

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({
      'skip-prompt': false,
      'adobe-services': '',
      'project-name': 'fake'
    }))
  })
})
