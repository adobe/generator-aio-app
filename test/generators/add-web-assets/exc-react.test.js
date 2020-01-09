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

describe('run', () => {
  test('--project-name abc', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'project-name': 'abc', 'skip-install': false })

    // added files
    assert.file('web-src/index.html')
    assert.file('web-src/404.html')
    assert.file('web-src/src/index.js')
    assert.file('web-src/src/App.js')
    assert.file('web-src/src/exc-runtime.js')

    // make sure react dependencies are added
    assert.jsonFileContent('package.json', {
      dependencies: {
        react: '^16.9.0',
        'react-dom': '^16.9.0',
        'react-error-boundary': '^1.2.5'
      }
    })

    // greats with projectName
    assert.fileContent('web-src/src/App.js', '<h1>Welcome to abc!</h1>')

    // make sure html calls js files
    assert.fileContent('web-src/index.html', '<script src="./src/exc-runtime.js"')
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"')

    expect(installDependencies).toHaveBeenCalledTimes(1)
  })

  test('--project-name abc --skip-install', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'project-name': 'abc', 'skip-install': true })
    expect(installDependencies).toHaveBeenCalledTimes(0)
  })
})

// todo check with existing files in project
