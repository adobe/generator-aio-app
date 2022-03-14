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

const { isLoopingPrompts, runtimeManifestKey } = require('../../lib/constants')
const utils = require('../../lib/utils')

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
// this generator creates files for an application `aio app init --no-extension`
class Application extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.option('supported-adobe-services', { type: String, default: '' })
    this.option('adobe-services', { type: String, default: '' })

    this.option('skip-prompt', { default: false })

    this.options['project-name'] = utils.guessProjectName(this)
  }

  async initializing () {
    // all paths are relative to root
    this.appFolder = '' // = root
    this.actionFolder = path.join(this.appFolder, 'actions')
    this.webSrcFolder = path.join(this.appFolder, 'web-src')
    this.configPath = path.join(this.appFolder, 'app.config.yaml')
    this.keyToManifest = 'application.' + runtimeManifestKey
  }

  async writing () {
    // add basic config to point to path, relative to config file
    utils.writeKeyAppConfig(this, 'application.actions', path.relative(this.appFolder, this.actionFolder))
    utils.writeKeyAppConfig(this, 'application.web', path.relative(this.appFolder, this.webSrcFolder))
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

    // TODO cleanup unecessary params in all generators
    // run add action and add ui generators when applicable
    if (addActions) {
      this.composeWith(path.join(__dirname, '../add-action/index.js'), {
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'supported-adobe-services': this.options['supported-adobe-services'],
        'action-folder': this.actionFolder,
        'config-path': this.configPath,
        'full-key-to-manifest': this.keyToManifest
      })
    }
    if (addEvents) {
      this.composeWith(path.join(__dirname, '../add-events/index.js'), {
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'action-folder': this.actionFolder,
        'config-path': this.configPath,
        'full-key-to-manifest': this.keyToManifest
      })
    }
    if (addWebAssets) {
      this.composeWith(path.join(__dirname, '../add-web-assets/index.js'), {
        'skip-prompt': this.options['skip-prompt'],
        'adobe-services': this.options['adobe-services'],
        'project-name': this.options['project-name'],
        'web-src-folder': this.webSrcFolder,
        'config-path': this.configPath
      })
    }
  }
}

module.exports = Application
