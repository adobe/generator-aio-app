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

const path = require('path')

/**
 * Create a VS Code launch compound.
 *
 * @param {Object} params the parameters
 * @param {String} params.name the compound name
 * @param {Array<string>} params.configurations an array of launch configuration names
 */
function createLaunchCompound (params) {
  const { name, configurations = [] } = params
  return {
    name,
    configurations
  }
}

/**
 * Create a VS Code basic launch configuration.
 *
 * @param {Object} params the parameters
 * @param {String} params.type the launch configuration type
 * @param {String} params.name the launch configuration name
 * @param {String} params.request the launch configuration request
 */
function createLaunchConfiguration (params) {
  const { type, name, request } = params
  return {
    type,
    name,
    request
  }
}

/**
 * Create a VS Code Google Chrome launch configuration.
 *
 * This configuration needs the Chrome Debugging extension for VS Code (created by Microsoft) to be installed.
 *
 * @param {Object} params the parameters
 * @param {String} params.url the frontend URL
 * @param {String} params.webRoot the path to the web root
 * @param {String} params.webDistDev the path to the web dist-dev folder
 */
function createChromeLaunchConfiguration (params) {
  const { url, webRoot } = params
  return {
    ...createLaunchConfiguration({ type: 'chrome', name: 'Web', request: 'launch' }),
    url,
    webRoot,
    breakOnLoad: true,
    sourceMapPathOverrides: {
      '/__parcel_source_root/*': '${workspaceFolder}/*' // eslint-disable-line no-template-curly-in-string
    }
  }
}

/**
 * Create a VS Code Node launch configuration.
 *
 * @param {Object} params the parameters
 * @param {String} params.packageName the Openwhisk package name
 * @param {String} params.actionName the Openwhisk action name
 * @param {String} params.actionFileRelativePath the relative path to the action file
 * @param {String} params.envFileRelativePath the relative path to the env file
 * @param {String} params.remoteRoot the remote root path
 */
function createPwaNodeLaunchConfiguration (params) {
  const { packageName, actionName, actionFileRelativePath, envFileRelativePath, remoteRoot } = params
  const configurationName = `Action:${packageName}/${actionName}`

  return {
    ...createLaunchConfiguration({ type: 'pwa-node', name: configurationName, request: 'launch' }),
    runtimeExecutable: '${workspaceFolder}/node_modules/.bin/wskdebug', // eslint-disable-line no-template-curly-in-string
    envFile: `\${workspaceFolder}/${envFileRelativePath}`,
    timeout: 30000,
    killBehavior: 'polite',
    localRoot: '${workspaceFolder}', // eslint-disable-line no-template-curly-in-string
    remoteRoot,
    outputCapture: 'std',
    attachSimplePort: 0,
    runtimeArgs: [
      `${packageName}/${actionName}`,
      path.join('${workspaceFolder}', actionFileRelativePath), // eslint-disable-line no-template-curly-in-string
      '-v',
      '--disable-concurrency'
    ]
  }
}

/**
 * Create a VS Code configuration.
 *
 * @param {Object} params the parameters
 * @param {Array<Object>} params.configurations an array of VS Code launch configurations
 * @param {Array<Object>} params.compunds an array of VS Code launch compounds
 */
function createVsCodeConfiguration (params = {}) {
  const { configurations = [], compounds = [] } = params
  return {
    configurations,
    compounds
  }
}

module.exports = {
  createVsCodeConfiguration,
  createLaunchCompound,
  createChromeLaunchConfiguration,
  createPwaNodeLaunchConfiguration
}
