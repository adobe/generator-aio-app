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

const { utils } = require('@adobe/generator-app-common-lib')

class ExcReactGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)
    // required
    this.option('web-src-folder', { type: String })
    // this.option('skip-prompt', { default: false }) // useless for now
    this.option('config-path', { type: String })

    // props are used by templates
    this.props = {}
    this.props.projectName = utils.readPackageJson(this).name
  }

  // nothing for now
  // async prompting () {}

  writing () {
    const destFolder = this.options['web-src-folder']
    this.sourceRoot(path.join(__dirname, './templates/'))

    this.fs.copyTpl(
      this.templatePath('./**/*'),
      this.destinationPath(destFolder),
      this.props
    )
    // add .babelrc
    /// NOTE this is a global file and might conflict
    this.fs.writeJSON(this.destinationPath('.babelrc'), {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: ['@babel/plugin-transform-react-jsx']
    })
    // add dependencies
    utils.addDependencies(this, {
      'core-js': '^3.6.4',
      react: '^16.13.1',
      'react-dom': '^16.13.1',
      'react-router-dom': '^5.2.0',
      'react-error-boundary': '^1.2.5',
      'regenerator-runtime': '^0.13.5',
      '@adobe/exc-app': '^0.2.21',
      '@adobe/react-spectrum': '^3.4.0',
      '@spectrum-icons/workflow': '^3.2.0'
    })
    utils.addDependencies(
      this,
      {
        '@babel/core': '^7.8.7',
        '@babel/polyfill': '^7.8.7',
        '@babel/preset-env': '^7.8.7',
        '@babel/plugin-transform-react-jsx': '^7.8.3'
      },
      true
    )
  }
}

module.exports = ExcReactGenerator
