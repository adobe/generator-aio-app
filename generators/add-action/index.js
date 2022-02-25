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

const { sdkCodes, isLoopingPrompts } = require('../../lib/constants')

const inquirer = require('inquirer')

// we have one actions generator per service, an action generator could generate different types of actions
const sdkCodeToActionGenerator = {
  [sdkCodes.target]: path.join(__dirname, 'target/index.js'),
  [sdkCodes.analytics]: path.join(__dirname, 'analytics/index.js'),
  [sdkCodes.campaign]: path.join(__dirname, 'campaign-standard/index.js'),
  [sdkCodes.assetCompute]: path.join(__dirname, 'asset-compute/index.js'),
  [sdkCodes.customerProfile]: path.join(__dirname, 'customer-profile/index.js'),
  [sdkCodes.audienceManagerCD]: path.join(__dirname, 'audience-manager-cd/index.js'),
  [sdkCodes.AEMHeadlessClient]: path.join(__dirname, 'aem-headless-client/index.js')
}

const sdkCodeToTitle = {
  [sdkCodes.target]: 'Adobe Target',
  [sdkCodes.analytics]: 'Adobe Analytics',
  [sdkCodes.campaign]: 'Adobe Campaign Standard',
  [sdkCodes.assetCompute]: 'Adobe Asset Compute Worker',
  [sdkCodes.customerProfile]: 'Adobe Experience Platform: Realtime Customer Profile',
  [sdkCodes.audienceManagerCD]: 'Adobe Audience Manager: Customer Data',
  [sdkCodes.AEMHeadlessClient]: 'AEM Headless Client'
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

    // required
    this.option('action-folder', { type: String })
    this.option('config-path', { type: String })
    this.option('full-key-to-manifest', { type: String, default: '' }) // key in config path that resolves to manifest e.g. 'application.runtimeManifest'

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    /// Adobe services added to the Console Workspace
    this.option('adobe-services', { type: String, default: '' })
    /// Adobe services that are supported by the Org
    this.option('supported-adobe-services', { type: String, default: '' })
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
          loop: isLoopingPrompts,
          pageSize: choices.length,
          validate: atLeastOne
        }
      ])
      // retrieve selection
      actionGenerators = promptProps.actionGenerators
    }

    // run selected generators
    actionGenerators.forEach(gen => this.composeWith(gen, {
      // forward needed args
      'skip-prompt': this.options['skip-prompt'],
      'action-folder': this.options['action-folder'],
      'config-path': this.options['config-path'],
      'full-key-to-manifest': this.options['full-key-to-manifest']
    }))
  }
}

/**
 * helper
 *
 * @private
 **/
function getPromptChoices (adobeServicesOption, supportedAdobeServicesOption) {
  // helpers

  // converts and cleans input list string
  const cleanInputServices = (option) => option
    .split(',')
    .map(x => x.trim())
    .filter(s => sdkCodeToTitle[s]) // filter out sdkCodes for which we don't have a template for (or invalid ones)

  // converts a set of sdkCodes to a inquirer choice list
  const toChoices = (sdkCodeSet, checked = false) =>
    [...sdkCodeSet]
      .map(s => ({ name: sdkCodeToTitle[s], value: sdkCodeToActionGenerator[s], checked }))

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
    const addedServicesChoices = toChoices(addedSet, true)
    const choices = [
      new inquirer.Separator('-- supported templates for services added to this Adobe Developer Console Workspace --'),
      { name: 'Generic', value: genericActionGenerator, checked: addedServicesChoices.length <= 0 },
      ...addedServicesChoices
    ]
    if (supportedNotAddedSet.size > 0) {
      choices.push(
        new inquirer.Separator('-- templates supported by this Organization, corresponding services should be added to this Workspace in https://console.adobe.io/ --'),
        ...toChoices(supportedNotAddedSet)
      )
    }
    // else: means all supported services are already added to this Workspace
    if (remainingSet.size > 0) {
      choices.push(
        new inquirer.Separator('-- more templates for services not available to this Organization --'),
        ...toChoices(remainingSet)
      )
    }
    // else: means all services for which there is a template are already supported by this Organization
    return choices
  }
  /// case b. supported-adobe-services are not defined but adobe-services are defined
  ///         e.g. `aio app init --import console.json` with some services in workspace
  if (supportedSet.size <= 0 && addedSet.size > 0) {
    const addedServicesChoices = toChoices(addedSet, true)
    const choices = [
      new inquirer.Separator('-- supported templates for services added to this Adobe Developer Console Workspace --'),
      { name: 'Generic', value: genericActionGenerator, checked: addedServicesChoices.length <= 0 },
      ...addedServicesChoices
    ]
    if (remainingSet.size > 0) {
      choices.push(
        new inquirer.Separator('-- more templates, corresponding services, if available to this Organization, should be added to this Workspace in https://console.adobe.io/ --'),
        ...toChoices(remainingSet)
      )
    }
    // else: means all services for which there is a template are already added to this Workspace
    return choices
  }
  /// case c. no supported-adobe-services nor adobe-services
  ///         e.g. `aio app init --import` with no services in workspace or `aio app init --no-login`
  return [
    { name: 'Generic', value: genericActionGenerator, checked: true },
    new inquirer.Separator('-- Adobe service specific templates, corresponding services may have to be added to this Workspace in https://console.adobe.io/ --'),
    ...toChoices(remainingSet)
  ]
}

module.exports = AddActions
