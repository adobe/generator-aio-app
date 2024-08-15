/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Generator = require('yeoman-generator')
const fs = require('fs-extra')

/*
    'initializing',
    'prompting',
    'configuring',
    'default',
    'writing',
    'conflicts',
    'install',
    'end'
*/

const Default = {
  DESTINATION_FILE: '.vscode/launch.json',
  SKIP_PROMPT: false
}

const Option = {
  DESTINATION_FILE: 'destination-file',
  SKIP_PROMPT: 'skip-prompt'
}

class AddVsCodeConfig extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option(Option.DESTINATION_FILE, { type: String, default: Default.DESTINATION_FILE })
    this.option(Option.SKIP_PROMPT, { type: Boolean, default: Default.SKIP_PROMPT })
  }

  initializing () {
    this.vsCodeConfig = {
      version: '0.3.0',
      configurations: []
    }

    this.vsCodeConfig.configurations.push({
      name: 'App Builder: debug actions',
      type: 'node-terminal',
      request: 'launch',
      command: 'aio app dev',
      skipFiles: [
        '<node_internals>/**/*.js',
        // eslint-disable-next-line no-template-curly-in-string
        '${workspaceFolder}/node_modules/**/*.js'
      ]
    })

    this.vsCodeConfig.configurations.push({
      name: 'App Builder: debug full stack',
      type: 'node-terminal',
      request: 'launch',
      command: 'aio app dev',
      sourceMapPathOverrides: {
        // eslint-disable-next-line no-template-curly-in-string
        '/__parcel_source_root/*': '${webRoot}/*'
      },
      skipFiles: [
        '<node_internals>/**/*.js',
        // eslint-disable-next-line no-template-curly-in-string
        '${workspaceFolder}/node_modules/**/*.js'
      ],
      serverReadyAction: {
        pattern: 'server running on port : ([0-9]+)',
        uriFormat: 'https://localhost:%s',
        action: 'debugWithChrome',
        // eslint-disable-next-line no-template-curly-in-string
        webRoot: '${workspaceFolder}'
      }
    })
  }

  async writing () {
    const destFile = this.options[Option.DESTINATION_FILE]
    const skipPrompt = this.options[Option.SKIP_PROMPT]

    let confirm = { overwriteVsCodeConfig: true }

    if (fs.existsSync(destFile) && !skipPrompt) {
      confirm = await this.prompt([
        {
          type: 'confirm',
          name: 'overwriteVsCodeConfig',
          message: `Please confirm the overwrite of your Visual Studio Code launch configuration in '${destFile}'?`
        }
      ])
    }

    if (confirm.overwriteVsCodeConfig) {
      this.fs.writeJSON(this.destinationPath(destFile), this.vsCodeConfig)
    }
  }
}

module.exports = AddVsCodeConfig
