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

import Runtime, { init } from '@adobe/exc-app'
import actions from './config.json'
import actionWebInvoke from './utils.js'

let state = {}

window.onload = () => {
  /* Here you can bootstrap your application and configure the integration with the Adobe Experience Cloud Shell */
  try {
    // attempt to load the Experience Cloud Runtime
    require('./exc-runtime')
    // if there are no errors, bootstrap the app in the Experience Cloud Shell
    init(initRuntime)
  } catch (e) {
    console.log('application not running in Adobe Experience Cloud Shell')
    // fallback mode, run the application without the Experience Cloud Runtime
  }

  showActionsList()
  document.getElementById('actionForm').onsubmit = (event) => {
    event.preventDefault();
    setTimeout(doSubmit, 1)
  }
}

/**
 * Initialize runtime and get IMS profile
 */
function initRuntime() {
  // get the Experience Cloud Runtime object
  const runtime = Runtime()
  // ready event brings in authentication/user info
  runtime.on('ready', ({ imsOrg, imsToken, imsProfile, locale }) => {
    // tell the exc-runtime object we are done
    runtime.done()
    state = { imsOrg, imsToken, imsProfile, locale }
    console.log('exc-app:ready')
  })
  // set solution info, shortTitle is used when window is too small to display full title
  runtime.solution = {
    icon: 'AdobeExperienceCloud',
    title: 'test-raw'
  }
  runtime.title = 'test-raw'
}

/**
 * Generate list of actions
 */
function showActionsList() {
  const container = document.getElementById('action-list')
  if (Object.keys(actions).length === 0) {
    container.innerHTML = '<span>you have no actions, run <code>aio app add actions</code> to add one</span>'
  } else if (Object.keys(actions).length === 1) {
    container.innerHTML = `<span>${actions[0].actionName}</span>`
  } else {
    container.innerHTML = '<select id="selAction">' + Object.entries(actions).map(([actionName]) => `<option>${actionName}</option>`).join('') + '</select>'
  }
}
/**
 * Quick helper to safely call JSON.parse
 * @param {string} val 
 */
function safeParse(val) {
  let result = null
  try {
    result = JSON.parse(val)
  } catch (e) { }
  return result
}

function doSubmit() {
  const actionIndex = document.getElementById('selAction').selectedIndex || 0;
  document.getElementById('taOutput').innerHTML = ""
  if (actions) {
    const selAction = Object.entries(actions)[actionIndex]
    const headers = safeParse(document.getElementById('actionHeaders').value)
    const params = safeParse(document.getElementById('actionParams').value)
    // track the time to a result
    const preCallTime = Date.now()
    invokeAction(selAction, headers, params)
      .then(actionResponse => {
        const taOutput = document.getElementById('taOutput')
        console.log('ActionResponse:', actionResponse)
        taOutput.innerHTML = `${JSON.stringify(actionResponse, 0, 2)}\n\n  time:${(Date.now() - preCallTime)}ms`
      }).catch(err => {
        console.error('Error:', err)
      })
  }
}

function invokeAction(action, _headers, _params) {
  const headers = _headers || {}
  const params = _params || {}
  // all headers to lowercase
  Object.keys(headers).forEach((h) => {
    const lowercase = h.toLowerCase()
    if (lowercase !== h) {
      headers[lowercase] = headers[h]
      headers[h] = undefined
      delete headers[h]
    }
  })
  // set the authorization header and org from the ims props object
  if (state.imsToken && !headers.authorization) {
    headers.authorization = `Bearer ${state.imsToken}`
  }
  if (state.imsOrg && !headers['x-gw-ims-org-id']) {
    headers['x-gw-ims-org-id'] = state.imsOrg
  }
  return actionWebInvoke(action[1], headers, params)
}
