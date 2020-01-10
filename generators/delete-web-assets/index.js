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

const { webAssetsDirname } = require('../../lib/constants')

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

class DeleteWebAssets extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })

    this.webAssetsPath = this.destinationPath(webAssetsDirname)
  }

  initializing () {
    if (!fs.existsSync(this.webAssetsPath)) throw new Error('you have no webAssets in your project')
  }

  async end () {
    const resConfirm = await this.prompt([
      {
        type: 'confirm',
        name: 'deleteWebAssets',
        message: `Please confirm the deletion of all your web assets in '${this.webAssetsPath}'`,
        when: !this.options['skip-prompt']
      }
    ])
    if (this.options['skip-prompt'] || resConfirm.deleteWebAssets) {
      this.log('> deleting web assets, please make sure to cleanup associated dependencies and configurations yourself')

      fs.removeSync(this.webAssetsPath)
    }
  }
}

module.exports = DeleteWebAssets
