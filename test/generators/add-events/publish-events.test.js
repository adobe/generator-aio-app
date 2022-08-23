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
const path = require('path')
const cloneDeep = require('lodash.clonedeep')

const theGeneratorPath = require.resolve('../../../generators/add-events/publish-events')
const Generator = require('yeoman-generator')

const { constants } = require('@adobe/generator-app-common-lib')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

function assertGeneratedFiles (actionName) {
  assert.file(`${constants.actionsDirname}/${actionName}/index.js`)
  // assert.file(`test/${constants.actionsDirname}/${actionName}.test.js`)
  // assert.file(`e2e/${constants.actionsDirname}/${actionName}.e2e.js`)

  assert.file(`${constants.actionsDirname}/utils.js`)
  // assert.file(`test/${constants.actionsDirname}/utils.test.js`)

  // assert.file('manifest.yml')
  // assert.file('.env')
}

/* eslint no-unused-vars: 0 */
function assertManifestContent (actionName) {
  const json = yaml.load(fs.readFileSync('manifest.yml').toString())
  expect(json.packages[constants.manifestPackagePlaceholder].actions[actionName]).toEqual({
    function: path.normalize(`${constants.actionsDirname}/${actionName}/index.js`),
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

function assertEnvContent (prevContent) {
  assert.fileContent('.env', prevContent)
}

function assertEventCodeContent (actionName) {
  const theFile = `${constants.actionsDirname}/${actionName}/index.js`
  // a few checks to make sure the action calls the events sdk to publish cloud events
  assert.fileContent(
    theFile,
    'const { Core, Events } = require(\'@adobe/aio-sdk\')'
  )
  assert.fileContent(
    theFile,
    'const requiredParams = [\'apiKey\', \'providerId\', \'eventCode\', \'payload\']'
  )
  assert.fileContent(
    theFile,
    'const requiredHeaders = [\'Authorization\', \'x-gw-ims-org-id\']'
  )
  assert.fileContent(
    theFile,
    'const eventsClient = await Events.init(orgId, params.apiKey, token)'
  )
  assert.fileContent(
    theFile,
    'const published = await eventsClient.publishEvent(cloudEvent)'
  )
}

describe('run', () => {
  test('--skip-prompt', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
    try {
      await helpers.run(theGeneratorPath)
        .withOptions(options)
        .inTmpDir(dir => {
          fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
        })
    } catch (e) {
      console.error(e)
    }

    // default
    const actionName = 'publish-events'

    assertGeneratedFiles(actionName)
    assertEventCodeContent(actionName)
    // assertManifestContent(actionName)
    // assertEnvContent(prevDotEnvContent)
    assertDependencies(fs, {
      '@adobe/aio-sdk': expect.any(String),
      cloudevents: expect.any(String),
      uuid: expect.any(String)
    }, { '@openwhisk/wskdebug': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('--skip-prompt, and action with default name already exists', async () => {
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .inTmpDir(dir => {
        fs.writeFileSync('ext.config.yaml', yaml.dump({
          runtimeManifest: {
            packages: {
              __APP_PACKAGE__: {
                actions: {
                  'publish-events': { function: 'fake.js' }
                }
              }
            }
          }
        }))
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    // default
    const actionName = 'publish-events-1'

    assertGeneratedFiles(actionName)
    assertEventCodeContent(actionName)
    // assertManifestContent(actionName)
    // assertEnvContent(prevDotEnvContent)
    assertDependencies(fs, {
      '@adobe/aio-sdk': expect.any(String),
      cloudevents: expect.any(String),
      uuid: expect.any(String)
    }, { '@openwhisk/wskdebug': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('user input actionName=fakeAction', async () => {
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = false
    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .withPrompts({ actionName: 'fakeAction' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    const actionName = 'fakeAction'

    assertGeneratedFiles(actionName)
    assertEventCodeContent(actionName)
    // assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(fs, {
      '@adobe/aio-sdk': expect.any(String),
      cloudevents: expect.any(String),
      uuid: expect.any(String)
    }, { '@openwhisk/wskdebug': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })
})
