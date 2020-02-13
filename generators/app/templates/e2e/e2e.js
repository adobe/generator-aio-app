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

const execa = require('execa')
const chalk = require('chalk').default
const fetch = require('node-fetch');

test('config create test', async () => {

  const name = 'aio-action'
  console.log(chalk.blue(`> e2e tests for ${chalk.bold(name)}`))

  console.log(chalk.bold('    - start local server' + process.env['AIO_RUNTIME_NAMESPACE']))
  execa.sync('node', ['aio', 'app', 'deploy']);
  resp = await fetch('https://' + process.env['AIO_RUNTIME_NAMESPACE'] + '.adobeio-static.net/1-0.0.1/index.html')
  expect(resp).toEqual(expect.objectContaining({
      statusCode: 200
    }))
  execa.sync('node', ['aio', 'app', 'undeploy']);
  
  console.log(chalk.green(`    - done for ${chalk.bold(name)}`))
});
