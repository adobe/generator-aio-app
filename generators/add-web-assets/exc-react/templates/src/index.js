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
import config from './config.json'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

if ('exc-module-runtime' in window) {
  bootstrap()
} else {
  window.EXC_MR_READY = () => bootstrap()
}

function bootstrap () {
  const Runtime = window['exc-module-runtime'].default
  const runtime = new Runtime({ canTakeover: true })

  window.runtime = runtime
  runtime.customEnvLabel = '<%= projectName %>'

  ReactDOM.render(<App runtime={runtime}/>, document.getElementById('root'))

  // set a favicon
  // runtime.favicon = 'url-to-favicon'

  // respond to clicks on the app-bar title
  // runtime.heroClick = () => window.alert('Did I ever tell you you\'re my hero?')

  // ready event brings in authentication/user info
  runtime.on('ready', ({ imsOrg, imsToken, imsProfile, locale }) => {
    console.log('Ready! received imsProfile:', imsProfile)
    window.imsProfile = imsProfile
  })

  // respond to history change events
  runtime.historyChange = path => {
    console.log('history changed :: ', path)
    // this.history.replace(path)
    // this.setState({currentPath: `/${path}`})
  }

  // set solution info, shortTitle is used when window is too small to dispay full title
  runtime.solution = {
    icon: 'AdobeExperienceCloud',
    title: '<%= projectName %>',
    shortTitle: 'JGR'
  }
  runtime.title = '<%= projectName %>'

  // tell the exc-runtime object we are done
  runtime.done()
}
