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
const installDependencies = jest.spyOn(Generator.prototype, 'installDependencies')
beforeAll(() => {
  composeWith.mockReturnValue(undefined)
  installDependencies.mockReturnValue(undefined)
})
beforeEach(() => {
  composeWith.mockClear()
  installDependencies.mockClear()
})
afterAll(() => {
  composeWith.mockRestore()
  installDependencies.mockRestore()
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
    assert.file('test/jest.setup.js')
  }

  function expectDotEnv () {
    assert.fileContent('.env', '# AIO_RUNTIME_AUTH=')
    assert.fileContent('.env', '# AIO_RUNTIME_NAMESPACE=')
  }

  test('--skip-prompt --project-name fake', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'project-name': 'fake-name', 'skip-install': false })

    expectBaseFiles()
    expectDotEnv()
    assert.JSONFileContent('package.json', { name: 'fake-name', version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(2)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': true,
      'adobe-services': '',
      'project-name': 'fake-name'
    }))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-action/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': true,
      'adobe-services': ''
    }))

    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--skip-prompt --adobe-services some,string', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'adobe-services': 'some,string', 'skip-install': false })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(2)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': true,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName
    }))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-action/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': true,
      'adobe-services': 'some,string'
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services some,string and prompt selection "actions"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['actions'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-action/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': false,
      'adobe-services': 'some,string'
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services some,string and prompt selection "events"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['events'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-events/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': false,
      'adobe-services': 'some,string'
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services some,string and prompt selection "web-assets"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['webAssets'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName,
      'has-backend': false
    }))

    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('--adobe-services some,string and prompt selection "web-assets, actions"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['webAssets', 'actions'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(2)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-action/index.js')), expect.objectContaining({
      'skip-install': true,
      'skip-prompt': false,
      'adobe-services': 'some,string'
    }))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName,
      'has-backend': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('--adobe-services some,string and prompt selection "web-assets, actions, CI"', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'some,string', 'skip-install': false })
      .withPrompts({ components: ['webAssets', 'actions', 'ci'] })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(3)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'adobe-services': 'some,string',
      'project-name': expectedProjectName
    }))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-ci/index.js')), expect.objectContaining({
      'skip-prompt': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('--skip-prompt --skip-install', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': true })

    expectBaseFiles()
    expectDotEnv()
    const expectedProjectName = path.basename(dir)
    assert.JSONFileContent('package.json', { name: expectedProjectName, version: '0.0.1' })
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(2)

    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'adobe-services': '',
      'project-name': expectedProjectName
    }))
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('add-web-assets/index.js')), expect.objectContaining({
      'skip-install': true,
      'adobe-services': '',
      'project-name': expectedProjectName
    }))
    expect(installDependencies).toHaveBeenCalledTimes(0)
  })
})
