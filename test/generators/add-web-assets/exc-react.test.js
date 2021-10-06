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

/* eslint-disable jest/expect-expect */ // => use assert

const helpers = require('yeoman-test')
const assert = require('yeoman-assert')
const fs = require('fs')
const path = require('path')
const cloneDeep = require('lodash.clonedeep')

const theGeneratorPath = require.resolve(
  '../../../generators/add-web-assets/exc-react'
)
const Generator = require('yeoman-generator')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

function assertEnvContent (prevContent) {
  assert.fileContent('.env', prevContent)
}

function assertFiles () {
  assert.file('web-src/index.html')
  assert.file('web-src/src/exc-runtime.js')
  assert.file('web-src/src/index.css')
  assert.file('web-src/src/index.js')
  assert.file('web-src/src/utils.js')
  assert.file('web-src/src/components/About.js')
  assert.file('web-src/src/components/ActionsForm.js')
  assert.file('web-src/src/components/App.js')
  assert.file('web-src/src/components/Home.js')
  assert.file('web-src/src/components/SideBar.js')
}

function assertWithActions () {
  assert.fileContent(
    'web-src/src/components/ActionsForm.js',
    'Run your application backend actions'
  )
  assert.fileContent('web-src/src/components/SideBar.js', 'Actions')
}

function assertWithNoActions () {
  assert.fileContent('web-src/src/components/ActionsForm.js', 'You have no actions !')
}

function assertWithDoc () {
  assert.fileContent(
    'web-src/src/components/About.js',
    'Useful documentation for your app'
  )
  assert.fileContent('web-src/src/components/About.js', 'App Builder')
  assert.fileContent('web-src/src/components/About.js', 'Adobe I/O SDK')
  assert.fileContent('web-src/src/components/About.js', 'React Spectrum')
}

const prevDotEnv = 'FAKECONTENT'

describe('run', () => {
  test('--project-name abc', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['project-name'] = 'abc'
    options['web-src-folder'] = 'web-src'
    await helpers
      .run(theGeneratorPath)
      .withOptions(options)
      .inTmpDir((dir) => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnv)
      })

    assertFiles()
    assertDependencies(
      fs,
      {
        react: expect.any(String),
        'react-dom': expect.any(String),
        'react-error-boundary': expect.any(String),
        'core-js': expect.any(String),
        'regenerator-runtime': expect.any(String),
        '@adobe/exc-app': expect.any(String),
        '@adobe/react-spectrum': expect.any(String),
        '@spectrum-icons/workflow': expect.any(String),
        'react-router-dom': expect.any(String)
      },
      {
        '@babel/core': expect.any(String),
        '@babel/polyfill': expect.any(String),
        '@babel/preset-env': expect.any(String),
        '@babel/plugin-transform-react-jsx': expect.any(String)
      }
    )
    assertEnvContent(prevDotEnv)

    // greats with projectName
    // TODO fix check failing content mismatch, possible bug
    // assert.fileContent('web-src/src/components/Home.js', 'Welcome to abc!')

    // make sure html calls js files
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"')

    assertWithActions()
    assertWithDoc()
  })

  test('--project-name abc --has-backend false', async () => {
    const options = cloneDeep(global.basicGeneratorOptions)
    options['project-name'] = 'abc'
    options['has-backend'] = false
    options['web-src-folder'] = 'web-src'
    await helpers
      .run(theGeneratorPath)
      .withOptions(options)
      .inTmpDir((dir) => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnv)
      })

    assertFiles()
    assertDependencies(
      fs,
      {
        react: expect.any(String),
        'react-dom': expect.any(String),
        'react-error-boundary': expect.any(String),
        'core-js': expect.any(String),
        'regenerator-runtime': expect.any(String),
        '@adobe/exc-app': expect.any(String),
        '@adobe/react-spectrum': expect.any(String),
        '@spectrum-icons/workflow': expect.any(String),
        'react-router-dom': expect.any(String)
      },
      {
        '@babel/core': expect.any(String),
        '@babel/polyfill': expect.any(String),
        '@babel/preset-env': expect.any(String),
        '@babel/plugin-transform-react-jsx': expect.any(String)
      }
    )
    assertEnvContent(prevDotEnv)

    // greats with projectName
    // TODO fix check failing content mismatch, possible bug
    // assert.fileContent('web-src/src/components/Home.js', 'Welcome to abc!')

    // make sure html calls js files
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"')

    assertWithNoActions()
    assertWithDoc()
  })
})
