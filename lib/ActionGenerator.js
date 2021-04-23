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

const path = require('path')
const upath = require('upath')
const { EOL } = require('os')

const Generator = require('yeoman-generator')

const { dotenvFilename, manifestPackagePlaceholder } = require('./constants')

const utils = require('./utils')

class ActionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.option('skip-prompt', { default: false })
    // required
    this.option('action-folder', { type: String })
    this.option('ext-config-path', { type: String })
  }

  async promptForActionName (actionPurpose, defaultValue) {
    // TODO prompt is disabled for now, decide what to do with this code
    const actionName = this.getDefaultActionName(defaultValue)

    // if (!this.options['skip-prompt']) {
    //   const promptProps = await this.prompt([
    //     {
    //       type: 'input',
    //       name: 'actionName',
    //       message: `We are about to create a new sample action that ${actionPurpose}.\nHow would you like to name this action?`,
    //       default: actionName,
    //       when: !this.options['skip-prompt'],
    //       validate (input) {
    //       // must be a valid openwhisk action name, this is a simplified set see:
    //       // https://github.com/apache/openwhisk/blob/master/docs/reference.md#entity-names
    //         const valid = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/
    //         if (valid.test(input)) {
    //           return true
    //         }
    //         return `'${input}' is not a valid action name, please use a name that matches "^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$"`
    //       }
    //     }
    //   ])
    //   actionName = promptProps.actionName
    // }

    return actionName
  }

  /**
   * Adds a new action to the project
   *
   * @param {string} actionName
   * @param {string} tplActionPath
   * @param {object} [options={}]
   * @param {object} [options.testFile]
   * @param {object} [options.e2eTestFile]
   * @param {object} [options.sharedLibFile]
   * @param {object} [options.sharedLibTestFile]
   * @param {object} [options.tplContext]
   * @param {object} [options.dotenvStub]
   * @param {string} options.dotenvStub.label
   * @param {Array<string>} options.dotenvStub.vars
   * @param {object} [options.dependencies]
   * @param {object} [options.devDependencies]
   * @param {object} [options.actionManifestConfig]
   * @memberof ActionGenerator
   */
  addAction (actionName, tplActionPath, options = {}) {
    options.tplContext = options.tplContext || {}
    const actionFolder = this.options['action-folder'] // todo ensure this is relative to root
    const extConfigPath = this.destinationPath(this.options['ext-config-path'])
    const runtimePackageName = path.basename(extConfigPath)
    const actionPath = path.join(actionFolder, actionName, 'index.js')

    this.writeTplAction(tplActionPath, actionPath, options.tplContext)

    this.writeActionRuntimeManifest(actionName, actionPath, extConfigPath, runtimePackageName, options.actionManifestConfig)
    if (options.testFile) {
      // this only works if action folder is relative
      const testDestPath = this.destinationPath('test', actionFolder, `${actionName}.test.js`)
      this.writeActionTest(options.testFile, testDestPath, actionPath, options.tplContext)
    }
    if (options.sharedLibFile) {
      this.fs.copyTpl(this.templatePath(options.sharedLibFile), this.destinationPath(path.join(actionFolder, path.basename(options.sharedLibFile))), options.tplContext)
    }
    if (options.sharedLibFile && options.sharedLibTestFile) {
      this.fs.copyTpl(this.templatePath(options.sharedLibTestFile), this.destinationPath('test', actionFolder, path.basename(options.sharedLibTestFile)), options.tplContext)
    }
    if (options.e2eTestFile) {
      // this only works if action folder is relative
      const testDestPath = this.destinationPath('e2e', actionFolder, `${actionName}.e2e.js`)
      this.writeActionE2ETest(options.e2eTestFile, testDestPath, options.tplContext)
    }
    if (options.dotenvStub) {
      this.appendStubVarsToDotenv(options.dotenvStub.label, options.dotenvStub.vars)
    }
    if (options.dependencies) {
      utils.addDependencies(this, options.dependencies)
    }
    // make sure wskdebug is there
    utils.addDependencies(this, { '@openwhisk/wskdebug': '^1.3.0', ...options.devDependencies }, true)
    // make sure the node engines are added
    this.addPackageJsonNodeEngines()
  }

  /** @private */
  getDefaultActionName (defaultActionName) {
    const manifestPath = this.destinationPath('manifest.yml')
    const manifest = this.loadRuntimeManifestConfig(manifestPath)
    let actionName = defaultActionName
    let defaultIndex = 1

    while (actionName in manifest.packages[manifestPackagePlaceholder].actions) {
      actionName = defaultActionName + '-' + defaultIndex
      defaultIndex++
    }
    return actionName
  }

  /** @private */
  writeTplAction (tplActionPath, destPath, tplContext) {
    // Note: other options of copyTpl (templateOptions && copyOptions) could be useful
    this.fs.copyTpl(this.templatePath(tplActionPath), destPath, tplContext, {}, {})
  }

  /** @private */
  writeActionRuntimeManifest (actionName, actionPath, extConfigPath, pkgName, actionManifestConfig = {}) {
    const extConfig = utils.readYAMLConfig(this, extConfigPath)
    const relativeActionPathToConfig = upath.toUnix(path.relative(path.dirname(extConfigPath), actionPath))

    if (!extConfig.runtimeManifest) {
      // first action: must setup some fields
      extConfig.runtimeManifest = {
        packages: {
          [pkgName]: {
            license: 'Apache-2.0',
            actions: {}
          }
        }
      }
    }

    extConfig.runtimeManifest.packages[pkgName].actions[actionName] = {
      function: relativeActionPathToConfig,
      web: 'yes',
      runtime: 'nodejs:12',
      ...actionManifestConfig,
      annotations: { 'require-adobe-auth': true, ...actionManifestConfig.annotations }
    }

    utils.writeYAMLConfig(this, extConfigPath, extConfig)
  }

  /** @private */
  writeActionTest (tplActionTest, testDestPath, actionPath, tplContext) {
    // enriches tplContext with actionRelPath to be required from test file
    tplContext = { actionRelPath: upath.toUnix(path.relative(path.dirname(testDestPath), actionPath)), ...tplContext }
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  /** @private */
  writeActionE2ETest (tplActionTest, testDestPath, tplContext) {
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  /** @private */
  appendStubVarsToDotenv (label, vars) {
    const content = `## ${label}${EOL}${vars.map(v => `#${v}=`).join(EOL)}${EOL}`
    utils.appendOrWrite(this, this.destinationPath(dotenvFilename), content, label)
  }

  /** @private */
  addPackageJsonNodeEngines () {
    const content = utils.readPackageJson(this)
    const engines = content.engines || {}
    if (!engines.node) {
      // do not overwrite existing node engines
      engines.node = '^10 || ^12'
      utils.writePackageJson(this, { ...content, engines })
    }
  }
}

module.exports = ActionGenerator
