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

const excPublishEventsGenerator = path.join(__dirname, 'publish-events/index.js')

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

    // todo throw meaningful error if add actions in a non existing project, but what defines a project?
  }

  async prompting () {
    const eventGenerator = excPublishEventsGenerator
    // default if skip-prompt = true

    // code for later -> as of now support only publish events
    // const eventGeneratorChoices = [{ name: 'Publish Cloud Events to Adobe I/O', value: path.join(__dirname, 'cloud-events/index.js') }]
    // if (!this.options['skip-prompt']) {
    // const promptProps = await this.prompt([
    //    {
    //      type: 'checkbox',
    //      name: 'eventGenerator',
    //      message: 'Select the type of integration with I/O Events to generate',
    //      choices: eventGeneratorChoices
    //        .filter(entry => !!entry.value),
    //      validate: atLeastOne
    //    }
    //  ])
    //  eventGenerator = promptProps.eventGenerator
    // }
    // eventGenerator.forEach(gen => this.composeWith(gen, {
    //  'skip-prompt': this.options['skip-prompt']
    // }))

    // run action generators
    this.composeWith(eventGenerator, this.options)
  }
}

module.exports = AddEvents
