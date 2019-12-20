/* eslint-disable jest/expect-expect */
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

const TheGenerator = require('../../../generators/add-web-assets')
const Generator = require('yeoman-generator')

jest.mock('../../../lib/utils')
const utils = require('../../../lib/utils')

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

      utils.guessProjectName.mockReturnValue('fake')
      // eslint-disable-next-line no-new
      new TheGenerator()
      expect(spy).toHaveBeenCalledWith('project-name', { type: String, default: 'fake' })
      spy.mockRestore()
      utils.guessProjectName.mockReset()
    })
  })
  describe('prompting with composition', () => {
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

      expect(composeWith).toHaveBeenCalledTimes(1)
      // if skip prompt makes sure defaults to generic
      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('raw/index.js'), {
        'skip-prompt': true,
        'project-name': 'fake',
        'adobe-services': 'some,string'
      })
    })

    test('project-name="fake", skip-prompt="false", adobe-services="some,string"', async () => {
      // mock empty generators => behavior of when = false
      prompt.mockResolvedValue({
        webAssetsGenerator: 'fakeSelectedGenerator'
      })

      theGenerator.options = { 'project-name': 'fake', 'skip-prompt': false, 'adobe-services': 'some,string' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledWith([expect.objectContaining({
        type: 'list',
        name: 'webAssetsGenerator',
        choices: [{ name: 'Raw HTML/JS', value: expect.stringContaining('raw/index.js') }],
        validate: utils.atLeastOne
      })])

      expect(composeWith).toHaveBeenCalledTimes(1)
      // if skip prompt makes sure defaults to generic
      expect(composeWith).toHaveBeenCalledWith('fakeSelectedGenerator', {
        'skip-prompt': false,
        'project-name': 'fake',
        'adobe-services': 'some,string'
      })
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
