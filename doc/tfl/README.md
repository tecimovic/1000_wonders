# Transport for London Unified API (local copy)

Local reference for the `tfl-unified` adapter (`train/src/transit/adapters/tfl-unified.js`).
It's development information only and not part of the website. Refresh with
`doc/tfl/fetch.sh`.

## Files

| File | What's in it |
|---|---|
| `swagger.json` | The full Swagger 2.0 spec of the Unified API, from https://api.tfl.gov.uk/swagger/docs/v1. Every endpoint, parameter and response type. |

The developer portal (keys, terms, rate limits) is https://api-portal.tfl.gov.uk.
Human-readable endpoint docs: https://api.tfl.gov.uk (Swagger UI).

## Is there GTFS?

No. TfL doesn't publish GTFS or GTFS-Realtime itself. Its timetables are
published as TransXChange, and live data only through this JSON API. Third
parties convert TransXChange to GTFS, but the app doesn't need that. The
adapter maps the Unified API straight to the app's normalized shapes.

## Cheat sheet

- **Base URL:** `https://api.tfl.gov.uk`
- **Auth:** `?app_key=<key>`. Without a key the API still works, with a lower
  rate limit. The key is the `tfl` entry's `api.encryptedApiKey` in
  `train/src/supportedTransitAuthorities.json`.
- **CORS:** `Access-Control-Allow-Origin: *` (and `OPTIONS` allows `GET`), so
  browsers can call it directly.
- **Responses** are plain JSON, with a `$type` field on every object. Errors
  have a proper HTTP status and `{ httpStatusCode, message, relativeUri }`.
  **`relativeUri` echoes the request URL, `app_key` included**, so don't save
  raw error responses anywhere.
- **Modes** (`/Line/Meta/Modes`): `tube`, `dlr`, `overground`,
  `elizabeth-line`, `tram`, `bus`, `replacement-bus`, `river-bus`,
  `cable-car`, plus non-TfL `national-rail` etc. Many endpoints take a
  comma-separated list of modes.

| Endpoint | Used for |
|---|---|
| `GET /Line/Mode/{modes}/Status` | Alerts. One object per line with `lineStatuses[]`: `statusSeverity`, `statusSeverityDescription`, `reason`, `validityPeriods[]`, `disruption`. |
| `GET /StopPoint/Search/{query}?modes=…&maxResults=…` | Stop search. Returns `matches[]` of `{ id, name, modes, zone, towards, lat, lon }`. |
| `GET /StopPoint/{id}` | One stop point with its `children` tree and `additionalProperties` (facilities). |
| `GET /StopPoint/{id}/Arrivals` | Live predictions: `lineId`, `lineName`, `modeName`, `platformName`, `destinationName`, `towards`, `expectedArrival` (ISO), `timeToStation` (s), `currentLocation`, `vehicleId`. |

### Things learned from the live API (2026-11)

- **Stop ids** are NaPTAN codes. `940G…` = Underground/DLR/tram station,
  `910G…` = rail station (Elizabeth line, Overground, National Rail),
  `490…` = one bus stop (one side of the road), `490G…` = a cluster of bus
  stops, `HUB…` = an interchange that groups several of the above, `930G…` = pier.
- **Arrivals only exist for stations and single bus stops.** `HUB…` and
  `490G…` ids return `[]`, so the adapter walks the `children` of
  `/StopPoint/{id}` and requests each `NaptanMetroStation`,
  `NaptanRailStation` and `NaptanPublicBusCoachTram` child separately.
- **`/StopPoint/{ids}/Arrivals` does not accept a comma-separated list**
  (404 "stop point is not recognised"), unlike most other StopPoint endpoints.
- **The full stop list is huge.** `/StopPoint/Mode/bus` has ~32,500 entries
  in 1,000-entry pages of ~3.4 MB each, and `/StopPoint/Mode/tube` pages are
  ~9.5 MB (they include children). That's why the adapter searches on the
  server (`searchStops`) instead of loading every stop (`getStops`).
- **Stop search** returns at most ~10 matches, whatever `maxResults` says.
- **No line colors** in the API; the adapter has TfL's brand colors built in.
- **Line status severities:** 10 = Good Service, 0 = Special Service (buses
  use it for diversions, often with a long `reason`), 20 = Service Closed
  (tube lines at night, usually with no `reason`). Lower numbers are worse
  (1 Closed, 2 Suspended, 6 Severe Delays, 9 Minor Delays). The adapter turns
  everything except 10/18, and 20 without a reason, into alerts.
- **Bus statuses** are many (~230 of ~500 bus routes had one in 2026-11);
  several routes often share one `reason` text, which the adapter merges into
  one alert.
- Arrivals for buses: `platformName` is the stop letter (e.g. `W`).
- Facilities (`additionalProperties` with category `Facility` or
  `Accessibility`) exist for stations, e.g. lifts, escalators, toilets, Wi-Fi,
  step-free access.
