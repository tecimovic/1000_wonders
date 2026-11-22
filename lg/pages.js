// Extra URLs of the lg app that load the same page as /lg/ (the app looks at
// location.pathname to decide what to show), e.g. /lg/constitution/ opens the
// Constitution overlay over the map.
//
// - Build: emits dist/lg/<page>/index.html, a copy of the app's index.html.
//   Built asset URLs are absolute (/lg/assets/...), so the copy works as is,
//   and Apache redirects /lg/constitution to /lg/constitution/.
// - Dev: /lg/<page> and /lg/<page>/ are served the app's index.html. Used by
//   lg/vite.config.js and by the root vite.config.js (`npm run dev`); only
//   the lg build (base '/lg/') emits pages.
import fs from 'node:fs'
import path from 'node:path'

export const LG_PAGES = ['constitution']

export function lgPages() {
  const re = new RegExp(`^/lg/(${LG_PAGES.join('|')})(/)?(\\?.*)?$`)
  let isLgBuild = false
  return {
    name: 'lg-pages',
    configResolved(config) {
      isLgBuild = config.base === '/lg/'
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(re)
        if (!m) return next()
        if (m[2]) {
          // In dev index.html uses relative paths, which would break under
          // a trailing slash: drop it.
          res.statusCode = 302
          res.setHeader('Location', `/lg/${m[1]}${m[3] ?? ''}`)
          return res.end()
        }
        req.url = `/lg/${m[3] ?? ''}`
        next()
      })
    },
    writeBundle(options) {
      // index.html is only final once written, so copy it from disk.
      if (!isLgBuild) return
      const src = path.join(options.dir, 'index.html')
      if (!fs.existsSync(src)) return
      for (const page of LG_PAGES) {
        fs.mkdirSync(path.join(options.dir, page), { recursive: true })
        fs.copyFileSync(src, path.join(options.dir, page, 'index.html'))
      }
    }
  }
}
