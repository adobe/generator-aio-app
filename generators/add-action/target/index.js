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
const ActionGenerator = require('../../../lib/ActionGenerator')

class TargetGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {
      description: 'This is a sample action showcasing how to access the Adobe Target API',
      // eslint-disable-next-line quotes
      requiredParams: `['apiKey', 'tenant']`,
      // eslint-disable-next-line quotes
      importCode: `const { Target } = require('@adobe/aio-sdk')`,
      responseCode: `// initialize the sdk
    const targetClient = await Target.init(params.tenant, params.apiKey, token)

    // get activities from Target api
    const activities = await targetClient.getActivities({ limit: 5, offset: 0 })
    logger.debug('activities = ' + JSON.stringify(activities, null, 2))
    const response = {
      statusCode: 200,
      body: activities
    }`
    }
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('interacts with the Adobe Target API', 'target')
  }

  writing () {
    this.sourceRoot(path.join(__dirname, '../templates'))

    this.addAction(this.props.actionName, './stub-action.js', {
      testFile: '../target/templates/getActivities.test.js',
      sharedLibFile: './utils.js',
      sharedLibTestFile: './utils.test.js',
      e2eTestFile: './stub-action.e2e.js',
      tplContext: this.props,
      dotenvStub: {
        label: 'please provide your Adobe I/O Target integration tenant and api key',
        vars: [
          'TARGET_TENANT',
          'TARGET_API_KEY'
        ]
      },
      dependencies: {
        '@adobe/aio-sdk': '^2.0.0'
      },
      actionManifestConfig: {
        inputs: { LOG_LEVEL: 'debug', tenant: '$TARGET_TENANT', apiKey: '$TARGET_API_KEY' },
        annotations: { final: true }
      }
    })
  }
}

module.exports = TargetGenerator
