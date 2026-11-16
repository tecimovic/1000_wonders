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
train/              Public transportation site: live transit data (Boston MBTA,
  index.html,       Budapest BKK, London TfL, Oslo Ruter), behind a password page. The URL stays
  vite.config.js,   /train/ even though the topic is public transportation in
  favicon.svg       general. See the "train: ..." sections below.
  src/
    supportedTransitAuthorities.json   The transit systems the app can show,
                      with API details and encrypted API keys.
    App.vue           Chooses the page: PasswordPage or LandingPage.
    components/
      PasswordPage.vue  Password form + the animated tram (TransitScene.vue).
      LandingPage.vue   "Currently showing: <authority>" picker, then LinesList,
                        StopPicker + StopDetails, and AlertsTree.
      LinesList.vue     All lines, grouped by mode (Bus, Underground, ...).
      AlertsTree.vue    Current alerts as a collapsible tree-table (mode → effect → alert).
      StopPicker.vue    Search box over all stations and stand-alone stops.
      StopDetails.vue   Predictions (auto-refresh 30 s) and facilities of one stop.
    transit/
      authorities.js    Loads the authorities, unlock(password), selectAuthority(),
                        useTransit() → { authority, client, modes, capabilities }.
      adapters/         One adapter per API type (index.js maps type → adapter):
        mbta-v3.js        The MBTA V3 API (JSON:API).
        bkk-futar.js      BKK FUTÁR, Budapest (OneBusAway-style JSON).
        tfl-unified.js    Transport for London's Unified API (not GTFS-based).
        entur.js          Entur's Journey Planner v3 (GraphQL), all of Norway; used for Oslo.
      http.js           getJson() / postJson(): fetch with the authority's base
                        URL, API key and fixed headers.
      predictions.js    Normalized predictions → display rows (display rules).
      format.js         GTFS route types, time formatting in the authority's time zone.
    crypto.js         encryptSecret() / decryptSecret() (Web Crypto).
    passwordCookie.js The mbtaApiKeyPassword cookie.
  scripts/encrypt-secret.mjs   Encrypts an API key for supportedTransitAuthorities.json.
doc/mbta/           Local copy of the MBTA V3 API and GTFS docs (development
                    reference, not part of the website). Start at README.md.
doc/bkk/            Local copy of BKK's FUTÁR API docs. Start at README.md.
doc/tfl/            Local copy of TfL's Unified API spec. Start at README.md.
doc/entur/          Local copy of Entur's Journey Planner GraphQL schema. Start at README.md.
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

### train: transit authorities

The train app can show several transit systems ("authorities"). The user picks
one in the "Currently showing: ..." heading. The choice is kept in the URL
(`?authority=mbta`) and in localStorage. Today the list has four entries: the
Boston MBTA, Budapest BKK, London TfL and Oslo Ruter.

**The list is `train/src/supportedTransitAuthorities.json`**, an array with
one object per authority:

```json
{
  "id": "mbta",
  "name": "Boston MBTA",
  "fullName": "Massachusetts Bay Transportation Authority",
  "region": "Boston, Massachusetts, USA",
  "timeZone": "America/New_York",
  "website": "https://www.mbta.com",
  "api": {
    "type": "mbta-v3",
    "baseUrl": "https://api-v3.mbta.com",
    "docs": "https://www.mbta.com/developers/v3-api",
    "apiKeyHeader": "x-api-key",
    "encryptedApiKey": "v1.600000...."
  }
}
```

- `id`: short and URL-safe. `name` is shown in the picker, and `fullName`,
  `region` and `website` are shown around the page.
- `timeZone`: an IANA zone. All times are shown in it.
- `stopSearchExamples`: a few well-known stop names, shown as examples in the
  stop search box.
- `api.type`: picks the adapter (see below).
- `api.baseUrl`: the start of every request URL.
- `api.apiKeyHeader` and/or `api.apiKeyQueryParam`: how the key is sent.
  Leave out `encryptedApiKey` if the API needs no key.
