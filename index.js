import fs from "fs/promises"
import path from "path"
import { filePathToImportName } from "./util.js"


/**
 * @typedef {object} FindMetaDefinitionFilesOptions
 * 
 * @property {string} directory The directory to read the meta definitions from.
 * @property {string} prefix The prefix to match file names to read. Only files that start with this prefix will be read. Ignored if `pattern` is specified.
 * @property {string} suffix The suffix to match file names to read. Only files that end with this suffix will be read. Ignored if `pattern` is specified.
 * @property {RegExp} pattern The pattern to match file names to read. Only files that match this pattern will be read. Overrides `prefix` and `suffix` if specified.
 * @property {boolean} recursive Whether to recursively search for meta definition files in subdirectories.
 */


/**
 * Finds all meta definition files in the specified directory.
 *
 * @param {FindMetaDefinitionFilesOptions} options
 */
async function findMetaDefinitionFiles({
    directory,
    prefix = "",
    suffix = "",
    pattern,
    recursive = false
} = {}) {
    const files = await fs.readdir(directory, { withFileTypes: true })

    const metaDefinitionFiles = []

    for (const file of files) {
        if (file.isDirectory()) {
            if (recursive) {
                metaDefinitionFiles.push(...await findMetaDefinitionFiles({
                    directory: path.join(directory, file.name),
                    prefix,
                    suffix,
                    pattern,
                    recursive
                }))
            }
        } else {
            if (pattern) {
                if (pattern.test(file.name)) {
                    metaDefinitionFiles.push(path.join(directory, file.name))
                }
            } else {
                if (file.name.startsWith(prefix) && file.name.endsWith(suffix)) {
                    metaDefinitionFiles.push(path.join(directory, file.name))
                }
            }
        }
    }

    return metaDefinitionFiles
}


/**
 * @typedef {object} BuildBarrelOptions
 * @augments FindMetaDefinitionFilesOptions
 * 
 * @property {string} outputPath The path to write the barrel file to.
 * @property {string} definitionKey The key to look for in each object exported from the meta definition files. If specified, the result will be an object with the specified key as the key and the object as the value. If not specified, the result will be an array of the objects.
 */


/**
 * Builds a barrel file for the meta definitions in the specified directory.
 *
 * @export
 * @param {BuildBarrelOptions} options
 */
export async function buildBarrel({
    outputPath = "",
    definitionKey,
    ...options
} = {}) {
    const files = await findMetaDefinitionFiles(options)
    const importNames = files.map(
        file => filePathToImportName(path.relative(options.directory, file))
    )

    let barrelContent = importNames.map((importName, i) => {
        const importPath = path.relative(path.dirname(outputPath), files[i])
            .replaceAll("\\", "/")

        return `import ${importName} from "./${importPath}"`
    }).join("\n") + "\n"

    if (definitionKey) {
        barrelContent += `
export default {
    ${importNames.map(importName => `[${importName}.${definitionKey}]: ${importName}`).join(",\n    ")}    
}`
    }
    else {
        barrelContent += `
export default [
    ${importNames.join(",\n    ")}
]`
    }

    if (!outputPath)
        return barrelContent

    await fs.writeFile(outputPath, barrelContent)
}
