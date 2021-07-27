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

const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const fs = require('fs')
const yaml = require('js-yaml')
const cloneDeep = require('lodash.clonedeep')
const path = require('path')
const theGeneratorPath = require.resolve('../../../generators/add-action/audience-manager-cd')
const Generator = require('yeoman-generator')

const constants = require('../../../lib/constants')

const installDependencies = jest.spyOn(Generator.prototype, 'installDependencies')
beforeAll(() => {
  // mock implementations
  installDependencies.mockReturnValue(undefined)
})
beforeEach(() => {
  installDependencies.mockClear()
})
afterAll(() => {
  installDependencies.mockRestore()
})

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

function assertGeneratedFiles (actionName) {
  assert.file(`${constants.actionsDirname}/${actionName}/index.js`)

  assert.file(`test/${actionName}.test.js`)
  assert.file(`e2e/${actionName}.e2e.test.js`)

  assert.file(`${constants.actionsDirname}/utils.js`)
  assert.file('test/utils.test.js')

  assert.file('ext.config.yaml')
}

// pkgName is optional
function assertManifestContent (actionName, pkgName) {
  const json = yaml.safeLoad(fs.readFileSync('ext.config.yaml').toString())
  expect(json.runtimeManifest.packages).toBeDefined()

  // default packageName is path.basename(path.dirname('ext.config.yaml'))
  pkgName = pkgName || path.basename(process.cwd())

  expect(json.runtimeManifest.packages[pkgName].actions[actionName]).toEqual({
    function: `${constants.actionsDirname}/${actionName}/index.js`,
    web: 'yes',
    runtime: 'nodejs:14',
    inputs: {
      LOG_LEVEL: 'debug',
      apiKey: '$SERVICE_API_KEY'
    },
    annotations: {
      final: true,
      'require-adobe-auth': true
    }
  })
}

function assertActionCodeContent (actionName) {
  const theFile = `${constants.actionsDirname}/${actionName}/index.js`
  // a few checks to make sure the action calls the audienceManagerCD sdk
  assert.fileContent(
    theFile,
    'const { Core, AudienceManagerCD } = require(\'@adobe/aio-sdk\')'
  )
  assert.fileContent(
    theFile,
    'const requiredParams = [\'apiKey\', \'id\', \'dataSourceId\']'
  )
  assert.fileContent(
    theFile,
    'const requiredHeaders = [\'Authorization\', \'x-gw-ims-org-id\']'
  )
  assert.fileContent(
    theFile,
    'const audienceManagerClient = await AudienceManagerCD.init(orgId, params.apiKey, token)'
  )
  assert.fileContent(
    theFile,
    'const profiles = await audienceManagerClient.getProfile(params.id, params.dataSourceId)'
  )
}

describe('run', () => {
  test('--skip-prompt', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    await helpers.run(theGeneratorPath)
      .withOptions(options)

    // default
    const actionName = 'audience-manager-cd'
    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertDependencies(fs, { '@adobe/aio-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('--skip-prompt, and action with default name already exists', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .inTmpDir(dir => {
        fs.writeFileSync('ext.config.yaml', yaml.dump({
          runtimeManifest: {
            packages: {
              somepackage: {
                actions: {
                  'audience-manager-cd': { function: 'fake.js' }
                }
              }
            }
          }
        }))
      })

    // default
    const actionName = 'audience-manager-cd-1'
    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName, 'somepackage')
    assertDependencies(fs, { '@adobe/aio-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('user input actionName=fakeAction', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = false
    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .withPrompts({ actionName: 'fakeAction' })

    const actionName = 'fakeAction'

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertDependencies(fs, { '@adobe/aio-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })
})
