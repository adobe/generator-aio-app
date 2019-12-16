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

// todo use real sdkCodes from console
const sdkCodeToActionGenerator = {
  target: path.join(__dirname, '../actions/target/index.js'),
  analytics: path.join(__dirname, '../actions/analytics/index.js'),
  campaign: path.join(__dirname, '../actions/campaign-standard/index.js')
}

const sdkCodeToTitle = {
  target: 'Adobe Target',
  analytics: 'Adobe Analytics',
  campaign: 'Adobe Campaign Standard'
}

const genericActionGenerator = path.join(__dirname, '../actions/generic/index.js')
const rawWebAssetsGenerator = path.join(__dirname, '../web-assets/raw/index.js')

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
    this.option('adobe-services', { type: String, default: 'target,analytics,campaign' }) // todo use real sdkCodes from console

    this.option('project-root', { type: String, default: process.cwd() })
    this.option('project-name', { type: String, default: path.basename(this.options['project-root']) }) // todo get name from console

    this.option('mode', { type: String, default: 'init' })
    const validFeatures = ['init', 'add-actions', 'add-web-assets']
    if (!validFeatures.includes(this.options.mode)) {
      throw new Error(`'${this.options.mode}' is not a valid mode, please provide one of '${validFeatures}'`)
    }

    // todo throw meaningful error if add actions/webassets in a non existing project, but how to know if we are in a project?

    this.destinationRoot(this.options['project-root'])

    // for convenience
    this.mode = this.options.mode

    // props are passed to templates
    this.props = {}
    this.props.projectName = this.options['project-name']
  }

  async prompting () {
    this.log(`Code generation
You are about to initialize the project '${this.options['project-name']}' in this directory:
  ${this.destinationPath()}`)

    const showPrompt = !this.options['skip-prompt']

    const atLeastOne = input => {
      if (input.length === 0) {
        // eslint-disable-next-line no-throw-literal
        return 'please choose at least one option'
      }
      return true
    }

    let addActions = this.mode === 'add-actions'
    let addWebAssets = this.mode === 'add-web-assets'

    if (this.mode === 'init') {
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
          when: showPrompt,
          validate: atLeastOne
        }
      ])
      addActions = res.components.includes('actions')
      addWebAssets = res.components.includes('webAssets')
    }

    const prompts = [
      {
        type: 'checkbox',
        name: 'actionGenerators',
        message: 'Which type of sample actions do you want to create?\nselect type of actions to generate',
        choices: [{ type: 'separator', line: '--service specific--' }]
          .concat(
            this.options['adobe-services'].split(',').map(x => x.trim())
              .map(s => ({ name: sdkCodeToTitle[s], value: sdkCodeToActionGenerator[s] }))
              .filter(entry => !!entry.value)
              .concat([
                { type: 'separator', line: '--others--' },
                { name: 'Generic', value: genericActionGenerator, checked: true }
              ])),
        when: showPrompt && addActions,
        validate: atLeastOne
      },
      {
        // for now we just have one webAsset generator
        type: 'checkbox',
        name: 'webAssetsGenerator',
        message: 'Which type of UI do you want to add to your project?\nselect template to generate',
        choices: [{ name: 'Raw HTML/JS', value: rawWebAssetsGenerator, checked: true }],
        when: showPrompt && addWebAssets,
        validate: atLeastOne
      }
    ]
    const promptProps = await this.prompt(prompts)
    // defaults for when skip-prompt is set
    promptProps.actionGenerators = promptProps.actionGenerators || [genericActionGenerator]
    promptProps.webAssetsGenerator = promptProps.webAssetsGenerator || [rawWebAssetsGenerator]

    // run action and ui generators when applicable
    if (addActions) {
      promptProps.actionGenerators.forEach(gen => this.composeWith(gen, {
        'skip-prompt': this.options['skip-prompt'],
        'actions-dir': 'actions'
      }))
    }
    if (addWebAssets) {
      this.composeWith(rawWebAssetsGenerator, {
        'skip-prompt': this.options['skip-prompt'],
        'web-dir': 'web-src',
        'adobe-services': this.options['adobe-services'],
        'project-name': this.options['project-name']
      })
    }
  }

  writing () {
    this.sourceRoot(path.join(__dirname, './templates/'))
    if (this.options.mode === 'init') {
      // copy everything that does not start with an _
      this.fs.copyTpl(
        `${this.templatePath()}/**/!(_)*/`,
        this.destinationPath(),
        this.props
      )

      // the above excluded our strangely named .env file, lets fix it
      this.fs.copyTpl(
        this.templatePath('_dot.env'),
        this.destinationPath('.env'),
        this.props
      )
    }
    // let actions and ui generator create subfolders + manifest
  }

  async install () {
    if (this.props.skipPrompt) {
      return this.installDependencies({ bower: false })
    }
    const prompts = [{
      name: 'installDeps',
      message: 'npm install dependencies now?',
      type: 'confirm',
      default: true
    }]
    return this.prompt(prompts).then(props => {
      if (props.installDeps) {
        return this.installDependencies({ bower: false })
      }
    })
  }
}

module.exports = CodeGenerator
