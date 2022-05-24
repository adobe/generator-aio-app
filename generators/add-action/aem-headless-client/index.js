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
const ActionGenerator = require('../../../lib/ActionGenerator')

class AemHeadlessClientGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {
      description: 'This is a sample action showcasing how to use AEM GraphQL capabilities',
      // eslint-disable-next-line quotes
      requiredParams: `['serviceURL', 'endpoint']`,
      // eslint-disable-next-line quotes
      requiredHeaders: `['Authorization']`,
      // eslint-disable-next-line quotes
      importCode: `const { Core } = require('@adobe/aio-sdk')
      const { AEMHeadless } = require('@adobe/aem-headless-client-nodejs')`,
      responseCode: `// initialize sdk
      const auth = params.AEM_AUTH && params.AEM_AUTH[0] === '[' ? JSON.parse(params.AEM_AUTH) : params.AEM_AUTH
      const aemHeadlessClient = new AEMHeadless({
        serviceURL: params.serviceURL,
        endpoint: params.endpoint,
        auth
      })
      // call methods, eg listPersistedQueries
      let body;
      try {
          body = await aemHeadlessClient.listPersistedQueries()
      } catch (e) {
          throw new Error(e)
      }
      const response = {
        statusCode: 200,
        body
      }`
    }
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('interacts with the AEMHeadlessClient', 'aem-headless-client')
  }

  writing () {
    this.sourceRoot(path.join(__dirname, '.'))

    this.addAction(this.props.actionName, '../../common-templates/stub-action.js', {
      testFile: './templates/listPersistedQueries.test.js',
      sharedLibFile: '../../common-templates/utils.js',
      sharedLibTestFile: '../../common-templates/utils.test.js',
      e2eTestFile: '../../common-templates/stub-action.e2e.js',
      tplContext: this.props,
      dependencies: {
        '@adobe/aem-headless-client-nodejs': '1.1.0'
      },
      dotenvStub: {
        label: 'please provide your AEM Auth: service token path, dev token, or [user,pass]',
        vars: [
          'AEM_AUTH'
        ]
      },
      actionManifestConfig: {
        inputs: {
          LOG_LEVEL: 'debug',
          AEM_AUTH: '$AEM_AUTH'
        },
        annotations: { final: true } // makes sure loglevel cannot be overwritten by request param
      }
    })
  }
}

module.exports = AemHeadlessClientGenerator
