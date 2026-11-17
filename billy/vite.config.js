import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Dead Set Billy, a platformer. Served at /billy/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/billy/',
  plugins: [vue()],
  build: {
    outDir: '../dist/billy',
    emptyOutDir: true
  }
})
