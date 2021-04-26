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
const Generator = require('yeoman-generator')

const utils = require('../../../lib/utils')

class RawGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.option('web-src-folder', { type: String })
    this.option('skip-install', { type: Boolean, default: false })
    this.option('ext-config-path', { type: String })
    // props are used by templates
    this.props = {}
    this.props.projectName = this.options['project-name']
  }

  // nothing for now
  // async prompting () {}

  writing () {
    const destFolder = this.options['web-src-folder']
    this.sourceRoot(path.join(__dirname, './templates/'))
    this.fs.copyTpl(this.templatePath('./**/*'), this.destinationPath(destFolder), this.props)

    utils.addDependencies(this, {
      'regenerator-runtime': '^0.13.5',
      '@adobe/exc-app': '^0.2.17'
    })
  }
}

module.exports = RawGenerator