- `api.headers`: fixed headers sent with every request (not secrets; e.g.
  Entur's `ET-Client-Name`).
- `api.encryptedApiKey`: the API key, encrypted with **the same password as
  all the others** (see "train: password and secrets").
- Adapters may read more `api` fields of their own. `bkk-futar` uses
  `language` (`"en"` or `"hu"`) and `stopsArea` (`{south, west, north, east}`,
  the area to load stops from). `entur` uses `language` (`"en"` or `"no"`),
  `stopsArea`, and `codespace` (e.g. `"RUT"`: keep only stops served by that
  data owner's lines, plus train stations).

The order in the file is the order in the picker. The first entry is the
default.

**Adapters.** GTFS standardizes the *data*, but every agency serves it through
a different web API, so code never talks to an API directly. Each `api.type`
has an adapter in `train/src/transit/adapters/` that turns its API into one
normalized shape. The UI only uses that shape. An adapter exports:

| Export | Returns |
|---|---|
| `capabilities` | `{ lines, alerts, stops, predictions, facilities }` booleans. The UI hides what's missing. |
| `modes` | GTFS `route_type` → `{ name, color }` (start from `GTFS_MODES` in `format.js`). |
| `getLines(authority, { signal })` | `[{ ...Route, routeType }]`: every line, in the order to show them within a mode. Only needed if `capabilities.lines`. |
| `getAlerts(authority, { signal })` | `[{ id, title, header, description, effect, cause, severity (0–10), lifecycle, timeframe, activePeriods: [{start, end}], routeTypes: [int], routes: [Route], updatedAt, url }]` |
| `getStops(authority, { signal })` | `[{ id, name, kind, isStation, municipality }]`: stations and stand-alone stops. |
| `searchStops(authority, query, { signal })` | *Optional.* Stops matching `query`, searched by the API, same shape as `getStops`. For systems with too many stops to load at once. If present, the stop picker uses it instead of `getStops`. |
| `getStop(authority, stopId, { signal })` | *Optional, goes with `searchStops`.* One stop by id (for `?stop=` in the URL), or `null`. |
| `getPredictions(authority, stopId, { signal })` | `[{ id, routeType, route: Route, destination, platform, arrivalTime, departureTime, status, scheduleRelationship, nonRevenue, hasVehicle, vehicleStoppedHere }]` (ISO times, GTFS-Realtime meanings) |
| `getFacilities(authority, stopId, { signal })` | `[{ id, type, name, properties: [{ name, value }] }]` |

Here `Route` = `{ id, name, longName, color, textColor }` (colors as `#rrggbb`).
The `authority` passed in carries its decrypted `apiKey`. Use `getJson()` (or
`postJson()`, e.g. for GraphQL) from `http.js` for requests: they apply
`baseUrl`, the key and `api.headers`.

**Adding a transit authority:**

1. Get an API key for it (if it needs one), and check that its API allows CORS (browsers call
   it directly; many GTFS-Realtime feeds don't allow CORS and would need a
   proxy).
2. If it has a key, encrypt it with `node train/scripts/encrypt-secret.mjs`, using the
   same password as the existing keys.
3. If an adapter for its API type exists, add an object to
   `supportedTransitAuthorities.json`. That's all.
4. Otherwise, write `train/src/transit/adapters/<type>.js` with the exports
   above, and register it in `adapters/index.js`. Put that API's docs in
   `doc/<authority>/`, like `doc/mbta/`.

Code rules:

- Components use `useTransit()` from `train/src/transit/authorities.js`
  (`transit.value.client.getAlerts()` and so on) and never call an API
  directly.
- Show times in the authority's time zone (`formatClock` / `formatDateTime`
  in `format.js`, passing `authority.timeZone`).
- Show predictions according to MBTA's Real-Time Display Guidelines, which
  only use GTFS-Realtime concepts (`train/src/transit/predictions.js`).

### train: the adapters that exist

| `api.type` | Used by | Docs | Notes |
|---|---|---|---|
| `mbta-v3` | Boston MBTA | `doc/mbta/` | All four capabilities. |
| `bkk-futar` | Budapest BKK | `doc/bkk/` | No facilities. Stops load in 25 tiles (the API caps one request at ~5,000 stops) and are cached in localStorage for 24 h. There's no "all routes" endpoint: lines are the routes in those tiles' references (same load, same cache). Alert severity is derived (the API has none). |
| `tfl-unified` | London TfL | `doc/tfl/` | TfL publishes no GTFS; its JSON API is mapped to GTFS route types. Lines come from `/Line/Mode/{modes}`. Stops are searched on the server (`searchStops`), since London has ~33,000. Alerts are line statuses. Hubs and bus stop clusters are expanded into their child stops for predictions. Key via `app_key` (optional: the API also works without one, rate-limited). |
| `entur` | Oslo Ruter | `doc/entur/` | GraphQL, no API key (only an `ET-Client-Name` header). No facilities. Entur covers all of Norway and has no working region filter, so stops in `stopsArea` are loaded in one request with the line ids at each quay, and those served by `codespace` (plus train stations) are kept; lines are the lines at those stops (at train stations only their trains). Both are cached in localStorage for 24 h. Alerts are Entur "situations", kept if they touch the area's lines or stops; severity is derived (it's always "normal"). |

