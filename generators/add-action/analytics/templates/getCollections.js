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
const { errorResponse, getToken, logParameters, validateRequest } = require('../utils')

async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action')

    logParameters(logger.debug, params)

    // check for missing parameters
    const required = ['companyId', 'apiKey']

    const { ok, status, errorMessage } = await validateRequest(params, required)
    if (!ok) {
      if (status === 500) {
        logger.error(errorMessage)
        return errorResponse(status, 'server error', logger)
      }
      return errorResponse(status, errorMessage, logger)
    }

    // get the input user token, which can be reused to access Adobe APIs
    const token = getToken(params)

    // initialize the sdk
    const analyticsClient = await Analytics.init(params.companyId, params.apiKey, token)

    // get collections from analytic API
    const collections = await analyticsClient.getCollections({ limit: 5, page: 0 })
    logger.debug(`collections = ${JSON.stringify(collections, null, 2)}`)
    return {
      statusCode: 200,
      body: collections
    }
  } catch (error) {
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
