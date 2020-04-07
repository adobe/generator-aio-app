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

const utils = require('../../../lib/utils')
const theGeneratorPath = require.resolve('../../../generators/add-action')
const Generator = require('yeoman-generator')

const { sdkCodes } = require('../../../lib/constants')

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

jest.mock('../../../lib/utils')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('--skip-prompt --adobe-services="analytics,target,campaign-standard,customer-profile"', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'adobe-services': `${sdkCodes.analytics},${sdkCodes.target},${sdkCodes.campaign},${sdkCodes.customerProfile}`, 'skip-install': false })
    // with skip prompt defaults to generic action
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('generic/index.js')), expect.objectContaining({
      'skip-prompt': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--skip-prompt --skip-install', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true, 'skip-install': true })

    // with skip prompt defaults to generic action
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expect.stringContaining(n('generic/index.js')), expect.objectContaining({
      'skip-prompt': true
    }))
    expect(installDependencies).toHaveBeenCalledTimes(0)
  })

  test('--adobe-services="NOTEXISTING" and selects fake generator a', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'NOTEXITING', 'skip-install': false })
      .withPrompts({ actionGenerators: ['a'] })

    // first make sure choices are displayed
    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          { name: 'Generic', value: expect.stringContaining(n('generic/index.js')), checked: true }
        ]
      })
    ])

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services="analytics" and selects fake generator a', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': `${sdkCodes.analytics}`, 'skip-install': false })
      .withPrompts({ actionGenerators: ['a'] })

    // first make sure choices are displayed
    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          { name: 'Adobe Analytics', value: expect.stringContaining(n('analytics/index.js')) },
          { name: 'Generic', value: expect.stringContaining(n('generic/index.js')), checked: true }
        ]
      })
    ])

    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services="analytics,target,campaign-standard,customer-profile" and selects fake generators a,b,c,d', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': `${sdkCodes.analytics},${sdkCodes.target},${sdkCodes.campaign},${sdkCodes.customerProfile}`, 'skip-install': false })
      .withPrompts({ actionGenerators: ['a', 'b', 'c', 'd'] })

    // first make sure choices are displayed
    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          { name: 'Adobe Analytics', value: expect.stringContaining(n('analytics/index.js')) },
          { name: 'Adobe Target', value: expect.stringContaining(n('target/index.js')) },
          { name: 'Adobe Campaign Standard', value: expect.stringContaining(n('campaign-standard/index.js')) },
          { name: 'Adobe Experience Platform: Realtime Customer Profile', value: expect.stringContaining(n('customer-profile/index.js')) },
          { name: 'Generic', value: expect.stringContaining(n('generic/index.js')), checked: true }
        ]
      })
    ])

    expect(composeWith).toHaveBeenCalledTimes(4)
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(composeWith).toHaveBeenCalledWith('d', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
})

// todo check with existing files in project
