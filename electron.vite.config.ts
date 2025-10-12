import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import path from 'node:path'
import tailwindcss from 'tailwindcss'
import tsconfigPathsPlugin from 'vite-tsconfig-paths'

const tsconfigPaths = tsconfigPathsPlugin({
  projects: [path.resolve('tsconfig.json')],
})

export default defineConfig({
  main: {
    plugins: [tsconfigPaths, externalizeDepsPlugin()],

    publicDir: path.resolve('resources'),
  },
  preload: {
    plugins: [tsconfigPaths, externalizeDepsPlugin()],
  },
  renderer: {
    define: {
      'process.platform': JSON.stringify(process.platform),
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: './src/renderer/tailwind.config.js',
          }),
        ],
      },
    },
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src'),
      },
    },
    // Ensure esbuild/vite targets the Chromium version bundled with the Electron runtime.
    build: {
      target: 'chrome104',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'chrome104',
      },
    },
    plugins: [tsconfigPaths, react()],
  },
})
