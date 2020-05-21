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
  assert.file(`worker-${actionName}.js`)
  assert.file('tests/corrupt-input/file.jpg')
  assert.file('tests/corrupt-input/params.json')
  assert.file('tests/simple-test/file.jpg')
  assert.file('tests/simple-test/params.json')
  assert.file('tests/simple-test/rendition.jpg')

  assert.file('manifest.yml')
  assert.file('.env')
  assert.file('package.json')
}

function assertManifestContent (actionName) {
  const json = yaml.safeLoad(fs.readFileSync('manifest.yml').toString())
  expect(json.packages[constants.manifestPackagePlaceholder].actions[actionName]).toEqual({
    function: `worker-${actionName}.js`,
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
  assert.fileContent('.env', `## please provide the following environment variables for the Asset Compute devtool. You can use AWS or Azure, not both:
# ASSET_COMPUTE_INTEGRATION_FILE_PATH=
# S3_BUCKET=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AZURE_STORAGE_ACCOUNT=
# AZURE_STORAGE_KEY=
# AZURE_STORAGE_CONTAINER_NAME=`)
  assert.fileContent('.env', prevContent)
}

function assertActionCodeContent (actionName) {
  const theFile = `worker-${actionName}.js`
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

function assertDependencies (actionName) {
  expect(JSON.parse(fs.readFileSync('package.json').toString())).toEqual({
    name: actionName,
    scripts: {
      test: 'aio asset-compute test-worker',
      debug: 'aio app run && aio asset-compute devtool'
    },
    dependencies: {
      '@adobe/asset-compute-sdk': expect.any(String)
    },
    devDependencies: {
      '@adobe/wskdebug': expect.any(String),
      '@adobe/aio-cli-plugin-asset-compute': expect.any(String)
    }
  })
}

describe('run', () => {
  test('asset-compute: --skip-prompt', async () => {
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    // default
    const actionName = 'example'

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(actionName)
  })

  test('asset-compute: --skip-prompt, and action with default name already exists', async () => {
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
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

    // default
    const actionName = 'example-1'

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(actionName)
  })

  test('asset-compute: --skip-prompt, and action already has package.json with scripts', async () => {
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': true })
      .inTmpDir(dir => {
        fs.writeFileSync('package.json', JSON.stringify({
          scripts: {}
        }))
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    // default
    const actionName = 'example'

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(actionName)
  })

  test('asset-compute: user input actionName=new-action', async () => {
    const prevDotEnvContent = 'PREVIOUSCONTENT\n'
    await helpers.run(theGeneratorPath)
      .withOptions({ 'skip-prompt': false })
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    const actionName = 'new-asset-compute-action'

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(actionName)
  })
})
