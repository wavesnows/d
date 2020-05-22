import typescript from 'rollup-plugin-typescript2'
import sourceMaps from "rollup-plugin-sourcemaps";
import json from '@rollup/plugin-json'
const path = require('path')
// 定位包所在的目录
// const packagesDir = path.resolve(__dirname, '../packages');
// const resolve = p => path.resolve(packageDir, p);


const pkg = require('./package.json')

const name = pkg.name

// const targetPackage = process.env.TARGET;

let filePath = path.resolve(__dirname, 'dist')

const tsconfig = path.resolve(__dirname, 'tsconfig.json')
// console.log('tsconfig------', tsconfig)


const output = [
    {
        file: `${filePath}/${name}.js`,
        format: `cjs`,
        sourceMaps: true
    }
]


module.exports =  {
    input: `src/index.ts`,
    output,
    watch: {
        include: 'src/**',
    },
    external:[
        'download'
    ],
    plugins: [
        json({
            namedExports: false
        }),
        // Compile TypeScript files
        typescript({ 
            // tsconfigDefaults: defaults,
            tsconfig: tsconfig,
            // tsconfigOverride: tsconfig,
            useTsconfigDeclarationDir: true,
            clean: true,
            abortOnError: true
        }),
        sourceMaps()
    ]
}