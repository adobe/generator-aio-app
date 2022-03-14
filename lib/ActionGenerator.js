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

const Generator = require('yeoman-generator')
const utils = require('./utils')

class ActionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.option('skip-prompt', { default: false }) // prompt to ask action name
    // required
    this.option('action-folder', { type: String })
    this.option('config-path', { type: String })
    this.option('full-key-to-manifest', { type: String, default: '' }) // key in config path that resolves to manifest e.g. 'application.runtimeManifest'

    // path to store action and runtime config
    this.actionFolder = this.options['action-folder'] // todo ensure this is relative to root
    this.configPath = this.destinationPath(this.options['config-path'])
    this.fullKeyToManifest = this.options['full-key-to-manifest']
    // load manifest and package name
    this.defaultRuntimePackageName = path.basename(path.dirname(this.configPath)) // todo do better, allow to pass in package name ?
  }

  async promptForActionName (actionPurpose, defaultValue) {
    const { runtimeManifest, runtimePackageName } = this.loadRuntimeManifest(this.configPath, this.fullKeyToManifest, this.defaultRuntimePackageName)
    let actionName = this.getDefaultActionName(defaultValue, runtimeManifest, runtimePackageName)
    if (!this.options['skip-prompt']) {
      const promptProps = await this.prompt([
        {
          type: 'input',
          name: 'actionName',
          message: `We are about to create a new sample action that ${actionPurpose}.\nHow would you like to name this action?`,
          default: actionName,
          when: !this.options['skip-prompt'],
          validate (input) {
          // must be a valid openwhisk action name, this is a simplified set see:
          // https://github.com/apache/openwhisk/blob/master/docs/reference.md#entity-names
            const valid = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/
            if (valid.test(input)) {
              return true
            }
            return `'${input}' is not a valid action name, please make sure that:
The name has at least 3 characters or less than 33 characters.            
The first character is an alphanumeric character.
The subsequent characters are alphanumeric.
The last character isn't a space.
Note: characters can only be split by '-'.
`
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
    // NOTE: it's important to load a fresh manifest now, as we do want to include the
    // latest written data (in case of add multiple actions concurrently)
    const { runtimeManifest, runtimePackageName } = this.loadRuntimeManifest(this.configPath, this.fullKeyToManifest, this.defaultRuntimePackageName)

    options.tplContext = options.tplContext || {}

    // relativeToRoot
    this.extRoot = path.dirname(this.configPath)
    this.actionPath = path.join(this.actionFolder, actionName, 'index.js')
    this.relativeActionPath = path.relative(path.dirname(this.configPath), this.actionPath)

    this.writeTplAction(tplActionPath, this.actionPath, options.tplContext)

    this.setRuntimeManifestAction(actionName, this.relativeActionPath, runtimeManifest, runtimePackageName, options.actionManifestConfig)
    this.writeRuntimeManifest(this.configPath, this.fullKeyToManifest, runtimeManifest)

    if (options.testFile) {
      // this only works if action folder is relative
      const testDestPath = this.destinationPath(this.extRoot, 'test', `${actionName}.test.js`)
      this.writeActionTest(options.testFile, testDestPath, this.actionPath, options.tplContext)
    }
    if (options.sharedLibFile) {
      // the sharedLibFile is always put in the root of this.actionFolder, this is important for sharedLibTestFile below
      const sharedLibFileDestPath = this.destinationPath(path.join(this.actionFolder, path.basename(options.sharedLibFile)))
      this.fs.copyTpl(this.templatePath(options.sharedLibFile), sharedLibFileDestPath, options.tplContext)

      if (options.sharedLibTestFile) {
        const sharedLibTestFileDestPath = this.destinationPath(this.extRoot, 'test', path.basename(options.sharedLibTestFile))
        this.writeUtilsTest(options.sharedLibTestFile, sharedLibTestFileDestPath, sharedLibFileDestPath, options.tplContext)
      }
    }
    if (options.e2eTestFile) {
      // this only works if action folder is relative
      const testDestPath = this.destinationPath(this.extRoot, 'e2e', `${actionName}.e2e.test.js`)
      this.writeActionE2ETest(options.e2eTestFile, testDestPath, { runtimePackageName, ...options.tplContext })
    }
    if (options.dotenvStub) {
      utils.appendStubVarsToDotenv(this, options.dotenvStub.label, options.dotenvStub.vars)
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
  loadRuntimeManifest (configPath, fullKeyToManifest, defaultPkgName) {
    const config = utils.readYAMLConfig(this, configPath)
    const runtimeManifest = fullKeyToManifest.split('.').reduce((obj, k) => obj && obj[k], config) || {}

    let pkgName

    // setup pkg if none
    if (!runtimeManifest.packages || Object.keys(runtimeManifest.packages).length <= 0) {
      pkgName = defaultPkgName
      runtimeManifest.packages = {
        [pkgName]: {
          license: 'Apache-2.0',
          actions: {}
        }
      }
    }

    // else add to first package
    pkgName = Object.keys(runtimeManifest.packages)[0]

    return { runtimeManifest, runtimePackageName: pkgName }
  }

  /** @private */
  writeRuntimeManifest (configPath, fullKeyToManifest, runtimeManifest) {
    utils.writeKeyYAMLConfig(this, configPath, fullKeyToManifest, runtimeManifest)
  }

  /** @private */
  setRuntimeManifestAction (actionName, relActionPath, runtimeManifest, pkgName, actionManifestConfig = {}) {
    // in place
    relActionPath = upath.toUnix(relActionPath) // relative to config File
    runtimeManifest.packages[pkgName].actions[actionName] = {
      function: relActionPath,
      web: 'yes',
      runtime: 'nodejs:14',
      ...actionManifestConfig,
      annotations: { 'require-adobe-auth': true, ...actionManifestConfig.annotations }
    }
    return runtimeManifest
  }

  /** @private */
  getDefaultActionName (defaultActionNameBase, runtimeManifest, pkgName) {
    let actionName = defaultActionNameBase
    let defaultIndex = 1

    while (actionName in runtimeManifest.packages[pkgName].actions) {
      actionName = defaultActionNameBase + '-' + defaultIndex
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
  writeActionTest (tplActionTest, testDestPath, actionPath, tplContext) {
    // enriches tplContext with actionRelPath to be required from test file
    tplContext = { actionRelPath: upath.toUnix(path.relative(path.dirname(testDestPath), actionPath)), ...tplContext }
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  /** @private */
  writeUtilsTest (tplUtilsTest, testDestPath, utilsPath, tplContext) {
    // enriches tplContext with utilsRelPath to be required from test file
    tplContext = { utilsRelPath: upath.toUnix(path.relative(path.dirname(testDestPath), utilsPath)), ...tplContext }
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplUtilsTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  /** @private */
  writeActionE2ETest (tplActionTest, testDestPath, tplContext) {
    // should we support other options of copyTpl (templateOptions && copyOptions) ?
    this.fs.copyTpl(this.templatePath(tplActionTest), testDestPath, tplContext, {}, {})

    return testDestPath
  }

  /** @private */
  addPackageJsonNodeEngines () {
    const content = utils.readPackageJson(this)
    const engines = content.engines || {}
    if (!engines.node) {
      // do not overwrite existing node engines
      engines.node = '^10 || ^12 || ^14'
      utils.writePackageJson(this, { ...content, engines })
    }
  }
}

module.exports = ActionGenerator
