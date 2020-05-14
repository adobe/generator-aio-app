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
const Generator = require('yeoman-generator')
const utils = require('../../../lib/utils')

const { webAssetsDirname, dotenvFilename } = require('../../../lib/constants')
const { sdkCodes, eventCodes } = require('../../../lib/constants')

class ExcReactGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    // todo check that those are set
    this.option('adobe-services', { type: String, default: '' })
    this.option('project-name', { type: String })
    // this.option('skip-prompt', { default: false }) // useless for now
    this.option('skip-install', { type: Boolean, default: false })
    this.option('has-backend', { type: Boolean, default: true })

    // props are used by templates
    this.props = {}
    this.props.adobeServices = this.options['adobe-services'].split(',').map(x => x.trim())
    this.props.projectName = this.options['project-name']
    this.props.sdkCodes = sdkCodes
    this.props.eventCodes = eventCodes
    this.props.hasBackend = this.options['has-backend']
  }

  // nothing for now
  // async prompting () {}

  writing () {
    this.sourceRoot(path.join(__dirname, './templates/'))
    this.fs.copyTpl(this.templatePath('./**/*'), this.destinationPath(webAssetsDirname), this.props)
    // add .babelrc
    this.fs.writeJSON(this.destinationPath('.babelrc'), { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] })
    // add dependencies
    utils.addDependencies(this, {
      'core-js': '^3.6.4',
      react: '^16.13.1',
      'react-dom': '^16.13.1',
      'react-error-boundary': '^1.2.5',
      'regenerator-runtime': '^0.13.5',
      '@adobe/exc-app': '^0.2.14',
      '@react-spectrum/button': '^3.0.0-rc.2',
      '@react-spectrum/form': '^3.0.0-rc.2',
      '@react-spectrum/layout': '^3.0.0-alpha.1',
      '@react-spectrum/link': '^3.0.0-alpha.1',
      '@react-spectrum/picker': '^3.0.0-alpha.1',
      '@react-spectrum/progress': '^3.0.0-rc.2',
      '@react-spectrum/provider': '^3.0.0-rc.2',
      '@react-spectrum/textfield': '^3.0.0-rc.2',
      '@react-spectrum/theme-default': '^3.0.0-rc.2',
      '@react-spectrum/typography': '^3.0.0-alpha.1'
    })
    utils.addDependencies(this, {
      '@babel/core': '^7.8.7',
      '@babel/polyfill': '^7.8.7',
      '@babel/preset-env': '^7.8.7'
    }, true)
    // add env variable to load ui in exc shell
    utils.appendOrWrite(this, this.destinationPath(dotenvFilename),
      'AIO_LAUNCH_URL_PREFIX="https://experience.adobe.com/?devMode=true#/custom-apps/?localDevUrl="')
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message'
    if (!this.options['skip-install']) return this.installDependencies({ bower: false, skipMessage: true })
  }
}

module.exports = ExcReactGenerator
