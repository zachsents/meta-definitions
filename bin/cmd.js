#!/usr/bin/env node
import yargs from "yargs"
import { buildBarrel } from "../index.js"


yargs(process.argv.slice(2))
    .command("build", "Builds the barrel for meta definitions.", {
        outputPath: {
            type: "string",
            description: "The path to write the barrel file to.",
            alias: "o",
            default: "./barrel.js",
        },
        definitionKey: {
            type: "string",
            description: "The key representing a unique ID for each definition.",
            alias: "i",
            default: "id",
        },
        directory: {
            type: "string",
            description: "The path to the directory containing the meta definition files.",
            alias: "d",
        },
        prefix: {
            type: "string",
            description: "The prefix to look for in each file name.",
            alias: "p",
        },
        suffix: {
            type: "string",
            description: "The suffix to look for in each file name.",
            alias: "s",
        },
        pattern: {
            type: "string",
            description: "A regular expression to test each file name against.",
            alias: "P",
        },
        recursive: {
            type: "boolean",
            description: "Whether to search recursively.",
            alias: "r",
            default: false,
        },
    }, buildBarrel)
    .demandCommand()
    .help()
    .argv