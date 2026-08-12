const assert = require('node:assert/strict')
const test = require('node:test')

test('matches configured folders only at a path boundary', () => {
    const { state, watchers } = loadPlugin()

    try {
        watchers.uri('/foobar/')
        assert.equal(state.tile_size, 3)

        watchers.uri('/foo/child/')
        assert.equal(state.tile_size, 10)

        watchers.uri('/elsewhere/')
        assert.equal(state.tile_size, 3)
    }
    finally {
        delete global.HFS
        delete global.sessionStorage
    }
})

test('respects a manual tile change within the active folder and across reloads', () => {
    const storage = makeStorage()
    let loaded = loadPlugin(storage)

    try {
        loaded.watchers.uri('/foo/')
        assert.equal(loaded.state.tile_size, 10)

        loaded.state.tile_size = 0
        loaded.watchers.uri('/foo/child/')
        assert.equal(loaded.state.tile_size, 0)

        loaded = loadPlugin(storage, 0)
        loaded.watchers.uri('/foo/child/')
        assert.equal(loaded.state.tile_size, 0)

        loaded.watchers.uri('/elsewhere/')
        assert.equal(loaded.state.tile_size, 0)
        loaded.watchers.uri('/foo/')
        assert.equal(loaded.state.tile_size, 10)
    }
    finally {
        delete global.HFS
        delete global.sessionStorage
    }
})

test('restores the previous mode after reloading inside an automatic folder', () => {
    const storage = makeStorage()
    let loaded = loadPlugin(storage)

    try {
        loaded.watchers.uri('/foo/')
        assert.equal(loaded.state.tile_size, 10)

        loaded = loadPlugin(storage, 10)
        loaded.watchers.uri('/foo/')
        loaded.watchers.uri('/elsewhere/')
        assert.equal(loaded.state.tile_size, 3)
    }
    finally {
        delete global.HFS
        delete global.sessionStorage
    }
})

function loadPlugin(storage = makeStorage(), tileSize = 3) {
    const watchers = {}
    const state = new Proxy({ tile_size: tileSize }, {
        set(target, key, value) {
            target[key] = value
            watchers[key]?.(value)
            return true
        },
    })
    global.sessionStorage = storage
    global.HFS = {
        getPluginConfig: () => ({ tileSize: 10, folders: [{ path: '/foo', depth: 0 }] }),
        state,
        watchState: (key, callback) => watchers[key] = callback,
    }
    delete require.cache[require.resolve('../dist/public/main.js')]
    require('../dist/public/main.js')
    return { state, watchers }
}

function makeStorage() {
    const values = new Map()
    return {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
    }
}
