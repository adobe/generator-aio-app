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

import actions from './config.json'

/* global fetch */

/**
 *
 * Attempts to load the Adobe Experience Cloud Runtime.
 *
 * @throws {Error} error in case of failure, most likely when the app is not running in
 * the Experience Cloud Shell.
 *
 */
function loadExcRuntime () {
  /* eslint-disable-next-line */
  (function(e,t){if(t.location===t.parent.location)throw new Error("Module Runtime: Needs to be within an iframe!");var o=function(e){var t=new URL(e.location.href).searchParams.get("_mr");return t||!e.EXC_US_HMR?t:e.sessionStorage.getItem("unifiedShellMRScript")}(t);if(!o)throw new Error("Module Runtime: Missing script!");if("https:"!==(o=new URL(decodeURIComponent(o))).protocol)throw new Error("Module Runtime: Must be HTTPS!");if(!/experience(-qa|-stage)?\.adobe\.com$/.test(o.hostname)&&!/localhost\.corp\.adobe\.com$/.test(o.hostname))throw new Error("Module Runtime: Invalid domain!");if(!/\.js$/.test(o.pathname))throw new Error("Module Runtime: Must be a JavaScript file!");t.EXC_US_HMR&&t.sessionStorage.setItem("unifiedShellMRScript",o.toString());var n=e.createElement("script");n.async=1,n.src=o.toString(),n.onload=n.onreadystatechange=function(){n.readyState&&!/loaded|complete/.test(n.readyState)||(n.onload=n.onreadystatechange=null,n=void 0,"EXC_MR_READY"in t&&t.EXC_MR_READY())},e.head.appendChild(n)})(document, window)
}

/**
 *
 * Invokes a web action
 *
 * @param  {string} actionName
 * @param {object} headers
 * @param  {object} params
 *
 * @returns {Promise<string|object>} the response
 *
 */
async function actionWebInvoke (actionName, headers = {}, params = {}) {
  if (!actionName || !actions[actionName]) {
    throw new Error(`Cannot fetch action '${actionName}' as it doesn't exist.`)
  }
  const response = await fetch(actions[actionName], {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(params)
  })
  let content = await response.text()
  if (!response.ok) {
    throw new Error(`failed request to '${actions[actionName]}' with status: ${response.status} and message: ${content}`)
  }
  try {
    content = JSON.parse(content)
  } catch (e) {
    // response is not json
  }
  return content
}

export {
  loadExcRuntime,
  actionWebInvoke
}
