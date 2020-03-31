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

const theGeneratorPath = require.resolve('../../../generators/add-web-assets/exc-react')
const Generator = require('yeoman-generator')

const installDependencies = jest.spyOn(Generator.prototype, 'installDependencies')
beforeAll(() => {
  // mock implementations
  installDependencies.mockReturnValue(undefined)
})
beforeEach(() => {
  installDependencies.mockClear()
})
afterAll(() => {
  installDependencies.mockRestore()
})

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

function assertEnvContent (prevContent) {
  assert.fileContent('.env', 'AIO_LAUNCH_URL_PREFIX="https://experience.adobe.com/?devMode=true#/myapps/?localDevUrl="')
  assert.fileContent('.env', prevContent)
}

function assertDependencies () {
  expect(JSON.parse(fs.readFileSync('package.json').toString())).toEqual({
    dependencies: {
      react: expect.any(String),
      'react-dom': expect.any(String),
      'react-error-boundary': expect.any(String),
      'core-js': expect.any(String),
      'regenerator-runtime': expect.any(String),
      '@adobe/exc-app': expect.any(String)
    },
    devDependencies: {
      '@babel/core': expect.any(String),
      '@babel/polyfill': expect.any(String),
      '@babel/preset-env': expect.any(String)
    }
  })
}

function assertFiles () {
  assert.file('web-src/index.html')
  assert.file('web-src/404.html')
  assert.file('web-src/src/index.js')
  assert.file('web-src/src/App.js')
  assert.file('web-src/src/App.css')
  assert.file('web-src/src/utils.js')
  assert.file('web-src/src/exc-runtime.js')
}

function assertWithActions () {
  assert.fileContent('web-src/src/App.js', '<h3>Your application backend actions</h3>')
  assert.fileContent('web-src/src/App.js', 'invoke</button>')
  assert.fileContent('web-src/src/App.js', 'async invoke (')
  assert.fileContent('web-src/src/App.js', '<a href="https://adobedocs.github.io/adobeio-runtime/">Adobe I/O Runtime</a>')
}

function assertWithNoActions () {
  assert.noFileContent('web-src/src/App.js', '<h3>Your application backend actions</h3>')
  assert.noFileContent('web-src/src/App.js', 'invoke</button>')
  assert.noFileContent('web-src/src/App.js', 'async invoke (')
  assert.noFileContent('web-src/src/App.js', '<a href="https://adobedocs.github.io/adobeio-runtime/">Adobe I/O Runtime</a>')
}

function assertWithDoc () {
  assert.fileContent('web-src/src/App.js', '<h3>Useful documentation for your app</h3>')
  assert.fileContent('web-src/src/App.js', '<a href="https://github.com/AdobeDocs/adobe-custom-applications/blob/master/README.md">Adobe I/O Custom Applications</a>')
}

const prevDotEnv = 'FAKECONTENT'

describe('run', () => {
  test('--project-name abc', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'project-name': 'abc', 'skip-install': false })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnv)
      })

    assertFiles()
    assertDependencies()
    assertEnvContent(prevDotEnv)

    // greats with projectName
    assert.fileContent('web-src/src/App.js', '<h1>Welcome to abc!</h1>')

    // make sure html calls js files
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"')

    assertWithActions()
    assertWithDoc()

    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--project-name abc --has-backend false', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'project-name': 'abc', 'skip-install': false, 'has-backend': false })
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), prevDotEnv)
      })

    assertFiles()
    assertDependencies()
    assertEnvContent(prevDotEnv)

    // greats with projectName
    assert.fileContent('web-src/src/App.js', '<h1>Welcome to abc!</h1>')

    // make sure html calls js files
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"')

    assertWithNoActions()
    assertWithDoc()

    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--project-name abc --skip-install', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'project-name': 'abc', 'skip-install': true })
    expect(installDependencies).toHaveBeenCalledTimes(0)
  })
})
