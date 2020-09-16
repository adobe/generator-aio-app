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
const utils = require('../../../lib/utils')

const theGeneratorPath = require.resolve('../../../generators/add-web-assets')
const Generator = require('yeoman-generator')

// spies
const prompt = jest.spyOn(Generator.prototype, 'prompt')
const composeWith = jest.spyOn(Generator.prototype, 'composeWith')
const installDependencies = jest.spyOn(Generator.prototype, 'installDependencies')
beforeAll(() => {
  // mock implementations
  composeWith.mockReturnValue(undefined)
  installDependencies.mockReturnValue(undefined)
})
beforeEach(() => {
  prompt.mockClear()
  composeWith.mockClear()
  installDependencies.mockClear()
})
afterAll(() => {
  composeWith.mockRestore()
  installDependencies.mockRestore()
})

const expectedDefaultGenerator = expect.stringContaining(n('exc-react/index.js'))
const expectedPromptChoices = [expect.objectContaining({
  type: 'list',
  name: 'webAssetsGenerator',
  choices: [
    { name: 'Adobe Experience Cloud Shell - React', value: expect.stringContaining(n('exc-react/index.js')) },
    { name: 'Raw HTML/JS', value: expect.stringContaining(n('raw/index.js')) }
  ],
  validate: utils.atLeastOne
})]

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('web assets already in project --skip-prompt', async () => {
    await expect(helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'project-name': 'fake', 'adobe-services': 'some,string' })
      .inTmpDir(dir => {
        fs.mkdirSync(path.join(dir, 'web-src'))
      })).rejects.toThrow('you already have web assets in your project, please delete first')
  })

  test('--skip-prompt', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': false })

    const expectProjectName = path.basename(dir)

    expect(composeWith).toHaveBeenCalledTimes(1)
    // calls default generator
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': expectProjectName,
      'has-backend': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--skip-prompt --has-backend false', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': false, 'has-backend': false })

    const expectProjectName = path.basename(dir)

    expect(composeWith).toHaveBeenCalledTimes(1)
    // calls default generator
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': expectProjectName,
      'has-backend': false
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--skip-prompt --project-name fake', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': false, 'project-name': 'fake' })

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': 'fake',
      'has-backend': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--skip-prompt --skip-install --project-name fake', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': true, 'project-name': 'fake' })

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': 'fake',
      'has-backend': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(0)
  })

  test('--skip-prompt --project-name fake --adobe-services=some,string', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': false, 'project-name': 'fake', 'adobe-services': 'some,string' })

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultGenerator, expect.objectContaining({
      'skip-prompt': true,
      'adobe-services': 'some,string',
      'project-name': 'fake',
      'has-backend': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--project-name fake and selected prompt is fake generator "a"', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-install': false, 'project-name': 'fake' })
      .withPrompts({ webAssetsGenerator: 'a' })

    // check choices
    expect(prompt).toHaveBeenCalledWith(expectedPromptChoices)

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({
      'skip-prompt': false,
      'adobe-services': '',
      'project-name': 'fake'
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
})

// todo check with existing files in project
