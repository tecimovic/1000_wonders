# BKK FUTÁR (Budapest) developer docs (local copy)

Local reference for the `bkk-futar` adapter (`train/src/transit/adapters/bkk-futar.js`).
It's development information only and not part of the website. Refresh with
`doc/bkk/fetch.sh`.

## Files

| File | What's in it |
|---|---|
| **`futar-api-reference.md`** | **Start here.** Every endpoint with its parameters, and every schema with its fields. Generated from the OpenAPI spec by `openapi-to-md.py`. The descriptions are in Hungarian. |
| `futar-openapi.yaml` | The raw OpenAPI 3 spec, from https://opendata.bkk.hu/docs/futar-openapi.yaml. |

BKK's open data portal is https://opendata.bkk.hu (a JavaScript app; the docs
behind it are the YAML above). BKK also publishes GTFS-Realtime protobuf feeds
at `https://go.bkk.hu/api/query/v1/ws/gtfs-rt/full/{VehiclePositions,TripUpdates,Alerts}.pb?key=…`.
The app doesn't use them, because the JSON API has the same data.

## Cheat sheet

- **Base URL:** `https://futar.bkk.hu/api/query/v1/ws/otp/api/where` (the
  `{dialect}` in the spec's paths is `otp`). `go.bkk.hu` serves the same API.
  Endpoints end in `.json`, e.g. `/alert-search.json`.
- **Auth:** `?key=<key>`. Without a key: HTTP 401. The key is the `bkk` entry's
  `api.encryptedApiKey` in `train/src/supportedTransitAuthorities.json`.
- **CORS:** `Access-Control-Allow-Origin: *`, so browsers can call it directly.
- **Responses:** `{ status: "OK", code: 200, currentTime, data: { entry | list, references } }`.
  Errors still come back as HTTP 200 (or 400) with `status` set to something
  else, e.g. `"LIMIT_EXCEEDED"`. Always check `status`.
- **References:** related objects come in `data.references.{routes, trips, stops, alerts, agencies}`
  as maps from id to object. `includeReferences=COMPACT` keeps them but drops
  route descriptions. `false` leaves them out.
- **Times** are epoch **seconds**. Scheduled times are `arrivalTime`/`departureTime`,
  real-time ones are `predictedArrivalTime`/`predictedDepartureTime` (only when
  known).
- **Text** comes as `{ translations: { en, hu }, someTranslation }`. English is
  always present (sometimes it's the Hungarian text). Alert descriptions are
  small HTML snippets.

### Things learned from the live API (2026-11)

- **Stops:** there's no "all stops" endpoint. `stops-for-location.json` with
  `lat`, `lon`, `latSpan`, `lonSpan` (or `radius` in meters) returns the stops
  in a box, but **one request may return at most ~5,000 stops**. A bigger area
  answers `LIMIT_EXCEEDED`. The adapter loads the area in 5×5 tiles (25
  requests, 6 at a time, ~1 s) and caches the result in localStorage for 24 h.
- **Stop areas:** stops with `locationType: 1`, `locationSubType: "stop-area"`
  group the platforms around a square (ids like `BKK_CS011732` = Deák Ferenc tér).
  Platforms have `locationType: 0`, a `parentStationId` and a `type` (`BUS`,
  `TRAM`, `TROLLEYBUS`, `SUBWAY`, `SUBURBAN_RAILWAY` (HÉV), `RAIL`, `COACH`,
  `FERRY`). `localityName` is a postal code (1051 = Budapest district V).
  `arrivals-and-departures-for-stop.json?stopId=<stop area>` returns
  departures for all of its platforms.
- **The feed covers the whole country:** regional Volán coach stops (`volan_…`)
  go far beyond Budapest. `api.stopsArea` limits the app to Budapest and its
  surroundings (47.33–47.66 N, 18.85–19.36 E: ~2,850 stop areas and stand-alone
  stops).
- **Alerts:** `alert-search.json?listView=true` returns the curated list BKK
  shows riders (~50). Without `listView` you also get ~90 MÁV rail
  "dwell time exceeded" notices. `entry.alertGroups` splits them into Active
  and Future. There's no severity field: `effectType` is mostly empty
  (sometimes `NO_SERVICE`/`WARNING`) and `priority` is 0–2. The `header` is a
  short type ("stop relocation", "Replacement bus service between …"), and
  `vehicleRouteTypes` plus `routeIds` say which modes are affected. Skip alerts
  with `disableApp: true` (messages about BKK's own phone app).
- **Arrivals:** `stopTimes[]` has `tripId`, `stopId` (the platform),
  `stopHeadsign`, times, `canceled`, `uncertain`, and with
  `includeVehicleFromTrip=true` a `vehicle` (`status`: `IN_TRANSIT_TO` /
  `STOPPED_AT`, `stopId`, `label` like "Mercedes Conecto 2 szóló busz").
  Departures without real-time data have only scheduled times.
  `onlyDepartures` defaults to true, which leaves out arrivals at a trip's
  last stop. Platform letters are in the platform stop's `platformCode` (e.g. `E2`).
- **Routes:** `shortName` (`M2`, `16`, `100E`), `type`, and `color`/`textColor`
  without `#`. Metro lines have their own colors (M1 yellow, M2 red, M3 blue,
  M4 green).
- **No facilities** data (elevators etc.) in this API.
