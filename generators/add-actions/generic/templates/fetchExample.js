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
 * This is a sample action showcasing how to access an external service
 *
 * You can invoke this function via:
 *     aio rt:action:invoke <action_path>
 *
 * To find your <action_path>, run this command:
 *     aio rt:ls
 *
 * To show debug logging for this function, you can add the LOG_LEVEL parameter as well:
 *     aio rt:action:invoke <action_path> -p LOG_LEVEL '<log_level>'
 * ... where LOG_LEVEL can be one of [ error, warn, info, verbose, debug, silly ]
 *
 * Then, you can view your app logs:
 *     aio app:logs
 *
 * Secrets to access the external API can be passed to the action using default parameters and dotenv variables:
 *    - set MY_API_KEY=1234 in .env
 *    - configure the manifest.yml under `<%= actionName %>` to have an input field:
 *        inputs:
 *          myApiKey: $MY_API_KEY
 *    - access the apiKey in your action through params.myApiKey
 */

const { Core } = require('@adobe/aio-sdk')
const fetch = require('node-fetch')

async function main (params) {
  // create a Logger
  const myAppLogger = Core.Logger('main', { level: params.LOG_LEVEL })
  // 'info' is the default level if not set
  myAppLogger.info('Calling the main action')

  // log levels are cumulative: 'debug' will include 'info' as well (levels are in order of verbosity: error, warn, info, verbose, debug, silly)
  myAppLogger.debug(`params: ${JSON.stringify(params, null, 2)}`) // careful to not log any secrets!

  try {
    // replace this with the api you want to access
    // if needed apikeys and tokens can be passed to the action using default parameters and dotenv variables
    const apiEndpoint = 'https://adobeioruntime.net/api/v1/'

    const response = await fetch(apiEndpoint)
    if (!response.ok) {
      throw new Error(`request to '${apiEndpoint}' failed with status code '${response.status}'`)
    }

    const content = await response.json()

    return {
      statusCode: 200,
      body: content
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
