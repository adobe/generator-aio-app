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

const { sdkCodes, promptLoop, promptMaxChoices } = require('../../lib/constants')

const inquirer = require('inquirer')

// we have one actions generator per service, an action generator could generate different types of actions
const sdkCodeToActionGenerator = {
  [sdkCodes.target]: path.join(__dirname, 'target/index.js'),
  [sdkCodes.analytics]: path.join(__dirname, 'analytics/index.js'),
  [sdkCodes.campaign]: path.join(__dirname, 'campaign-standard/index.js'),
  [sdkCodes.assetCompute]: path.join(__dirname, 'asset-compute/index.js'),
  [sdkCodes.customerProfile]: path.join(__dirname, 'customer-profile/index.js'),
  [sdkCodes.audienceManagerCD]: path.join(__dirname, 'audience-manager-cd/index.js')
}

const sdkCodeToTitle = {
  [sdkCodes.target]: 'Adobe Target',
  [sdkCodes.analytics]: 'Adobe Analytics',
  [sdkCodes.campaign]: 'Adobe Campaign Standard',
  [sdkCodes.assetCompute]: 'Adobe Asset Compute Worker',
  [sdkCodes.customerProfile]: 'Adobe Experience Platform: Realtime Customer Profile',
  [sdkCodes.audienceManagerCD]: 'Adobe Audience Manager: Customer Data'
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
    this.option('skip-install', { type: String, default: false })
    /// Adobe services added to the Console Workspace
    this.option('adobe-services', { type: String, default: '' })
    /// Adobe services that are supported by the Org
    this.option('supported-adobe-services', { type: String, default: '' })
    // todo throw meaningful error if add actions in a non existing project, but what defines a project?
  }

  async prompting () {
    // default if skip-prompt = true
    let actionGenerators = [genericActionGenerator]

    if (!this.options['skip-prompt']) {
      // get list of choices
      const choices = getPromptChoices(this.options['adobe-services'], this.options['supported-adobe-services'])
      // prompt for selection
      const promptProps = await this.prompt([
        {
          type: 'checkbox',
          name: 'actionGenerators',
          message: 'Which type of sample actions do you want to create?\nSelect type of actions to generate',
          choices,
          loop: promptLoop,
          pageSize: promptMaxChoices,
          validate: atLeastOne
        }
      ])
      // retrieve selection
      actionGenerators = promptProps.actionGenerators
    }

    // run selected generators
    actionGenerators.forEach(gen => this.composeWith(gen, {
      'skip-prompt': this.options['skip-prompt']
    }))
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message' into parent generator
    if (!this.options['skip-install']) {
      return this.installDependencies({ bower: false })
    }
  }
}

/**
 * helper
 *
 * @private
 **/
function getPromptChoices (adobeServicesOption, supportedAdobeServicesOption) {
  // helpers

  const cleanInputServices = (option) => option
    .split(',')
    .map(x => x.trim())
    .filter(s => s)

  const toChoices = (sdkCodeSet, checked = false) => [...sdkCodeSet]
    .map(s => ({ name: sdkCodeToTitle[s], value: sdkCodeToActionGenerator[s], checked }))
    .filter(e => !!e.value)

  // start
  // 1. define set of choices
  const supportedSet = new Set(cleanInputServices(supportedAdobeServicesOption))
  const addedSet = new Set(cleanInputServices(adobeServicesOption))
  const supportedNotAddedSet = new Set([...supportedSet].filter(s => !addedSet.has(s)))
  const remainingSet = new Set(Object.values(sdkCodes).filter(s => !supportedNotAddedSet.has(s) && !addedSet.has(s)))

  // 2. build the selection list
  /// case a. supported-services are defined
  ///         e.g. `aio app init` with login
  if (supportedSet.size > 0) {
    const choices = [
      new inquirer.Separator('-- supported templates for services added to the current Adobe I/O Console Workspace --'),
      { name: 'Generic', value: genericActionGenerator, checked: false },
      ...toChoices(addedSet, true),
      new inquirer.Separator('-- templates supported by the Organization, corresponding services should be added to this Workspace in https://console.adobe.io/ --'),
      ...toChoices(supportedNotAddedSet)
    ]
    if (remainingSet.size > 0) {
      choices.push(
        new inquirer.Separator('-- more templates for services not available to this Organization --'),
        ...toChoices(remainingSet)
      )
    }
    return choices
  }
  /// case b. supported-services is not defined but added-services is defined
  ///         e.g. `aio app init --import console.json` with some services in workspace
  if (supportedSet.size <= 0 && addedSet.size > 0) {
    const choices = [
      new inquirer.Separator('-- supported templates for services added to the current Adobe I/O Console Workspace --'),
      { name: 'Generic', value: genericActionGenerator, checked: false },
      ...toChoices(addedSet, true)
    ]
    if (remainingSet.size > 0) {
      choices.push(
        new inquirer.Separator('-- more templates, corresponding services, if available to the Organization, should be added to this Workspace in https://console.adobe.io/ --'),
        ...toChoices(remainingSet)
      )
    }
    return choices
  }
  /// case c. no supported-services nor added-services
  ///         e.g. `aio app init --import` with no services in workspace or `aio app init --no-login`
  return [
    { name: 'Generic', value: genericActionGenerator, checked: true },
    new inquirer.Separator('-- Adobe service specific templates, corresponding services may have to be added to the Console Workspace in https://console.adobe.io/ --'),
    ...toChoices(remainingSet)
  ]
}

module.exports = AddActions
