import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Trains. Served at /train/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/train/',
  plugins: [vue()],
  build: {
    outDir: '../dist/train',
    emptyOutDir: true
  }
})
