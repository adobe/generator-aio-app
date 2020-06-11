/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Generator = require('yeoman-generator')
const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')

const { manifestPackagePlaceholder, actionsDirname } = require('../../lib/constants')

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

class DeleteEvents extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('action-name', { type: String, default: '' })
  }

  initializing () {
    if (this.options['skip-prompt'] && !this.options['action-name']) {
      throw new Error('--skip-prompt option provided but missing --action-name')
    }

    this.manifestContent = fs.existsSync(this.destinationPath('manifest.yml')) && yaml.safeLoad(fs.readFileSync(this.destinationPath('manifest.yml')).toString())
    this.manifestActions = this.manifestContent && this.manifestContent.packages[manifestPackagePlaceholder].actions
    if (!this.manifestContent || Object.keys(this.manifestActions).length === 0) throw new Error('you have no actions in your project')
  }

  async prompting () {
    this.actionName = this.options['action-name']
    if (!this.actionName) {
      const resAction = await this.prompt([
        {
          type: 'list',
          name: 'actionName',
          message: 'Which action do you whish to delete from the project?\nselect action to delete',
          choices: Object.keys(this.manifestActions),
          when: !this.options['skip-prompt'] && !this.options['action-name']
        }
      ])
      this.actionName = resAction.actionName
    }

    if (!this.manifestActions[this.actionName]) {
      throw new Error(`action name '${this.actionName}' does not exist`)
    }
  }

  async end () {
    const resConfirm = await this.prompt([
      {
        type: 'confirm',
        name: 'deleteEventAction',
        message: `Please confirm the deletion of the event action '${this.actionName}' and all its source code`,
        when: !this.options['skip-prompt']
      }
    ])
    if (this.options['skip-prompt'] || resConfirm.deleteEventAction) {
      this.log(`> deleting action '${this.actionName}', please make sure to cleanup associated dependencies and configurations yourself`)

      this.actionPath = this.destinationPath(this.manifestActions[this.actionName].function)

      // todo how to do this using this.fs ?
      if (fs.statSync(this.actionPath).isFile()) this.actionPath = path.dirname(this.actionPath)

      fs.removeSync(this.actionPath) // will make user prompt for all files if not --force
      delete this.manifestActions[this.actionName]
      fs.writeFileSync(this.destinationPath('manifest.yml'), yaml.safeDump(this.manifestContent))

      fs.removeSync(this.destinationPath('e2e', actionsDirname, this.actionName + '.e2e.js')) // remove e2e test
      fs.removeSync(this.destinationPath('test', actionsDirname, this.actionName + '.test.js')) // remove unit test
    }
  }
}

module.exports = DeleteEvents
