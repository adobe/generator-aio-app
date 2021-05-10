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
        packagePlaceholder: '__APP_PACKAGE__',
        full: {
          packages: {
            __APP_PACKAGE__: {
              actions: {
                'action-1': {
                  function: 'src/actions/action-1'
                }
              }
            }
          }
        }
      },
      web: {
        src: 'html',
        distDev: 'dist-dev'
      },
      root: 'root'
    },
    'frontend-url': 'https://localhost:9080',
    'env-file': 'my/.env'
  }
}

const createTestLaunchConfiguration = (
  packageName,
  requireAdobeAuth = false,
  mainFile = null
) => {
  const actionName = `${packageName}/${requireAdobeAuth ? '__secured_' : ''}action-1`
  let actionJs = '${workspaceFolder}/src/actions/action-1' // eslint-disable-line no-template-curly-in-string
  if (mainFile) {
    actionJs = `${actionJs}/${mainFile}`
  }

  return {
    configurations: [
      {
        type: 'pwa-node',
        name: `Action:${packageName}/action-1`,
        request: 'launch',
        killBehavior: 'polite',
        runtimeExecutable: '${workspaceFolder}/node_modules/.bin/wskdebug', // eslint-disable-line no-template-curly-in-string
        envFile: '${workspaceFolder}/my/.env', // eslint-disable-line no-template-curly-in-string
        timeout: 30000,
        localRoot: '${workspaceFolder}', // eslint-disable-line no-template-curly-in-string
        remoteRoot: '/code',
        outputCapture: 'std',
        attachSimplePort: 0,
        runtimeArgs: [
          actionName,
          actionJs,
          '-v',
          '--disable-concurrency',
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
          `Action:${packageName}/action-1`
        ]
      },
      {
        name: 'WebAndActions',
        configurations: [
          `Action:${packageName}/action-1`,
          'Web'
        ]
      }
    ]
  }
}

beforeEach(() => {
  fs.lstatSync.mockReset()
  fs.existsSync.mockReset()
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
    'App config missing keys: app.hasFrontend, app.hasBackend, ow.package, ow.apihost, manifest.packagePlaceholder, manifest.full.packages, web.src, web.distDev, root'))
})

test('option frontend-url missing', async () => {
  const options = createOptions()
  options['app-config'].app.hasBackend = false
  options['app-config'].app.hasFrontend = true
  options['frontend-url'] = undefined
  options['env-file'] = 'env-file'

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).rejects.toEqual(new Error('Missing option for generator: frontend-url'))
})

test('option env-file missing', async () => {
  const options = createOptions()
  options['app-config'].app.hasBackend = true
  options['app-config'].app.hasFrontend = true
  options['frontend-url'] = 'https://localhost:9999'
  delete options['env-file']

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).rejects.toEqual(new Error('Missing option for generator: env-file'))
})

test('no missing options -- coverage (no frontend or backend, runtime not specified)', async () => {
  const options = createOptions()
  options['app-config'].app.hasBackend = false
  options['app-config'].app.hasFrontend = false

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('no missing options (action is a file)', async () => {
  const options = createOptions()
  options['destination-file'] = 'foo/bar.json'
  const pkg = options['app-config'].manifest.full.packages.__APP_PACKAGE__
  pkg.actions['action-1'].runtime = 'nodejs:14'

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()

  assert.file(options['destination-file']) // destination file is written
  assert.JSONFileContent(options['destination-file'],
    createTestLaunchConfiguration(options['app-config'].ow.package))
})

test('no missing options (action is a folder)', async () => {
  const destFile = 'foo/bar.json'
  const options = createOptions()
  options['destination-file'] = destFile
  const pkg = options['app-config'].manifest.full.packages.__APP_PACKAGE__
  pkg.actions['action-1'].runtime = 'nodejs:14'

  let result

  fs.lstatSync.mockReturnValue({
    isDirectory: () => true
  })

  fs.readJsonSync.mockReturnValue({}) // no main property in package.json
  result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()

  assert.file(destFile) // destination file is written
  assert.JSONFileContent(destFile,
    createTestLaunchConfiguration(
      options['app-config'].ow.package,
      false,
      'index.js'
    )
  )

  fs.readJsonSync.mockReturnValue({ main: 'main.js' }) // has main property in package.json
  result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()

  assert.file(destFile) // destination file is written
  assert.JSONFileContent(destFile,
    createTestLaunchConfiguration(
      options['app-config'].ow.package,
      false,
      'main.js'
    )
  )
})

test('no missing options (coverage: action has a runtime specifier)', async () => {
  const options = createOptions()
  const pkg = options['app-config'].manifest.full.packages.__APP_PACKAGE__
  pkg.actions['action-1'].runtime = 'nodejs:14'

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('no missing options (coverage: action has annotations)', async () => {
  const options = createOptions()
  options['app-config'].ow.apihost = 'https://adobeioruntime.net'
  const pkg = options['app-config'].manifest.full.packages.__APP_PACKAGE__
  pkg.actions['action-1'].annotations = { 'require-adobe-auth': true }

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  const result = helpers.run(theGeneratorPath).withOptions(options)
  await expect(result).resolves.not.toThrow()
})

test('output check', async () => {
  const options = createOptions()
  const pkg = options['app-config'].manifest.full.packages.__APP_PACKAGE__
  pkg.actions['action-1'].runtime = 'nodejs:14'
  pkg.actions['action-1'].annotations = {
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
  assert.JSONFileContent(destFile, createTestLaunchConfiguration(options['app-config'].ow.package, true))
})

test('output check (custom package)', async () => {
  const customPackage = 'my-custom-package'
  const options = createOptions()
  const packages = options['app-config'].manifest.full.packages
  packages[customPackage] = Object.assign({}, packages.__APP_PACKAGE__)
  delete packages.__APP_PACKAGE__
  packages[customPackage].actions['action-1'].runtime = 'nodejs:14'
  packages[customPackage].actions['action-1'].annotations = {
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
  assert.JSONFileContent(destFile, createTestLaunchConfiguration(customPackage, true))
})

test('vscode launch configuration exists', async () => {
  const options = createOptions()
  options['destination-file'] = 'foo/bar.json'

  fs.lstatSync.mockReturnValue({
    isDirectory: () => false
  })

  fs.existsSync.mockReturnValue(true) // destination file exists

  const result = helpers
    .run(theGeneratorPath)
    .withOptions(options)
    .withPrompts({ overwriteVsCodeConfig: false })
  await expect(result).resolves.not.toThrow()

  const destFile = options['destination-file']
  assert.noFile(destFile) // destination file is not written
})
