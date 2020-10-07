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

const { promptMaxChoices, promptLoop, dotenvFilename } = require('../../lib/constants')
const { atLeastOne } = require('../../lib/utils')
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
    this.option('project-name', { type: String, default: path.basename(process.cwd()) })
    this.option('skip-install', { type: String, default: false })
    /// Adobe services added to the Console Workspace
    this.option('adobe-services', { type: String, default: '' })
    /// Adobe services that are supported by the Org
    this.option('supported-adobe-services', { type: String, default: '' })

    // props are passed to templates
    this.props = {}
    this.props.projectName = this.options && this.options['project-name']
  }

  async prompting () {
    this.log(`Generating code in: ${this.destinationPath()}`)

    let components = ['actions', 'events', 'webAssets'] // defaults when skip prompt
    if (!this.options['skip-prompt']) {
      const res = await this.prompt([
        {
          type: 'checkbox',
          name: 'components',
          message: 'Which Adobe I/O App features do you want to enable for this project?\nSelect components to include',
          loop: promptLoop,
          pageSize: promptMaxChoices,
          choices: [
            {
              name: 'Actions: Deploy Runtime actions',
              value: 'actions',
              checked: true
            },
            {
              name: 'Events: Publish to Adobe I/O Events',
              value: 'events',
              checked: true
            },
            {
              name: 'Web Assets: Deploy hosted static assets',
              value: 'webAssets',
              checked: true
            },
            {
              name: 'CI/CD: Include GitHub Actions based workflows for Build, Test and Deploy',
              value: 'ci',
              checked: true
            }
          ],
          validate: atLeastOne
        }
      ])
      components = res.components
    }
    const addActions = components.includes('actions')
    const addEvents = components.includes('events')
    const addWebAssets = components.includes('webAssets')
    const addCI = components.includes('ci')

    // run add action and add ui generators when applicable
    if (addActions) {
      this.composeWith(path.join(__dirname, '../add-action/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'supported-adobe-services': this.options['supported-adobe-services']
      })
    }
    if (addEvents) {
      this.composeWith(path.join(__dirname, '../add-events/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services']
      })
    }
    if (addWebAssets) {
      this.composeWith(path.join(__dirname, '../add-web-assets/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'project-name': this.options['project-name'],
        'has-backend': addActions || addEvents
      })
    }
    if (addCI) {
      this.composeWith(path.join(__dirname, '../add-ci/index.js'), {
        'skip-prompt': true
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
    // todo create dotenv programmatically from required vars
    this.fs.copyTpl(
      this.templatePath('_dot.env'),
      this.destinationPath(dotenvFilename),
      this.props
    )
    // npm pack will not include .gitignore template files so we need to rename it
    // see https://github.com/npm/npm/issues/3763
    this.fs.copyTpl(
      this.templatePath('_dot.gitignore'),
      this.destinationPath('.gitignore'),
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
