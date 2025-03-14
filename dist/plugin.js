exports.description = "Automatically switch to tiles-mode in selected folders"
exports.version = 0.13
exports.apiRequired = 8.72 // state.uri (vfs_path.files is not mandatory)
exports.repo = "rejetto/hfs-auto-tiles"
exports.frontend_js = "main.js"

exports.config = {
    tileSize: { frontend: true, type: 'number', defaultValue: 10, min: 1, max: 10, xs: 3 },
    folders: {
        frontend: true,
        type: 'array',
        defaultValue: [],
        fields: {
            path: { type: 'vfs_path', files: false, $width: 1 },
            depth: { type: 'number', defaultValue: 0, min: 0, $width: 90,
                helperText: "Set zero to activate as soon as you enter the path above.\nSet 1 to activate only when you enter a sub-folder, or 2 for sub-sub-folder, etc" },
        }
    }
}
exports.configDialog = {
    maxWidth: '30em'
}