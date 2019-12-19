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

const { webAssetsDirname } = require('../../lib/constants')

const rawWebAssetsGenerator = path.join(__dirname, 'raw/index.js')

// make it util or in an app super class
const guessProjectName = (generator) => {
  const packagejsonPath = generator.destinationPath('package.json')
  return (generator.fs.exists(packagejsonPath) && generator.fs.readJSON('package.json').name) || path.basename(process.cwd())
}

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

class AddWebAssets extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', { default: false })
    this.option('adobe-services', { type: String, default: '' }) // todo use real sdkCodes from console

    this.option('project-name', { type: String, default: guessProjectName(this) }) // project name is used in html template

    // todo throw meaningful error if add actions/webassets in a non existing project, but how to know if we are in a project?
  }

  async prompting () {
    const prompts = [
      {
        // for now we just have one webAsset generator
        type: 'list',
        name: 'webAssetsGenerator',
        message: 'Which type of UI do you want to add to your project?\nselect template to generate',
        choices: [{ name: 'Raw HTML/JS', value: rawWebAssetsGenerator }],
        when: !this.options['skip-prompt']
      }
    ]
    const promptProps = await this.prompt(prompts)
    // defaults for when skip-prompt is set
    promptProps.webAssetsGenerator = promptProps.webAssetsGenerator || rawWebAssetsGenerator

    // run ui generator
    this.composeWith(promptProps.webAssetsGenerator, {
      'skip-prompt': this.options['skip-prompt'],
      'web-dir': webAssetsDirname,
      'adobe-services': this.options['adobe-services'],
      'project-name': this.options['project-name']
    })
  }

  async install () {
    // this condition makes sure it doesn't print any unwanted 'skip install message' into parent generator
    if (!this.options['skip-install']) return this.installDependencies({ bower: false })
  }
}

module.exports = AddWebAssets
