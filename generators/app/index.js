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

const { dotenvFilename } = require('../../lib/constants')

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

class CodeGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('adobe-services', { type: String, default: '' })
    this.option('project-name', { type: String, default: path.basename(process.cwd()) }) // todo get name from console

    // props are passed to templates
    this.props = {}
    this.props.projectName = this.options['project-name']
  }

  async prompting () {
    this.log(`Generating code in: ${this.destinationPath()}`)

    const atLeastOne = input => {
      if (input.length === 0) {
        // eslint-disable-next-line no-throw-literal
        return 'please choose at least one option'
      }
      return true
    }

    const res = await this.prompt([
      {
        type: 'checkbox',
        name: 'components',
        message: 'Which Adobe I/O App features do you want to enable for this project?\nselect components to include',
        choices: [
          {
            name: 'Actions: Deploy Runtime actions',
            value: 'actions',
            checked: true
          },
          {
            name: 'Web Assets: Deploy hosted static assets',
            value: 'webAssets',
            checked: true
          }
        ],
        when: !this.options['skip-prompt'],
        validate: atLeastOne
      }
    ])
    const addActions = res.components.includes('actions')
    const addWebAssets = res.components.includes('webAssets')

    // run add action and add ui generators when applicable
    if (addActions) {
      this.composeWith(path.join(__dirname, '../add-actions/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'project-name': this.options['project-name']
      })
    }
    if (addWebAssets) {
      this.composeWith(path.join(__dirname, '../add-web-assets/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'project-name': this.options['project-name']
      })
    }
  }

  writing () {
    this.sourceRoot(path.join(__dirname, './templates/'))
    // copy everything that does not start with an _
    this.fs.copyTpl(
        `${this.templatePath()}/**/!(_)*/`,
        this.destinationPath(),
        this.props
    )
    // the above excluded our strangely named .env file, lets fix it
    this.fs.copyTpl(
      this.templatePath('_dot.env'),
      this.destinationPath(dotenvFilename),
      this.props
    )
    // let actions and ui generator create subfolders + manifest
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message'
    if (!this.options['skip-install']) return this.installDependencies({ bower: false, skipMessage: true })
  }
}

module.exports = CodeGenerator
