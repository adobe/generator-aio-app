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

const assetComputeActionGenerator = path.join(__dirname, '../../add-action/asset-compute/index.js')

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

class DxAssetComputeWorker1 extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
  }

  async initializing () {
    // all paths are relative to root
    this.extFolder = 'src/dx-asset-compute-worker-1'
    this.actionFolder = path.join(this.extFolder, 'actions')
    this.extConfigPath = path.join(this.extFolder, 'ext.config.yaml')

    // generate the nui action
    this.composeWith(assetComputeActionGenerator, {
      // forward needed args
      'skip-prompt': true, // do not prompt for action name
      'action-folder': this.actionFolder,
      'config-path': this.extConfigPath
    })
  }

  async writing () {
    // add the extension point config in root
    utils.writeKeyAppConfig(
      this,
      // key
      'extensions.dx/asset-compute/worker/1',
      // value
      {
        $include: this.extConfigPath
      }
    )

    // add required dotenv vars
    utils.appendStubVarsToDotenv(
      this,
      'please provide the following environment variables for the Asset Compute devtool. You can use AWS or Azure, not both:',
      [
        'ASSET_COMPUTE_PRIVATE_KEY_FILE_PATH',
        'S3_BUCKET',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'AZURE_STORAGE_ACCOUNT',
        'AZURE_STORAGE_KEY',
        'AZURE_STORAGE_CONTAINER_NAME'
      ]
    )

    // add extension point operation
    utils.writeKeyYAMLConfig(
      this,
      this.extConfigPath,
      // key
      'operations', {
        // TODO opcode is still tbd
        worker: [
          // todo package name and action name have to be given to assetCompute action gen
          { type: 'action', impl: 'dx-asset-compute-worker-1/worker' }
        ]
      }
    )

    // add hooks to ext config
    utils.writeKeyYAMLConfig(
      this,
      this.extConfigPath,
      // key
      'hooks',
      // value
      {
        'post-app-run': 'adobe-asset-compute devtool'
      }
    )

    // add actions path, relative to root
    utils.writeKeyYAMLConfig(this, this.extConfigPath, 'actions', this.actionFolder)

    // add test command
    // TODO NUI NEEDS TO OVERWRITE TEST SCRIPT... let's have a hook ?
    // todo here we assume the test script is set already
    const packagejson = utils.readPackageJson(this)
    packagejson.scripts.test = packagejson.scripts.test.concat(' && adobe-asset-compute test-worker')
    utils.writePackageJson(this, packagejson)

    // TODO add .npmignore and readme
  }
}

module.exports = DxAssetComputeWorker1