### train: the MBTA adapter (`mbta-v3`)

The Boston MBTA uses the **MBTA V3 API** (`https://api-v3.mbta.com`), which is
built on **GTFS** (static schedules) and **GTFS-Realtime** (predictions,
vehicles, alerts).

**Docs live in `doc/mbta/`**, so there's no need to look things up online
each time. Start with `doc/mbta/README.md` (index, cheat sheet, and quirks of
the live API), then use `doc/mbta/mbta-v3-api-reference.md` (every endpoint,
filter and attribute). `doc/mbta/fetch.sh` refreshes the whole folder. When
you learn something new about the live API, add it to the README's "Things
learned" section.

The landing page (the same for every authority) has three parts, in this order:

1. **Lines** (`/routes`): every line, grouped by mode (route type), each
   mode a collapsible group (collapsed at first).
2. **Stop**: a search box over ~7,100 stations and stops (`/stops`). The
   selected stop shows its arrivals and departures (`/predictions`, refreshed
   every 30 s) and its facilities (`/facilities`). The selected stop is kept
   in the URL (`?stop=place-pktrm`).
3. **Service alerts** (`/alerts`): a tree-table grouped by mode, then effect.
   Expanding an alert shows its full text, active periods, cause and routes.

### train: password and secrets

**Rule: secrets are committed only in encrypted form.** Never put a plaintext
secret or its password into any file in this repo.

- Each authority's API key is in `api.encryptedApiKey` in
  `train/src/supportedTransitAuthorities.json`, encrypted with AES-256-GCM.
  **All keys use the same password**, so the user types one password and
  every key unlocks. The key comes from the password via
  PBKDF2-SHA256 with 600,000 iterations. The format is
  `v1.<iterations>.<salt>.<iv>.<ciphertext>` (base64 parts).
- To add or rotate a secret, run `node train/scripts/encrypt-secret.mjs`. It
  reads the secret and the password from stdin, never from arguments, and
  prints only the encrypted string. Paste that into the authority's
  `encryptedApiKey`.
- The password isn't in the repo. Ask the owner for it.

The user flow (in `train/src/App.vue`):

1. On load, if the `mbtaApiKeyPassword` cookie exists and its password opens
   the keys, go straight to the landing page. A password is right if it opens
   at least one key. An authority whose key doesn't open is shown in the
   picker as "(key unavailable)".
2. Otherwise show the password page. If a stored cookie no longer works, the
   cookie is cleared and the page shows "Invalid password".
3. Submitting a wrong password shows "Invalid password". Submitting an empty
   field shows nothing.
4. The right password goes to the landing page and is stored in the cookie
   (`Path=/train/`, `SameSite=Strict`, `Secure` on HTTPS). The cookie
   expires 7 days after the password was entered and isn't refreshed on later
   visits.
5. "Log out" (next to "← All apps" on the landing page) deletes the cookie,
   forgets the decrypted keys (`lock()`) and goes back to the password page.

In code, `unlock(password)` in `train/src/transit/authorities.js` decrypts the
keys and keeps them in memory only; `lock()` forgets them. Adapters receive the key as
`authority.apiKey`.

Web Crypto only works in secure contexts (HTTPS or localhost).
platycore.com also answers on plain `http://`, so `train/src/main.js` switches
`http://` to `https://` before the app starts.

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
