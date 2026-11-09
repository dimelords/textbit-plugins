import { join, resolve, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { glob } from 'glob'
import path from 'path'

import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  logLevel: 'warn',
  plugins: [
    react(),
    dts({ bundleTypes: true })
  ],
  resolve: {
    alias: {
      'yjs': path.resolve(import.meta.dirname, './node_modules/yjs')
    },
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'slate',
      'slate-react',
      'slate-history',
      '@slate-yjs/core',
      '@slate-yjs/react',
      'yjs'
    ]
  },
  build: {
    target: 'esnext',
    minify: true,
    lib: {
      entry: resolve(import.meta.dirname, join('lib', 'index.ts')),
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Exclude peer dependencies from the bundle to reduce bundle size
      external: [
        'react/jsx-runtime',
        ...Object.keys(pkg.peerDependencies)
      ],
      input: Object.fromEntries(
        glob.sync('lib/**/*.{ts,tsx}').map(file => [
          // The name of the entry point
          // lib/plugins/foo.ts becomes nested/foo
          relative(
            'lib',
            file.slice(0, file.length - extname(file).length)
          ),
          // The absolute path to the entry file
          // lib/plugins/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        preserveModules: false,
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: '[name].[format].js'
      }
    }
  }
})
