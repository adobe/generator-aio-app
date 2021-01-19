/*
Copyright 2021 Adobe. All rights reserved.
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
const fs = require('fs-extra')
const path = require('path')

jest.mock('fs-extra')

const theGeneratorPath = require.resolve('../../../generators/add-vscode-config')
const Generator = require('yeoman-generator')

const createOptions = () => {
  return {
    'app-config': {
      app: {
        hasBackend: true,
        hasFrontend: true
      },
      ow: {
        package: 'my-package',
        apihost: 'https://my-api.host'
      },
      manifest: {
        package: {
          actions: {
            'action-1': { function: 'src/actions/action-1' }
          }
        }
      },
      web: {
        src: 'html',
        distDev: 'dist-dev'
      },
      root: 'root',
      envFile: 'env-file'
    },
    'frontend-url': 'https://localhost:9080'
  }
}

beforeEach(() => {
  fs.lstatSync.mockReset()
})

test('exports a yeoman generator', () => {
  expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
})

test('option app-config incomplete', async () => {
  const options = {
    'app-config': {
      app: {
      }
    }
  }
  const result = helpers.run(theGeneratorPath).withOptions(options)

  await expect(result).rejects.toEqual(new Error(
    'App config missing keys: app.hasFrontend, app.hasBackend, ow.package, ow.apihost, manifest.package.actions, web.src, web.distDev, root, envFile'))
})

test('option frontend-url missing', async () => {
  const options = createOptions()
  options['app-config'].app.hasBackend = false
  options['app-config'].app.hasFrontend = true
  options['frontend-url'] = undefined

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).rejects.toEqual(new Error('Missing option for generator: frontend-url'))
})

test('no missing options (action is a file)', async () => {
  const options = createOptions()
  options['app-config'].app.hasBackend = false
  options['app-config'].app.hasFrontend = false

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('no missing options (action is a folder)', async () => {
  const options = createOptions()
  let result

  fs.lstatSync.mockReturnValue({
    isDirectory: () => true
  })

  fs.readJsonSync.mockReturnValue({}) // no main property in package.json
  result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()

  fs.readJsonSync.mockReturnValue({ main: 'main.js' }) // has main property in package.json
  result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('no missing options (coverage: action has a runtime specifier)', async () => {
  const options = createOptions()
  options['app-config'].manifest.package.actions['action-1'].runtime = 'nodejs:14'

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('no missing options (coverage: action has annotations)', async () => {
  const options = createOptions()
  options['app-config'].manifest.package.actions['action-1'].annotations = {
    'require-adobe-auth': true
  }
  options['app-config'].ow.apihost = 'https://adobeioruntime.net'

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('output check', async () => {
  const options = createOptions()
  options['app-config'].manifest.package.actions['action-1'].runtime = 'nodejs:14'
  options['app-config'].manifest.package.actions['action-1'].annotations = {
    'require-adobe-auth': true
  }
  options['app-config'].ow.apihost = 'https://adobeioruntime.net'
  options['destination-file'] = 'foo/bar.json'

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()

  const destFile = options['destination-file']
  assert.file(destFile) // destination file is written
  assert.JSONFileContent(destFile, {
    configurations: [
      {
        type: 'pwa-node',
        name: 'Action:my-package/action-1',
        request: 'launch',
        runtimeExecutable: '${workspaceFolder}/node_modules/.bin/wskdebug', // eslint-disable-line no-template-curly-in-string
        envFile: '${workspaceFolder}/env-file', // eslint-disable-line no-template-curly-in-string
        timeout: 30000,
        localRoot: '${workspaceFolder}', // eslint-disable-line no-template-curly-in-string
        remoteRoot: '/code',
        outputCapture: 'std',
        attachSimplePort: 0,
        runtimeArgs: [
          'my-package/__secured_action-1',
          '${workspaceFolder}/src/actions/action-1', // eslint-disable-line no-template-curly-in-string
          '-v',
          '--kind',
          'nodejs:14'
        ]
      },
      {
        type: 'chrome',
        name: 'Web',
        request: 'launch',
        url: 'https://localhost:9080',
        webRoot: 'html',
        breakOnLoad: true,
        sourceMapPathOverrides: {
          '*': path.join('dist-dev', '*')
        }
      }
    ],
    compounds: [
      {
        name: 'Actions',
        configurations: [
          'Action:my-package/action-1'
        ]
      },
      {
        name: 'WebAndActions',
        configurations: [
          'Action:my-package/action-1',
          'Web'
        ]
      }
    ]
  })

  const envFile = options['app-config'].envFile
  assert.file(envFile) // env file is written
  assert.fileContent(envFile, 'OW_NAMESPACE=')
  assert.fileContent(envFile, 'OW_AUTH=')
  assert.fileContent(envFile, 'OW_APIHOST=')
})
