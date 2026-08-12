'use strict';{
    const cfg = HFS.getPluginConfig()
    const { state } = HFS
    // session scope preserves temporary state across reloads without making it permanent
    const SESSION_KEY = 'hfs-auto-tiles-state'
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    let { active, backup } = saved || {}
    let changing

    HFS.watchState('tile_size', value => {
        if (!active || changing) return
        backup = value
        saveSession()
    })

    HFS.watchState('uri', uri => {
        let matched
        for (const x of cfg.folders) {
            const path = x.path
            if (path && (uri === path || uri.startsWith(path + (path.endsWith('/') ? '' : '/')))) { // path is undefined when hidden by a root
                const depth = uri.slice(path.length).split('/').length - 1
                if (depth >= x.depth) { // match depth
                    matched = path + '\n' + x.depth
                    break
                }
            }
        }
        if (matched === active) return
        if (active) {
            sessionStorage.removeItem(SESSION_KEY)
            if (backup !== undefined)
                setTileSize(backup)
        }
        active = matched
        backup = undefined
        if (!matched) return
        backup = state.tile_size
        saveSession()
        setTileSize(cfg.tileSize)
    })

    function setTileSize(value) {
        changing = true
        state.tile_size = value
        changing = false
    }

    function saveSession() {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ active, backup }))
    }
}
