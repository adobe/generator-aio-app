/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const path = require('path')
const ActionGenerator = require('../../../lib/ActionGenerator')

class GenericGenerator extends ActionGenerator {
  constructor (args, opts) {
    super(args, opts)
    this.props = {}
  }

  async prompting () {
    this.props.actionName = await this.promptForActionName('showcases how to access an external API', 'generic')
  }

  writing () {
    this.sourceRoot(path.join(__dirname, './templates'))

    this.addAction(this.props.actionName, './fetchExample.js', {
      testFile: './fetchExample.test.js',
      e2eTestFile: './fetchExample.e2e.js',
      tplContext: this.props,
      dependencies: {
        '@adobe/aio-sdk': '^1.0.2',
        'node-fetch': '^2.6.0'
      },
      actionManifestConfig: {
        inputs: { LOG_LEVEL: 'debug' },
        annotations: { final: true } // makes sure loglevel cannot be overwritten by request param
      }
    })
  }
}

module.exports = GenericGenerator
