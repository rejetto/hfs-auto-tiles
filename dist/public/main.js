'use strict';{
    const cfg = HFS.getPluginConfig()
    const { state } = HFS
    let backup

    HFS.watchState('uri', uri => {
        for (const x of cfg.folders)
            if (uri.startsWith(x.path)) { // match path
                const depth = uri.slice(x.path.length).split('/').length - 1
                if (depth >= x.depth) { // match depth
                    if (state.tile_size === cfg.tileSize) return // already in position, nothing to do
                    backup = state.tile_size
                    state.tile_size = cfg.tileSize
                    return
                }
            }
        // no match found
        if (backup !== undefined) { // possibly restore
            state.tile_size = backup
            backup = undefined
        }
    })
}
