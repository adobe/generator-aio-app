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

const { Config } = require('@adobe/aio-sdk').Core
const fs = require.requireActual('fs')
const fetch = require('node-fetch')

const namespace = Config.get('runtime.namespace')
const hostname = Config.get('cna.hostname') || 'adobeio-static.net'
const packagejson = JSON.parse(fs.readFileSync('package.json').toString())
const runtimePackage = `${packagejson.name}-${packagejson.version}`

const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/<%= actionName %>`

test('returns a error when missing companyId, apiKey and token', async () => {
  const res = await fetch(actionUrl)
  expect(res).toEqual(expect.objectContaining({
    status: 200
  }))
  const jsonBody = await res.json()
  expect(jsonBody.error).toBe('missing Adobe Analytics credentials, required: companyId, apiKey and token')
})
