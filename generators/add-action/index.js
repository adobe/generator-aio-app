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

const { actionsDirname } = require('../../lib/constants')

// we have one actions generator per service, an action generator could generate different types of actions
// todo use real sdkCodes from console
const sdkCodeToActionGenerator = {
  target: path.join(__dirname, 'target/index.js'),
  analytics: path.join(__dirname, 'analytics/index.js'),
  'campaign-standard': path.join(__dirname, 'campaign-standard/index.js')
}

const sdkCodeToTitle = {
  target: 'Adobe Target',
  analytics: 'Adobe Analytics',
  'campaign-standard': 'Adobe Campaign Standard'
}

const genericActionGenerator = path.join(__dirname, 'generic/index.js')

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

class AddActions extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('adobe-services', { type: String, default: '' })

    this.option('project-name', { type: String, default: path.basename(process.cwd()) }) // todo get name from console

    // todo throw meaningful error if add actions in a non existing project, but what defines a project?
  }

  async prompting () {
    const atLeastOne = input => {
      if (input.length === 0) {
        // eslint-disable-next-line no-throw-literal
        return 'please choose at least one option'
      }
      return true
    }
    const prompts = [
      {
        type: 'checkbox',
        name: 'actionGenerators',
        message: 'Which type of sample actions do you want to create?\nselect type of actions to generate',
        choices: this.options['adobe-services'].split(',').map(x => x.trim())
          .map(s => ({ name: sdkCodeToTitle[s], value: sdkCodeToActionGenerator[s] }))
          .filter(entry => !!entry.value)
          .concat([
            { name: 'Generic', value: genericActionGenerator, checked: true }
          ]),
        when: !this.options['skip-prompt'],
        validate: atLeastOne
      }
    ]
    const promptProps = await this.prompt(prompts)
    // defaults for when skip-prompt is set
    promptProps.actionGenerators = promptProps.actionGenerators || [genericActionGenerator]

    // run action generators
    promptProps.actionGenerators.forEach(gen => this.composeWith(gen, {
      'skip-prompt': this.options['skip-prompt'],
      'actions-dir': actionsDirname
    }))
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message' into parent generator
    if (!this.options['skip-install']) return this.installDependencies({ bower: false })
  }
}

module.exports = AddActions
