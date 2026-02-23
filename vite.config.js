import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Custom plugin to copy badge.js unchanged to dist
const copyBadgeJs = () => ({
  name: 'copy-badge-js',
  closeBundle() {
    const src = resolve(__dirname, 'public/badge.js')
    const dest = resolve(__dirname, 'dist/badge.js')
    if (existsSync(src)) {
      copyFileSync(src, dest)
      console.log('Copied badge.js to dist/')
    }
  }
})

export default defineConfig({
  plugins: [react(), copyBadgeJs()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
