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

import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import fs from 'fs'
import path from 'path'

import theGenerator from '../../../generators/add-ci/index.js'
import Generator from 'yeoman-generator'

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(theGenerator.prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('should create files under .github', async () => {
    await helpers.run(theGenerator)
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.env'), 'FAKECONTENT')
      })

    // added files
    assert.file('.github/workflows/pr_test.yml')
    assert.fileContent('.github/workflows/pr_test.yml', 'version: 11.x.x')
    assert.fileContent('.github/workflows/pr_test.yml', 'adobe/aio-apps-action@4.1.0')
    assert.fileContent('.github/workflows/pr_test.yml', 'environment: stage')
    assert.fileContent('.github/workflows/pr_test.yml', 'secrets.CLIENTID')
    assert.noFileContent('.github/workflows/pr_test.yml', 'secrets.CLIENTID_STAGE')
    assert.file('.github/workflows/deploy_prod.yml')
    assert.fileContent('.github/workflows/deploy_prod.yml', 'version: 11.x.x')
    assert.fileContent('.github/workflows/deploy_prod.yml', 'adobe/aio-apps-action@4.1.0')
    assert.fileContent('.github/workflows/deploy_prod.yml', 'environment: production')
    assert.fileContent('.github/workflows/deploy_prod.yml', 'secrets.CLIENTID')
    assert.noFileContent('.github/workflows/deploy_prod.yml', 'secrets.CLIENTID_PROD')
    assert.file('.github/workflows/deploy_stage.yml')
    assert.fileContent('.github/workflows/deploy_stage.yml', 'version: 11.x.x')
    assert.fileContent('.github/workflows/deploy_stage.yml', 'adobe/aio-apps-action@4.1.0')
    assert.fileContent('.github/workflows/deploy_stage.yml', 'environment: stage')
    assert.fileContent('.github/workflows/deploy_stage.yml', 'secrets.CLIENTID')
    assert.noFileContent('.github/workflows/deploy_stage.yml', 'secrets.CLIENTID_STAGE')
  })
})
