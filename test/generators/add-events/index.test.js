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

const theGeneratorPath = require.resolve('../../../generators/add-events')
const Generator = require('yeoman-generator')
const cloneDeep = require('lodash.clonedeep')

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

const expectedDefaultEventsGenerator = expect.stringContaining(n('publish-events/index.js'))

jest.mock('../../../lib/utils')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('--skip-prompt "', async () => {
    let options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    await helpers.run(theGeneratorPath)
      .withOptions(options)
    // with skip prompt defaults to generic action
    // make sure sub generators have been called
    expect(composeWith).toHaveBeenCalledTimes(1)
    expect(composeWith).toHaveBeenCalledWith(expectedDefaultEventsGenerator, expect.objectContaining({
      'skip-prompt': true
    }))
  })
})
