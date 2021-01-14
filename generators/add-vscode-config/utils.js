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

const path = require('path')

function absApp (root, p) {
  if (path.isAbsolute(p)) return p
  return path.join(root, path.normalize(p))
}

function objGetProp (obj, key) {
  return obj[Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())]
}

function objGetValue (obj, key) {
  const keys = (key || '').toString().split('.')
  return keys.filter(o => o.trim()).reduce((o, i) => o && objGetProp(o, i), obj)
}

module.exports = {
  absApp,
  objGetValue
}
