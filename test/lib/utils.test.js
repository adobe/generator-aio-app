const utils = require('../../lib/utils')
const eol = require('eol')

describe('atLeastOne', () => {
  test('returns true if input.length > 0', () => {
    expect(utils.atLeastOne([1])).toBe(true)
  })
  test('returns "please choose at least one option" if input.length === 0', () => {
    expect(utils.atLeastOne([])).toBe('please choose at least one option')
  })
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

  test('appendStubVarsToDotenv existing label', () => {
    const mockRead = jest.fn(() => '# label')
    const mockExists = jest.fn(() => {
      return true
    })
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        read: mockRead,
        append: jest.fn(),
        exists: mockExists
      }
    }

    utils.appendStubVarsToDotenv(generator, 'label', ['a', 'b', 'c'])
    expect(generator.fs.append).not.toHaveBeenCalled()
  })

  test('appendStubVarsToDotenv', () => {
    const mockRead = jest.fn(() => '')
    const mockExists = jest.fn(() => {
      return false
    })
    const generator = {
      destinationPath: jest.fn(() => 'some-path'),
      fs: {
        read: mockRead,
        append: jest.fn(),
        exists: mockExists
      }
    }

    utils.appendStubVarsToDotenv(generator, 'fake', ['a', 'b', 'c'])
    expect(generator.fs.append).toHaveBeenCalledWith('some-path', eol.auto(`## fake
#a=
#b=
#c=
`))
  })

  test('writeMultiLayerKeyInObject', () => {
    const obj = {
      test: 'somevalue',
      a: {
        b: {
          c: [{
            test1: 'fakevalue',
            test2: 'fakevalue'
          }]
        }
      }
    }
    utils.writeMultiLayerKeyInObject(obj, 'a.b.c', [{ test: 'new value' }])
    expect(obj.a.b.c[1]).toEqual({ test: 'new value' })
  })
})
