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

class CodeGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('project-name', { type: String, default: path.basename(process.cwd()) })

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
    // let actions and ui generator create subfolders + manifest

    // npm pack leaves the unused `_dot.ignore and _dot.env` files on the system
    // so we need to remove these unused files
    // see https://github.com/adobe/generator-aio-app/issues/184
    this.fs.delete(
      [this.destinationPath('_dot.env'), this.destinationPath('_dot.gitignore')],
      this.props
    )
  }
}

module.exports = CodeGenerator
