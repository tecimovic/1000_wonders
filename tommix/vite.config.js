import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Tommix, a psychedelic songbook. Served at /tommix/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/tommix/',
  plugins: [vue()],
  build: {
    outDir: '../dist/tommix',
    emptyOutDir: true
  }
})
