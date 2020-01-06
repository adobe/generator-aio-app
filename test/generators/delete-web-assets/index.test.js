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
const fs = require('fs-extra')
const helpers = require('yeoman-test')
const assert = require('yeoman-assert')

const theGeneratorPath = require.resolve('../../../generators/delete-web-assets')
const Generator = require('yeoman-generator')

jest.mock('../../../lib/utils')

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  function writeFakeWebAssets (dir) {
    const htmlContent = '<html><body>hello</body></html>'
    const htmlPath = 'web-src/index.html'
    const jsContent = 'window.fake = () => {}'
    const jsPath = 'web-src/src/index.js'

    // we use real fs, dir is provided by yeoman-test helpers and will be cleaned up
    fs.ensureDirSync(path.join(dir, path.dirname(htmlPath)))
    fs.writeFileSync(path.join(dir, htmlPath), htmlContent)
    fs.ensureDirSync(path.join(dir, path.dirname(jsPath)))
    fs.writeFileSync(path.join(dir, jsPath), jsContent)
  }

  test('no web-src folder', async () => {
    await expect(
      helpers.run(theGeneratorPath)
    ).rejects.toThrow('you have no webAssets in your project')
  })

  test('prompts yes to delete confirmation', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        writeFakeWebAssets(dir)
      })
      .withPrompts({ deleteWebAssets: true })

    assert.noFile('web-src/src/index.js')
    assert.noFile('web-src/index.html')
    expect(fs.existsSync(path.join(dir, 'web-src'))).toEqual(false)
  })

  test('prompts false to delete confirmation', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        writeFakeWebAssets(dir)
      })
      .withPrompts({ deleteWebAssets: false })

    assert.file('web-src/src/index.js')
    assert.file('web-src/index.html')
    expect(fs.existsSync(path.join(dir, 'web-src'))).toEqual(true)
  })

  test('--skip-prompt', async () => {
    const dir = await helpers.run(theGeneratorPath)
      .inTmpDir(dir => {
        writeFakeWebAssets(dir)
      })
      .withOptions({ 'skip-prompt': true })

    assert.noFile('web-src/src/index.js')
    assert.noFile('web-src/index.html')
    expect(fs.existsSync(path.join(dir, 'web-src'))).toEqual(false)
  })
})
