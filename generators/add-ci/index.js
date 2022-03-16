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
const { constants } = require('@adobe/generator-app-common-lib')
const { ciDirName } = constants

class CIGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {}

    this.ciPath = this.destinationPath(ciDirName)
    this.props.addCI = false
    this.option('skip-prompt', { default: false })
  }

  writing () {
    this.sourceRoot(path.join(__dirname, './'))
    this.fs.copyTpl(
      this.templatePath(ciDirName),
      this.destinationPath(ciDirName),
      {}
    )
  }
}

module.exports = CIGenerator
