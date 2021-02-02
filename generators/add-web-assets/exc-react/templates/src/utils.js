/*<% if (false) { %>
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
<% } %>
* <license header>
*/

/* global fetch */

/**
 *
 * Invokes a web action
 *
 * @param  {string} actionUrl
 * @param {object} headers
 * @param  {object} params
 *
 * @returns {Promise<string|object>} the response
 *
 */
async function actionWebInvoke (actionUrl, headers = {}, params = {}) {
  const actionHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }
  if (window.location.hostname === 'localhost') {
    actionHeaders['x-ow-extra-logging'] = 'on'
  }

  // Switch between fetch method based on invocation params
  const method = Object.keys(params).length ? 'post' : 'get'
  // Set request body only for post
  const body = (method === 'post') ? JSON.stringify(params) : null
  
  const response = await fetch(actionUrl, {
    headers: actionHeaders,
    method,
    body,
  })
  let content = await response.text()
  if (!response.ok) {
    throw new Error(`failed request to '${actionUrl}' with status: ${response.status} and message: ${content}`)
  }
  try {
    content = JSON.parse(content)
  } catch (e) {
    // response is not json
  }
  return content
}

export default actionWebInvoke
