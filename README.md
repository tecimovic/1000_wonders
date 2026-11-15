# platycore.com

[![Build](https://github.com/tecimovic/1000_wonders/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/tecimovic/1000_wonders/actions/workflows/build.yml?query=branch%3Amain)

## 👉 See it live: **[http://platycore.com](http://platycore.com)** 👈

# What is this?

An experimentation website and hobby project, published at
[platycore.com](http://platycore.com). Nothing here is of permanent value:
apps come and go as experiments.

The site is a landing page with a menu of apps, plus several independent
Vue 3 apps:

- **[/lg/](http://platycore.com/lg/)**: *World of 1000 Wonders*, an
  interactive map of a Minecraft world (Overworld, Nether and End).
- **[/train/](http://platycore.com/train/)**: a site about public
  transportation. For now it's a placeholder with an animated tram.

The repo also keeps a few notes and assets about that Minecraft world.

# How to contribute?

It's a private hobby project. If you'd like to join, contact the owner.

Each app lives in its own folder (`lg/`, `train/`, ...) with its own
`index.html` and Vite config. All apps share one `package.json`. The
landing page builds its menu from `public/apps.json`, so adding an app
means creating its folder and adding one entry (icon, title, subtitle and
URI) to that file. [`AGENTS.md`](AGENTS.md) describes the full repo
structure and the exact steps.

Every push to `main` and every pull request is built by GitHub Actions.
The badge at the top shows whether `main` currently builds.

# How to see this in action?

The easiest way is the live site: **[http://platycore.com](http://platycore.com)**.

To run it locally (needs Node.js):

```
npm install
npm run dev
```

Then open the URL that Vite prints. The landing page links to every app.
To try the production build, run `npm run build && npm run preview`.

---

*This README is generated from [`AGENTS.md`](AGENTS.md). Make changes there,
not here.*
