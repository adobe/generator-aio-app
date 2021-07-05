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

const helpers = require('yeoman-test')
const assert = require('yeoman-assert')

const theGeneratorPath = require.resolve('../../../generators/app')
const Generator = require('yeoman-generator')

// spies
const composeWith = jest.spyOn(Generator.prototype, 'composeWith')
beforeAll(() => {
  composeWith.mockReturnValue(undefined)
})
beforeEach(() => {
  composeWith.mockClear()
})
afterAll(() => {
  composeWith.mockRestore()
})

jest.mock('../../../lib/utils')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  function expectBaseFiles () {
    // expected files
    assert.file('.aio')
    assert.file('.env')
    assert.file('.gitignore')
    assert.file('README.md')
    assert.file('package.json')
    assert.file('jest.setup.js')
  }

  function expectDotEnv () {
    assert.fileContent('.env', 'AIO_runtime_auth=')
    assert.fileContent('.env', 'AIO_runtime_namespace=')
    assert.fileContent('.env', 'SERVICE_API_KEY=')
  }

  test('--skip-prompt --project-name fake', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'project-name': 'fake-name' })

    expectBaseFiles()
    expectDotEnv()
    assert.JSONFileContent('package.json', { name: 'fake-name', version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), {
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': 'fake-name',
      'has-backend': true
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), {
      'skip-prompt': true,
      'adobe-services': '',
      'supported-adobe-services': ''
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), {
      'skip-prompt': true,
      'adobe-services': ''
    })
  })

  test('--skip-prompt --adobe-services some,string', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'adobe-services': 'some,string' })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), {
      'skip-prompt': true,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName,
      'has-backend': true
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), {
      'skip-prompt': true,
      'adobe-services': 'some,string',
      'supported-adobe-services': ''
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), {
      'skip-prompt': true,
      'adobe-services': 'some,string'
    })
  })

  test('--adobe-services some,string --supported-adobe-services="" and prompt selection "actions"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'supported-adobe-services': '' })
      .withPrompts({ components: ['actions'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string',
      'supported-adobe-services': ''
    })
  })

  test('--adobe-services some,string and prompt selection "events"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string' })
      .withPrompts({ components: ['events'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string'
    })
  })

  test('--adobe-services some,string and prompt selection "web-assets"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string' })
      .withPrompts({ components: ['webAssets'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName,
      'has-backend': false
    })
  })
  test('--adobe-services some,string --supported-adobe-service=some,other,string and prompt selection "web-assets, actions"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'supported-adobe-services': 'some,other,string' })
      .withPrompts({ components: ['webAssets', 'actions'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(2)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string',
      'supported-adobe-services': 'some,other,string'
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName,
      'has-backend': true
    })
  })
  test('--adobe-services some,string --supported-adobe-service=some,other,string and prompt selection "web-assets, actions, CI, events"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'supported-adobe-services': 'some,other,string' })
      .withPrompts({ components: ['webAssets', 'actions', 'ci', 'events'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(4)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-action/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string',
      'supported-adobe-services': 'some,other,string'
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-ci/index.js')), {
      'skip-prompt': true
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-web-assets/index.js')), {
      'skip-prompt': false,
      'has-backend': true,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName
    })
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(path.normalize('add-events/index.js')), {
      'skip-prompt': false,
      'adobe-services': 'some,string'
    })
  })
})
