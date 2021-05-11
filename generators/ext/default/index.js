/*
Copyright 2021 Adobe. All rights reserved.
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

const { isLoopingPrompts } = require('../../../lib/constants')
const utils = require('../../../lib/utils')

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

class Default extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.option('supported-adobe-services', { type: String, default: '' })
    this.option('adobe-services', { type: String, default: '' })

    this.option('skip-prompt', { default: false })
    this.option('skip-install', { type: String, default: false })

    this.options['project-name'] = utils.guessProjectName(this)
  }

  async initializing () {
    // all paths are relative to root
    this.extFolder = ''
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')
    this.actionFolder = path.join(this.extFolder, 'actions')
    this.webSrcFolder = path.join(this.extFolder, 'web-src')
  }

  async writing () {
    // add the extension point config in root
    utils.writeKeyAppConfig(this, 'extensionPoints.blank', { config: this.extConfigPath })

    // add default path to actions and web src, not required but gives some information to
    // the user and creates the basic path structure
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'actions', this.actionFolder)
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'web-src', this.webSrcFolder)
  }

  async composeWithAddGenerators () {
    let components = ['actions', 'events', 'webAssets'] // defaults when skip prompt
    if (!this.options['skip-prompt']) {
      const res = await this.prompt([
        {
          type: 'checkbox',
          name: 'components',
          message: 'Which Adobe I/O App features do you want to enable for this project?\nSelect components to include',
          loop: isLoopingPrompts,
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
          validate: utils.atLeastOne
        }
      ])
      components = res.components
    }
    const addActions = components.includes('actions')
    const addEvents = components.includes('events')
    const addWebAssets = components.includes('webAssets')
    const addCI = components.includes('ci')

    // TODO cleanup unecessary params in all generators
    // run add action and add ui generators when applicable
    if (addActions) {
      this.composeWith(path.join(__dirname, '../../add-action/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'supported-adobe-services': this.options['supported-adobe-services'],
        'action-folder': this.actionFolder,
        'ext-config-path': this.extConfigPath
      })
    }
    if (addEvents) {
      this.composeWith(path.join(__dirname, '../../add-events/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'action-folder': this.actionFolder,
        'ext-config-path': this.extConfigPath
      })
    }
    if (addWebAssets) {
      this.composeWith(path.join(__dirname, '../../add-web-assets/index.js'), {
        'skip-install': true,
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'project-name': this.options['project-name'],
        'has-backend': addActions || addEvents,
        'web-src-folder': this.webSrcFolder,
        'ext-config-path': this.extConfigPath
      })
    }
    if (addCI) {
      this.composeWith(path.join(__dirname, '../../add-ci/index.js'), {
        'skip-prompt': true
      })
    }
  }
}

module.exports = Default
