/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable jest/expect-expect */ // => use assert

const theGeneratorPath = require.resolve('../../../generators/base-app/')
const Generator = require('yeoman-generator')

let yeomanTestHelpers
beforeAll(async () => {
  yeomanTestHelpers = (await import('yeoman-test')).default
})

describe('prototype', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })
})

describe('run', () => {
  test('basic ext generator', async () => {
    const options = { 'skip-prompt': true }

    const ret = await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions(options)
    expect(ret).toBeDefined()
    ret.assertFile('.env')
    ret.assertFile('.gitignore')
    ret.assertFile('.eslintrc.json')
    ret.assertJsonFileContent('package.json',
      {
        devDependencies: {
          eslint: '^8',
          'eslint-plugin-jest': '^27.2.3'
        },
        scripts: { lint: 'eslint --ignore-pattern web-src --no-error-on-unmatched-pattern test src actions' }
      }
    )
    ret.assertNoFile('_dot.env')
    ret.assertNoFile('_dot.gitignore')
    ret.assertNoFile('_eslint.basic.json')
    ret.assertNoFile('_eslintrc.adobe.recommended.json')
  })

  test('basic ext generator, no linter', async () => {
    const options = { 'skip-prompt': true, linter: 'none' }

    const ret = await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions(options)
    expect(ret).toBeDefined()
    ret.assertFile('.env')
    ret.assertFile('.gitignore')
    ret.assertNoFile('.eslintrc.json')
    ret.assertNoJsonFileContent('package.json', { scripts: { lint: 'eslint --ignore-pattern web-src --no-error-on-unmatched-pattern test src actions' } })
    ret.assertNoFile('_dot.env')
    ret.assertNoFile('_dot.gitignore')
    ret.assertNoFile('_eslint.basic.json')
    ret.assertNoFile('_eslintrc.adobe.recommended.json')
  })

  test('basic ext generator, adobe recommended linter', async () => {
    const options = { 'skip-prompt': true, linter: 'adobe-recommended' }

    const ret = await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions(options)
    expect(ret).toBeDefined()
    ret.assertFile('.env')
    ret.assertFile('.gitignore')
    ret.assertFile('.eslintrc.json')
    ret.assertJsonFileContent('package.json',
      {
        devDependencies: {
          '@adobe/eslint-config-aio-lib-config': '^3',
          'eslint-config-standard': '^17.1.0',
          'eslint-plugin-import': '^2.28.0',
          'eslint-plugin-jest': '^27.2.3',
          'eslint-plugin-jsdoc': '^42.0.0',
          'eslint-plugin-n': '^15.7',
          'eslint-plugin-node': '^11.1.0',
          'eslint-plugin-promise': '^6.1.1'
        },
        scripts: { lint: 'eslint --ignore-pattern web-src --no-error-on-unmatched-pattern test src actions' }
      }
    )
    ret.assertNoFile('_dot.env')
    ret.assertNoFile('_dot.gitignore')
    ret.assertNoFile('_eslint.basic.json')
    ret.assertNoFile('_eslintrc.adobe.recommended.json')
  })

  test('basic ext generator, prompt returns None', async () => {
    const options = { 'skip-prompt': false, linter: 'none' }

    const ret = await yeomanTestHelpers.run(theGeneratorPath)
      .withOptions(options)
    expect(ret).toBeDefined()
    ret.assertFile('.env')
    ret.assertFile('.gitignore')
    ret.assertNoFile('.eslintrc.json')
    ret.assertNoJsonFileContent('package.json', { scripts: { lint: 'eslint --ignore-pattern web-src --no-error-on-unmatched-pattern test src actions' } })
    ret.assertNoFile('_dot.env')
    ret.assertNoFile('_dot.gitignore')
    ret.assertNoFile('_eslint.basic.json')
    ret.assertNoFile('_eslintrc.adobe.recommended.json')
  })
})
