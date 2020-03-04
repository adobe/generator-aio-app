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
 * This is a sample action showcasing how to access the <%= solutionName %> API
 */

const { Core } = require('@adobe/aio-sdk')
<% if (importCode) { %>
<%- importCode %>
<% } %>
const { errorResponse, getToken, stringParameters, validateRequest } = require('../utils')

async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing parameters
    const required = <%- requiredParams %>

    const { ok, status, errorMessage } = await validateRequest(params, required)
    if (!ok) {
      return errorResponse(status, errorMessage, logger)
    }

    const token = getToken(params)

    <%- responseCode %>

    logger.info(response.statusCode, 'end of request')
    return response
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
