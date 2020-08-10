/*<% if (false) { %>
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

import React from "react";
import { Provider, defaultTheme, Grid, View } from "@adobe/react-spectrum";
import SideBar from "./SideBar";
<% if (hasBackend) { %>
import ActionsForm from "./ActionsForm";
<% } %>
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Home } from "./Home";
import { About } from "./About";
function App(props) {
  return (
    <Router>
      <Provider theme={defaultTheme}>
        <Grid
          areas={["sidebar content"]}
          columns={["256px", "3fr"]}
          rows={["auto"]}
          height="100vh"
          gap="size-100"
        >
          <View
            gridArea="sidebar"
            backgroundColor="gray-200"
            padding="size-200"
          >
            <SideBar></SideBar>
          </View>
          <View gridArea="content" padding="size-200">
            <Switch>
              <Route exact path="/">
                <Home></Home>
              </Route>
              <% if (hasBackend) { %>
              <Route path="/actions">
                <ActionsForm runtime={props.runtime} ims={props.ims} />
              </Route>
              <% } %>
              <Route path="/about">
                <About></About>
              </Route>
            </Switch>
          </View>
        </Grid>
      </Provider>
    </Router>
  );
}

export default App;
