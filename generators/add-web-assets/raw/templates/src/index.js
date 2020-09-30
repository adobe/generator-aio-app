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
}

/**
 * Initialize runtime and get IMS profile
 */
function initRuntime () {
  // get the Experience Cloud Runtime object
  const runtime = Runtime()

  // use this to set a favicon
  // runtime.favicon = 'url-to-favicon'

  // use this to respond to clicks on the app-bar title
  // runtime.heroClick = () => window.alert('Did I ever tell you you\'re my hero?')

  // ready event brings in authentication/user info
  runtime.on('ready', ({ imsOrg, imsToken, imsProfile, locale }) => {
    // tell the exc-runtime object we are done
    runtime.done()
    console.log('Ready! received imsProfile:', imsProfile)
  })

  // set solution info, shortTitle is used when window is too small to display full title
  runtime.solution = {
    icon: 'AdobeExperienceCloud',
    title: '<%= projectName %>',
    shortTitle: 'JGR'
  }
  runtime.title = '<%= projectName %>'
}

/**
 * Generate list of actions
 */
function showActionsList () {
  const container = document.getElementById('action-list')
  if (Object.keys(actions).length === 0) {
    container.innerHTML = '<span>you have no actions, run <code>aio app add actions</code> to add one</span>'
  } else {
    container.innerHTML = '<div>' + Object.entries(actions).map(([actionName, url]) => `<div><a href=${url} class="spectrum-Link spectrum-Link--quiet">${actionName}: ${url}</a></div>`).join('') + '</div>'
  }
}
