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

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn()
  },
  Events: {
    init: jest.fn()
  }
}))

const { Core, Events } = require('@adobe/aio-sdk')
const mockEventsInstance = { publishEvent: jest.fn() }
const mockLoggerInstance = { info: jest.fn(), debug: jest.fn(), error: jest.fn() }
Core.Logger.mockReturnValue(mockLoggerInstance)

Events.init.mockReturnValue(mockEventsInstance)

const action = require('./<%= actionRelPath %>')

beforeEach(() => {
  Events.init.mockClear() // only clears calls stats
  jest.clearAllMocks()
  Core.Logger.mockClear()
  mockLoggerInstance.info.mockReset()
  mockLoggerInstance.debug.mockReset()
  mockLoggerInstance.error.mockReset()
})

const fakeRequestParams = { organizationId: 'fakeOrgId', apiKey: 'fakeKey', providerId: 'fakeProvider', eventCode: 'fakeEventCode', payload: {hello: 'world'}, __ow_headers: { authorization: 'Bearer fakeToken' } }
describe('<%= actionName %>', () => {
  test('main should be defined', () => {
    expect(action.main).toBeInstanceOf(Function)
  })
  test('should set logger to use LOG_LEVEL param', async () => {
    await action.main({ ...fakeRequestParams, LOG_LEVEL: 'fakeLevel' })
    expect(Core.Logger).toHaveBeenCalledWith(expect.any(String), { level: 'fakeLevel' })
  })
  test('events sdk should be initialized with input credentials', async () => {
    await action.main({ ...fakeRequestParams, otherParam: 'fake4' })
    expect(Events.init).toHaveBeenCalledWith('fakeOrgId', 'fakeKey', 'fakeToken' )
  })
  test('should return an http response with 200 status code if successful', async () => {
    mockEventsInstance.publishEvent = jest.fn().mockReturnValue('OK')
    const response = await action.main(fakeRequestParams)
    expect(response).toEqual(expect.objectContaining({
      statusCode: 200
    }))
  })
  test('should return an http response with 204 status code if successful', async () => {
    mockEventsInstance.publishEvent = jest.fn().mockReturnValue(undefined)
    const response = await action.main(fakeRequestParams)
    expect(response).toEqual(expect.objectContaining({
      statusCode: 204
    }))
  })
  test('if there is an error should return a 500 and log the error', async () => {
    const fakeError = new Error('fake')
    mockEventsInstance.publishEvent = jest.fn().mockRejectedValue(fakeError)
    const response = await action.main(fakeRequestParams)
    expect(response).toEqual(expect.objectContaining({
      error: {
        statusCode: 500,
        body: { error: 'server error' }
      }
    }))
    expect(mockLoggerInstance.error).toHaveBeenCalledWith(fakeError)
  })
  test('missing input request parameters, should return 400', async () => {
    const response = await action.main({})
    expect(response).toEqual({
      error: {
        statusCode: 400,
        body: { error: 'missing header(s) \'authorization\' and missing parameter(s) \'organizationId,apiKey,providerId,eventCode,payload\'' }
      }
    })
  })
})
