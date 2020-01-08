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

const { atLeastOne, guessProjectName } = require('../../lib/utils')

const rawWebAssetsGenerator = path.join(__dirname, 'raw/index.js')
const excReactWebAssetsGenerator = path.join(__dirname, 'exc-react/index.js')

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

class AddWebAssets extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('adobe-services', { type: String, default: '' }) // todo use real sdkCodes from console

    this.option('project-name', { type: String, default: guessProjectName(this) }) // project name is used in html template
    this.option('skip-install', { type: String, default: false })

    // todo throw meaningful error if add actions/webassets in a non existing project, but how to know if we are in a project?
  }

  async prompting () {
    let webAssetsGenerator = excReactWebAssetsGenerator
    if (!this.options['skip-prompt']) {
      const promptProps = await this.prompt([
        {
          // for now we just have one webAsset generator
          type: 'list',
          name: 'webAssetsGenerator',
          message: 'Which type of UI do you want to add to your project?\nselect template to generate',
          choices: [{ name: 'Exc Shell React', value: excReactWebAssetsGenerator }, { name: 'Raw HTML/JS', value: rawWebAssetsGenerator }],
          validate: atLeastOne
        }
      ])
      webAssetsGenerator = promptProps.webAssetsGenerator
    }

    // run ui generator
    this.composeWith(webAssetsGenerator, {
      'skip-prompt': this.options['skip-prompt'],
      'adobe-services': this.options['adobe-services'],
      'project-name': this.options['project-name']
    })
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message' into parent generator
    if (!this.options['skip-install']) return this.installDependencies({ bower: false })
  }
}

module.exports = AddWebAssets
