import { defineConfig } from 'rollup'
import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default defineConfig({
    input: './src/index.js',
    output: {
        file: './dist/vue.js',
        name: 'Vue',
        format: 'umd',
        sourcemap: true
    },
    plugins: [
        babel({
            presets: ["@babel/preset-env"],
            exclude: 'node_modules/**'
        }),
        nodeResolve()
    ]
})