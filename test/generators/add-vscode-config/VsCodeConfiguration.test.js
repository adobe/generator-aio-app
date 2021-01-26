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
const {
  createVsCodeConfiguration,
  createLaunchCompound,
  createChromeLaunchConfiguration,
  createPwaNodeLaunchConfiguration
} = require('../../../generators/add-vscode-config/VsCodeConfiguration')

const path = require('path')

test('exports', () => {
  expect(typeof createVsCodeConfiguration).toEqual('function')
  expect(typeof createLaunchCompound).toEqual('function')
  expect(typeof createChromeLaunchConfiguration).toEqual('function')
  expect(typeof createPwaNodeLaunchConfiguration).toEqual('function')
})

test('createVsCodeConfiguration', () => {
  const launchConfig = createVsCodeConfiguration()

  expect(typeof launchConfig).toEqual('object')
  expect(Array.isArray(launchConfig.configurations)).toBeTruthy()
  expect(Array.isArray(launchConfig.compounds)).toBeTruthy()
})

test('createLaunchCompound', () => {
  const compoundName = 'compound-name'
  const launchCompound = createLaunchCompound({ name: compoundName })

  expect(typeof launchCompound).toEqual('object')
  expect(launchCompound.name).toEqual(compoundName)
  expect(Array.isArray(launchCompound.configurations)).toBeTruthy()
})

test('createChromeLaunchConfiguration', () => {
  const params = {
    url: 'my-url',
    webRoot: 'my-web-root',
    webDistDev: 'dist-dev'
  }
  const launchConfig = createChromeLaunchConfiguration(params)

  expect(typeof launchConfig).toEqual('object')
  expect(launchConfig.type).toEqual('chrome')
  expect(launchConfig.name).toEqual('Web')
  expect(launchConfig.request).toEqual('launch')

  expect(launchConfig).toStrictEqual({
    type: 'chrome',
    name: 'Web',
    request: 'launch',
    url: params.url,
    webRoot: params.webRoot,
    breakOnLoad: true,
    sourceMapPathOverrides: {
      '*': path.join(params.webDistDev, '*')
    }
  })
})

test('createPwaNodeLaunchConfiguration', () => {
  const params = {
    packageName: 'my-package',
    actionName: 'my-action-name',
    actionFileRelativePath: 'action-relative-path',
    envFileRelativePath: 'env-file-relative-path',
    remoteRoot: 'remote-root',
    nodeVersion: 14
  }
  const launchConfig = createPwaNodeLaunchConfiguration(params)

  expect(launchConfig).toStrictEqual({
    type: 'pwa-node',
    name: `Action:${params.packageName}/${params.actionName}`,
    request: 'launch',
    killBehavior: 'polite',
    runtimeExecutable: '${workspaceFolder}/node_modules/.bin/wskdebug', // eslint-disable-line no-template-curly-in-string
    envFile: '${workspaceFolder}/env-file-relative-path', // eslint-disable-line no-template-curly-in-string
    timeout: 30000,
    localRoot: '${workspaceFolder}', // eslint-disable-line no-template-curly-in-string
    remoteRoot: params.remoteRoot,
    outputCapture: 'std',
    attachSimplePort: 0,
    runtimeArgs: [
      `${params.packageName}/${params.actionName}`,
      `\${workspaceFolder}/${params.actionFileRelativePath}`, // eslint-disable-line no-template-curly-in-string
      '-v',
      '--disable-concurrency'
    ]
  })
})
