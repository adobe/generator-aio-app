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

class FireflyExcshellV1 extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('skip-install', { type: String, default: false })

    // todo ensure the basic app structure is there already (packagejson at least)
  }

  async initializing () {
    // all paths are relative to root
    this.extFolder = 'firefly-excshell-v1'
    this.actionFolder = path.join(this.extFolder, 'actions')
    // todo support multi UI (could be one for each operation)
    this.webSrcFolder = path.join(this.extFolder, 'web-src')
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')

    // generate the generic action
    this.composeWith(genericActionGenerator, {
      // forward needed args
      'skip-prompt': this.options['skip-prompt'],
      'skip-install': this.options['skip-install'],
      'action-folder': this.actionFolder,
      'ext-config-path': this.extConfigPath
    })

    // generate the UI
    this.composeWith(excReactWebAssetsGenerator, {
      // forward needed args
      'skip-prompt': this.options['skip-prompt'],
      'skip-install': this.options['skip-install'],
      'web-src-folder': this.webSrcFolder,
      'ext-config-path': this.extConfigPath
    })
  }

  async writing () {
    // add the extension point config in root
    utils.writeKeyAppConfig(
      this,
      // key
      'extensionPoints.firefly/excshell/v1',
      // value
      {
        config: this.extConfigPath,
        operations: {
          view: [
            { type: 'spa' }
          ]
        }
      }
    )
  }

  async install () {
    if (!this.options['skip-install']) {
      return this.installDependencies({ bower: false })
    }
  }
}

module.exports = FireflyExcshellV1
