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
const cloneDeep = require('lodash.clonedeep')

const theGeneratorPath = require.resolve('../../../generators/add-action/asset-compute')
const Generator = require('yeoman-generator')

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

  assert.file('ext.config.yaml')
  assert.file('.env')
  assert.file('package.json')
}

// pkgName is optional
function assertManifestContent (actionName, pkgName) {
  const json = yaml.safeLoad(fs.readFileSync('ext.config.yaml').toString())
  expect(json.runtimeManifest.packages).toBeDefined()

  // default packageName is path.basename(path.dirname('ext.config.yaml'))
  pkgName = pkgName || path.basename(process.cwd())

  expect(json.runtimeManifest.packages[pkgName].actions[actionName]).toEqual({
    function: `actions/${actionName}/index.js`,
    web: 'yes',
    runtime: 'nodejs:14',
    limits: {
      concurrency: 10
    },
    annotations: {
      'require-adobe-auth': true
    }
  })
}

function assertEnvContent (prevContent) {
  // the generator does not write anything to .env
  assert.fileContent('.env', prevContent)
}

function assertActionCodeContent (actionName) {
  const theFile = `actions/${actionName}/index.js`

  // a few checks to make sure the action uses the asset compute sdk
  assert.fileContent(
    theFile,
    'const { worker, SourceCorruptError } = require(\'@adobe/asset-compute-sdk\');'
  )
  assert.fileContent(
    theFile,
    'exports.main = worker(async (source, rendition) => {'
  )
}

describe('run', () => {
  test('asset-compute: --skip-prompt', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'worker' // default value

    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(fs, { '@adobe/asset-compute-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String), '@adobe/aio-cli-plugin-asset-compute': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('asset-compute: --skip-prompt, and action with default name already exists', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`

    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .inTmpDir(dir => {
        fs.writeFileSync('ext.config.yaml', yaml.dump({
          runtimeManifest: {
            packages: {
              somepackagename: {
                actions: {
                  worker: { function: 'fake.js' }
                }
              }
            }
          }

        }))
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    const actionName = 'worker-1'
    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName, 'somepackagename')
    assertEnvContent(prevDotEnvContent)
    assertDependencies(fs, { '@adobe/asset-compute-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String), '@adobe/aio-cli-plugin-asset-compute': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('asset-compute: --skip-prompt, and action already has package.json with scripts', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = true
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'worker'

    await helpers.run(theGeneratorPath)
      .withOptions(options)
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
    assertDependencies(fs, { '@adobe/asset-compute-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String), '@adobe/aio-cli-plugin-asset-compute': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('asset-compute: user input actionName=new-action', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = false
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const actionName = 'new-asset-compute-action'

    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    assertGeneratedFiles(actionName)
    assertActionCodeContent(actionName)
    assertManifestContent(actionName)
    assertEnvContent(prevDotEnvContent)
    assertDependencies(fs, { '@adobe/asset-compute-sdk': expect.any(String) }, { '@openwhisk/wskdebug': expect.any(String), '@adobe/aio-cli-plugin-asset-compute': expect.any(String) })
    assertNodeEngines(fs, '^10 || ^12 || ^14')
  })

  test('asset-compute: adding an action 2 times', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = false
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`

    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
      })

    const actionName2 = 'new-asset-compute-action-second-of-its-name'
    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .withPrompts({ actionName: actionName2 })
  })

  test('asset-compute: verifying scripts are not overridden', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['skip-prompt'] = false
    const prevDotEnvContent = `PREVIOUSCONTENT${EOL}`
    const dummyPackageJson = JSON.stringify({
      name: 'dummy-app',
      version: '0.0.1',
      dependencies: {
        '@adobe/asset-compute-sdk': '^2.2.1'
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
      .withOptions(options)
      .withPrompts({ actionName: 'new-asset-compute-action' })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnvContent)
        fs.writeFileSync(path.join(dir, 'package.json'), dummyPackageJson)
      })

    const actionName2 = 'new-asset-compute-action-second-of-its-name'
    await helpers.run(theGeneratorPath)
      .withOptions(options)
      .withPrompts({ actionName: actionName2 })
  })
})
