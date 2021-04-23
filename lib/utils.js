const path = require('path')
const yaml = require('js-yaml')
const { appConfigFile } = require('./constants')

function atLeastOne (input) {
  if (input.length === 0) {
    return 'please choose at least one option'
  }
  return true
}

/* app generator specific utilities */

function writeExtensionPointConfig (generator, extensionPointKey, extensionPointConfig) {
  const appConfigPath = generator.destinationPath(appConfigFile)
  const appConfig = readYAMLConfig(generator, appConfigPath)
  if (!appConfig.extensionPoints) {
    appConfig.extensionPoints = {}
  }
  appConfig.extensionPoints[extensionPointKey] = extensionPointConfig
  writeYAMLConfig(generator, extensionPointKey, appConfig)
}

function readYAMLConfig (generator, configPath) {
  if (!generator.fs.exists(configPath)) {
    return {}
  }
  return generator.safeLoad(this.fs.read(configPath))
}

function writeYAMLConfig (generator, configPath, config) {
  generator.fs.write(configPath, yaml.safeDump(config))
}

function guessProjectName (generator) {
  const packagejsonPath = generator.destinationPath('package.json')
  return (generator.fs.exists(packagejsonPath) && generator.fs.readJSON('package.json').name) || path.basename(process.cwd())
}

function readPackageJson (generator) {
  const packagejsonPath = generator.destinationPath('package.json')
  return generator.fs.readJSON(packagejsonPath) || {}
}

function writePackageJson (generator, content) {
  const packagejsonPath = generator.destinationPath('package.json')
  return generator.fs.writeJSON(packagejsonPath, content || {})
}

function addDependencies (generator, deps, dev = false) {
  const content = readPackageJson(generator)
  const key = dev ? 'devDependencies' : 'dependencies'
  content[key] = { ...content[key], ...deps }
  writePackageJson(generator, content)
}

function addPkgScript (generator, scripts) {
  const content = readPackageJson(generator)
  content.scripts = { ...content.scripts, ...scripts }
  writePackageJson(generator, content)
}

function appendOrWrite (generator, file, content, filter) {
  if (generator.fs.exists(file)) {
    // do not write if already there
    return !(filter && generator.fs.read(file).includes(filter)) && generator.fs.append(file, content)
  }
  return generator.fs.write(file, content)
}

module.exports = {
  atLeastOne,
  guessProjectName,
  addDependencies,
  appendOrWrite,
  addPkgScript,
  readPackageJson,
  writePackageJson,
  readYAMLConfig,
  writeYAMLConfig,
  writeExtensionPointConfig
}
