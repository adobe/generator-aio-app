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

const Generator = require('yeoman-generator')
const path = require('path')
const fs = require('fs-extra')
const { absApp, objGetValue } = require('./utils')

const {
  createVsCodeConfiguration,
  createLaunchCompound,
  createChromeLaunchConfiguration,
  createPwaNodeLaunchConfiguration
} = require('./VsCodeConfiguration')

/*
    'initializing',
    'prompting',
    'configuring',
    'default',
    'writing',
    'conflicts',
    'install',
    'end'
*/

const Default = {
  DESTINATION_FILE: '.vscode/launch.json',
  REMOTE_ROOT: '/code'
}

const Option = {
  DESTINATION_FILE: 'destination-file',
  FRONTEND_URL: 'frontend-url',
  REMOTE_ROOT: 'remote-root',
  APP_CONFIG: 'app-config'
}

class AddVsCodeConfig extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option(Option.APP_CONFIG, { type: Object })
    this.option(Option.FRONTEND_URL, { type: String })
    this.option(Option.REMOTE_ROOT, { type: String, default: Default.REMOTE_ROOT })
    this.option(Option.DESTINATION_FILE, { type: String, default: Default.DESTINATION_FILE })
  }

  verifyConfig () {
    const appConfig = this.options[Option.APP_CONFIG]
    const verifyKeys = [
      'app.hasFrontend',
      'app.hasBackend',
      'ow.package',
      'ow.apihost',
      'manifest.package.actions',
      'web.src',
      'web.distDev',
      'root',
      'envFile'
    ]

    const missingKeys = []
    verifyKeys.forEach(key => {
      if (objGetValue(appConfig, key) === undefined) {
        missingKeys.push(key)
      }
    })

    if (missingKeys.length > 0) {
      throw new Error(`App config missing keys: ${missingKeys.join(', ')}`)
    }
  }

  _getActionEntryFile (pkgJson) {
    const pkgJsonContent = fs.readJsonSync(pkgJson)
    if (pkgJsonContent.main) {
      return pkgJsonContent.main
    }
    return 'index.js'
  }

  _processRuntimeArgsForActionEntryFile (action, runtimeArgs) {
    const appConfig = this.options[Option.APP_CONFIG]
    const actionPath = absApp(appConfig.root, action.function)

    const actionFileStats = fs.lstatSync(actionPath)
    if (actionFileStats.isDirectory()) {
      // take package.json main or 'index.js'
      const zipMain = this._getActionEntryFile(path.join(actionPath, 'package.json'))
      return path.join(actionPath, zipMain)
    }

    return runtimeArgs
  }

  _processForBackend () {
    const appConfig = this.options[Option.APP_CONFIG]
    const nodeVersion = this.options[Option.NODE_VERSION]
    const remoteRoot = this.options[Option.REMOTE_ROOT]

    const packageName = appConfig.ow.package
    const manifestActions = appConfig.manifest.package.actions

    Object.keys(manifestActions).map(actionName => {
      const action = manifestActions[actionName]

      const launchConfig = createPwaNodeLaunchConfiguration({
        packageName,
        actionName,
        actionFileRelativePath: action.function,
        envFileRelativePath: appConfig.envFile,
        remoteRoot,
        nodeVersion
      })

      launchConfig.runtimeArgs = this._processRuntimeArgsForActionEntryFile(action, launchConfig.runtimeArgs)

      if (
        action.annotations &&
        action.annotations['require-adobe-auth'] &&
        appConfig.ow.apihost === 'https://adobeioruntime.net'
      ) {
        // NOTE: The require-adobe-auth annotation is a feature implemented in the
        // runtime plugin. The current implementation replaces the action by a sequence
        // and renames the action to __secured_<action>. The annotation will soon be
        // natively supported in Adobe I/O Runtime, at which point this condition won't
        // be needed anymore.
        /* instanbul ignore next */
        launchConfig.runtimeArgs[0] = `${packageName}/__secured_${actionName}`
      }

      if (action.runtime) {
        launchConfig.runtimeArgs.push('--kind')
        launchConfig.runtimeArgs.push(action.runtime)
      }

      this.vsCodeConfig.configurations.push(launchConfig)
    })

    this.vsCodeConfig.compounds.push({
      name: 'Actions',
      configurations: this.vsCodeConfig.configurations.map(config => config.name)
    })
  }

  _processForFrontend () {
    const appConfig = this.options[Option.APP_CONFIG]
    const frontEndUrl = this.options[Option.FRONTEND_URL]

    if (!frontEndUrl) {
      throw new Error(`Missing option for generator: ${Option.FRONTEND_URL}`)
    }

    const webConfig = createChromeLaunchConfiguration({
      url: frontEndUrl,
      webRoot: appConfig.web.src,
      webDistDev: appConfig.web.distDev
    })

    this.vsCodeConfig.configurations.push(webConfig)

    this.vsCodeConfig.compounds.push(createLaunchCompound({
      name: 'WebAndActions',
      configurations: this.vsCodeConfig.configurations.map(config => config.name)
    }))
  }

  initializing () {
    this.verifyConfig()
    this.vsCodeConfig = createVsCodeConfiguration()

    const appConfig = this.options[Option.APP_CONFIG]

    if (appConfig.app.hasBackend) {
      this._processForBackend()
    }

    if (appConfig.app.hasFrontend) {
      this._processForFrontend()
    }
  }

  writing () {
    const appConfig = this.options[Option.APP_CONFIG]
    const destFile = this.options[Option.DESTINATION_FILE]

    this.fs.writeJSON(this.destinationPath(destFile), this.vsCodeConfig)

    this.sourceRoot(path.join(__dirname, './templates/'))

    this.fs.copyTpl(
      this.templatePath('env.local'),
      this.destinationPath(appConfig.envFile),
      {}
    )
  }
}

module.exports = AddVsCodeConfig
