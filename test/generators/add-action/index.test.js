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

const { utils } = require('@adobe/generator-app-common-lib')
const AddActions = require('../../../generators/add-action')
const Generator = require('yeoman-generator')
const { constants } = require('@adobe/generator-app-common-lib')
const { sdkCodes } = constants
const cloneDeep = require('lodash.clonedeep')
const generic = require('@adobe/generator-add-action-generic')
const assetCompute = require('@adobe/generator-add-action-asset-compute')

const expectedSeparator = expect.objectContaining({
  type: 'separator',
  line: expect.any(String)
})
const expectedChoices = {
  generic: {
    name: 'Generic',
    value: generic
  },
  [sdkCodes.analytics]: {
    name: 'Adobe Analytics',
    value: require('../../../generators/add-action/analytics')
  },
  [sdkCodes.target]: {
    name: 'Adobe Target',
    value: require('../../../generators/add-action/target')
  },
  [sdkCodes.campaign]: {
    name: 'Adobe Campaign Standard',
    value: require('../../../generators/add-action/campaign-standard')
  },
  [sdkCodes.assetCompute]: {
    name: 'Adobe Asset Compute Worker',
    value: assetCompute
  },
  [sdkCodes.customerProfile]: {
    name: 'Adobe Experience Platform: Realtime Customer Profile',
    value: require('../../../generators/add-action/customer-profile')
  },
  [sdkCodes.audienceManagerCD]: {
    name: 'Adobe Audience Manager: Customer Data',
    value: require('../../../generators/add-action/audience-manager-cd')
  }
}

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

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(AddActions.prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('--skip-prompt --adobe-services="analytics,target,campaign-standard,customer-profile"', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    options['adobe-services'] = `${sdkCodes.analytics},${sdkCodes.target},${sdkCodes.campaign},${sdkCodes.customerProfile}`
    await helpers.run(AddActions)
      .withOptions(options)
    // with skip prompt defaults to generic action
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith({ Generator: generic, path: 'unknown' }, expect.objectContaining({
      'skip-prompt': true
    }))
  })

  test('no input, selects one generator', async () => {
    await helpers.run(AddActions)
      .withPrompts({ actionGenerators: ['a'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          { ...expectedChoices.generic, checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.analytics], checked: false },
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.customerProfile], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({
      'skip-prompt': false
    }))
  })
  test('no input, selects multiple generators', async () => {
    await helpers.run(AddActions)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          { ...expectedChoices.generic, checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.analytics], checked: false },
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.customerProfile], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })
  test('--adobe-services="NOTEXISTING" --adobe-supported-services="notexistting" and selects multiple generators', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = 'NOTEXITING'
    options['--adobe-supported-services'] = 'notexistting'
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          { ...expectedChoices.generic, checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.analytics], checked: false },
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.customerProfile], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })
  test('--adobe-services="analytics,customerProfile"', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = `${sdkCodes.analytics},${sdkCodes.customerProfile}`
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: false },
          { ...expectedChoices[sdkCodes.analytics], checked: true },
          { ...expectedChoices[sdkCodes.customerProfile], checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })
  test('--adobe-services="analytics,customerProfile", supported-adobe-services="analytics,assetCompute,customerProfile,target"', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = `${sdkCodes.analytics},${sdkCodes.customerProfile}`
    options['supported-adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.target}`
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: false },
          { ...expectedChoices[sdkCodes.analytics], checked: true },
          { ...expectedChoices[sdkCodes.customerProfile], checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })

  test('--adobe-services="analytics,customerProfile", supported-adobe-services=ALL', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = `${sdkCodes.analytics},${sdkCodes.customerProfile}`
    options['supported-adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: false },
          { ...expectedChoices[sdkCodes.analytics], checked: true },
          { ...expectedChoices[sdkCodes.customerProfile], checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })

  test('--adobe-services=ALL, supported-adobe-services=ALL', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`
    options['supported-adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: false },
          { ...expectedChoices[sdkCodes.analytics], checked: true },
          { ...expectedChoices[sdkCodes.assetCompute], checked: true },
          { ...expectedChoices[sdkCodes.customerProfile], checked: true },
          { ...expectedChoices[sdkCodes.campaign], checked: true },
          { ...expectedChoices[sdkCodes.target], checked: true },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: true }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })

  test('--adobe-services=ALL', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`
    await helpers.run(AddActions)
      .withOptions({
        'adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`
      })
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: false },
          { ...expectedChoices[sdkCodes.analytics], checked: true },
          { ...expectedChoices[sdkCodes.assetCompute], checked: true },
          { ...expectedChoices[sdkCodes.customerProfile], checked: true },
          { ...expectedChoices[sdkCodes.campaign], checked: true },
          { ...expectedChoices[sdkCodes.target], checked: true },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: true }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })

  test('--adobe-services="", supported-adobe-services=analytics,assetCompute,customerProfile,target', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = ''
    options['supported-adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.target}`
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.analytics], checked: false },
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.customerProfile], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })

  test('--adobe-services="", supported-adobe-services=ALL', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['adobe-services'] = ''
    options['supported-adobe-services'] = `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`
    await helpers.run(AddActions)
      .withOptions(options)
      .withPrompts({ actionGenerators: ['a', 'b', 'c'] })

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(prompt).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'checkbox',
        name: 'actionGenerators',
        validate: utils.atLeastOne,
        choices: [
          expectedSeparator,
          { ...expectedChoices.generic, checked: true },
          expectedSeparator,
          { ...expectedChoices[sdkCodes.analytics], checked: false },
          { ...expectedChoices[sdkCodes.assetCompute], checked: false },
          { ...expectedChoices[sdkCodes.customerProfile], checked: false },
          { ...expectedChoices[sdkCodes.campaign], checked: false },
          { ...expectedChoices[sdkCodes.target], checked: false },
          { ...expectedChoices[sdkCodes.audienceManagerCD], checked: false }
        ]
      })
    ])
    expect(composeWith).toHaveBeenCalledTimes(3)
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'a', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'b', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith({ Generator: 'c', path: 'unknown' }, expect.objectContaining({ 'skip-prompt': false }))
  })
})
