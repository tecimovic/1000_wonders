# Entur Journey Planner v3 (local copy)

Local reference for the `entur` adapter (`train/src/transit/adapters/entur.js`),
used for Oslo. It's development information only and not part of the website.
Refresh with `doc/entur/fetch.sh`.

## Files

| File | What's in it |
|---|---|
| `journey-planner-v3.graphql` | The whole GraphQL schema (types, fields, arguments, descriptions), generated from a live introspection query. |
| `fetch.sh` | Re-downloads the schema. |
| `introspection-to-sdl.py` | Turns the introspection JSON into the `.graphql` file. |

Developer docs: https://developer.entur.org. Interactive query editor:
https://api.entur.io/graphql-explorer/journey-planner-v3.

## Is there GTFS?

Yes, but the app doesn't use it. Entur publishes timetables as NeTEx and GTFS
(zip files) and real time as SIRI and GTFS-Realtime (protobuf). The Journey
Planner serves the same data, already combined, as JSON, which is much easier
to use from a browser.

## Cheat sheet

- **Endpoint:** `POST https://api.entur.io/journey-planner/v3/graphql` with
  `{ "query": "...", "variables": {...} }`.
- **No API key.** Every client must send an `ET-Client-Name` header,
  `<company>-<application>` (the app sends `platycore-train`, from
  `api.headers` in `supportedTransitAuthorities.json`). Unnamed clients get
  stricter rate limits.
- **CORS:** `Access-Control-Allow-Origin: *`, and `ET-Client-Name` is an
  allowed header, so browsers can call it directly.
- **Errors** come back as HTTP 200 with an `errors` array (e.g. a field that
  doesn't exist). Always check `errors`.
- **Ids** are `<codespace>:<Type>:<id>`. The codespace is the data owner:
  `RUT` Ruter (Oslo and Akershus), `VYG` Vy trains, `FLT` Flytoget (airport
  express train), `NSR` the national stop register (all stops and quays).
- **Stops:** a `StopPlace` (e.g. `NSR:StopPlace:58381` Majorstuen) has `quays`
  (platforms, `NSR:Quay:…`) with a `publicCode` (platform or track). Big
  stations are multi-modal: a parent stop place with mono-modal children.
- **Times** are ISO 8601 with offset. `aimed…` is scheduled, `expected…`
  includes real time, `actual…` is set once it happened. `realtime: true`
  means the call has a real-time update.
- **Text** in situations (alerts) is a list of `{ value, language }`, usually
  `no` and `en`.

| Query | Used for |
|---|---|
| `stopPlacesByBbox(minimumLatitude, …, filterByInUse: true, multiModalMode: parent)` | All stops in an area, with `quays { lines { id } }`. |
| `lines(ids: [...])` | Line details: `publicCode`, `name`, `transportMode`, `presentation { colour textColour }` (hex without `#`). |
| `stopPlace(id) { estimatedCalls(numberOfDepartures, timeRange, includeCancelledTrips) }` | Departures. A parent stop place includes all of its children's departures. |
| `situations(codespaces: [...])` | Alerts, with `affects` (lines, stops, quays, service journeys). |

### Things learned from the live API (2026-11)

- **No region filter:** `stopPlacesByBbox(authority: "RUT:Authority:RUT")`
  returns nothing (also with `"RUT"`). The adapter loads the whole box
  (59.45–60.45 N, 10.30–11.75 E: ~4,700 stop places, 1.5 MB with line ids,
  under 1 s) and keeps the ~3,500 served by a `RUT:` line, plus train
  stations. Oslo S has no Ruter lines (Ruter's buses and trams stop at
  Jernbanetorget next door), so without the train-station rule it would be
  missing.
- **Lines in the area:** Ruter has 391 lines (376 bus, 6 tram, 5 metro,
  4 boat). At Ruter's stops there are also Vy and Flytoget trains, regional
  buses of neighbouring counties, coaches (Vy Buss, FlixBus, NOR-WAY), and
  `air` lines (flights, at the airport stop). The adapter skips `air`, `taxi`
  and `carpool`.
- **Train line colours:** Vy's local and regional trains have colours (L1
  `8DC63F`, R13 `DF2027`, …). Flytoget's lines have `colour: null`.
- **Situations:** `severity` is always `normal` in practice, and `reportType`
  is `incident` or `general`. Most `affects` are `AffectedStopPlaceOnLine`,
  often with `stopPlace: null` and only a `quay { stopPlace }`. Asking for
  `VYG` returns situations for all of Norway, so the adapter keeps only those
  touching the area's lines or stops.
- **Tariff zones:** a stop has zones from several codespaces (`RUT:TariffZone:1`
  named `1`, `BRA:TariffZone:311` named `Oslo`, …). Ruter's zones (`1`, `2V`,
  `4V`, …) are the ones riders know.
- **No facilities** data (elevators etc.) in the Journey Planner.
