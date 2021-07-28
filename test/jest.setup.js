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
const { stdout, stderr } = require('stdout-stderr')

process.on('unhandledRejection', error => {
  throw error
})

// trap console log
beforeEach(() => { stdout.start(); stderr.start(); stdout.print = true })
afterEach(() => { stdout.stop(); stderr.stop() })

// quick normalization to test windows/unix paths
global.n = p => path.normalize(p)
global.r = p => path.resolve(p)

global.assertDependencies = (fs, dependencies, devDependencies) => {
  expect(JSON.parse(fs.readFileSync('package.json').toString())).toEqual(expect.objectContaining({
    dependencies,
    devDependencies
  }))
}

global.assertNodeEngines = (fs, nodeEngines) => {
  expect(JSON.parse(fs.readFileSync('package.json').toString())).toEqual(expect.objectContaining({
    engines: { node: nodeEngines }
  }))
}
global.basicGeneratorOptions = {
  'action-folder': 'actions',
  'config-path': 'ext.config.yaml',
  'full-key-to-manifest': 'runtimeManifest'
}
