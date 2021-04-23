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

const utils = require('../../../lib/utils')

const inquirer = require('inquirer')

const assetComputeGenerator = path.join(__dirname, '../../add-action/asset-compute/index.js')

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

class AemNuiV1 extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('skip-install', { type: String, default: false })
  }

  async initializing () {
    // all paths are relative to root
    this.extFolder = 'aem-nui-v1'
    this.actionFolder = path.join(this.extFolder, 'actions')
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')

    // generate the nui action
    this.composeWith(assetComputeGenerator, {
      // forward needed args
      'skip-prompt': this.options['skip-prompt'],
      'action-folder': this.actionFolder,
      'ext-config-path': this.extConfigPath
    })
  }

  async writing () {
    // 1. add the extension point config in root
    utils.writeExtensionPointConfig(
      this,
      'aem/nui/v1',
      {
        config: this.extConfigPath,
        operations: {
          // TODO opcode is still tbd
          worker: [
            // todo package name and action name have to be given to assetCompute action gen
            { type: 'headless', impl: 'aem-nui-v1/worker' }
          ]
        }
      }
    )
  }

  async prompting () {
    // no prompts for now

    // run selected generators
    actionGenerators.forEach(gen => this.composeWith(gen, {
      // forward needed args
      'skip-prompt': this.options['skip-prompt'],
      'action-folder': this.options['action-folder'],
      'ext-config-path': this.options['ext-config-path']
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

module.exports = AemNuiV1
