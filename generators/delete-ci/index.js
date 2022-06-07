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

const Generator = require('yeoman-generator')
const fs = require('fs-extra')

const { constants } = require('@adobe/generator-app-common-lib')
const { ciDirName } = constants
const DEPLOY_PROD_FILENAME = '/workflows/deploy_prod.yml'
const DEPLOY_STAGE_FILENAME = '/workflows/deploy_stage.yml'
const TEST_PR_FILENAME = '/workflows/pr_test.yml'

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

class DeleteCI extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.ciPath = this.destinationPath(ciDirName)
  }

  initializing () {
    if (!fs.existsSync(this.ciPath)) throw new Error('you have no CI in your project')
  }

  async end () {
    const resConfirm = await this.prompt([
      {
        type: 'confirm',
        name: 'deleteCI',
        message: `Please confirm the deletion of all your CI files in '${this.ciPath}'`,
        when: !this.options['skip-prompt']
      }
    ])
    if (this.options['skip-prompt'] || resConfirm.deleteCI) {
      fs.removeSync(this.ciPath + DEPLOY_PROD_FILENAME)
      fs.removeSync(this.ciPath + DEPLOY_STAGE_FILENAME)
      fs.removeSync(this.ciPath + TEST_PR_FILENAME)
      this.log('✔ deleted CI files locally')
    }
  }
}

module.exports = DeleteCI
