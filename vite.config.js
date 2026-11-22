import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { lgPages } from './lg/pages.js'

// Root of the website.
// - Build: only the landing page (index.html + public/). Each app has its own
//   config in its folder and builds separately into dist/<name>/.
// - Dev (`npm run dev`): one server for everything — the landing page at /,
//   and each app at /<name>/ (their index.html files use relative paths).
export default defineConfig({
  // lgPages(): serve /lg/constitution etc. in dev (it emits nothing
  // in this build).
  plugins: [vue(), lgPages()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
