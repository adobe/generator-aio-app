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

class AssetComputeGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {}
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('extends the Adobe Asset Compute service', 'worker')
  }

  writing () {
    this.sourceRoot(path.join(__dirname, './templates'))

    this.addAction(this.props.actionName, './_worker.js', {
      tplContext: this.props,
      dependencies: {
        '@adobe/asset-compute-sdk': '^2.2.1'
      },
      devDependencies: {
        '@adobe/aio-cli-plugin-asset-compute': '^1.4.1'
      },
      actionManifestConfig: {
        limits: {
          concurrency: 10
        },
        annotations: {
          'require-adobe-auth': true
        }
      }
    })

    const extFolder = path.dirname(this.configPath)

    // TODO add support in ActionGenerator for copying test folders instead of files
    const destTestFolder = this.destinationPath(extFolder, 'test', 'asset-compute', this.props.actionName)
    const workerTemplateTestFiles = `${this.templatePath()}/test/` // copy the rest of the worker template files
    this.fs.copyTpl(
      workerTemplateTestFiles,
      destTestFolder,
      this.props
    )
  }
}

module.exports = AssetComputeGenerator
