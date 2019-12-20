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

jest.mock('yeoman-generator')

const TheGenerator = require('../../../generators/app')
const Generator = require('yeoman-generator')

jest.mock('../../../lib/utils')
const utils = require('../../../lib/utils')

const path = require('path')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(TheGenerator.prototype).toBeInstanceOf(Generator)
  })
})

describe('implementation', () => {
  describe('constructor', () => {
    test('accepts adobe-services option', () => {
      const spy = jest.spyOn(TheGenerator.prototype, 'option')
      // eslint-disable-next-line no-new
      new TheGenerator()
      expect(spy).toHaveBeenCalledWith('adobe-services', { type: String, default: '' })
      spy.mockRestore()
    })
    test('accepts skip-prompt option', () => {
      const spy = jest.spyOn(TheGenerator.prototype, 'option')
      // eslint-disable-next-line no-new
      new TheGenerator()
      expect(spy).toHaveBeenCalledWith('skip-prompt', { default: false })
      spy.mockRestore()
    })
    test('accepts project-name option', () => {
      const spy = jest.spyOn(TheGenerator.prototype, 'option')

      const cwd = process.cwd
      process.cwd = () => 'yolo/fake'
      // eslint-disable-next-line no-new
      new TheGenerator()
      expect(spy).toHaveBeenCalledWith('project-name', { type: String, default: 'fake' })
      spy.mockRestore()
      process.cwd = cwd
    })
  })
  describe('prompting with composition', () => {
    TheGenerator.prototype.log = () => {}
    let prompt
    let composeWith
    let theGenerator
    beforeEach(() => {
      prompt = jest.spyOn(TheGenerator.prototype, 'prompt')
      composeWith = jest.spyOn(TheGenerator.prototype, 'composeWith')
      theGenerator = new TheGenerator()
    })
    afterEach(() => {
      prompt.mockRestore()
      composeWith.mockRestore()
    })

    test('project-name="fake", skip-prompt="true", adobe-services="some,string"', async () => {
      theGenerator.options = { 'project-name': 'fake', 'skip-prompt': true, 'adobe-services': 'some,string' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledTimes(0)

      expect(composeWith).toHaveBeenCalledTimes(2)

      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('add-web-assets/index.js'), {
        'skip-install': true,
        'skip-prompt': true,
        'project-name': 'fake',
        'adobe-services': 'some,string'
      })
      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('add-action/index.js'), {
        'skip-install': true,
        'skip-prompt': true,
        'adobe-services': 'some,string'
      })
    })

    test('skip-prompt="false", selected components are "actions"', async () => {
      prompt.mockReturnValue({
        components: ['actions']
      })
      theGenerator.options = { 'project-name': 'fake', 'skip-prompt': false, 'adobe-services': 'some,string' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledWith([expect.objectContaining({
        type: 'checkbox',
        name: 'components',
        choices: [
          {
            name: 'Actions: Deploy Runtime actions',
            value: 'actions',
            checked: true
          },
          {
            name: 'Web Assets: Deploy hosted static assets',
            value: 'webAssets',
            checked: true
          }
        ],
        validate: utils.atLeastOne
      })])

      expect(composeWith).toHaveBeenCalledTimes(1)

      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('add-action/index.js'), {
        'skip-install': true,
        'skip-prompt': false,
        'adobe-services': 'some,string'
      })
    })

    test('skip-prompt="false", selected components are "web-assets, actions"', async () => {
      prompt.mockReturnValue({
        components: ['actions', 'webAssets']
      })
      theGenerator.options = { 'project-name': 'fake', 'skip-prompt': false, 'adobe-services': 'some,string' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledWith([expect.objectContaining({
        type: 'checkbox',
        name: 'components',
        choices: [
          {
            name: 'Actions: Deploy Runtime actions',
            value: 'actions',
            checked: true
          },
          {
            name: 'Web Assets: Deploy hosted static assets',
            value: 'webAssets',
            checked: true
          }
        ],
        validate: utils.atLeastOne
      })])

      expect(composeWith).toHaveBeenCalledTimes(2)

      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('add-web-assets/index.js'), {
        'skip-install': true,
        'skip-prompt': false,
        'project-name': 'fake',
        'adobe-services': 'some,string'
      })
      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('add-action/index.js'), {
        'skip-install': true,
        'skip-prompt': false,
        'adobe-services': 'some,string'
      })
    })

    test('skip-prompt="false", selected components are "web-assets"', async () => {
      prompt.mockReturnValue({
        components: ['webAssets']
      })
      theGenerator.options = { 'project-name': 'fake', 'skip-prompt': false, 'adobe-services': 'some,string' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledWith([expect.objectContaining({
        type: 'checkbox',
        name: 'components',
        choices: [
          {
            name: 'Actions: Deploy Runtime actions',
            value: 'actions',
            checked: true
          },
          {
            name: 'Web Assets: Deploy hosted static assets',
            value: 'webAssets',
            checked: true
          }
        ],
        validate: utils.atLeastOne
      })])

      expect(composeWith).toHaveBeenCalledTimes(1)

      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('add-web-assets/index.js'), {
        'skip-install': true,
        'skip-prompt': false,
        'project-name': 'fake',
        'adobe-services': 'some,string'
      })
    })
  })

  describe('writing', () => {
    let sourceRoot
    const copyTpl = jest.fn()
    let theGenerator
    let templatePath
    let destinationPath
    beforeEach(() => {
      sourceRoot = jest.spyOn(TheGenerator.prototype, 'sourceRoot')
      templatePath = jest.spyOn(TheGenerator.prototype, 'templatePath')
      destinationPath = jest.spyOn(TheGenerator.prototype, 'destinationPath')
      theGenerator = new TheGenerator()
      theGenerator.fs = {
        copyTpl
      }
    })
    afterEach(() => {
      copyTpl.mockReset()
      sourceRoot.mockRestore()
      templatePath.mockRestore()
      destinationPath.mockRestore()
    })

    test('sets sourceRoot to ./templates/', async () => {
      await theGenerator.writing()
      expect(sourceRoot).toHaveBeenCalledWith(path.join(__dirname, '../../../generators/app/templates/'))
    })

    test('copies base template files', async () => {
      theGenerator.props = { projectName: 'fakeName' } // todo pass it via options
      templatePath.mockImplementation((p = '') => path.join('/fake', p))
      destinationPath.mockImplementation((p = '') => path.join('/dest', p))
      await theGenerator.writing()

      // first copy all files that do not start with _
      expect(copyTpl).toHaveBeenCalledWith(
        '/fake/**/!(_)*/',
        '/dest',
        { projectName: 'fakeName' }) // tmpl context
      // copy _dotenv => .env
      expect(copyTpl).toHaveBeenCalledWith(
        '/fake/_dot.env',
        '/dest/.env',
        { projectName: 'fakeName' }) // tmpl context
    })
  })
  describe('install', () => {
    let installDependencies
    let theGenerator
    beforeEach(() => {
      installDependencies = jest.spyOn(TheGenerator.prototype, 'installDependencies')
      theGenerator = new TheGenerator()
    })
    afterEach(() => {
      installDependencies.mockRestore()
    })

    test('skip-install=false', async () => {
      theGenerator.options = { 'skip-install': false }
      await theGenerator.install()
      expect(installDependencies).toBeCalledTimes(1)
    })

    test('skip-install=true', async () => {
      theGenerator.options = { 'skip-install': true }
      await theGenerator.install()
      expect(installDependencies).toBeCalledTimes(0)
    })
  })
})
