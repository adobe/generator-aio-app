# Adobe I/O App Generator

A Yeoman generator for Adobe I/O Applications.

[![Version](https://img.shields.io/npm/v/@adobe/generator-aio-app.svg)](https://npmjs.org/package/@adobe/generator-aio-app)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/generator-aio-app.svg)](https://npmjs.org/package/@adobe/generator-aio-app)
![Node.js CI](https://github.com/adobe/generator-aio-app/workflows/Node.js%20CI/badge.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/generator-aio-app/master.svg?style=flat-square)](https://codecov.io/gh/adobe/generator-aio-app/)


## Usage

This module is used by the Adobe I/O CLI app plugin. 

- `npm install -g @adobe/aio-cli`

- `aio app init` to bootstrap your project's code
- `aio app add action` to add new actions to an existing app
- `aio app add web-assets` to add a UI to an existing app
- `aio app add ci` to add a CI to an existing app
- `aio app delete action` to delete an existing action
- `aio app delete web-assets` to delete the app's UI

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### How to provide new template generators

Two types of generators can be easily contributed to the project:

- action generators, e.g. [analytics action generator](./generators/add-action/analytics/index.js):

  - add a new action template generator into `generators/add-action/<generator-name>/index.js`. It is recommended that
    the generator extends `lib/ActionGenerator.js` that provides a set of helpers.
  - add template files into `generators/add-action/<generator-name>/templates/`
  - update `generators/add-action/index.js` to reference the newly added generator in the prompt choices.

- web assets generators, e.g. [experience cloud shell react generator](./generators/add-web-assets/exc-react/index.js):

  - add a new web assets template generator into `generators/add-web-assets/<generator-name>/index.js`.
  - add template files into `generators/add-web-assets/<generator-name>/templates/`
  - update `generators/add-web-assets/index.js` to reference the newly added generator in the prompt choices.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
