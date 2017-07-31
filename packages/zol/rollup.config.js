import sourceMaps from 'rollup-plugin-sourcemaps'
const pkg = require('./package.json')
const camelCase = require('lodash.camelcase')

const libraryName = 'zol'

export default {
    entry: `build/src/${libraryName}.js`,
    targets: [
        { dest: pkg.main, moduleName: camelCase(libraryName), format: 'umd' },
        { dest: pkg.module, format: 'es' }
    ],
    sourceMap: true,
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [
        'pg'
    ],
    plugins: [
        sourceMaps()
    ]
}
