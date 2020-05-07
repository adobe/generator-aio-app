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

const { atLeastOne } = require('../../lib/utils')

const { eventCodes } = require('../../lib/constants')

// we have one actions generator per service, an action generator could generate different types of actions
const eventCodeToActionGenerator = {
  [eventCodes.webhook]: path.join(__dirname, 'webhook/index.js'),
  [eventCodes.journal]: path.join(__dirname, 'journal/index.js'),
  [eventCodes.customEvents]: path.join(__dirname, 'custom-events/index.js')
}

const eventCodeToTitle = {
  [eventCodes.webhook]: 'Subscribe to Adobe Events via Webhook',
  [eventCodes.journal]: 'Subscribe to Adobe Events via Journaling API',
  [eventCodes.customEvents]: 'Publish Cloud Events to Adobe I/O'
}

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

class AddEvents extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('adobe-services', { type: String, default: '' })
    this.option('skip-install', { type: String, default: false })

    // todo throw meaningful error if add actions in a non existing project, but what defines a project?
  }

  async prompting () {
    const eventCodesList = [eventCodes.webhook, eventCodes.journal,
      eventCodes.customEvents]
    let eventGenerator = []
    // default if skip-prompt = true
    if (!this.options['skip-prompt']) {
      const promptProps = await this.prompt([
        {
          type: 'checkbox',
          name: 'eventGenerator',
          message: 'Select the type of integration with I/O Events to generate',
          choices: eventCodesList.map(s => ({
            name: eventCodeToTitle[s],
            value: eventCodeToActionGenerator[s]
          }))
            .filter(entry => !!entry.value),
          validate: atLeastOne
        }
      ])
      eventGenerator = promptProps.eventGenerator
    }

    // run action generators
    eventGenerator.forEach(gen => this.composeWith(gen, {
      'skip-prompt': this.options['skip-prompt']
    }))
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message' into parent generator
    if (!this.options['skip-install']) {
      return this.installDependencies(
        { bower: false })
    }
  }
}

module.exports = AddEvents
