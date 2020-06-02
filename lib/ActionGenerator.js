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

const yaml = require('js-yaml')
const path = require('path')
const upath = require('upath')
const { EOL } = require('os')

const Generator = require('yeoman-generator')

const { manifestPackagePlaceholder, dotenvFilename, actionsDirname } = require('./constants')

const utils = require('./utils')

class ActionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.option('skip-prompt', { default: false })
  }

  async promptForActionName (actionPurpose, defaultValue) {
    // todo check args

    let actionName = this._getDefaultActionName(defaultValue)
    if (!this.options['skip-prompt']) {
      const promptProps = await this.prompt([
        {
          type: 'input',
          name: 'actionName',
          message: `We are about to create a new sample action that ${actionPurpose}\nhow would you like to name this action?`,
          default: actionName,
          when: !this.options['skip-prompt'],
          validate (input) {
          // must be a valid openwhisk action name, this is a simplified set see:
          // https://github.com/apache/openwhisk/blob/master/docs/reference.md#entity-names
            const valid = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/
            if (valid.test(input)) {
              return true
            }
            return `'${input}' is not a valid action name, please use a name that matches "^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$"`
          }
        }
      ])
      actionName = promptProps.actionName
    }

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

    const destPath = this._writeTplAction(actionName, tplActionPath, options.tplContext)
    this._writeActionManifest(actionName, destPath, options.actionManifestConfig)
    if (options.testFile) {
      this._writeActionTest(actionName, options.testFile, destPath, options.tplContext)
    }
    if (options.sharedLibFile) {
      this.fs.copyTpl(this.templatePath(options.sharedLibFile), this.destinationPath(path.join(actionsDirname, path.basename(options.sharedLibFile))), options.tplContext)
    }
    if (options.sharedLibFile && options.sharedLibTestFile) {
      this.fs.copyTpl(this.templatePath(options.sharedLibTestFile), this.destinationPath('test', actionsDirname, path.basename(options.sharedLibTestFile)), options.tplContext)
    }
    if (options.e2eTestFile) {
      this._writeActionE2ETest(actionName, options.e2eTestFile, options.tplContext)
    }
    if (options.dotenvStub) this._appendStubVarsToDotenv(options.dotenvStub.label, options.dotenvStub.vars)
    if (options.dependencies) utils.addDependencies(this, options.dependencies)
    // make sure wskdebug is there
    utils.addDependencies(this, { '@openwhisk/wskdebug': '^1.2.0', ...options.devDependencies }, true)
  }

  _getDefaultActionName (defaultActionName) {
    const manifestPath = this.destinationPath('manifest.yml')
    const manifest = this._loadManifest(manifestPath)
    let actionName = defaultActionName
    let defaultIndex = 1

    while (actionName in manifest.packages[manifestPackagePlaceholder].actions) {
      actionName = defaultActionName + '-' + defaultIndex
      defaultIndex++
    }
    return actionName
  }

  _loadManifest (manifestPath) {
    if (!this.fs.exists(manifestPath)) {
      // stub manifest content
      return {
        packages: {
          [manifestPackagePlaceholder]: {
            license: 'Apache-2.0',
            actions: {}
          }
        }
      }
    } else {
      return yaml.safeLoad(this.fs.read(manifestPath))
    }
  }

  _writeTplAction (actionName, tplActionPath, tplContext) {
    // always actions/actionName/index.js
    // option for custom action destination path
    const actionDestinationPath = tplContext.actionDestPath ? tplContext.actionDestPath : this.destinationPath(actionsDirname, actionName, 'index.js')

    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionPath), actionDestinationPath, tplContext, {}, {})

    return actionDestinationPath
  }

  _writeActionManifest (actionName, actionPath, actionManifestConfig = {}) {
    const manifestPath = this.destinationPath('manifest.yml')
    const manifest = this._loadManifest(manifestPath)

    manifest.packages[manifestPackagePlaceholder].actions[actionName] = {
      function: path.relative(path.dirname(manifestPath), actionPath),
      web: 'yes',
      runtime: 'nodejs:10',
      ...actionManifestConfig,
      annotations: { 'require-adobe-auth': true, ...actionManifestConfig.annotations }
    }

    this.fs.write(manifestPath, yaml.safeDump(manifest))
  }

  _writeActionTest (actionName, tplActionTest, actionDestPath, tplContext) {
    // test/actions/actionName.test.js
    const testDestPath = this.destinationPath('test', actionsDirname, actionName + '.test.js')
    // enriches tplContext with actionRelPath to be required from test file
    // tplContext = { actionRelPath: path.relative(path.dirname(testDestPath), actionDestPath), ...tplContext }
    tplContext = { actionRelPath: upath.toUnix(path.relative(path.dirname(testDestPath), actionDestPath)), ...tplContext }
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  _writeActionE2ETest (actionName, tplActionTest, tplContext) {
    // test/actions/actionName.test.js
    const testDestPath = this.destinationPath('e2e', actionsDirname, actionName + '.e2e.js')
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  _appendStubVarsToDotenv (label, vars) {
    const content = `## ${label}${EOL}${vars.map(v => `#${v}=`).join(EOL)}${EOL}`
    utils.appendOrWrite(this, this.destinationPath(dotenvFilename), content, label)
  }
}

module.exports = ActionGenerator
