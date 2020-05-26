const path = require('path')

function atLeastOne (input) {
  if (input.length === 0) {
    return 'please choose at least one option'
  }
  return true
}

// todo move all those utils (until eof) to an app generator super class

function guessProjectName (generator) {
  const packagejsonPath = generator.destinationPath('package.json')
  return (generator.fs.exists(packagejsonPath) && generator.fs.readJSON('package.json').name) || path.basename(process.cwd())
}

function addDependencies (generator, deps, dev = false) {
  const packagejsonPath = generator.destinationPath('package.json')
  const packagejsonContent = generator.fs.readJSON(packagejsonPath) || {}
  const key = dev ? 'devDependencies' : 'dependencies'
  packagejsonContent[key] = { ...packagejsonContent[key], ...deps }
  generator.fs.writeJSON(packagejsonPath, packagejsonContent)
}

function addPkgScript (generator, scripts) {
  const pkgPath = generator.destinationPath('package.json')
  const pkgContent = generator.fs.readJSON(pkgPath) || {}
  pkgContent.scripts = Object.assign(pkgContent.scripts, scripts)
  generator.fs.writeJSON(pkgPath, pkgContent)
}

function appendOrWrite (generator, file, content) {
  if (generator.fs.exists(file)) {
    return generator.fs.append(file, content)
  }
  return generator.fs.write(file, content)
}

module.exports = {
  atLeastOne,
  guessProjectName,
  addDependencies,
  appendOrWrite,
  addPkgScript
}
