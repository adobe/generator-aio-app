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
const fs = require('fs-extra')

const { utils } = require('@adobe/generator-app-common-lib')
const { addWebAssets: { excReact } } = require('@adobe/generator-app-excshell')

const rawWebAssetsGenerator = path.join(__dirname, 'raw/index.js')
const excReactWebAssetsGenerator = excReact

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

    // required
    // todo throw error on missing
    this.option('web-src-folder', { type: String })

    this.option('skip-prompt', { default: false })
    this.option('adobe-services', { type: String, default: '' })

    this.option('project-name', { type: String, default: utils.guessProjectName(this) }) // project name is used in html template

    this.webSrcFolder = this.destinationPath(this.options['web-src-folder'])
    // throw meaningful error if add actions/webassets in a non existing project
  }

  initializing () {
    if (fs.existsSync(this.webSrcFolder)) {
      throw new Error('you already have web assets in your project, please delete first')
    }
  }

  async prompting () {
    if (!this.options['skip-prompt']) {
      const promptProps = await this.prompt([
        {
          type: 'list',
          name: 'webAssetsGenerator',
          message: 'Which type of UI do you want to add to your project?\nselect template to generate',
          choices: [
            {
              name: 'React Spectrum 3',
              value: excReactWebAssetsGenerator
            },
            {
              name: 'Pure HTML/JS',
              value: rawWebAssetsGenerator
            }
          ],
          validate: utils.atLeastOne
        }
      ])
      this.composeWith(promptProps.webAssetsGenerator, this.options)
    } else {
      // default template
      this.composeWith(excReactWebAssetsGenerator, this.options)
    }
  }
}

module.exports = AddWebAssets
