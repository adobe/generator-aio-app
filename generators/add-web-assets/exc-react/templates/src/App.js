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
  }

  static get propTypes () {
    return {
      runtime: PropTypes.any
    }
  }

  render () {
    return (
      <ErrorBoundary onError={this.onError} FallbackComponent={this.fallbackComponent} >
        <h1><%= projectName %></h1>
        <pre>this.props.runtime &eq;{JSON.stringify(this.props.runtime, 0, '\t')}</pre>
      </ErrorBoundary>
    )
  }
}
