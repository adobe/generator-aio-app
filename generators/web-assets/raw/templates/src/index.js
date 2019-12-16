/* <% if (false) { %>
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
<% } %> */
import actions from './config.json'

window.showActionsList = () => {
  const container = document.getElementById('action-list')
  if (Object.keys(actions).length === 0) {
    container.innerHTML = '<ul><li>you have no actions, run <code>aio app add actions</code> to add one</li></ul>'
  } else {
    container.innerHTML = '<ul>' + Object.entries(actions).map(([_, url]) => `<li><a href=${url}>${url}</a></li>`).join('') + '</ul>'
  }
}
