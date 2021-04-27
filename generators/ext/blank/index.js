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

class Blank extends Generator {
  async initializing () {
    // all paths are relative to root
    this.extFolder = 'default'
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')
  }

  async writing () {
    // add the extension point config in root
    utils.writeKeyAppConfig(this, 'default', { config: this.extConfigPath })

    // add default path to actions and web src, not required but gives some information to
    // the user and creates the basic path structure
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'actions', './actions/')
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'web-src', './web-src/')
  }
}

module.exports = Blank
