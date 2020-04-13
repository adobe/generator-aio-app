/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// #########################################################################################
// 3rd party template
// #########################################################################################

const path = require('path')
const ActionGenerator = require('../../../lib/ActionGenerator')
const GEN_DEBUG = false
const fse = require('fs-extra')

// Yeoman generator
// const Generator = require('yeoman-generator')

class AssetComputeGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {}
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('contains a template for a JavaScript Asset Compute worker', 'worker-example')
  }

  // updatePackageJSON () {
  //   const packagesJsonPath = path.join(__dirname, './templates/package.json')
  //   const packagesJson = fse.readJsonSync(packagesJsonPath)
  //   const packagesJsonOriginal = JSON.parse(JSON.stringify(packagesJson))
  //   console.log('.........................................')
  //   console.log('package.json:')
  //   console.log(packagesJson)
  //   console.log('.........................................')
  //   // packagesJson.name = this.props.actionName
  //   packagesJson.author = 'Author of ' + this.props.actionName
  //   packagesJson.scripts.test = 'jest; cd actions/' + this.props.actionName + '; aio nui test-worker'
  //   packagesJson.scripts.start = 'aio app deploy && aio asset-compute devtool'
  //   fse.writeJsonSync(packagesJsonPath, packagesJson)
  // }

  writing () {
    this.sourceRoot(path.join(__dirname, './templates'))
    // this.props.fullStruct = true;

    const fileToCopy = `${this.templatePath()}/**/!(_)*/`
    if (GEN_DEBUG) {
      console.log('.........................................')
      console.log('fileToCopy:')
      console.log(fileToCopy)
      console.log('.........................................')
    }


    this.addAction(this.props.actionName, './_worker.js', {
      tplContext: this.props,
      dependencies: {
        '@nui/library': '^19.0.0' // will be replaced with open sourced @adobe scope
      },
      devDependencies: {
        '@nui/eslint-config': '^1.0.4' // will be replaced with open sourced @adobe scope
      },
      dotenvStub: {
        label: 'please provide your Adobe IMS ORG_ID and CLIENT_ID',
        vars: [
          'ORG_ID',
          'CLIENT_ID'
        ]
      },
      actionManifestConfig: {
        // change variable inputs here e.g. NR
        inputs: { LOG_LEVEL: 'debug', companyId: '$ORG_ID', clientId: '$CLIENT_ID' },
        annotations: { final: true }
      }
    })

    // const dest = path.join(this.destinationPath(), 'actions', this.props.actionName);
    // const dest = path.join(this.destinationPath(), 'actions', packagesJson.name)
    // if (GEN_DEBUG) {
    //   console.log('.................................')
    //   console.log(dest)
    //   console.log('.................................')
    // }
    // this.fs.copyTpl(
    //   fileToCopy,
    //   dest,
    //   this.props
    // )

    // fse.writeJsonSync(packagesJsonPath, packagesJsonOriginal)
  }
}

module.exports = AssetComputeGenerator
