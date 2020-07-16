const utils = require('../../lib/utils')

describe('atLeastOne', () => {
  test('returns true if input.length > 0', () => {
    expect(utils.atLeastOne([1])).toBe(true)
  })
  test('returns "please choose at least one option" if input.length === 0', () => {
    expect(utils.atLeastOne([])).toBe('please choose at least one option')
  })
})

describe('appendOrWrite', () => {
  test('writes if file does not exist', () => {
    const mockWrite = jest.fn()
    const mockAppend = jest.fn()
    const mockRead = jest.fn()
    const generator = {
      fs: {
        read: mockRead,
        exists: () => false,
        write: mockWrite,
        append: mockAppend
      }
    }
    utils.appendOrWrite(generator, 'file', 'content')
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('file', 'content')
    expect(mockAppend).toHaveBeenCalledTimes(0)
    expect(mockRead).toBeCalledTimes(0)
  })

  test('appends if file exists', () => {
    const mockWrite = jest.fn()
    const mockAppend = jest.fn()
    const mockRead = jest.fn()
    const generator = {
      fs: {
        read: mockRead,
        exists: () => true,
        write: mockWrite,
        append: mockAppend
      }
    }
    utils.appendOrWrite(generator, 'file', 'content')
    expect(mockAppend).toHaveBeenCalledTimes(1)
    expect(mockAppend).toHaveBeenCalledWith('file', 'content')
    expect(mockWrite).toHaveBeenCalledTimes(0)
    expect(mockRead).toBeCalledTimes(0)
  })

  test('does not append if file contains filter', () => {
    const mockWrite = jest.fn()
    const mockAppend = jest.fn()
    const mockRead = jest.fn().mockReturnValue('exists')
    const generator = {
      fs: {
        read: mockRead,
        exists: () => true,
        write: mockWrite,
        append: mockAppend
      }
    }
    utils.appendOrWrite(generator, 'file', 'content exists', 'exists')
    expect(mockRead).toHaveBeenCalledWith('file')
    expect(mockAppend).toHaveBeenCalledTimes(0)
    expect(mockWrite).toHaveBeenCalledTimes(0)
  })
})

test('appends if file does not contain filter', () => {
  const mockWrite = jest.fn()
  const mockAppend = jest.fn()
  const mockRead = jest.fn().mockReturnValue('exists')
  const generator = {
    fs: {
      read: mockRead,
      exists: () => true,
      write: mockWrite,
      append: mockAppend
    }
  }
  utils.appendOrWrite(generator, 'file', 'content notexists', 'notexists')
  expect(mockRead).toHaveBeenCalledWith('file')
  expect(mockAppend).toHaveBeenCalledTimes(1)
  expect(mockAppend).toHaveBeenCalledWith('file', 'content notexists')
  expect(mockWrite).toHaveBeenCalledTimes(0)
})

describe('guessProjectName', () => {
  test('returns cwd if package.json does not exist', () => {
    const spy = jest.spyOn(process, 'cwd')
    spy.mockReturnValue('FAKECWD')
    expect(utils.guessProjectName({
      destinationPath: () => { },
      fs: {
        exists: () => false
      }
    })).toEqual('FAKECWD')
    spy.mockRestore()
  })

  test('returns cwd if package.json[name] is not defined', () => {
    const spy = jest.spyOn(process, 'cwd')
    spy.mockReturnValue('FAKECWD')
    expect(utils.guessProjectName({
      destinationPath: () => { },
      fs: {
        exists: () => true,
        readJSON: () => ({})
      }
    })).toEqual('FAKECWD')
    spy.mockRestore()
  })

  test('returns package.json[name] if package.json exists and has a name attribut', () => {
    expect(utils.guessProjectName({
      destinationPath: () => { },
      fs: {
        exists: () => true,
        readJSON: () => ({ name: 'FAKENAME' })
      }
    })).toEqual('FAKENAME')
  })
})

