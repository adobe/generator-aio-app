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

const utils = require('../../../lib/utils')

const TheGenerator = require('../../../generators/add-action')
const Generator = require('yeoman-generator')

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

    async function testPromptChoices (adobeServices, expectedChoices) {
      // mock selected generator
      prompt.mockResolvedValue({
        actionGenerators: ['fakeSelection']
      })

      theGenerator.options = { 'skip-prompt': false, 'adobe-services': adobeServices }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledWith([expect.objectContaining({
        name: 'actionGenerators',
        choices: expectedChoices,
        validate: utils.atLeastOne,
        type: 'checkbox'
      })])
    }

    test('skip-prompt=false, check prompt choices for adobe-services=""', testPromptChoices.bind(this, '', [
      { name: 'Generic', value: expect.stringContaining('generic/index.js'), checked: true }
    ]))

    // todo should we throw instead of ignore ?
    test('skip-prompt=false, check prompt choices for adobe-services="notAservice"', testPromptChoices.bind(this, 'notAService', [
      { name: 'Generic', value: expect.stringContaining('generic/index.js'), checked: true }
    ]))

    test('skip-prompt=false, check prompt choices for adobe-services="analytics"', testPromptChoices.bind(this, 'analytics', [
      { name: 'Adobe Analytics', value: expect.stringContaining('analytics/index.js') },
      { name: 'Generic', value: expect.stringContaining('generic/index.js'), checked: true }
    ]))

    test('skip-prompt=false, check prompt choices for adobe-services=" analytics ,target "', testPromptChoices.bind(this, ' analytics ,target ', [
      { name: 'Adobe Analytics', value: expect.stringContaining('analytics/index.js') },
      { name: 'Adobe Target', value: expect.stringContaining('target/index.js') },
      { name: 'Generic', value: expect.stringContaining('generic/index.js'), checked: true }
    ]))

    test('skip-prompt=false, check prompt choices for adobe-services=" analytics ,target , campaign-standard"', testPromptChoices.bind(this, ' analytics ,target , campaign-standard', [
      { name: 'Adobe Analytics', value: expect.stringContaining('analytics/index.js') },
      { name: 'Adobe Target', value: expect.stringContaining('target/index.js') },
      { name: 'Adobe Campaign Standard', value: expect.stringContaining('campaign-standard/index.js') },
      { name: 'Generic', value: expect.stringContaining('generic/index.js'), checked: true }
    ]))

    test('skip-prompt=true"', async () => {
      theGenerator.options = { 'skip-prompt': true, 'adobe-services': 'analytics, target, campaign-standard' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledTimes(0)

      expect(composeWith).toHaveBeenCalledTimes(1)
      // if skip prompt makes sure defaults to generic
      expect(composeWith).toHaveBeenCalledWith(expect.stringContaining('generic/index.js'), {
        'skip-prompt': true
      })
    })

    test('skip-prompt=false and user selected ["a", "b", "c"] (should call all three generators)', async () => {
      // mock selection of generators
      prompt.mockResolvedValue({
        actionGenerators: ['a', 'b', 'c']
      })

      theGenerator.options = { 'skip-prompt': false, 'adobe-services': '' }
      await theGenerator.prompting()

      expect(prompt).toHaveBeenCalledTimes(1)
      expect(composeWith).toHaveBeenCalledTimes(3)
      // if skip prompt makes sure defaults to generic
      expect(composeWith).toHaveBeenCalledWith('a', {
        'skip-prompt': false
      })
      expect(composeWith).toHaveBeenCalledWith('b', {
        'skip-prompt': false
      })
      expect(composeWith).toHaveBeenCalledWith('c', {
        'skip-prompt': false
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
