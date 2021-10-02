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
const cloneDeep = require('lodash.clonedeep')

const constants = require('../../lib/constants')

jest.mock('yeoman-generator')

const ActionGenerator = require('../../lib/ActionGenerator')
const Generator = require('yeoman-generator')

jest.mock('../../lib/utils.js')
const utils = require('../../lib/utils.js')

const generatorOptions = cloneDeep(global.basicGeneratorOptions)

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(ActionGenerator.prototype).toBeInstanceOf(Generator)
  })
})

beforeEach(() => {
  utils.readYAMLConfig.mockRestore()
  utils.readPackageJson.mockRestore()
  utils.writeYAMLConfig.mockRestore()
  utils.writePackageJson.mockRestore()
  utils.appendStubVarsToDotenv.mockRestore()
  utils.addDependencies.mockRestore()
  utils.writeKeyYAMLConfig.mockRestore()
})

describe('implementation', () => {
  beforeEach(() => {
    ActionGenerator.prototype.templatePath = p => path.join('/fakeTplDir', p)
    ActionGenerator.prototype.destinationPath = (...args) => path.join('/fakeDestRoot', ...args)
    Generator.prototype.options = generatorOptions
  })
  describe('constructor', () => {
    test('accept options', () => {
      const spy = jest.spyOn(ActionGenerator.prototype, 'option')
      // eslint-disable-next-line no-new
      new ActionGenerator()
      expect(spy).toHaveBeenCalledWith('skip-prompt', { default: false })
      expect(spy).toHaveBeenCalledWith('action-folder', { type: String })
      expect(spy).toHaveBeenCalledWith('config-path', { type: String })
      expect(spy).toHaveBeenCalledWith('full-key-to-manifest', { type: String, default: '' })
      spy.mockRestore()
    })
  })
  describe('promptForActionName', () => {
    let promptSpy
    let actionGenerator
    beforeEach(() => {
      promptSpy = jest.spyOn(ActionGenerator.prototype, 'prompt')
      actionGenerator = new ActionGenerator()
      actionGenerator.options = { 'skip-prompt': false }
    })
    afterEach(() => {
      promptSpy.mockRestore()
    })
    test('calls prompt and returns the input actionName', async () => {
      promptSpy.mockResolvedValue({
        actionName: 'inputName'
      })
      const actionName = await actionGenerator.promptForActionName('fake purpose', 'fake default')
      expect(actionName).toEqual('inputName')
      expect(promptSpy).toHaveBeenCalledWith([expect.objectContaining({
        when: true,
        default: 'fake default',
        message: expect.stringContaining('fake purpose')
      })])
      expect(promptSpy).toHaveBeenCalledTimes(1)
    })
    test('if options.skip-prompt is set should return the default value', async () => {
      promptSpy.mockResolvedValue({
        actionName: undefined
      })
      actionGenerator.options['skip-prompt'] = true
      const actionName = await actionGenerator.promptForActionName('fake purpose', 'fake default')
      expect(actionName).toEqual('fake default')
      expect(promptSpy).toHaveBeenCalledTimes(0)
    })
    test('validates input `abc-1234, 1234-abc, ABC-1234, 1234-ABC`', async () => {
      promptSpy.mockReturnValue({ actionName: 'fake' })
      await actionGenerator.promptForActionName()
      expect(promptSpy.mock.calls[0][0][0].validate).toBeInstanceOf(Function)
      const validate = promptSpy.mock.calls[0][0][0].validate
      expect(validate('abc-1234')).toBe(true)
      expect(validate('1234-abc')).toBe(true)
      expect(validate('ABC-1234')).toBe(true)
      expect(validate('1234-ABC')).toBe(true)
    })
    test('rejects inputs `a, 1, ab, 12, -abc-1234, abc@, abc_1234, 1234-abc!, abc123456789012345678901234567890`', async () => {
      promptSpy.mockReturnValue({ actionName: 'fake' })
      await actionGenerator.promptForActionName()
      expect(promptSpy.mock.calls[0][0][0].validate).toBeInstanceOf(Function)
      const validate = promptSpy.mock.calls[0][0][0].validate
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

    test('rejects invalid name with a message`', async () => {
      const invalidName = 'a'
      const invalidNameMessage = `'${invalidName}' is not a valid action name, please make sure that:
The name has at least 3 characters or less than 33 characters.            
The first character is an alphanumeric character.
The subsequent characters are alphanumeric.
The last character isn't a space.
Note: characters can only be split by '-'.
`
      promptSpy.mockReturnValue({ actionName: 'fake' })
      await actionGenerator.promptForActionName()
      expect(promptSpy.mock.calls[0][0][0].validate).toBeInstanceOf(Function)
      const validate = promptSpy.mock.calls[0][0][0].validate
      expect(validate(invalidName)).toEqual(invalidNameMessage)
    })

    test('returns new default name in case of conflict', async () => {
      utils.readYAMLConfig.mockReturnValue({
        runtimeManifest: {
          license: 'Apache-2.0',
          packages: {
            mypackage: {
              actions: {
                defaulttest: { function: 'fake.js' },
                'defaulttest-1': { function: 'fake.js' }
              }
            }
          }
        }
      })
      actionGenerator.options = { 'skip-prompt': true }

      const actionName = await actionGenerator.promptForActionName('fakepurpose', 'defaulttest')
      expect(actionName).toEqual('defaulttest-2')
    })
  })

  describe('addAction', () => {
    let actionGenerator
    beforeEach(() => {
      actionGenerator = new ActionGenerator()
      actionGenerator.options = { 'skip-prompt': false }
      actionGenerator.fs = { copyTpl: jest.fn() }

      // mock path resolvers
      actionGenerator.templatePath = p => path.join('/fakeTplDir', p)
      actionGenerator.destinationPath = (...args) => args[0].startsWith(n('/fakeDestRoot')) ? path.join(...args) : path.join('/fakeDestRoot', ...args)
    })

    test('with no options and manifest does not exist', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js')

      // 1. test copy action template to right destination
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templateFile.js'), n(`${constants.actionsDirname}/myAction/index.js`), {}, {}, {})
      // 2. test manifest creation with action information
      expect(utils.writeKeyYAMLConfig).toHaveBeenCalledWith(
        actionGenerator,
        n('/fakeDestRoot/ext.config.yaml'),
        'runtimeManifest',
        // function path should be checked to be relative to config file
        { packages: { fakeDestRoot: { actions: { myAction: { annotations: { 'require-adobe-auth': true }, function: expect.stringContaining('myAction/index.js'), runtime: 'nodejs:14', web: 'yes' } }, license: 'Apache-2.0' } } })

      // 3. make sure wskdebug dev dependency was added to package.json
      expect(utils.addDependencies).toHaveBeenCalledWith(actionGenerator, { '@openwhisk/wskdebug': expect.any(String) }, true)
    })

    test('with extra dependencies and manifest already exists', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({
        runtimeManifest: {
          packages: {
            somepackage: {
              actions: {
                actionxyz: { function: 'fake.js' }

              }
            }
          }
        }
      })

      actionGenerator.addAction('myAction', './templateFile.js', { dependencies: { abc: '1.2.3', def: '4.5.6' }, devDependencies: { xyz: '3.2.1', vuw: '6.5.4' } })

      // 1. test copy action template to right destination
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templateFile.js'), n(`${constants.actionsDirname}/myAction/index.js`), {}, {}, {})
      // 2. test manifest creation with action information, and preserving previous content
      expect(utils.writeKeyYAMLConfig).toHaveBeenCalledWith(
        actionGenerator,
        n('/fakeDestRoot/ext.config.yaml'),
        'runtimeManifest',
        // function path should be checked to be relative to config file
        { packages: { somepackage: { actions: { actionxyz: { function: 'fake.js' }, myAction: { annotations: { 'require-adobe-auth': true }, function: expect.stringContaining('myAction/index.js'), runtime: 'nodejs:14', web: 'yes' } } } } })
      // 3. make sure wskdebug dev dependency was added to package.json
      // prod
      expect(utils.addDependencies).toHaveBeenCalledWith(actionGenerator, {
        abc: '1.2.3', def: '4.5.6'
      })
      // dev
      expect(utils.addDependencies).toHaveBeenCalledWith(actionGenerator, {
        xyz: '3.2.1',
        vuw: '6.5.4',
        '@openwhisk/wskdebug': expect.any(String)
      }, true)
    })

    test('with tplContext and no manifest', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { tplContext: { fake: 'context', with: { fake: 'values' } } })

      // 1. test copy action template to right destination with template options
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templateFile.js'), n(`${constants.actionsDirname}/myAction/index.js`), { fake: 'context', with: { fake: 'values' } }, {}, {})
    })

    test('with tplContext option and actionDestPath already set and no maniifest', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { tplContext: { actionDestPath: `${path.sep}fakeDestRoot${path.sep}${constants.actionsDirname}${path.sep}myAction${path.sep}index.js`, fake: 'context', with: { fake: 'values' } } })

      // 1. test copy action template to predefined destination
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templateFile.js'), n(`${constants.actionsDirname}${path.sep}myAction${path.sep}index.js`), { actionDestPath: `${path.sep}fakeDestRoot${path.sep}${constants.actionsDirname}${path.sep}myAction${path.sep}index.js`, fake: 'context', with: { fake: 'values' } }, {}, {})
    })

    test('with extra actionManifestConfig and no manifest', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { actionManifestConfig: { runtime: 'fake:42', inputs: { fake: 'value' } } })
      // test manifest creation with action information
      expect(utils.writeKeyYAMLConfig).toHaveBeenCalledWith(
        actionGenerator,
        n('/fakeDestRoot/ext.config.yaml'),
        'runtimeManifest',
        // function path should be checked to be relative to config file
        { packages: { fakeDestRoot: { actions: { myAction: { runtime: 'fake:42', inputs: { fake: 'value' }, annotations: { 'require-adobe-auth': true }, function: expect.stringContaining('myAction/index.js'), web: 'yes' } }, license: 'Apache-2.0' } } })
    })

    test('with dotenvStub option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { dotenvStub: { label: 'fake label', vars: ['FAKE', 'FAKE2'] } })
      expect(utils.appendStubVarsToDotenv).toHaveBeenCalledWith(actionGenerator, 'fake label', ['FAKE', 'FAKE2'])
    })

    test('with testFile option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { testFile: './template.test.js' })
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledTimes(2)
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/template.test.js'), n('/fakeDestRoot/test/myAction.test.js'), { actionRelPath: expect.stringContaining('myAction/index.js') }, {}, {})
    })

    test('with testFile option and tplContext option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { testFile: './template.test.js', tplContext: { fake: 'context', with: { fake: 'values' } } })

      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledTimes(2)
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/template.test.js'), n('/fakeDestRoot/test/myAction.test.js'), { actionRelPath: expect.stringContaining('myAction/index.js'), fake: 'context', with: { fake: 'values' } }, {}, {})
    })

    test('with e2eTestFile option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { e2eTestFile: './templatee2e.test.js' })
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledTimes(2)
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/templatee2e.test.js'), n('/fakeDestRoot/e2e/myAction.e2e.test.js'), { runtimePackageName: 'fakeDestRoot' }, {}, {})
    })

    test('with sharedLibFile option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { sharedLibFile: './utils.js' })

      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/utils.js'), n(`/fakeDestRoot/${constants.actionsDirname}/utils.js`), {})
    })

    test('with sharedLibTestFile option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { sharedLibTestFile: './utils.test.js' })

      expect(actionGenerator.fs.copyTpl).not.toHaveBeenCalledWith(n('/fakeTplDir/utils.test.js'), n(`/fakeDestRoot/test/${constants.actionsDirname}/utils.test.js`), {})
    })

    test('with sharedLibFile and sharedLibTestFile option', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({})
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js', { sharedLibFile: './utils.js', sharedLibTestFile: './utils.test.js' })
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalled()

      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/utils.js'), n(`/fakeDestRoot/${constants.actionsDirname}/utils.js`), {})
      expect(actionGenerator.fs.copyTpl).toHaveBeenCalledWith(n('/fakeTplDir/utils.test.js'), n('/fakeDestRoot/test/utils.test.js'), { utilsRelPath: expect.stringContaining('../actions/utils.js') }, {}, {})
    })
    test('with existing package.json node engines', () => {
      // mock files
      utils.readPackageJson.mockReturnValue({ engines: { node: '1 || 2' } })
      utils.readYAMLConfig.mockReturnValue({})

      actionGenerator.addAction('myAction', './templateFile.js')

      expect(utils.writePackageJson).not.toHaveBeenCalledWith(actionGenerator, expect.objectContaining({
        engines: { node: '^10 || ^12 || ^14' }
      }))
    })
  })
})