describe('addPkgScript', () => {
  test('adds scripts to package.json', () => {
    const mockRead = jest.fn(() => {
      return ({ name: 'bob', scripts: { scripta: 'a' } })
    })
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: () => 'some-path',
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addPkgScript(generator, { scriptb: 'b' })

    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', expect.objectContaining({ name: 'bob', scripts: { scripta: 'a', scriptb: 'b' } }))
  })

  test('overwrites existing scripts package.json', () => {
    const mockRead = jest.fn(() => {
      return ({ name: 'bob', scripts: { scripta: 'a' } })
    })
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: () => 'some-path',
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addPkgScript(generator, { scripta: 'b' })

    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', expect.objectContaining({ name: 'bob', scripts: { scripta: 'b' } }))
  })

  test('writes package.json if null', () => {
    const mockRead = jest.fn()
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: () => 'some-path',
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addPkgScript(generator, { scripta: 'b' })

    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', expect.objectContaining({ scripts: { scripta: 'b' } }))
  })
})

describe('readPackageJson', () => {
  test('if package.json is empty', () => {
    const mockRead = jest.fn(() => {
      return ''
    })
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        readJSON: mockRead
      }
    }
    expect(utils.readPackageJson(generator)).toEqual({})
    expect(mockRead).toHaveBeenCalledWith('some-path')
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
  })

  test('if package.json is { a: key, scripts: { b: c } }', () => {
    const mockRead = jest.fn(() => {
      return { a: 'key', scripts: { b: 'c' } }
    })
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        readJSON: mockRead
      }
    }
    expect(utils.readPackageJson(generator)).toEqual({ a: 'key', scripts: { b: 'c' } })
    expect(mockRead).toHaveBeenCalledWith('some-path')
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
  })
})

describe('writePackageJson', () => {
  test('if content is empty', () => {
    const mockWrite = jest.fn(() => {
      return ''
    })
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        writeJSON: mockWrite
      }
    }
    utils.writePackageJson(generator, '')
    expect(mockWrite).toHaveBeenCalledWith('some-path', {})
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
  })

  test('if content is { a: key, scripts: { b: c } }', () => {
    const mockWrite = jest.fn(() => {
      return ''
    })
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        writeJSON: mockWrite
      }
    }
    utils.writePackageJson(generator, { a: 'key', scripts: { b: 'c' } })
    expect(mockWrite).toHaveBeenCalledWith('some-path', { a: 'key', scripts: { b: 'c' } })
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
  })
})

describe('addDependencies', () => {
  test('adds dependencies to package.json with no existing dependencies', () => {
    const mockRead = jest.fn(() => {
      return undefined
    })
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addDependencies(generator, { a: 'b', c: 'd' })

    expect(mockRead).toHaveBeenCalledWith('some-path')
    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', { dependencies: { a: 'b', c: 'd' } })
  })
  test('adds devDependencies to package.json with no existing devDependencies', () => {
    const mockRead = jest.fn(() => {
      return undefined
    })
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addDependencies(generator, { a: 'b', c: 'd' }, true)

    expect(mockRead).toHaveBeenCalledWith('some-path')
    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', { devDependencies: { a: 'b', c: 'd' } })
  })
  test('adds and overwrites dependencies in package.json', () => {
    const mockRead = jest.fn(() => {
      return { dependencies: { a: 'fake', e: 'f' }, devDependencies: { g: 'h' } }
    })
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addDependencies(generator, { a: 'b', c: 'd' })

    expect(mockRead).toHaveBeenCalledWith('some-path')
    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', { dependencies: { a: 'b', c: 'd', e: 'f' }, devDependencies: { g: 'h' } })
  })

  test('adds and overwrites devDependencies in package.json', () => {
    const mockRead = jest.fn(() => {
      return { devDependencies: { a: 'fake', e: 'f' }, dependencies: { g: 'h' } }
    })
    const mockWrite = jest.fn()
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        readJSON: mockRead,
        writeJSON: mockWrite
      }
    }
    utils.addDependencies(generator, { a: 'b', c: 'd' }, true)

    expect(mockRead).toHaveBeenCalledWith('some-path')
    expect(mockRead).toHaveBeenCalledTimes(1)
    expect(generator.destinationPath).toHaveBeenCalledWith('package.json')
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('some-path', { devDependencies: { a: 'b', c: 'd', e: 'f' }, dependencies: { g: 'h' } })
  })
})
