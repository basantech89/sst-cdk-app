import type { RollupOptions } from 'rollup'
import del from 'rollup-plugin-delete'
import externals from 'rollup-plugin-node-externals'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescriptPlugin from '@rollup/plugin-typescript'
import terserPlugin from '@rollup/plugin-terser'

const extensions = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.mts']

const config: RollupOptions[] = [
  {
    input: './lib/index.ts',
    plugins: [
      del({ targets: 'dist/*' }),
      // Leave out third-party dependencies (listed under `package.json`'s `dependencies` option) from the bundled outputs. For example, this library hosts components written with React. We can assume that developers using this library will already have React imported in their applications. And so, why include React in the bundled output and add unnecessary bloat?
      externals({ deps: true }),
      // Find third-party modules within `node_modules` with any one of the following file extensions: `.js`, `.ts` and `.tsx`.
      // nodeResolve({ extensions }),
      typescriptPlugin({
        declaration: true,
        outDir: './dist/',
        exclude: 'rollup.config.ts'
      }),
      terserPlugin()
    ],
    output: [
      {
        file: 'dist/bundle.cjs.js',
        format: 'cjs'
      },
      {
        file: 'dist/bundle.esm.js',
        format: 'esm'
      }
    ]
  }
]

export default config
