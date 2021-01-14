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

const {
  absApp,
  objGetValue
} = require('../../../generators/add-vscode-config/utils')

test('exports', () => {
  expect(typeof absApp).toEqual('function')
  expect(typeof objGetValue).toEqual('function')
})

test('absApp', () => {
  expect(() => absApp(undefined, undefined)).toThrowError()
  expect(() => absApp(undefined, 'bar')).toThrowError()
  expect(() => absApp('/foo', undefined)).toThrowError()

  expect(absApp('/foo', 'bar')).toEqual('/foo/bar')
  expect(absApp('/foo', '/foo/bar')).toEqual('/foo/bar')
})

test('objGetValue', () => {
  const obj = {
    foo: {
      bar: 'baz'
    }
  }

  expect(objGetValue(undefined, undefined)).toEqual(undefined)
  expect(objGetValue(undefined, 'foo')).toEqual(undefined)
  expect(objGetValue(obj, undefined)).toEqual(obj)
  expect(objGetValue(obj, 'foo')).toEqual({ bar: 'baz' })
  expect(objGetValue(obj, 'foo.bar')).toEqual('baz')
})
