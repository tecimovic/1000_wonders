import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// L.G. — the World of 1000 Wonders map. Served at /lg/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/lg/',
  plugins: [vue()],
  build: {
    outDir: '../dist/lg',
    emptyOutDir: true
  }
})
