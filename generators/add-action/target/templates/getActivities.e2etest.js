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
const fs = require('fs')
const namespace = Config.get('runtime.namespace') 
const hostname = Config.get('cna.hostname') || 'adobeio-static.net'
const packagejson = JSON.parse(fs.readFileSync('../../package.json').toString())
const runtimePackage = `${packagejson.name}-${packagejson.version}`
const fetch  = require('node-fetch')

const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/<%= actionName %>`

const requestParams = { companyId: process.env['ACTION_COMPANY_ID'], 
						apiKey: process.env['ACTION_API_KEY'],
						token: process.env['ACTION_TOKEN']
					}

test('should return an http response with analytics collections', async () => {
  const res = await fetch(actionUrl + '?companyId=' + requestParams.companyId + '&apiKey=' + requestParams.apiKey + '&token=' + requestParams.token)
  expect(res).toEqual(expect.objectContaining({
      statusCode: 200
    }))
  // TODO Add expect result for body returned from Target Action
  //expect(response).toEqual(expect.objectContaining({
  //    body: fakeResponse
  //  }))
})

test('returns a 400 when missing tenant,  apiKey and token', async () => {
  const res = await fetch(actionUrl)
  expect(res).toEqual(expect.objectContaining({
      statusCode: 400
    }))
  const jsonBody = await res.json()
  expect(jsonBody.error).toBe('missing Adobe Analytics credentials, required: companyId, apiKey and token')
})

test('if companyId is missing should return with 400', async () => {
  const res = await fetch(actionUrl + '?apiKey=' + requestParams.apiKey + '&token=' + requestParams.token)
  expect(res).toEqual(expect.objectContaining({
      statusCode: 400
    }))
  const jsonBody = await res.json()
  expect(jsonBody.error).toBe('missing Adobe Analytics credentials, required: companyId, apiKey and token')
})

test('if apiKey is missing should return with 400', async () => {
  const res = await fetch(actionUrl + '?companyId=' + requestParams.companyId + '&token=' + requestParams.token)
  expect(res).toEqual(expect.objectContaining({
      statusCode: 400
    }))
  const jsonBody = await res.json()
  expect(jsonBody.error).toBe('missing Adobe Analytics credentials, required: companyId, apiKey and token')
})

test('if token is missing should return with 400', async () => {
  const res = await fetch(actionUrl + '?companyId=' + requestParams.companyId + '&apiKey=' + requestParams.apiKey)
  expect(res).toEqual(expect.objectContaining({
      statusCode: 400
    }))
  const jsonBody = await res.json()
  expect(jsonBody.error).toBe('missing Adobe Analytics credentials, required: companyId, apiKey and token')
})