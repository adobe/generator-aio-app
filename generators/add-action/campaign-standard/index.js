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

class CampaignStandardGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {
      description: 'This is a sample action showcasing how to access the Adobe Campaign Standard API',
      // eslint-disable-next-line quotes
      requiredParams: `['apiKey', 'tenant']`,
      // eslint-disable-next-line quotes
      requiredHeaders: `['Authorization']`,
      // eslint-disable-next-line quotes
      importCode: `const { Core, CampaignStandard } = require('@adobe/aio-sdk')`,
      responseCode: `// initialize the sdk
    const campaignClient = await CampaignStandard.init(params.tenant, params.apiKey, token)

    // get profiles from Campaign Standard
    const profiles = await campaignClient.getAllProfiles()
    const response = {
      statusCode: 200,
      body: profiles
    }`
    }
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('interacts with the Adobe Campaign Standard API', 'campaign-standard')
  }

  writing () {
    // this.registerTransformStream(beautify({ indent_size: 2 }))
    this.sourceRoot(path.join(__dirname, '.'))

    this.addAction(this.props.actionName, '../../common-templates/stub-action.js', {
      testFile: './templates/getAllProfiles.test.js',
      sharedLibFile: '../../common-templates/utils.js',
      sharedLibTestFile: '../../common-templates/utils.test.js',
      e2eTestFile: '../../common-templates/stub-action.e2e.js',
      tplContext: this.props,
      dotenvStub: {
        label: 'please provide your Adobe I/O Campaign Standard tenant',
        vars: [
          'CAMPAIGN_STANDARD_TENANT'
        ]
      },
      dependencies: {
        '@adobe/aio-sdk': commonDependencyVersions['@adobe/aio-sdk']
      },
      actionManifestConfig: {
        inputs: { LOG_LEVEL: 'debug', tenant: '$CAMPAIGN_STANDARD_TENANT', apiKey: '$SERVICE_API_KEY' },
        annotations: { final: true }
      }
    })
  }
}

module.exports = CampaignStandardGenerator
