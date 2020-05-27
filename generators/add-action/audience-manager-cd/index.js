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

const path = require('path')
const ActionGenerator = require('../../../lib/ActionGenerator')
const { commonDependencyVersions } = require('../../../lib/constants')

class AudienceManagerCDGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {
      description: 'This is a sample action showcasing how to access the Adobe Audience Manager Customer Data API',
      // eslint-disable-next-line quotes
      requiredParams: `['apiKey', 'id', 'dataSourceId']`,
      // eslint-disable-next-line quotes
      requiredHeaders: `['Authorization', 'x-gw-ims-org-id']`,
      // eslint-disable-next-line quotes
      importCode: `const { AudienceManagerCD } = require('@adobe/aio-sdk')`,
      responseCode: `// initialize the sdk
    const orgId = params.__ow_headers['x-gw-ims-org-id']
    const audienceManagerClient = await AudienceManagerCD.init(orgId, params.apiKey, token)

    // get Customer Profile from Audience Manager Customer Data API
    const profiles = await audienceManagerClient.getProfile(params.id, params.dataSourceId)
    logger.debug('profiles = ' + JSON.stringify(profiles, null, 2))
    const response = {
      statusCode: 200,
      body: profiles
    }`
    }
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('interacts with the Adobe Audience Manager Customer Data API', 'audience-manager-cd')
  }

  writing () {
    // this.registerTransformStream(beautify({ indent_size: 2 }))
    this.sourceRoot(path.join(__dirname, '.'))

    this.addAction(this.props.actionName, '../../common-templates/stub-action.js', {
      testFile: './templates/getProfile.test.js',
      sharedLibFile: '../../common-templates/utils.js',
      sharedLibTestFile: '../../common-templates/utils.test.js',
      e2eTestFile: '../../common-templates/stub-action.e2e.js',
      tplContext: this.props,
      dependencies: {
        '@adobe/aio-sdk': commonDependencyVersions['@adobe/aio-sdk']
      },
      dotenvStub: {
        label: 'please provide your Adobe I/O Audience Manager Customer Data integration api key',
        vars: [
          'AUDIENCE_MANAGER_API_KEY'
        ]
      },
      actionManifestConfig: {
        inputs: { LOG_LEVEL: 'debug', apiKey: '$AUDIENCE_MANAGER_API_KEY' },
        annotations: { final: true }
      }
    })
  }
}

module.exports = AudienceManagerCDGenerator
