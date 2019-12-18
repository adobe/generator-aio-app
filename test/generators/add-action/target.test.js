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

const ActionGenerator = require('../../../lib/ActionGenerator')
const TargetGenerator = require('../../../generators/add-action/target')

jest.mock('../../../lib/ActionGenerator') // treat the lib super class as a separate unit

describe('prototype', () => {
  test('exports ActionGenerator instance', () => {
    expect(TargetGenerator.prototype).toBeInstanceOf(ActionGenerator)
  })
})

describe('implementation', () => {
  describe('prompting', () => {
    test('generator prompts for action name with default set to target', async () => {
      const targetGenerator = new TargetGenerator()
      const spy = jest.spyOn(targetGenerator, 'promptForActionName')
      await targetGenerator.prompting()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(expect.any(String), 'target')
      spy.mockRestore()
    })
  })

  describe('writing', () => {
    test('generator sets sourceRoot to ./templates', async () => {
      const targetGenerator = new TargetGenerator()
      const spy = jest.spyOn(targetGenerator, 'sourceRoot')
      await targetGenerator.writing()
      expect(spy).toHaveBeenCalledWith(path.join(__dirname, '../../../generators/add-action/target/templates'))
      spy.mockRestore()
    })
    test('generator adds an action by calling ActionGenerator.addAction', async () => {
      const targetGenerator = new TargetGenerator()
      const spy = jest.spyOn(targetGenerator, 'addAction')
      targetGenerator.props.actionName = 'fakeName'

      targetGenerator.writing()
      // here we test that:
      // 1. uses the set fakeName
      // 2. provides template files
      // 3. sets the dependencies
      // 4. sets the dotenv variables
      // 5. sets manifest
      expect(spy).toHaveBeenCalledWith('fakeName', expect.stringContaining('.js'), {
        testFile: expect.stringContaining('.test.js'),
        tplContext: expect.any(Object),
        dependencies: {
          '@adobe/aio-sdk': expect.any(String)
        },
        dotenvStub: {
          label: expect.any(String),
          vars: ['TARGET_TENANT']
        },
        actionManifestConfig: {
          inputs: { LOG_LEVEL: 'debug', tenant: '$TARGET_TENANT' },
          annotations: { final: true }
        }
      })
    })
  })
})
