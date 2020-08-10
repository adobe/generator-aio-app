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
import { Heading, Content, View } from "@adobe/react-spectrum";
import { Link } from "@adobe/react-spectrum";
export const About = () => (
  <View width="size-6000">
    <Heading level={1}>Firefly Apps!</Heading>
    <Content>
      Project Firefly is a complete framework that enables enterprise developers
      to build and deploy custom web applications that extend Adobe Experience
      Cloud solutions and run on Adobe infrastructure. It leverages modern
      technologies (JAM stack, serverless computing, Node, and React) and
      ensures best practices when building applications (event-driven
      architecture, microservices, continuous integration, and delivery).
      <br />
      <Link>
        <a
          href="https://www.adobe.io/apis/experienceplatform/project-firefly/docs.html"
          target="_blank"
        >
          Read more
        </a>
      </Link>
    </Content>
  </View>
);
