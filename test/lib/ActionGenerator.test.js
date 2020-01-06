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
const yaml = require('js-yaml')

const constants = require('../../lib/constants')

jest.mock('yeoman-generator')

const ActionGenerator = require('../../lib/ActionGenerator')
const Generator = require('yeoman-generator')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(ActionGenerator.prototype).toBeInstanceOf(Generator)
  })
})

describe('implementation', () => {
  describe('constructor', () => {
    test('accepts skip-prompt option', () => {
      const spy = jest.spyOn(ActionGenerator.prototype, 'option')
      // eslint-disable-next-line no-new
      new ActionGenerator()
      expect(spy).toHaveBeenCalledWith('skip-prompt', { default: false })
      spy.mockRestore()
    })
  })
  describe('promptForActionName', () => {
    let spy
    let actionGenerator
    beforeEach(() => {
      spy = jest.spyOn(ActionGenerator.prototype, 'prompt')
      actionGenerator = new ActionGenerator()
      actionGenerator.options = { 'skip-prompt': false }
    })
    afterEach(() => {
      spy.mockRestore()
    })
    test('calls prompt and returns the input actionName', async () => {
      spy.mockResolvedValue({
        actionName: 'inputName'
      })
      const actionName = await actionGenerator.promptForActionName('fake purpose', 'fake default')
      expect(actionName).toEqual('inputName')
      expect(spy).toHaveBeenCalledWith([expect.objectContaining({
        when: true,
        default: 'fake default',
        message: expect.stringContaining('fake purpose')
      })])
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('if options.skip-prompt is set should return the default value', async () => {
      spy.mockResolvedValue({
        actionName: undefined
      })
      actionGenerator.options['skip-prompt'] = true
      const actionName = await actionGenerator.promptForActionName('fake purpose', 'fake default')
      expect(actionName).toEqual('fake default')
      expect(spy).toHaveBeenCalledTimes(0)
    })
    test('validates input `abc-1234, 1234-abc, ABC-1234, 1234-ABC`', async () => {
      spy.mockReturnValue({ actionName: 'fake' })
      await actionGenerator.promptForActionName()
      expect(spy.mock.calls[0][0][0].validate).toBeInstanceOf(Function)
      const validate = spy.mock.calls[0][0][0].validate
      expect(validate('abc-1234')).toBe(true)
      expect(validate('1234-abc')).toBe(true)
      expect(validate('ABC-1234')).toBe(true)
      expect(validate('1234-ABC')).toBe(true)
    })
    test('rejects inputs `a, 1, ab, 12, -abc-1234, abc@, abc_1234, 1234-abc!, abc123456789012345678901234567890`', async () => {
      spy.mockReturnValue({ actionName: 'fake' })
      await actionGenerator.promptForActionName()
      expect(spy.mock.calls[0][0][0].validate).toBeInstanceOf(Function)
      const validate = spy.mock.calls[0][0][0].validate
      expect(validate('a')).not.toEqual(true)
      expect(validate('1')).not.toEqual(true)
      expect(validate('ab')).not.toEqual(true)
      expect(validate('12')).not.toEqual(true)
      expect(validate('-abc-1234')).not.toEqual(true)
      expect(validate('abc_1234')).not.toEqual(true)
      expect(validate('1234-abc!')).not.toEqual(true)
      expect(validate('abc@')).not.toEqual(true)
      expect(validate('abc123456789012345678901234567890')).not.toEqual(true)
    })
  })

  describe('addAction', () => {
    // mock path resolvers
    ActionGenerator.prototype.templatePath = p => path.join('/fakeTplDir', p)
    ActionGenerator.prototype.destinationPath = (...args) => path.join('/fakeDestRoot', ...args)

    let actionGenerator
    beforeEach(() => {
      actionGenerator = new ActionGenerator()
      actionGenerator.options = { 'skip-prompt': false }
    })

    test('with no options and manifest does not exist', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js')

      // 1. test copy action template to right destination
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templateFile.js'), n(`/fakeDestRoot/${constants.actionsDirname}/myAction/index.js`), {}, {}, {})
      // 2. test manifest creation with action information
      expect(actionGenerator.fs.write).toHaveBeenCalledWith(n('/fakeDestRoot/manifest.yml'), yaml.safeDump({
        packages: {
          [constants.manifestPackagePlaceholder]: {
            license: 'Apache-2.0',
            actions: {
              myAction: {
                function: n(`${constants.actionsDirname}/myAction/index.js`), // relative path is important here
                web: 'yes',
                runtime: 'nodejs:10'
              }
            }
          }
        }
      }))
      // 3. make sure wskdebug dependency was added to package.json
      expect(actionGenerator.fs.writeJSON).toHaveBeenCalledWith(n('/fakeDestRoot/package.json'), {
        devDependencies: {
          '@adobe/wskdebug': '^1.1.0'
        }
      })
    })
    test('with no options and manifest already exists', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(true), // called on manifest
        write: jest.fn(),
        read: jest.fn().mockReturnValue(yaml.safeDump({
          packages: {
            [constants.manifestPackagePlaceholder]: {
              actions: {},
              fake: 'value'
            }
          }
        })),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js')
      // test manifest update with action information
      expect(actionGenerator.fs.write).toHaveBeenCalledWith(n('/fakeDestRoot/manifest.yml'), yaml.safeDump({
        packages: {
          [constants.manifestPackagePlaceholder]: {
            actions: {
              myAction: {
                function: n(`${constants.actionsDirname}/myAction/index.js`), // relative path is important here
                web: 'yes',
                runtime: 'nodejs:10'
              }
            },
            fake: 'value'
          }
        }
      }))
    })

    test('with extra dependencies and devDependencies options', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { dependencies: { abc: '1.2.3', def: '4.5.6' }, devDependencies: { xyz: '3.2.1', vuw: '6.5.4' } })

      // dependencies are added to package.json + still adds wskdebug dependency
      expect(actionGenerator.fs.writeJSON).toHaveBeenCalledWith(n('/fakeDestRoot/package.json'), {
        dependencies: { abc: '1.2.3', def: '4.5.6' },
        devDependencies: {
          xyz: '3.2.1',
          vuw: '6.5.4',
          '@adobe/wskdebug': '^1.1.0'
        }
      })
    })

    test('with tplContext option', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { tplContext: { fake: 'context', with: { fake: 'values' } } })

      // 1. test copy action template to right destination
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templateFile.js'), n(`/fakeDestRoot/${constants.actionsDirname}/myAction/index.js`), { fake: 'context', with: { fake: 'values' } }, {}, {})
    })

    test('with actionManifestConfig option that also overwrite runtime action config', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { actionManifestConfig: { runtime: 'fake:42', inputs: { fake: 'value' } } })

      // test manifest update with action information
      expect(actionGenerator.fs.write).toHaveBeenCalledWith(n('/fakeDestRoot/manifest.yml'), yaml.safeDump({
        packages: {
          [constants.manifestPackagePlaceholder]: {
            license: 'Apache-2.0',
            actions: {
              myAction: {
                function: n(`${constants.actionsDirname}/myAction/index.js`), // relative path is important here
                web: 'yes',
                runtime: 'fake:42',
                inputs: {
                  fake: 'value'
                }
              }
            }
          }
        }
      }))
    })

    test('with dotenvStub option (dotenv must exists)', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        read: jest.fn().mockReturnValue('PREV=123\n'), // previous dotenv content
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { dotenvStub: { label: 'fake label', vars: ['FAKE', 'FAKE2'] } })

      // test manifest update with action information
      expect(actionGenerator.fs.write).toHaveBeenCalledWith(n(`/fakeDestRoot/${constants.dotenvFilename}`), 'PREV=123\n\n## fake label\n#FAKE=\n#FAKE2=\n')
    })

    test('with dotenvStub option but dotenv label is already set in dotenv (should ignore)', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        read: jest.fn().mockReturnValue('## fake label\nPREV=123\n'), // previous dotenv content
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { dotenvStub: { label: 'fake label', vars: ['FAKE', 'FAKE2'] } })

      // test manifest update with action information
      expect(actionGenerator.fs.write).not.toHaveBeenCalledWith(n(`/fakeDestRoot/${constants.dotenvFilename}`), expect.any(String))
    })

    test('with testFile option', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { testFile: './template.test.js' })

      // test manifest update with action information
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/template.test.js'), n(`/fakeDestRoot/test/${constants.actionsDirname}/myAction.test.js`), { actionRelPath: n(`../../${constants.actionsDirname}/myAction/index.js`) }, {}, {})
    })

    test('with testFile option and tplContext option (should append relative path to tested file to test template context)', () => {
      // mock fs
      actionGenerator.fs = {
        copyTpl: jest.fn(),
        exists: jest.fn().mockReturnValue(false), // called on manifest
        write: jest.fn(),
        writeJSON: jest.fn(),
        readJSON: jest.fn().mockReturnValue({}) // package.json read
      }
      actionGenerator.addAction('myAction', './templateFile.js', { testFile: './template.test.js', tplContext: { fake: 'context', with: { fake: 'values' } } })

      // test manifest update with action information
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/template.test.js'), n(`/fakeDestRoot/test/${constants.actionsDirname}/myAction.test.js`), { actionRelPath: n(`../../${constants.actionsDirname}/myAction/index.js`), fake: 'context', with: { fake: 'values' } }, {}, {})
    })
  })
})
