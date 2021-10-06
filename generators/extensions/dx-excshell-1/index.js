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
const Generator = require('yeoman-generator')
const { runtimeManifestKey } = require('../../../lib/constants')
const upath = require('upath')

const utils = require('../../../lib/utils')

const genericActionGenerator = path.join(__dirname, '../../add-action/generic/index.js')
const excReactWebAssetsGenerator = path.join(__dirname, '../../add-web-assets/exc-react/index.js')
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

class DxExcshell1 extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
  }

  async initializing () {
    // all paths are relative to root
    this.extFolder = 'src/dx-excshell-1'
    this.actionFolder = path.join(this.extFolder, 'actions')
    // todo support multi UI (could be one for each operation)
    this.webSrcFolder = path.join(this.extFolder, 'web-src')
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')
    this.configName = 'dx/excshell/1'

    // generate the generic action
    this.composeWith(genericActionGenerator, {
      // forward needed args
      'skip-prompt': true, // do not ask for action name
      'action-folder': this.actionFolder,
      'config-path': this.extConfigPath,
      'full-key-to-manifest': runtimeManifestKey
    })

    // generate the UI
    this.composeWith(excReactWebAssetsGenerator, {
      // forward needed args
      'skip-prompt': this.options['skip-prompt'],
      'web-src-folder': this.webSrcFolder,
      'config-path': this.extConfigPath
    })
  }

  async writing () {
    const unixExtConfigPath = upath.toUnix(this.extConfigPath)
    // add the extension point config in root
    utils.writeKeyAppConfig(
      this,
      // key
      'extensions.' + this.configName,
      // value
      {
        // posix separator

        $include: unixExtConfigPath
      }
    )

    // add extension point operation
    utils.writeKeyYAMLConfig(
      this,
      this.extConfigPath,
      // key
      'operations', {
        view: [
          { type: 'web', impl: 'index.html' }
        ]
      }
    )

    // add actions path, relative to config file
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'actions', path.relative(this.extFolder, this.actionFolder))
    // add web-src path, relative to config file
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'web', path.relative(this.extFolder, this.webSrcFolder))
  }
}

module.exports = DxExcshell1
