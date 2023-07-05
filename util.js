


/**
 * Converts a file path to an import name.
 * e.g. "test\Button.node.js" -> "TestButtonNode"
 *
 * @export
 * @param {string} path
 */
export function filePathToImportName(path) {
    return path.split(/\W+/).slice(0, -1).map(capitalizeFirstLetter).join("")
}


export function capitalizeFirstLetter(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1)
}