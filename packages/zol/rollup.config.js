import sourceMaps from "rollup-plugin-sourcemaps"
const pkg = require("./package.json")
const camelCase = require("lodash.camelcase")

const libraryName = "zol"

export default {
    input: `build/src/${libraryName}.js`,
    output: [
        { file: pkg.main, format: "umd", name: camelCase(libraryName) },
        { file: pkg.module, format: "es" }
    ],
    sourcemap: true,
    // Indicate here external modules you don't wanna include in your bundle (i.e.: "lodash")
    external: [
        "pg"
    ],
    plugins: [
        sourceMaps()
    ]
}
