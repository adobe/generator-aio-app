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

const { constants } = require('@adobe/generator-app-common-lib')
const { dotenvFilename } = constants
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

const linterOptions = {
  none: 'none',
  basic: 'basic',
  'adobe-recommended': 'adobe-recommended'
}

class CodeGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('project-name', { type: String, default: path.basename(process.cwd()) })
    this.option('linter', { type: String, default: linterOptions.basic })

    // props are passed to templates
    this.props = {}
    this.props.projectName = this.options && this.options['project-name']
    this.props.aioAppTemplateVersion = `${this.rootGeneratorName()}@${this.rootGeneratorVersion()}`
  }

  async initializing () {
    this.log(`Bootstrapping code in: ${this.destinationPath()}`)
  }

  writing () {
    // setup basic app structure
    this.sourceRoot(path.join(__dirname, './templates/'))
    // copy everything that does not start with an _
    this.fs.copyTpl(
        `${this.templatePath()}/**/!(_)*/`,
        this.destinationPath(),
        this.props
    )
    // the above excluded our strangely named .env file, lets fix it
    this.fs.copyTpl(
      this.templatePath('_dot.env'),
      this.destinationPath(dotenvFilename),
      this.props
    )
    // npm pack will not include .gitignore template files so we need to rename it
    // see https://github.com/npm/npm/issues/3763
    this.fs.copyTpl(
      this.templatePath('_dot.gitignore'),
      this.destinationPath('.gitignore'),
      this.props
    )
    // add webpack-config.js
    this.fs.copyTpl(
      this.templatePath('webpack-config.js'),
      this.destinationPath('webpack-config.js'),
      this.props
    )
    // add typescript support
    this.fs.copyTpl(
      this.templatePath('tsconfig.json'),
      this.destinationPath('tsconfig.json'),
      this.props
    )

    // setup linter
    switch (this.options.linter) {
      case 'none':
        // remove lint scripts from package.json if no linter
        this.fs.extendJSON(this.destinationPath('package.json'), {
          scripts: {
            lint: undefined,
            'lint:fix': undefined
          }
        })
        break
      case 'basic':
        this.fs.copyTpl(
          this.templatePath('_eslintrc.basic.json'),
          this.destinationPath('.eslintrc.json'),
          this.props
        )
        this.fs.extendJSON(this.destinationPath('package.json'), {
          devDependencies: {
            eslint: '^8',
            'eslint-plugin-jest': '^27.2.3'
          }
        })
        break
      case 'adobe-recommended':
        this.fs.copyTpl(
          this.templatePath('_eslintrc.adobe.recommended.json'),
          this.destinationPath('.eslintrc.json'),
          this.props
        )
        this.fs.extendJSON(this.destinationPath('package.json'), {
          devDependencies: {
            '@adobe/eslint-config-aio-lib-config': '^3',
            'eslint-config-standard': '^17.1.0',
            'eslint-plugin-import': '^2.28.0',
            'eslint-plugin-jest': '^27.2.3',
            'eslint-plugin-jsdoc': '^42.0.0',
            'eslint-plugin-n': '^15.7',
            'eslint-plugin-node': '^11.1.0',
            'eslint-plugin-promise': '^6.1.1'
          }
        })
        break
    }

    // let actions and ui generator create subfolders + manifest

    // npm pack leaves the unused `_dot.ignore and _dot.env` files on the system
    // so we need to remove these unused files
    // see https://github.com/adobe/generator-aio-app/issues/184
    this.fs.delete(
      [
        this.destinationPath('_dot.env'),
        this.destinationPath('_dot.gitignore'),
        this.destinationPath('_eslintrc.basic.json'),
        this.destinationPath('_eslintrc.adobe.recommended.json')
      ],
      this.props
    )
  }
}

module.exports = CodeGenerator
