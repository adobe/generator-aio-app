/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const path = require('path')

const theGeneratorPath = require.resolve('../../../generators/application')
const Generator = require('yeoman-generator')
const { utils } = require('@adobe/generator-app-common-lib')

// spies
const composeWith = jest.spyOn(Generator.prototype, 'composeWith')
const writeKeyAppConfig = jest.spyOn(utils, 'writeKeyAppConfig')

let yeomanTestHelpers
beforeAll(async () => {
  yeomanTestHelpers = (await import('yeoman-test')).default
})

beforeAll(async () => {
  composeWith.mockReturnValue(undefined)
  writeKeyAppConfig.mockReturnValue(undefined)
})
beforeEach(() => {
  composeWith.mockClear()
  writeKeyAppConfig.mockClear()
})
afterAll(() => {
  composeWith.mockRestore()
  writeKeyAppConfig.mockRestore()
})

jest.mock('@adobe/generator-app-common-lib', () => ({
  utils: {
    guessProjectName: jest.fn(),
    writeKeyAppConfig: jest.fn()
  },
  constants: {}
}))

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('--skip-prompt --project-name fake', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'project-name': 'fake-name', 'skip-install': false })

    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(2)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.actions'), 'actions')
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.web'), 'web-src')
  })

  test('--skip-prompt --adobe-services some,string', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'adobe-services': 'some,string', 'skip-install': false })

    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(2)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.actions'), 'actions')
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.web'), 'web-src')
  })

  test('--adobe-services some,string --supported-adobe-services="" and prompt selection "actions"', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'supported-adobe-services': '', 'skip-install': false })
      .withPrompts({ components: ['actions'] })

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(1)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.actions'), 'actions')
  })

  test('--adobe-services some,string and prompt selection "events"', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['events'] })

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(0)
  })

  test('--adobe-services some,string and prompt selection "web-assets"', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['webAssets'] })

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(1)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.web'), 'web-src')
  })
  test('--adobe-services some,string --supported-adobe-service=some,other,string and prompt selection "web-assets, actions"', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'supported-adobe-services': 'some,other,string', 'skip-install': false })
      .withPrompts({ components: ['webAssets', 'actions'] })

    expect(composeWith).toHaveBeenCalledTimes(2)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(2)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.actions'), 'actions')
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.web'), 'web-src')
  })
  test('--adobe-services some,string --supported-adobe-service=some,other,string and prompt selection "web-assets, actions, events"', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'supported-adobe-services': 'some,other,string', 'skip-install': false })
      .withPrompts({ components: ['webAssets', 'actions', 'events'] })

    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(2)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.actions'), 'actions')
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.web'), 'web-src')
  })
  test('--skip-prompt --skip-install', async () => {
    await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': true })

    expect(composeWith).toHaveBeenCalledTimes(3)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), expect.any(Object))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), expect.any(Object))

    expect(writeKeyAppConfig).toHaveBeenCalledTimes(2)
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.actions'), 'actions')
    expect(writeKeyAppConfig).toHaveBeenCalledWith(expect.any(Generator), expect.stringContaining('application.web'), 'web-src')
  })
})
