/* <% if (false) { %>
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
<% } %> */

/**
 * This is a sample action showcasing how to access Adobe Analytics API
 *
 * You can invoke this function via:
 *     aio rt:action:invoke <action_path> -p companyId '<company_id>' -p apiKey '<api_key>' -p token '<access_token>'
 *
 * To find your <action_path>, run this command:
 *     aio rt:ls
 *
 * To show debug logging for this function, you can add the LOG_LEVEL parameter as well:
 *     aio rt:action:invoke <action_path> -p companyId '<company_id>' -p apiKey '<api_key>' -p token '<access_token>' -p LOG_LEVEL '<log_level>'
 * ... where LOG_LEVEL can be one of [ error, warn, info, verbose, debug, silly ]
 *
 * Then, you can view your app logs:
 *     aio app:logs
 */

const { Core, Analytics } = require('@adobe/aio-sdk')

async function main (params) {
  // create a Logger
  const myAppLogger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  // 'info' is the default level if not set
  myAppLogger.info('Calling the main action')

  // log levels are cumulative: 'debug' will include 'info' as well (levels are in order of verbosity: error, warn, info, verbose, debug, silly)
  const maskToken = params.token ? { token: '<hidden>' } : {}
  myAppLogger.debug(`params: ${JSON.stringify({ ...params, ...maskToken }, null, 2)}`)

  if (!params.companyId || !params.apiKey || !params.token) {
    myAppLogger.info('sending 400, missing a required parameter')
    return {
      statusCode: 400,
      body: { error: 'missing Adobe Analytics credentials, required: companyId, apiKey and token' }
    }
  }
  try {
    // initialize the sdk
    const analyticsClient = await Analytics.init(params.companyId, params.apiKey, params.token)

    // get collections from analytic API
    const collections = await analyticsClient.getCollections({ limit: 5, page: 0 })
    myAppLogger.debug(`collections = ${JSON.stringify(collections, null, 2)}`)

    return {
      statusCode: 200,
      body: collections
    }
  } catch (error) {
    myAppLogger.error(error)
    return {
      statusCode: 500,
      body: { error: 'server error' }
    }
  }
}

exports.main = main
