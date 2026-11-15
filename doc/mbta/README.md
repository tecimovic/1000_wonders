# MBTA / GTFS developer docs (local copy)

Local reference for building the `train` app on the MBTA V3 API, so there's no
need to keep looking things up online. It's development information only and
not part of the website. Refresh everything with `doc/mbta/fetch.sh`.

## Files: where to look

| File | What's in it |
|---|---|
| **`mbta-v3-api-reference.md`** | **Start here.** Every V3 endpoint with all its filters and includes, and every resource with all attributes and enum values. Generated from `swagger.json` by `swagger-to-md.py`. |
| `swagger.json` | The raw OpenAPI 2.0 spec of the V3 API (api-v3.mbta.com). |
| `mbta-v3-api-overview.md` | V3 API intro: calls, filtering, includes. |
| `mbta-v3-api-best-practices.md` | Rate limits, caching (`If-Modified-Since`), sparse fieldsets, nested includes, how to query alerts, how to read predictions. |
| `mbta-v3-api-streaming.md` | Server-sent events (`Accept: text/event-stream`): reset/add/update/remove events. |
| `mbta-v3-api-versioning.md` | API versioning policy. |
| `mbta-real-time-display-guidelines.md` | **How MBTA wants predictions and alerts shown** (Arriving/Boarding/minutes rules per mode). |
| `mbta-gtfs-reference.md` | MBTA's extensions to GTFS (static): extra files and fields (e.g. `facilities.txt`). |
| `mbta-gtfs-realtime-reference.md` | MBTA's GTFS-Realtime feeds and extensions. |
| `gtfs-schedule-reference.md` | The GTFS static standard (gtfs.org): stops.txt, routes.txt, trips.txt, ... |
| `gtfs-realtime-reference.md` | The GTFS-Realtime standard: TripUpdate, VehiclePosition, Alert, enums. |
| `gtfs-realtime-service-alerts.md`, `gtfs-realtime-trip-updates.md` | GTFS-Realtime concept guides. |
| `mbta-gtfs-page.md`, `mbta-gtfs-realtime-page.md` | The short mbta.com landing pages (links, static GTFS zip). |

## V3 API cheat sheet

- **Base URL:** `https://api-v3.mbta.com`. **Auth:** `x-api-key: <key>` header.
  The key is the `mbta` entry's `api.encryptedApiKey` in
  `train/src/supportedTransitAuthorities.json` (see AGENTS.md). The app's
  MBTA code is `train/src/transit/adapters/mbta-v3.js`.
- **CORS:** `Access-Control-Allow-Origin: *`, and `x-api-key` is an allowed
  header, so browsers can call the API directly. There's no need for a proxy.
- **Rate limit:** 1,000 requests/min with a key (20/min without). The
  `x-ratelimit-*` response headers show the current state. A
  `If-Modified-Since` request that gets a 304 doesn't count against the limit.
- **Format:** JSON:API. `data[]` holds `{type, id, attributes, relationships}`,
  `include=a,b.c` adds related objects in `included[]`, `fields[type]=a,b`
  limits attributes, and filters take comma-separated lists
  (`filter[stop]=a,b`).
- **Compression:** browsers send `Accept-Encoding: gzip` on their own. All
  stops come to ~2.7 MB raw and ~160 KB gzipped.
- **curl tip:** use `curl -g`, otherwise curl treats `[` `]` in
  `filter[...]` as glob ranges.

### Things learned from the live API (2026-11)

- **Stops:** about 10,300 in total. `location_type`: `0` = stop/platform (7,759),
  `1` = station (276), `2` = entrance (333), `3` = generic node (1,924).
  Platforms have `relationships.parent_station`. For a "pick a stop" list,
  use `filter[location_type]=0,1` and drop stops that have a parent station.
  That leaves 276 stations + 6,817 bus stops + 18 ferry stops. Stations have
  `vehicle_type: null`. Bus stop names repeat often (each side of the
  street), so show the id or municipality too.
- **Station ids** look like `place-pktrm` (Park Street). Platform ids are
  numbers (`70075`) or names (`South Station-02`).
- **`/predictions` needs a filter** (stop, route or trip). `filter[stop]` with
  a station id also returns predictions for all of its platforms. Use
  `include=route,trip,stop,vehicle`: the route gives `color`, `text_color`,
  `short_name`/`long_name`, `type` and `direction_destinations`, the trip gives
  `headsign`, the stop (platform) gives `platform_name`/`platform_code`.
- **Prediction attributes:** the live API returns **`revenue`**
  (`"REVENUE"`/`"NON_REVENUE"`), not `revenue_status` as the spec says. Rows
  with `schedule_relationship: "CANCELLED"`/`"SKIPPED"` have no times. Trip ids
  can be `ADDED-...` or `NONREV-...`.
- **`/facilities?filter[stop]=place-...`** works with station ids. `properties`
  is a long list of name/value pairs, many of them `excludes-stop` (routing
  noise). Useful ones include `direction`, `address`, `capacity`,
  `enclosed`, `owner` and `fee-*`. `/live_facilities` returned nothing for
  Park Street.
- **`/alerts`:** about 100 alerts at a time (~270 KB raw). Group them by mode
  (`informed_entity[].route_type`: 0 light rail, 1 subway, 2 commuter rail, 3
  bus, 4 ferry). Use `service_effect` as a one-line summary, `header` as the
  main text and `description` for details. `severity` runs 0–10, and
  `lifecycle` is `NEW`, `ONGOING`, `ONGOING_UPCOMING` or `UPCOMING`. One alert
  can affect several modes.

### Showing predictions (summary of `mbta-real-time-display-guidelines.md`)

- Seconds until the vehicle = `arrival_time` (or `departure_time`) − now.
- **Subway:** if there's a `status`, show it. Skip the prediction if
  `departure_time` is null or past (riders can't board). ≤ 30 s shows
  "Arriving" (ARR). If the vehicle is `STOPPED_AT` this stop and ≤ 90 s, show
  "Boarding" (BRD). Otherwise show minutes (round half up), or hours and
  minutes from 60 min on.
- **Bus:** skip if `departure_time` is null or past, ≤ 30 s shows "Now",
  otherwise minutes.
- **Commuter rail:** show the clock time of departure, plus the status and
  track. If both times are null but there's a status, show the status with
  the scheduled time crossed out.
- **Ferry:** show the clock time of departure plus the status.
