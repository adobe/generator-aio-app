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
const { EOL } = require('os')

const theGeneratorPath = require.resolve('../../../generators/add-action/asset-compute')
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
  const actionPath = `actions/${actionName}`
  const testPath = `test/asset-compute/${actionName}`

  assert.file(`${actionPath}/index.js`)
  assert.file(`${testPath}/corrupt-input/file.jpg`)
  assert.file(`${testPath}/corrupt-input/params.json`)
  assert.file(`${testPath}/simple-test/file.jpg`)
  assert.file(`${testPath}/simple-test/params.json`)
  assert.file(`${testPath}/simple-test/rendition.jpg`)

  assert.file('manifest.yml')
  assert.file('.env')
  assert.file('package.json')
}

function assertManifestContent (actionName) {
  const json = yaml.safeLoad(fs.readFileSync('manifest.yml').toString())
  expect(json.packages[constants.manifestPackagePlaceholder].actions[actionName]).toEqual({
    function: `actions${path.sep}${actionName}${path.sep}index.js`,
    web: 'yes',
    runtime: 'nodejs:10',
    inputs: {
      LOG_LEVEL: 'debug'
    },
    annotations: {
      'require-adobe-auth': true
    }
  })
}

function assertEnvContent (prevContent) {
  assert.fileContent('.env', `## please provide the following environment variables for the Asset Compute devtool. You can use AWS or Azure, not both:${EOL}#ASSET_COMPUTE_INTEGRATION_FILE_PATH=${EOL}#S3_BUCKET=${EOL}#AWS_ACCESS_KEY_ID=${EOL}#AWS_SECRET_ACCESS_KEY=${EOL}#AWS_REGION=${EOL}#AZURE_STORAGE_ACCOUNT=${EOL}#AZURE_STORAGE_KEY=${EOL}#AZURE_STORAGE_CONTAINER_NAME=`)
  assert.fileContent('.env', prevContent)
}

function assertActionCodeContent (actionName) {
  const theFile = `actions/${actionName}/index.js`

  // a few checks to make sure the action uses the asset compute sdk
  assert.fileContent(
    theFile,
    'const { worker } = require(\'@adobe/asset-compute-sdk\');'
  )
  assert.fileContent(
    theFile,
    'exports.main = worker(async (source, rendition) => {'
  )
}

function assertDependencies () {
  const jsonContent = JSON.parse(fs.readFileSync('package.json').toString())
  assert.ok(jsonContent.dependencies['@adobe/asset-compute-sdk'] !== null)
  assert.ok(jsonContent.dependencies['@adobe/asset-compute-sdk'] !== undefined)
  assert.ok(jsonContent.devDependencies['@adobe/aio-cli-plugin-asset-compute'] !== null)
  assert.ok(jsonContent.devDependencies['@adobe/aio-cli-plugin-asset-compute'] !== undefined)
}

function assertScripts () {
  const jsonContent = JSON.parse(fs.readFileSync('package.json').toString())
  assert.ok(jsonContent.scripts.test.includes('adobe-asset-compute test-worker'))
  assert.ok(jsonContent.scripts.debug.includes('adobe-asset-compute devtool'))
}

describe('run', () => {
  test('asset-compute: --skip-prompt', async () => {
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'worker' // default value

    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies()
  })

  test('asset-compute: --skip-prompt, and action with default name already exists', async () => {
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'worker'

    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true })
      .inTmpDir(dir => {
        fs.writeFileSync('manifest.yml', yaml.dump({
          packages: {
            __APP_PACKAGE__: {
              actions: {
                example: { function: 'fake.js' }
              }
            }
          }
        }))
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies()
  })

  test('asset-compute: --skip-prompt, and action already has package.json with scripts', async () => {
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'worker'

    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true })
      .inTmpDir(dir => {
        fs.writeFileSync('package.json', JSON.stringify({
          scripts: {}
        }))
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies()
  })

  test('asset-compute: user input actionName=new-action', async () => {
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'new-asset-compute-action'

    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': false })
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies()
  })

  test('asset-compute: adding an action 2 times', async () => {
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`

    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': false })
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    const actionName2 = 'new-asset-compute-action-second-of-its-name'
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': false })
      .withPrompts({ actionName: 'new-asset-compute-action-second-of-its-name' })

    assertScripts(actionName2)
  })

  test('asset-compute: verifying scripts are not overridden', async () => {
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const dummyPackageJson = JSON.stringify({
      name: 'dummy-app',
      version: '0.0.1',
      dependencies: {
        '@adobe/asset-compute-sdk': '^1.0.2'
      },
      devDependencies: {
        jest: '^24.9.0'
      },
      scripts: {
        test: 'nothing meaningful here',
        debug: 'nothing meaningful here'
      }
    })

    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': false })
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
        fs.writeFileSync(path.join(dir, 'package.json'), dummyPackageJson)
      })

    const actionName2 = 'new-asset-compute-action-second-of-its-name'
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': false })
      .withPrompts({ actionName: 'new-asset-compute-action-second-of-its-name' })

    assertScripts(actionName2)
  })
})
