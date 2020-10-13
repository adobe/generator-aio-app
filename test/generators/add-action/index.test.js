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
const path = require('path')

const expectedSeparator = expect.objectContaining({
  type: 'separator',
  line: expect.any(String)
})
const expectedChoices = {
  generic: {
    name: 'Generic',
    value: expect.stringContaining(path.normalize('generic/index.js'))
  },
  [sdkCodes.analytics]: {
    name: 'Adobe Analytics',
    value: expect.stringContaining(path.normalize('analytics/index.js'))
  },
  [sdkCodes.target]: {
    name: 'Adobe Target',
    value: expect.stringContaining(path.normalize('target/index.js'))
  },
  [sdkCodes.campaign]: {
    name: 'Adobe Campaign Standard',
    value: expect.stringContaining(path.normalize('campaign-standard/index.js'))
  },
  [sdkCodes.assetCompute]: {
    name: 'Adobe Asset Compute Worker',
    value: expect.stringContaining(path.normalize('asset-compute/index.js'))
  },
  [sdkCodes.customerProfile]: {
    name: 'Adobe Experience Platform: Realtime Customer Profile',
    value: expect.stringContaining(path.normalize('customer-profile/index.js'))
  },
  [sdkCodes.audienceManagerCD]: {
    name: 'Adobe Audience Manager: Customer Data',
    value: expect.stringContaining(path.normalize('audience-manager-cd/index.js'))
  }
}

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
  test('no input, selects one generator', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-install': false })
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({
      'skip-prompt': false
    }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('no input, selects multiple generators', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-install': false })
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('--adobe-services="NOTEXISTING" --adobe-supported-services="notexistting" and selects multiple generators', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'NOTEXITING', '--adobe-supported-services': 'notexistting', 'skip-install': false })
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('--adobe-services="analytics,customerProfile"', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': `${sdkCodes.analytics},${sdkCodes.customerProfile}`, 'skip-install': false })
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
  test('--adobe-services="analytics,customerProfile", supported-adobe-services="analytics,assetCompute,customerProfile,target"', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({
        'adobe-services': `${sdkCodes.analytics},${sdkCodes.customerProfile}`,
        'supported-adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.target}`,
        'skip-install': false
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services="analytics,customerProfile", supported-adobe-services=ALL', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({
        'adobe-services': `${sdkCodes.analytics},${sdkCodes.customerProfile}`,
        'supported-adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`,
        'skip-install': false
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services=ALL, supported-adobe-services=ALL', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({
        'adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`,
        'supported-adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`,
        'skip-install': false
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services=ALL', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({
        'adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`,
        'skip-install': false
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services="", supported-adobe-services=analytics,assetCompute,customerProfile,target', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({
        'adobe-services': '',
        'supported-adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.target}`,
        'skip-install': false
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--adobe-services="", supported-adobe-services=ALL', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({
        'adobe-services': '',
        'supported-adobe-services': `${sdkCodes.analytics},${sdkCodes.assetCompute},${sdkCodes.customerProfile},${sdkCodes.campaign},${sdkCodes.target},${sdkCodes.audienceManagerCD}`,
        'skip-install': false
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
    expect(composeWith).toHaveBeenCalledWith('a', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('b', expect.objectContaining({ 'skip-prompt': false }))
    expect(composeWith).toHaveBeenCalledWith('c', expect.objectContaining({ 'skip-prompt': false }))
    expect(installDependencies).toHaveBeenCalledTimes(1)
  })
})
// todo check with existing files in project
