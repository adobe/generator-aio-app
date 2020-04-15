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

import React from 'react'
import PropTypes from 'prop-types'
import ErrorBoundary from 'react-error-boundary'

import './App.css'
<% if (hasBackend) { %>
import { actionWebInvoke } from './utils'
import actions from './config.json'
<% } %>
/* Here is your entry point React Component, this class has access to the Adobe Experience Cloud Shell runtime object */

export default class App extends React.Component {
  constructor (props) {
    super(props)

    // error handler on UI rendering failure
    this.onError = (e, componentStack) => {}

    // component to show if UI fails rendering
    this.fallbackComponent = ({ componentStack, error }) => (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
        <pre>{ componentStack + '\n' + error.message }</pre>
      </React.Fragment>
    )

    this.state = {}

    console.log('runtime object:', this.props.runtime)
    console.log('ims object:', this.props.ims)

    // use exc runtime event handlers
    // respond to configuration change events (e.g. user switches org)
    this.props.runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
      console.log('configuration change', { imsOrg, imsToken, locale })
    })
    // respond to history change events
    this.props.runtime.on('history', ({ type, path }) => {
      console.log('history change', { type, path })
    })
  }

  static get propTypes () {
    return {
      runtime: PropTypes.any,
      ims: PropTypes.any
    }
  }
<% if (hasBackend) { %>
  async invoke (action, params) {
    // set the authorization header and org from the ims props object
    const headers = {}
    if (this.props.ims.token) {
      headers.authorization = 'Bearer ' + this.props.ims.token
    }
    if (this.props.ims.org) {
      headers['x-org-id'] = this.props.ims.org
    }
    try {
      // invoke backend action
      const response = await actionWebInvoke(action, headers, params)
      // store the response
      this.setState({ response, errorMsg: null })
      console.log(`Response from ${action}:`, response)
    } catch (e) {
      // log and store any error message
      console.error(e)
      this.setState({ response: null, errorMsg: e.message })
    }
  }
<% } %>
  render () {
    return (
      // ErrorBoundary wraps child components to handle eventual rendering errors
      <ErrorBoundary onError={ this.onError } FallbackComponent={ this.fallbackComponent } >
      <div id='outerDiv'>
        <h1>Welcome to <%= projectName %>!</h1>
<% if (hasBackend) { %>
        <div id='actionList'>
          <h3>Your application backend actions</h3>
            { Object.entries(actions).length > 0 && Object.entries(actions).map(([name, url]) =>
              <div className='actionListItem' key={ name }>
                <label className='actionListItemLabel'>{ name }</label>
                <button onClick={ this.invoke.bind(this, name, {}) }>invoke</button>
              </div>
            )}
        </div>
<% } %>
        <div id='docList'>
          <h3>Useful documentation for your app</h3>
          <li className='docListItem' key='docCustomApps'><a href="https://github.com/AdobeDocs/adobe-custom-applications/blob/master/README.md">Adobe I/O Custom Applications</a></li>
          <% if (hasBackend) { %><li className='docListItem' key='docRuntime'><a href="https://adobedocs.github.io/adobeio-runtime/">Adobe I/O Runtime</a></li><% } %>
          <% if (adobeServices.includes(sdkCodes.target)) { %><li className='docListItem' key='docTarget'><a href="https://github.com/adobe/aio-lib-target/blob/master/README.md">Adobe Target SDK</a></li><% } %>
          <% if (adobeServices.includes(sdkCodes.analytics)) { %><li className='docListItem' key='docAnalytics'><a href="https://github.com/adobe/aio-lib-analytics/blob/master/README.md">Adobe Analytics SDK</a></li><% } %>
          <% if (adobeServices.includes(sdkCodes.campaign)) { %><li className='docListItem' key='docCampaign'><a href="https://github.com/adobe/aio-lib-campaign-standard/blob/master/README.md">Adobe Campaign Standard SDK</a></li><% } %>
        </div>
<% if (hasBackend) { %>
        { this.state.errorMsg &&
          <div id='actionErrorMessage'>
            Failure! See the error in your browser console.
          </div>
        }
        { !this.state.errorMsg && this.state.response &&
          <div id='actionSuccessMessage'>
            Success! See the response content in your browser console.
          </div>
        }
<% } %>
      </div>
      </ErrorBoundary>
    )
  }
}
