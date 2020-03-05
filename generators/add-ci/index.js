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
const ActionGenerator = require('../../lib/ActionGenerator')
const { ciDirName } = require('../../lib/constants')

class CIGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {}

    this.ciPath = this.destinationPath(ciDirName)
    this.props.addCI = false
  }

  async prompting () {
    if (!this.options['skip-prompt']) {
      const resConfirm = await this.prompt([
        {
          type: 'confirm',
          name: 'addCI',
          message: `Please confirm the addition of CI files in '${this.ciPath}'`,
          when: !this.options['skip-prompt']
        }
      ])
      if (this.options['skip-prompt'] || resConfirm.addCI) {
        this.log('> adding CI')
        this.props.addCI = true
      }
    } else {
      this.props.addCI = true
    }
  }

  writing () {
    if (this.props.addCI) {
      this.sourceRoot(path.join(__dirname, './'))
      this.fs.copyTpl(
        this.templatePath(ciDirName),
        this.destinationPath(ciDirName),
        {}
      )
    }
  }
}

module.exports = CIGenerator
