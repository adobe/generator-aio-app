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
import React from 'react'
import PropTypes from 'prop-types'
import ErrorBoundary from 'react-error-boundary'

import actions from './config.json'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    console.log('actions.list = ', actions.list)
    console.log('actions = ', actions.resolver)

    // error handler on UI rendering failure
    this.onError = (e, componentStack) => {}

    // component to show if UI fails rendering
    this.fallbackComponent = ({ componentStack, error }) => (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
        <pre>{ componentStack + '\n' + error.message }</pre>
      </React.Fragment>
    )

    console.log('runtime object:', this.props.runtime)
  }

  static get propTypes () {
    return {
      runtime: PropTypes.any
    }
  }

render () {
  return (
    <ErrorBoundary onError={this.onError} FallbackComponent={this.fallbackComponent} >
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to <%= projectName %>!</h1>
      <div id="action-list">
        <h3>backend actions</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>{ Object.entries(actions).map(([name, url]) => <li key={name}>{name}: <a href={url}>{url}</a></li>) }</ul>
        <script>window.showActionsList()</script>
      </div>
      <h3>next steps</h3>
      <div id="doc-list">
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li key='doc-readme'>check <code>README.md</code> for more docs</li>
          <li key='doc-runtime'><a href="https://adobedocs.github.io/adobeio-runtime/">Adobe I/O Runtime Documentation</a></li>
          <% if (adobeServices.includes('target')) { %><li key='doc-target'><a href="http://developers.adobetarget.com/api/">Adobe Target API</a></li><% } %>
          <% if (adobeServices.includes('analytics')) { %><li key='doc-analytics'><a href="https://www.adobe.io/apis/experiencecloud/analytics/docs.html">Adobe Analytics API</a></li><% } %>
          <% if (adobeServices.includes('campaign-standard')) { %><li key='doc-campaign'><a href="https://final-docs.campaign.adobe.com/doc/standard/en/api/ACS_API.html">Adobe Campaign Standard API</a></li><% } %>
        </ul>
      </div>
    </div>
    </ErrorBoundary>
  )
  }
}
