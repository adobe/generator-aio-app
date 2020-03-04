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

function stringParameters (params) {
  // hide authorization token without overriding params
  let headers = params.__ow_headers
  if (headers.authorization) {
    headers = { ...headers, authorization: '<hidden>' }
  }
}

function _getMissingParameters (params, required) {
  return required.filter(r => {
    const splits = r.split('.')
    const last = splits[splits.length - 1]
    const obj = splits.slice(0, -1).reduce((obj, split) => { obj = (obj[split] || {}); return obj }, params)
    return !obj[last]
  })
}

async function validateRequest (params, required = []) {
  if (!params.__ow_headers.authorization) {
    return { ok: false, status: 401, errorMessage: 'missing Authorization header' }
  }
  if (!params.__ow_headers['x-org-id']) {
    return { ok: false, status: 400, errorMessage: 'missing x-org-id header' }
  }
  const missing = _getMissingParameters(params, required)
  if (missing.length > 0) {
    return { ok: false, status: 400, errorMessage: `missing parameter(s) ${missing}` }
  }

  const VALIDATION_ENDPOINT = 'https://adobeio.adobeioruntime.net/apis/validate/app-registry/'
  const validationUrl = `${VALIDATION_ENDPOINT}/${params.__ow_headers['x-org-id']}?namespace=${process.env.__OW_NAMESPACE}`
  const response = await fetch(validationUrl, { headers: { Authorization: params.__ow_headers.authorization } })
  if (!response.ok && response.status !== 403) {
    throw new Error(`bad response from validation endpoint with status ${response.status}`)
  }
  if (response.status === 403) {
    return { ok: false, status: 403, errorMessage: 'request is not authorized to access the application' }
  }

  return { ok: true }
}

function getToken (params) {
  return params.__ow_headers.authorization.substring('Bearer '.length)
}

function errorResponse (statusCode, message, logger) {
  if (logger) {
    logger.error(statusCode, message)
  }
  return {
    statusCode,
    body: {
      error: message
    }
  }
}

module.exports = {
  errorResponse,
  getToken,
  stringParameters,
  validateRequest
}
