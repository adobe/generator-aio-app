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

const Generator = require('yeoman-generator')

const { manifestPackagePlaceholder, manifestFilename, dotenvFilename, packagejsonFilename } = require('./constants')

class ActionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.argument('actions-dir', { type: String, required: true })
    this.option('skip-prompt', { default: false })
  }

  async promptForActionName (actionPurpose, defaultValue) {
    // todo check args

    const promptProps = await this.prompt([
      {
        type: 'input',
        name: 'actionName',
        message: `We are about to create a new sample action that ${actionPurpose}\nhow would you like to name this action?`,
        default: defaultValue,
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
    const actionName = (promptProps && promptProps.actionName) || defaultValue
    return actionName
  }

  /**
   * Adds a new action to the project
   *
   * @param {string} actionName
   * @param {string} tplActionPath
   * @param {object} [options={}]
   * @param {object} [options.testFile]
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
    // todo check args

    const destPath = this._writeTplAction(actionName, tplActionPath, options.tplContext)
    this._writeActionManifest(actionName, destPath, options.actionManifestConfig)
    if (options.testFile) {
      this._writeActionTest(actionName, options.testFile, destPath, options.tplContext)
    }
    if (options.dotenvStub) this._appendStubVarsToDotenv(options.dotenvStub.label, options.dotenvStub.vars)
    if (options.dependencies) this._addDependencies(options.dependencies)
    // make sure wskdebug is there
    this._addDependencies({ '@adobe/wskdebug': '^1.1.0', ...options.devDependencies }, true)
  }

  _writeTplAction (actionName, tplActionPath, tplContext = {}) {
    // always actions/actionName/index.js
    const actionDestinationPath = this.destinationPath(this.options['actions-dir'], actionName, 'index.js')

    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionPath), actionDestinationPath, tplContext, {}, {})

    return actionDestinationPath
  }

  _writeActionManifest (actionName, actionPath, actionManifestConfig = {}) {
    const manifestPath = this.destinationPath(manifestFilename)
    let manifest
    if (!this.fs.exists(manifestPath)) {
      // stub manifest content
      manifest = {
        packages: {
          [manifestPackagePlaceholder]: {
            license: 'Apache-2.0',
            actions: {}
          }
        }
      }
    } else {
      manifest = yaml.safeLoad(this.fs.read(manifestPath))
    }

    manifest.packages[manifestPackagePlaceholder].actions[actionName] = {
      function: path.relative(path.dirname(manifestPath), actionPath),
      web: 'yes',
      runtime: 'nodejs:10',
      ...actionManifestConfig
    }

    this.fs.write(manifestPath, yaml.safeDump(manifest))
  }

  _writeActionTest (actionName, tplActionTest, actionDestPath, tplContext = {}) {
    // test/actions/actionName.test.js
    const testDestPath = this.destinationPath('test', this.options['actions-dir'], actionName + '.test.js')
    // enriches tplContext with actionRelPath to be required from test file
    tplContext = { actionRelPath: path.relative(path.dirname(testDestPath), actionDestPath), ...tplContext }
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  _appendStubVarsToDotenv (label, vars) {
    let dotenv = this.fs.read(this.destinationPath(dotenvFilename))
    if (dotenv.includes(`## ${label}\n`)) return
    let dotenvSection = `## ${label}\n`
    vars.forEach(v => {
      dotenvSection += `#${v}=\n`
    })
    dotenv += `\n${dotenvSection}`
    this.fs.write(this.destinationPath(dotenvFilename), dotenv)
  }

  _addDependencies (deps, dev = false) {
    // todo check for conflicting versions with already added dependencies
    const packagejsonPath = this.destinationPath(packagejsonFilename)
    const packagejsonContent = this.fs.readJSON(packagejsonPath)
    const key = dev ? 'devDependencies' : 'dependencies'
    packagejsonContent[key] = { ...packagejsonContent[key], ...deps }
    this.fs.writeJSON(packagejsonPath, packagejsonContent)
  }
}

module.exports = ActionGenerator
