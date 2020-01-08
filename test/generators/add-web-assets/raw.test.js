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

const theGeneratorPath = require.resolve('../../../generators/add-web-assets/raw')
const Generator = require('yeoman-generator')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('--project-name abc --adobe-services analytics,target,campaign-standard', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'analytics,target,campaign-standard', 'project-name': 'abc' })

    // added files
    assert.file('web-src/index.html')
    assert.file('web-src/404.html')
    assert.file('web-src/src/index.js')

    // greats with projectName
    assert.fileContent('web-src/index.html', '<h1>Welcome to abc!</h1>')

    // make sure service specific doc is here
    assert.fileContent('web-src/index.html', '<li><a href="http://developers.adobetarget.com/api/">Adobe Target API</a></li>')
    assert.fileContent('web-src/index.html', '<li><a href="https://www.adobe.io/apis/experiencecloud/analytics/docs.html">Adobe Analytics API</a></li>')
    assert.fileContent('web-src/index.html', '<li><a href="https://final-docs.campaign.adobe.com/doc/standard/en/api/ACS_API.html">Adobe Campaign Standard API</a></li>')

    // make sure calls index.js to get the list of actions
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"></script>')
    assert.fileContent('web-src/index.html', '<script>window.showActionsList()</script>')
  })

  test('--project-name abc --adobe-services analytics', async () => {
    await helpers.run(theGeneratorPath)
      .withOptions({ 'adobe-services': 'analytics', 'project-name': 'abc' })

    // added files
    assert.file('web-src/index.html')
    assert.file('web-src/404.html')
    assert.file('web-src/src/index.js')

    // greats with projectName
    assert.fileContent('web-src/index.html', '<h1>Welcome to abc!</h1>')

    // make sure service specific doc is here
    assert.noFileContent('web-src/index.html', '<li><a href="http://developers.adobetarget.com/api/">Adobe Target API</a></li>')
    assert.fileContent('web-src/index.html', '<li><a href="https://www.adobe.io/apis/experiencecloud/analytics/docs.html">Adobe Analytics API</a></li>')
    assert.noFileContent('web-src/index.html', '<li><a href="https://final-docs.campaign.adobe.com/doc/standard/en/api/ACS_API.html">Adobe Campaign Standard API</a></li>')

    // make sure calls index.js to get the list of actions
    assert.fileContent('web-src/index.html', '<script src="./src/index.js"></script>')
    assert.fileContent('web-src/index.html', '<script>window.showActionsList()</script>')
  })
})

// todo check with existing files in project
