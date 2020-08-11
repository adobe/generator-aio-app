/* <% if (false) { %>
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
<% } %>
* <license header>
*/

import React from 'react'
import { ListBox, Item } from '@adobe/react-spectrum'
import { useLocation } from 'react-router-dom'

const navItems = [
  {
    path: '/',
    name: 'Home'
  },
  {
    path: '/actions',
    name: 'Actions'
  },
  {
    path: '/about',
    name: 'About'
  }
]

function SideBar () {
  const location = useLocation()
  return (
    <ListBox
      aria-label="SideNav"
      selectionMode="single"
      defaultSelectedKeys={[location.pathname]}
      onSelectionChange={navigateTo}
      items={navItems}
      disallowEmptySelection={true}
    >
      {(item) => <Item key={item.path}>{item.name}</Item>}
    </ListBox>
  )

  function navigateTo (items) {
    const route = items.values().next()
    if (route.value) {
      window.location.hash = route.value
    }
  }
}

export default SideBar
