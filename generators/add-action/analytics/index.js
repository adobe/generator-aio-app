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
const { commonDependencyVersions } = require('../../../lib/constants')

class AnalyticsGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {
      description: 'This is a sample action showcasing how to access the Adobe Analytics API',
      // eslint-disable-next-line quotes
      requiredParams: `['apiKey', 'companyId']`,
      // eslint-disable-next-line quotes
      requiredHeaders: `['Authorization']`,
      // eslint-disable-next-line quotes
      importCode: `const { Analytics } = require('@adobe/aio-sdk')`,
      responseCode: `// initialize the sdk
    const analyticsClient = await Analytics.init(params.companyId, params.apiKey, token)

    // get collections from analytics API
    const collections = await analyticsClient.getCollections({ limit: 5, page: 0 })
    logger.debug('collections = ' + JSON.stringify(collections, null, 2))
    const response = {
      statusCode: 200,
      body: collections
    }`
    }
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('interacts with the Adobe Analytics API', 'analytics')
  }

  writing () {
    // this.registerTransformStream(beautify({ indent_size: 2 }))
    this.sourceRoot(path.join(__dirname, '.'))

    this.addAction(this.props.actionName, '../../common-templates/stub-action.js', {
      testFile: './templates/getCollections.test.js',
      sharedLibFile: '../../common-templates/utils.js',
      sharedLibTestFile: '../../common-templates/utils.test.js',
      e2eTestFile: '../../common-templates/stub-action.e2e.js',
      tplContext: this.props,
      dependencies: {
        '@adobe/aio-sdk': commonDependencyVersions['@adobe/aio-sdk']
      },
      dotenvStub: {
        label: 'please provide your Adobe I/O Analytics company id',
        vars: [
          'ANALYTICS_COMPANY_ID'
        ]
      },
      actionManifestConfig: {
        inputs: { LOG_LEVEL: 'debug', companyId: '$ANALYTICS_COMPANY_ID', apiKey: '$SERVICE_API_KEY' },
        annotations: { final: true }
      }
    })
  }
}

module.exports = AnalyticsGenerator
