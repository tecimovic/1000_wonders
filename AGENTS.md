# AGENTS.md

This file is the single source of truth about this repo. `README.md` is
generated from it (see [Generating README.md](#generating-readmemd)).

## What this is

An experimentation website, published at **http://platycore.com**.

It's a hobby project. Nothing here is of permanent value: apps come and go,
and breaking changes are fine. Optimize for fun and fast iteration, not for
backwards compatibility.

## Repo structure

The repo holds several **independent Vue 3 single-page apps** (SPAs) plus a
small landing page. They share one `package.json` and `node_modules`, and
nothing else: each app has its own `index.html`, its own Vite config and its
own build output, so a page from one app never loads files from another.

```
index.html          Landing page at "/": plain HTML (no Vue). Its inline script
                    fetches /apps.json and renders the menu of apps. It also
                    forwards /<app> or /<app>/anything to that app's uri, in
                    case the server falls back to the root page.
public/             Static files for the landing page only, served at "/":
  apps.json         The list of apps shown on the landing page (see below).
  hexarod.png       Menu icon for lg (a copy of lg/src/assets/hexarod.png).
  tram.svg          Menu icon for train.
  favicon.ico
vite.config.js      Root config: builds the landing page, and is the config for
                    `npm run dev` (which serves the landing page AND every app).
lg/                 "World of 1000 Wonders": a map of a Minecraft world. → /lg/
  index.html, vite.config.js, favicon.ico
  places.json       The map data. Edit this to add or move places.
  src/              App.vue, main.js, components/WorldMap.vue, assets/
train/              Public transportation site, currently a placeholder
  index.html,       (animated tram). The URL stays /train/ even though the
  vite.config.js,   topic is public transportation in general.
  favicon.svg, src/
deploy              Builds everything and uploads dist/ to the server via FTP.
.github/workflows/build.yml   CI: builds everything on GitHub (see below).
dist/               Build output (git-ignored): dist/index.html, dist/<app>/...
```

Loose files at the root (`overworld.svg`, `nether.svg`, `end.svg`,
`wardensville_places.json`, `lightning_god.md`, `stronghold.txt`,
`timotej-skin.png`) are notes and assets for the Minecraft world. No app
uses them.

### How the apps are wired

- Each app's `vite.config.js` sets `root` to its own folder, `base: '/<app>/'`,
  and `build.outDir: '../dist/<app>'`.
- An app's `index.html` must use **relative** paths (`./src/main.js`,
  `./favicon.svg`). Absolute paths like `/src/main.js` work when building but
  break `npm run dev`, which serves everything from the repo root.
- Put an app's images, icons, etc. inside the app folder and reference them
  relatively (e.g. `<img src="./assets/x.png">` in a `.vue` file). Vite then
  bundles them into `dist/<app>/assets/`. Don't put app files in the root
  `public/`: that belongs to the landing page.

### The app list: `public/apps.json`

The landing page's menu comes from this file, an array with one entry per app:

```json
{
  "icon": "/tram.svg",
  "title": "Public transportation",
  "subtitle": "Yay, public transportation!",
  "uri": "/train/"
}
```

- `icon`: URL of the menu image. Put it in `public/` so it's served from the
  site root. It's shown in a 64×64 tile, so square SVGs work best.
- `title` and `subtitle`: the text on the card.
- `uri`: where the app lives, with a trailing slash (`/<app>/`). The first path
  segment is also what the redirect script matches on.

The order in the file is the order on the page.

### Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (once). |
| `npm run dev` | One dev server: landing page at `/`, apps at `/lg/`, `/train/`, ... |
| `npm run dev:lg`, `npm run dev:train` | Dev server for a single app. |
| `npm run build` | Build the landing page and every app into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally, the way the server does. |
| `./deploy` | Build, then FTP-upload `dist/` to platycore.com. Needs the `DG_FTP_USERNAME` and `DG_FTP_PASSWORD` environment variables. |

`deploy` walks every folder in `dist/`, so new apps get uploaded without
changing it.

### CI

`.github/workflows/build.yml` (GitHub Actions, workflow name "Build") runs on
every push to `main`, on pull requests, and on demand. It runs `npm ci` and
`npm run build` on Node 22. Then it checks that `dist/index.html` exists and
that every `uri` in `public/apps.json` has a `dist/<app>/index.html`. A new app
that's listed in `apps.json` but missing from the `build` script fails CI.

Status badge for `main`:

```
[![Build](https://github.com/tecimovic/1000_wonders/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/tecimovic/1000_wonders/actions/workflows/build.yml?query=branch%3Amain)
```

### Adding a new app

Say the new app is called `foo` and should live at `/foo/`:

1. Create `foo/vite.config.js` (copy `train/vite.config.js`) and change
   `base` to `'/foo/'` and `outDir` to `'../dist/foo'`.
2. Create `foo/index.html` with `<div id="app"></div>` and
   `<script type="module" src="./src/main.js"></script>` (relative path!),
   plus `foo/src/main.js` and `foo/src/App.vue`.
3. In `package.json`, append `&& vite build --config foo/vite.config.js` to
   the `build` script, and add `"dev:foo": "vite --config foo/vite.config.js"`.
4. Add an icon to `public/` (e.g. `public/foo.svg`) and an entry to
   `public/apps.json` with `"uri": "/foo/"`. The landing page and its redirect
   pick it up from there, so `index.html` needs no changes.
5. Update the structure section above, then regenerate `README.md`.

Check it with `npm run dev` (open `/foo/` from the landing page) and with
`npm run build && npm run preview`. CI checks that the app gets built (see
[CI](#ci)).

## Contributing

It's a private hobby project. If you'd like to join, contact the owner. Git
commits are made by the owner, not by agents: leave your changes uncommitted.

## Generating README.md

`README.md` is **generated from this file** and is never edited by hand. Any
change to the repo that affects what's described here (new or removed apps,
changed commands, deploy changes, etc.) must update this file first, and
then **always regenerate `README.md`** in the same piece of work.

Rules for generating `README.md`:

- Start with a one-line title. Directly under it, put the CI status badge for
  the `main` branch (the badge markdown in the [CI](#ci) section above), so
  readers can see at a glance whether `main` builds. Then add a very
  prominent link to **http://platycore.com**, so readers can see the repo in
  action right away.
- Then use exactly these chapters, in this order, as `#` headings:
  1. `What is this?`
  2. `How to contribute?`
  3. `How to see this in action?`
- Write for humans visiting the repo: short, friendly and accurate. Take the
  content only from this file. Leave out agent-only details (like the
  regeneration rules).
- End with a note that the README is generated from `AGENTS.md`, and that
  changes belong there.
