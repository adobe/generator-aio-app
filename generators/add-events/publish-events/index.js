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
const { ActionGenerator, constants, commonTemplates } = require('@adobe/generator-app-common-lib')
const { commonDependencyVersions } = constants

class CloudEventsGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {
      description: 'This is a sample action showcasing how to create a cloud event and publish to I/O Events',
      // eslint-disable-next-line quotes
      requiredParams: `['apiKey', 'providerId', 'eventCode', 'payload']`,
      // eslint-disable-next-line quotes
      requiredHeaders: `['Authorization', 'x-gw-ims-org-id']`,
      importCode: `const { Core, Events } = require('@adobe/aio-sdk')
const uuid = require('uuid')
const {
  CloudEvent
} = require("cloudevents");`,
      inlineUtilityFunctions: `
function createCloudEvent(providerId, eventCode, payload) {
  let cloudevent = new CloudEvent({
    source: 'urn:uuid:' + providerId,
    type: eventCode,
    datacontenttype: "application/json",
    data: payload,
    id: uuid.v4()
  });
  return cloudevent
}`,
      responseCode: `
    // initialize the client
    const orgId = params.__ow_headers['x-gw-ims-org-id']
    const eventsClient = await Events.init(orgId, params.apiKey, token)

    // Create cloud event for the given payload
    const cloudEvent = createCloudEvent(params.providerId, params.eventCode, params.payload)

    // Publish to I/O Events
    const published = await eventsClient.publishEvent(cloudEvent)
    let statusCode = 200
    if (published === 'OK') {
      logger.info('Published successfully to I/O Events')
    } else if (published === undefined) {
      logger.info('Published to I/O Events but there were not interested registrations')
      statusCode = 204
    }
    const response = {
      statusCode: statusCode,
    }`
    }
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName(
      'creates messages in cloud events format and publishes to Adobe I/O Events',
      'publish-events')
  }

  writing () {
    // this.registerTransformStream(beautify({ indent_size: 2 }))
    this.sourceRoot(path.join(__dirname, '.'))

    this.addAction(this.props.actionName, commonTemplates['stub-action'], {
      testFile: './templates/publishEvents.test.js',
      sharedLibFile: commonTemplates.utils,
      sharedLibTestFile: commonTemplates['utils.test'],
      e2eTestFile: commonTemplates['stub-action.e2e'],
      tplContext: this.props,
      dependencies: {
        '@adobe/aio-sdk': commonDependencyVersions['@adobe/aio-sdk'],
        cloudevents: '^4.0.2',
        uuid: '^8.0.0'
      },
      actionManifestConfig: {
        inputs: {
          LOG_LEVEL: 'debug',
          apiKey: '$SERVICE_API_KEY'
        },
        annotations: { final: true }
      }
    })
  }
}

module.exports = CloudEventsGenerator
