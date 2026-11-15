<!-- Generated from swagger.json by swagger-to-md.py. Do not edit by hand. -->

# MBTA V3 API reference (MBTA 3.0)

Base URL: `https://api-v3.mbta.com`. Auth: `x-api-key` header (or `api_key` query param).
Format: JSON:API — `data[]` of `{type, id, attributes, relationships}`, related objects in `included[]`.
Filters take comma-separated lists, e.g. `filter[stop]=place-pktrm,place-dwnxg`.

## Endpoints

### GET /alerts



List active and upcoming system alerts

An effect (enumerated in `/data/{index}/attributes/effect` and human-readable in `/data/{index}/attributes/service_effect`) on a provided service (facility, route, route type, stop and/or trip in `//data/{index}/attributes/informed_entity`) described by a banner (`/data/{index}/attributes/banner`), short header (`/data/{index}/attributes/short_header`), header `/data/{index}/attributes/header`, description (`/data/{index}/attributes/description`), image (`/data/{index}/attributes/image`), and image alternative text (`/data/{index}/attributes/image_alternative_text`) that is active for one or more periods(`/data/{index}/attributes/active_period`) caused by a cause (`/data/{index}/attribute/cause`) that somewhere in its lifecycle (enumerated in `/data/{index}/attributes/lifecycle` and human-readable in `/data/{index}/attributes/timeframe`).

See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert)
**Descriptions**
There are 7 descriptive attributes.

| JSON pointer                                | Usage                                                                           |
|---------------------------------------------|---------------------------------------------------------------------------------|
| `/data/{index}/attributes/banner`       | Display as alert across application/website                                     |
| `/data/{index}/attributes/short_header` | When `/data/{index}/attributes/header` is too long to display               |
| `/data/{index}/attributes/header`       | Used before showing and prepended to `/data/{index}/attributes/description` |
| `/data/{index}/attributes/description`  | Used when user asks to expand alert.                                            |
| `/data/{index}/attributes/image`        | URL to descriptive image.                                                       |
| `/data/{index}/attributes/image_alternative_text`  | Text that describes image linked in url                              |
**Effect**
| JSON pointer                                  |                |
|-----------------------------------------------|----------------|
| `/data/{index}/attributes/effect`         | Enumerated     |
| `/data/{index}/attributes/service_effect` | Human-readable |
**Timeline**
There are 3 timeline related attributes

| JSON pointer                                 | Description                                                                              |
|----------------------------------------------|------------------------------------------------------------------------------------------|
| `/data/{index}/attributes/active_period` | Exact Date/Time ranges alert is active                                                   |
| `/data/{index}/attributes/lifecycle`     | Enumerated, machine-readable description of `/data/{index}/attributes/active_period` |
| `/data/{index}/attributes/timeframe`     | Human-readable description of `/data/{index}/attributes/active_period`               |
**Notifications**
There are 3 notifications related attributes

| JSON pointer                                                    | Description                                                                                           |
|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `/data/{index}/attributes/closed_timestamp`                 | Time the alert was closed.                                                                            |
| `/data/{index}/attributes/last_push_notification_timestamp` | Time to send a new or updated alert notification. Send an "all clear" if equal to closed_timestamp.   |
| `/data/{index}/attributes/reminder_times`                   | Times to send upcoming alert reminder notifications                                                   |
**Activities**
Alerts are by default filtered to those where `/data/{index}/attributes/informed_entity/{informed_entity_index}/activities/{activity_index}` in one of BOARDEXITRIDE, as these cover most riders.  If you want all alerts without filtering by activity, you should use the special value `"ALL"`: `filter[activity]=ALL`.
**Accessibility**
The default activities cover if boarding, exiting, or riding is generally affected for all riders by the alert. If ONLY wheelchair using riders are affected, such as if a ramp, lift, or safety system for wheelchairs is affected, only the `"USING_WHEELCHAIR"` activity will be set. To cover wheelchair using rider, filter on the defaults and `"USING_WHEELCHAIR"`: `filter[activity]=USING_WHEELCHAIR,BOARD,EXIT,RIDE`.

Similarly for riders with limited mobility that need escalators, `"USING_ESCALATOR"` should be added to the defaults: `filter[activity]=USING_ESCALATOR,BOARD,EXIT,RIDE`.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `active_period`, `banner`, `cause`, `closed_timestamp`, `created_at`, `description`, `duration_certainty`, `effect`, `effect_name`, `header`, `image`, `image_alternative_text`, `informed_entity`, `last_push_notification_timestamp`, `lifecycle`, `reminder_times`, `service_effect`, `severity`, `short_header`, `timeframe`, `updated_at`, `url` (prefix `-` for descending)
- `fields[alert]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `stops`, `routes`, `trips`, `facilities`.
  <details><summary>details</summary>

  * `stops`
  * `routes`
  * `trips`
  * `facilities`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>
- `filter[activity]` (query, string) — Filter to alerts for only those activities (`/data/{index}/attributes/informed_entity/activities/{activity_index}`) matching.  Multiple activities
  **MUST** be a comma-separated (U+002C COMMA, ",") list.

  An activity affected by an alert.

  | Value                | Description                                                                                                                                                                                                                                                                       |
  |----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | `"BOARD"`            | Boarding a vehicle. Any passenger trip includes boarding a vehicle and exiting from a vehicle.                                                                                                                                                                                    |
  | `"BRINGING_BIKE"`    | Bringing a bicycle while boarding or exiting.                                                                                                                                                                                                                                     |
  | `"EXIT"`             | Exiting from a vehicle (disembarking). Any passenger trip includes boarding a vehicle and exiting a vehicle.                                                                                                                                                                      |
  | `"PARK_CAR"`         | Parking a car at a garage or lot in a station.                                                                                                                                                                                                                                    |
  | `"RIDE"`             | Riding through a stop without boarding or exiting.. Not every passenger trip will include this -- a passenger may board at one stop and exit at the next stop.                                                                                                                    |
  | `"STORE_BIKE"`       | Storing a bicycle at a station.                                                                                                                                                                                                                                                   |
  | `"USING_ESCALATOR"`  | Using an escalator while boarding or exiting (should only be used for customers who specifically want to avoid stairs.)                                                                                                                                                           |
  | `"USING_WHEELCHAIR"` | Using a wheelchair while boarding or exiting. Note that this applies to something that specifically affects customers who use a wheelchair to board or exit; a delay should not include this as an affected activity unless it specifically affects customers using wheelchairs.  |
  **Special Values**
  * If the filter is not given OR it is empty, then defaults to ["BOARD", "EXIT", "RIDE"].
  * If the value `"ALL"` is used then all alerts will be returned, not just those with the default activities.
  **Accessibility**
  The default activities cover if boarding, exiting, or riding is generally affected for all riders by the alert. If ONLY wheelchair using riders are affected, such as if a ramp, lift, or safety system for wheelchairs is affected, only the `"USING_WHEELCHAIR"` activity will be set. To cover wheelchair using rider, filter on the defaults and `"USING_WHEELCHAIR"`: `filter[activity]=USING_WHEELCHAIR,BOARD,EXIT,RIDE`.

  Similarly for riders with limited mobility that need escalators, `"USING_ESCALATOR"` should be added to the defaults: `filter[activity]=USING_ESCALATOR,BOARD,EXIT,RIDE`.
- `filter[route_type]` (query, string) — Filter by route_type: https://gtfs.org/documentation/schedule/reference/#routestxt.

  Multiple `route_type` **MUST** be a comma-separated (U+002C COMMA, ",") list. One of: `0`, `1`, `2`, `3`, `4`.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. One of: `0`, `1`.
- `filter[route]` (query, string) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[stop]` (query, string) — Filter by `/data/{index}/relationships/stop/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Parent station IDs are treated as though their child stops were also included.
- `filter[trip]` (query, string) — Filter by `/data/{index}/relationships/trip/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[facility]` (query, string) — Filter by `/data/{index}/relationships/facility/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[id]` (query, string) — Filter by multiple IDs. Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[banner]` (query, string) — When combined with other filters, filters by alerts with or without a banner. **MUST** be "true" or "false".
- `filter[datetime]` (query, string) — Filter to alerts that are active at a given time (ISO8601 format).

  Additionally, the string "NOW" can be used to filter to alerts that are currently active.
- `filter[lifecycle]` (query, string) — Filters by an alert's lifecycle. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[severity]` (query, string) — Filters alerts by list of severities. **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Example: filter[severity]=3,4,10 returns alerts with severity levels 3, 4 and 10.

### GET /alerts/{id}



Show a particular alert by the alert's id

An effect (enumerated in `/data/attributes/effect` and human-readable in `/data/attributes/service_effect`) on a provided service (facility, route, route type, stop and/or trip in `//data/attributes/informed_entity`) described by a banner (`/data/attributes/banner`), short header (`/data/attributes/short_header`), header `/data/attributes/header`, description (`/data/attributes/description`), image (`/data/attributes/image`), and image alternative text (`/data/attributes/image_alternative_text`) that is active for one or more periods(`/data/attributes/active_period`) caused by a cause (`/data/attribute/cause`) that somewhere in its lifecycle (enumerated in `/data/attributes/lifecycle` and human-readable in `/data/attributes/timeframe`).

See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert)
**Descriptions**
There are 7 descriptive attributes.

| JSON pointer                                | Usage                                                                           |
|---------------------------------------------|---------------------------------------------------------------------------------|
| `/data/attributes/banner`       | Display as alert across application/website                                     |
| `/data/attributes/short_header` | When `/data/attributes/header` is too long to display               |
| `/data/attributes/header`       | Used before showing and prepended to `/data/attributes/description` |
| `/data/attributes/description`  | Used when user asks to expand alert.                                            |
| `/data/attributes/image`        | URL to descriptive image.                                                       |
| `/data/attributes/image_alternative_text`  | Text that describes image linked in url                              |
**Effect**
| JSON pointer                                  |                |
|-----------------------------------------------|----------------|
| `/data/attributes/effect`         | Enumerated     |
| `/data/attributes/service_effect` | Human-readable |
**Timeline**
There are 3 timeline related attributes

| JSON pointer                                 | Description                                                                              |
|----------------------------------------------|------------------------------------------------------------------------------------------|
| `/data/attributes/active_period` | Exact Date/Time ranges alert is active                                                   |
| `/data/attributes/lifecycle`     | Enumerated, machine-readable description of `/data/attributes/active_period` |
| `/data/attributes/timeframe`     | Human-readable description of `/data/attributes/active_period`               |
**Notifications**
There are 3 notifications related attributes

| JSON pointer                                                    | Description                                                                                           |
|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `/data/attributes/closed_timestamp`                 | Time the alert was closed.                                                                            |
| `/data/attributes/last_push_notification_timestamp` | Time to send a new or updated alert notification. Send an "all clear" if equal to closed_timestamp.   |
| `/data/attributes/reminder_times`                   | Times to send upcoming alert reminder notifications                                                   |

Parameters:

- `id` (path, string **required**) — Unique identifier for alert
- `fields[alert]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `stops`, `routes`, `trips`, `facilities`.
  <details><summary>details</summary>

  * `stops`
  * `routes`
  * `trips`
  * `facilities`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>

### GET /facilities



List Escalators and Elevators

Amenities at a station stop (`/data/relationships/stop`) such as elevators, escalators, parking lots, and bike storage.

An [MBTA extension](https://groups.google.com/forum/#!topic/gtfs-changes/EzC5m9k45pA).  This spec is not yet finalized.
**Accessibility**
Riders with limited mobility can search any facility, either `ELEVATOR` or `ESCALATOR`, while riders that need wheelchair access can search for `ELEVATOR` only.

The lack of an `ELEVATOR` MAY NOT make a stop wheelchair inaccessible.  Riders should check `/stops/{id}` `/data/attributes/wheelchair_boarding` is `1` to guarantee a path is available from the station entrance to the stop or `0` if it MAY be accessible.  Completely avoid `2` as that is guaranteed to be INACCESSIBLE.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `latitude`, `long_name`, `longitude`, `properties`, `short_name`, `type` (prefix `-` for descending)
- `fields[facility]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `stop`.
  <details><summary>details</summary>

  * `stop`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>
- `filter[stop]` (query, string) — Filter by `/data/{index}/relationships/stop/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[type]` (query, string) — Filter by type. Multiple types **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /facilities/{id}



Specific Escalator or Elevator

Amenities at a station stop (`/data/{index}/relationships/stop`) such as elevators, escalators, parking lots, and bike storage.

An [MBTA extension](https://groups.google.com/forum/#!topic/gtfs-changes/EzC5m9k45pA).  This spec is not yet finalized.
**Accessibility**
Riders with limited mobility can search any facility, either `ELEVATOR` or `ESCALATOR`, while riders that need wheelchair access can search for `ELEVATOR` only.

The lack of an `ELEVATOR` MAY NOT make a stop wheelchair inaccessible.  Riders should check `/stops/{id}` `/data/attributes/wheelchair_boarding` is `1` to guarantee a path is available from the station entrance to the stop or `0` if it MAY be accessible.  Completely avoid `2` as that is guaranteed to be INACCESSIBLE.

Parameters:

- `id` (path, string **required**) — Unique identifier for facility
- `fields[facility]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `stop`.
  <details><summary>details</summary>

  * `stop`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>

### GET /lines



List of lines. A line is a combination of routes. This concept can be used to group similar routes when displaying them to customers, such as for routes which serve the same trunk corridor or bus terminal.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `color`, `long_name`, `short_name`, `sort_order`, `text_color` (prefix `-` for descending)
- `fields[line]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `routes`.
  <details><summary>details</summary>

  * `routes`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>
- `filter[id]` (query, string) — Filter by multiple IDs. **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /lines/{id}



Single line, which represents a combination of routes.

Parameters:

- `id` (path, string **required**) — Unique identifier for a line
- `fields[line]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `routes`.
  <details><summary>details</summary>

  * `routes`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>

### GET /live_facilities



Live Facility Data

Live data about a given facility.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `properties`, `updated_at` (prefix `-` for descending)
- `include` — Relationships to include. Values: `facility`.
  <details><summary>details</summary>

  * `facility`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>
- `filter[id]` (query, string) — Filter by multiple parking facility ids. **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /live_facilities/{id}



List live parking data for specific parking facility

Live data about a given facility.

Parameters:

- `id` (path, string **required**) — Unique identifier for facility
- `include` — Relationships to include. Values: `facility`.
  <details><summary>details</summary>

  * `facility`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>

### GET /predictions



**NOTE:** A filter **MUST** be present for any predictions to be returned.

List of predictions for trips.  To get the scheduled times instead of the predictions, use `/schedules`.

The predicted arrival time (`/data/{index}/attributes/arrival_time`) and departure time (`/data/{index}/attributes/departure_time`) to/from a stop (`/data/{index}/relationships/stop/data/id`) at a given sequence (`/data/{index}/attriutes/stop_sequence`) along a trip (`/data/{index}/relationships/trip/data/id`) going a direction (`/data/{index}/attributes/direction_id`) along a route (`/data/{index}/relationships/route/data/id`).

See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-tripdescriptor)
See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `StopTimeUpdate`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate)
**When a vehicle is predicted to be at a stop**
`/predictions?filter[stop]=STOP_ID`
**The predicted schedule for one route**
`/predictions?filter[route]=ROUTE_ID`
**The predicted schedule for a whole trip**
`/predictions?filter[trip]=TRIP_ID`

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `arrival_time`, `arrival_uncertainty`, `departure_time`, `departure_uncertainty`, `direction_id`, `last_trip`, `revenue_status`, `schedule_relationship`, `status`, `stop_sequence`, `time`, `trip_headsign`, `update_type` (prefix `-` for descending)
- `fields[prediction]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `schedule`, `stop`, `route`, `trip`, `vehicle`, `alerts`.
  <details><summary>details</summary>

  * `schedule`
  * `stop`
  * `route`
  * `trip`
  * `vehicle`
  * `alerts`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  **Example**
  `https://api-v3.mbta.com/predictions?filter%5Bstop%5D=place-sstat&filter%5Bdirection_id%5D=0&include=stop`
  returns predictions from South Station with direction_id=0, below is a truncated response with only relevant fields displayed:
  ```
    {
      "data": [
        {
          "id": "prediction-CR-Weekday-Fall-18-743-South Station-02-1",
          "relationships": {
            "stop": {
              "data": {
                "id": "South Station-02",
                "type": "stop"
              }
            },
          },
          "type": "prediction"
        }
      ],
      "included": [
        {
          "attributes": {
            "platform_code": "2",
          },
          "id": "South Station-02",
          "type": "stop"
        }
      ],
    }
  ```
  Note the stop relationship; use it to cross-reference  stop-id with the included stops to retrieve the platform_code for the given prediction.
  **Note on trips**
  A Vehicle's `trip` is what is currently being served.

  A Prediction also has a `vehicle`: this is the vehicle we predict will serve this trip/stop.

  Since we know vehicles make future trips, the trip the vehicle is currently servicing can be different from the trips we're making predictions for.

  For example:
  * Vehicle 1234 is currently serving trip A
  * The block is Trip A → Trip B → Trip C

  We'll be making predictions for the rest of trip A, as well as all the stops of trip B and trip C. The `trip` for the Vehicle is always `A`, and all of the Predictions will reference Vehicle 1234.
  </details>
- `filter[latitude]` (query, string) — Latitude/Longitude must be both present or both absent.
- `filter[longitude]` (query, string) — Latitude/Longitude must be both present or both absent.
- `filter[radius]` (query, string) — Radius accepts a floating point number, and the default is 0.01.  For example, if you query for: latitude: 42,  longitude: -71,  radius: 0.05 then you will filter between latitudes 41.95 and 42.05, and longitudes -70.95 and -71.05.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. One of: `0`, `1`.
- `filter[route_type]` (query, string) — Filter by route_type: https://gtfs.org/documentation/schedule/reference/#routestxt.

  Multiple `route_type` **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Must be used in conjunction with another filter. One of: `0`, `1`, `2`, `3`, `4`.
- `filter[stop]` (query, string) — Filter by `/data/{index}/relationships/stop/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Parent station IDs are treated as though their child stops were also included.
- `filter[route]` (query, string) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[trip]` (query, string) — Filter by `/data/{index}/relationships/trip/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[revenue]` (query, string) — Filter predictions by revenue status.
  Revenue status indicates whether or not the vehicle is accepting passengers.
  When filter is not included, the default behavior is to filter by `revenue=REVENUE`.

  Multiple `revenue` types **MUST** be a comma-separated (U+002C COMMA, ",") list. One of: `NON_REVENUE`, `REVENUE`, `NON_REVENUE,REVENUE`.
- `filter[schedule_relationship]` (query, string) — Filter predictions by schedule relationship: https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship
  Relationship between the prediction and the current GTFS static schedule.
  When filter is not included, the default behavior is to return trips with all
  schedule relationships. One of: `SCHEDULED`, `SKIPPED`, `ADDED`.
- `filter[route_pattern]` (query, string) — Filter by `/included/{index}/relationships/route_pattern/data/id` of a trip. Multiple `route_pattern_id` **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /route_patterns



List of route patterns.

Route patterns are used to describe the subsets of a route, representing different possible patterns of where trips may serve. For example, a bus route may have multiple branches, and each branch may be modeled as a separate route pattern per direction. Hierarchically, the route pattern level may be considered to be larger than the trip level and smaller than the route level.

For most MBTA modes, a route pattern will typically represent a unique set of stops that may be served on a route-trip combination. Seasonal schedule changes may result in trips within a route pattern having different routings. In simple changes, such a single bus stop removed or added between one schedule rating and the next (for example, between the Summer and Fall schedules), trips will be maintained on the same route_pattern_id. If the changes are significant, a new route_pattern_id may be introduced.

For Commuter Rail, express or skip-stop trips use the same route pattern as local trips. Some branches do have multiple route patterns when the train takes a different path. For example, `CR-Providence` has two route patterns per direction, one for the Wickford Junction branch and the other for the Stoughton branch.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `canonical`, `direction_id`, `name`, `sort_order`, `time_desc`, `typicality` (prefix `-` for descending)
- `fields[route_pattern]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `route`, `representative_trip`.
  <details><summary>details</summary>

  * `route`
  * `representative_trip`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include | Description |
  |-|-|
  | `route` | The route that this pattern belongs to. |
  | `representative_trip` | A trip that can be considered a canonical trip for the route pattern. This trip can be used to deduce a pattern's canonical set of stops and shape. |
  </details>
- `filter[id]` (query, string) — Filter by multiple IDs. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[route]` (query, string) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. One of: `0`, `1`.
- `filter[stop]` (query, string) — Filter by `/data/{index}/relationships/stop/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Parent station IDs are treated as though their child stops were also included.
- `filter[canonical]` (query, boolean) — Filter by canonical

  true: Route pattern should be considered canonical for this route in this direction. If branching regularly occurs, this route-direction may have more than one canonical pattern.
  false: Route pattern should be not considered canonical for this route in this direction.
- `filter[date]` (query, string) — Filter by date that route pattern is active The active date is the service date. Trips that begin between midnight and 3am are considered part of the previous service day. The format is ISO8601 with the template of YYYY-MM-DD.

### GET /route_patterns/{id}



Show a particular route_pattern by the route's id.

Route patterns are used to describe the subsets of a route, representing different possible patterns of where trips may serve. For example, a bus route may have multiple branches, and each branch may be modeled as a separate route pattern per direction. Hierarchically, the route pattern level may be considered to be larger than the trip level and smaller than the route level.

For most MBTA modes, a route pattern will typically represent a unique set of stops that may be served on a route-trip combination. Seasonal schedule changes may result in trips within a route pattern having different routings. In simple changes, such a single bus stop removed or added between one schedule rating and the next (for example, between the Summer and Fall schedules), trips will be maintained on the same route_pattern_id. If the changes are significant, a new route_pattern_id may be introduced.

For Commuter Rail, express or skip-stop trips use the same route pattern as local trips. Some branches do have multiple route patterns when the train takes a different path. For example, `CR-Providence` has two route patterns per direction, one for the Wickford Junction branch and the other for the Stoughton branch.

Parameters:

- `fields[route_pattern]` (string) — sparse fieldset: comma-separated attribute names
- `id` (path, string **required**) — Unique identifier for route_pattern
- `include` — Relationships to include. Values: `route`, `representative_trip`.
  <details><summary>details</summary>

  * `route`
  * `representative_trip`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include | Description |
  |-|-|
  | `route` | The route that this pattern belongs to. |
  | `representative_trip` | A trip that can be considered a canonical trip for the route pattern. This trip can be used to deduce a pattern's canonical set of stops and shape. |
  </details>

### GET /routes



List of routes.
**Names and Descriptions**
There are 3 attributes with increasing details for naming and describing the route.

1. `/data/{index}/attributes/short_name`
2. `/data/{index}/attributes/long_name`
3. `/data/{index}/attributes/description`
**Directions**
`/data/{index}/attributes/direction_names` is the only place to convert the `direction_id` used throughout the rest of the API to human-readable names.
**Type**
`/data/{index}/attributes/type` corresponds to [GTFS `routes.txt` `route_type`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt).

| Value | Name          | Example    |
|-------|---------------|------------|
| `0`   | Light Rail    | Green Line |
| `1`   | Heavy Rail    | Red Line   |
| `2`   | Commuter Rail |            |
| `3`   | Bus           |            |
| `4`   | Ferry         |            |

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `color`, `description`, `direction_destinations`, `direction_names`, `fare_class`, `listed_route`, `long_name`, `short_name`, `sort_order`, `text_color`, `type` (prefix `-` for descending)
- `fields[route]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `stop`, `line`, `route_patterns`.
  <details><summary>details</summary>

  * `stop`
  * `line`
  * `route_patterns`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  `stop` can only be included when `filter[stop]` is also specified.
  </details>
- `filter[stop]` (query, string) — Filter by `/data/{index}/relationships/stop/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[type]` (query, string) — | Value | Name          | Example    |
  |-------|---------------|------------|
  | `0`   | Light Rail    | Green Line |
  | `1`   | Heavy Rail    | Red Line   |
  | `2`   | Commuter Rail |            |
  | `3`   | Bus           |            |
  | `4`   | Ferry         |            |


  Multiple `route_type` **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`.


  When combined with stop_id, filters by routes which stop at that stop when traveling in a particular direction One of: `0`, `1`.
- `filter[date]` (query, string) — Filter by date that route is active The active date is the service date. Trips that begin between midnight and 3am are considered part of the previous service day. The format is ISO8601 with the template of YYYY-MM-DD.
- `filter[id]` (query, string) — Filter by multiple IDs. Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[listed_route]` (query, string) — Filter by whether route should be publicly listed. Set to 'true' to return only listed routes, 'false' to return all routes. If not provided, defaults to showing only listed routes (same as 'true').

### GET /routes/{id}



Show a particular route by the route's id.
**Names and Descriptions**
There are 3 attributes with increasing details for naming and describing the route.

1. `/data/attributes/short_name`
2. `/data/attributes/long_name`
3. `/data/attributes/description`
**Directions**
`/data/attributes/direction_names` is the only place to convert the `direction_id` used throughout the rest of the API to human-readable names.
**Type**
`/data/attributes/type` corresponds to [GTFS `routes.txt` `route_type`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt).

| Value | Name          | Example    |
|-------|---------------|------------|
| `0`   | Light Rail    | Green Line |
| `1`   | Heavy Rail    | Red Line   |
| `2`   | Commuter Rail |            |
| `3`   | Bus           |            |
| `4`   | Ferry         |            |

Parameters:

- `id` (path, string **required**) — Unique identifier for route
- `fields[route]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `line`, `route_patterns`.
  <details><summary>details</summary>

  * `line`
  * `route_patterns`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>

### GET /schedules



**NOTE:** `filter[route]`, `filter[stop]`, or `filter[trip]` **MUST** be present for any schedules to be returned.

List of schedules.  To get a realtime prediction instead of the scheduled times, use `/predictions`.

A schedule is the arrival drop off (`/data/{index}/attributes/drop_off_type`) time (`/data/{index}/attributes/arrival_time`) and departure pick up (`/data/{index}/attributes/pickup_type`) time (`/data/{index}/attributes/departure_time`) to/from a stop (`/data/{index}/relationships/stop/data/id`) at a given sequence (`/data/{index}/attributes/stop_sequence`) along a trip (`/data/{index}/relationships/trip/data/id`) going in a direction (`/data/{index}/attributes/direction_id`) on a route (`/data/{index}/relationships/route/data/id`) when the trip is following a service (`/data/{index}/relationships/service/data/id`) to determine when it is active.

See [GTFS `stop_times.txt`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) for base specification.
**When a vehicle is scheduled to be at a stop**
`/schedules?filter[stop]=STOP_ID`
**The schedule for one route**
`/schedules?filter[route]=ROUTE_ID`
**When a route is open**
Query for the `first` and `last` stops on the route.

`/schedules?filter[route]=ROUTE_ID&filter[stop_sequence]=first,last`
**The schedule for a whole trip**
`/schedule?filter[trip]=TRIP_ID`

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `arrival_time`, `departure_time`, `direction_id`, `drop_off_type`, `pickup_type`, `stop_headsign`, `stop_sequence`, `time`, `timepoint` (prefix `-` for descending)
- `fields[schedule]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `stop`, `trip`, `prediction`, `route`, `added_routes`.
  <details><summary>details</summary>

  * `stop`
  * `trip`
  * `prediction`
  * `route`
  * `added_routes`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>
- `filter[date]` (query, string) — Filter schedule by date that they are active. The active date is the service date. Trips that begin between midnight and 3am are considered part of the previous service day. The format is ISO8601 with the template of YYYY-MM-DD.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. One of: `0`, `1`.
- `filter[route_type]` (query, string) — Filter by route_type: https://gtfs.org/documentation/schedule/reference/#routestxt.

  Multiple `route_type` **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Must be used in conjunction with another filter. One of: `0`, `1`, `2`, `3`, `4`.
- `filter[min_time]` (query, string) — Time before which schedule should not be returned. To filter times after midnight use more than 24 hours. For example, min_time=24:00 will return schedule information for the next calendar day, since that service is considered part of the current service day. Additionally, min_time=00:00&max_time=02:00 will not return anything. The time format is HH:MM.
- `filter[max_time]` (query, string) — Time after which schedule should not be returned. To filter times after midnight use more than 24 hours. For example, min_time=24:00 will return schedule information for the next calendar day, since that service is considered part of the current service day. Additionally, min_time=00:00&max_time=02:00 will not return anything. The time format is HH:MM.
- `filter[route]` (query, string) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[stop]` (query, string) — Filter by `/data/{index}/relationships/stop/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.

  Parent station IDs are treated as though their child stops were also included.
- `filter[trip]` (query, string) — Filter by `/data/{index}/relationships/trip/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[stop_sequence]` (query, string) — Filter by the index of the stop in the trip.  Symbolic values `first` and `last` can be used instead of numeric sequence number too.

### GET /services



List of services. Service represents the days of the week, as well as extra days, that a trip is valid.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `added_dates`, `added_dates_notes`, `description`, `end_date`, `rating_description`, `rating_end_date`, `rating_start_date`, `removed_dates`, `removed_dates_notes`, `schedule_name`, `schedule_type`, `schedule_typicality`, `start_date`, `valid_days` (prefix `-` for descending)
- `fields[service]` (string) — sparse fieldset: comma-separated attribute names
- `filter[id]` (query, string) — Filter by multiple IDs. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[route]` (query, string) — Filter by route. Multiple `route` **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /services/{id}



Single service, which represents the days of the week, as well as extra days, that a trip is valid.

Parameters:

- `id` (path, string **required**) — Unique identifier for a service
- `fields[service]` (string) — sparse fieldset: comma-separated attribute names

### GET /shapes



**NOTE:** `filter[route]` **MUST** be given for any shapes to be returned.

List of shapes.
**Vertices****World**
`/data/{index}/attributes/polyline` is in [Encoded Polyline Algorithm Format](https://developers.google.com/maps/documentation/utilities/polylinealgorithm), which encodes the latitude and longitude of a sequence of points in the shape.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `polyline` (prefix `-` for descending)
- `fields[shape]` (string) — sparse fieldset: comma-separated attribute names
- `filter[route]` (query, string **required**) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /shapes/{id}



Detail of a particular shape.
**Vertices****World**
`/data/attributes/polyline` is in [Encoded Polyline Algorithm Format](https://developers.google.com/maps/documentation/utilities/polylinealgorithm), which encodes the latitude and longitude of a sequence of points in the shape.

Parameters:

- `id` (path, string **required**) — Unique identifier for shape
- `fields[shape]` (string) — sparse fieldset: comma-separated attribute names

### GET /stop_events



List of stop events.

Stop events represent the actual arrival and departure times of vehicles at stops along their trips.

Stop events are unique to the start_date, trip_id, route_id, vehicle_id, and stop_sequence.

To return a list of stop events, **provide at least 1 filter parameter**; requests without filters will return an error.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `arrived`, `departed`, `direction_id`, `revenue`, `route_id`, `start_date`, `stop_id`, `stop_sequence`, `trip_id`, `vehicle_id` (prefix `-` for descending)
- `fields[stop_event]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `trip`, `stop`, `route`, `vehicle`, `schedule`.
  <details><summary>details</summary>

  * `trip`
  * `stop`
  * `route`
  * `vehicle`
  * `schedule`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include | Description |
  |-|-|
  | `trip` | The trip associated with this stop event. |
  | `stop` | The stop where the event occurred. |
  | `route` | The route associated with this stop event. |
  | `vehicle` | The vehicle that served this trip. |
  | `schedule` | The scheduled arrival/departure for this stop event. |

  Note that the included entities may appear in past events but no longer in realtime feeds, so included relationships may be empty.
  </details>
- `filter[trip]` (query, string) — Filter by trip ID. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[stop]` (query, string) — Filter by stop or parent station ID. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[route]` (query, string) — Filter by route ID. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[vehicle]` (query, string) — Filter by vehicle ID. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`.


  Must be used in conjunction with another filter. One of: `0`, `1`.

### GET /stop_events/{id}



Show a particular stop event by its composite ID.

Stop events represent the actual arrival and departure times of vehicles at stops along their trips.

Stop events are unique to the start_date, trip_id, route_id, vehicle_id, and stop_sequence.

To return a list of stop events, **provide at least 1 filter parameter**; requests without filters will return an error.

Parameters:

- `id` (path, string **required**) — Unique identifier for stop event (trip_id-route_id-vehicle_id-stop_sequence)
- `include` — Relationships to include. Values: `trip`, `stop`, `route`, `vehicle`, `schedule`.
  <details><summary>details</summary>

  * `trip`
  * `stop`
  * `route`
  * `vehicle`
  * `schedule`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include | Description |
  |-|-|
  | `trip` | The trip associated with this stop event. |
  | `stop` | The stop where the event occurred. |
  | `route` | The route associated with this stop event. |
  | `vehicle` | The vehicle that served this trip. |
  | `schedule` | The scheduled arrival/departure for this stop event. |

  Note that the included entities may appear in past events but no longer in realtime feeds, so included relationships may be empty.
  </details>

### GET /stops



List stops.
**Accessibility**
Wheelchair boarding (`/data/{index}/attributes/wheelchair_boarding`) corresponds to [GTFS wheelchair_boarding](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). The MBTA handles parent station inheritance itself, so value can be treated simply:

| Value | Meaning                                       |
|-------|-----------------------------------------------|
| `0`   | No Information                                |
| `1`   | Accessible (if trip is wheelchair accessible) |
| `2`   | Inaccessible                                  |
**Location****World**
Use `/data/{index}/attributes/latitude` and `/data/{index}/attributes/longitude` to get the location of a stop.
**Entrance**
The stop may be inside a station.  If `/data/{index}/relationships/parent_station/data/id` is present, you should look up the parent station (`/stops/{parent_id}`) and use its location to give direction first to the parent station and then route from there to the stop.
**Nearby**
The `filter[latitude]` and `filter[longitude]` can be used together to find any stops near that latitude and longitude.  The distance is in degrees as if latitude and longitude were on a flat 2D plane and normal Pythagorean distance was calculated.  Over the region MBTA serves, `0.02` degrees is approximately `1` mile. How close is considered nearby, is controlled by `filter[radius]`, which default to `0.01` degrees (approximately a half mile).

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `address`, `at_street`, `description`, `distance`, `latitude`, `location_type`, `longitude`, `municipality`, `name`, `on_street`, `platform_code`, `platform_name`, `vehicle_type`, `wheelchair_boarding` (prefix `-` for descending)
- `fields[stop]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `child_stops`, `connecting_stops`, `facilities`, `parent_station`, `route`.
  <details><summary>details</summary>

  * `child_stops`
  * `connecting_stops`
  * `facilities`
  * `parent_station`
  * `route`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  Note that `route` can only be included if `filter[route]` is present and has exactly one `/data/{index}/relationships/route/data/id`.
  </details>
- `filter[date]` (query, string) — Filter by date when stop is in use. Will be ignored unless filter[route] is present. If filter[service] is present, this filter will be ignored. The active date is the service date. Trips that begin between midnight and 3am are considered part of the previous service day. The format is ISO8601 with the template of YYYY-MM-DD.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. One of: `0`, `1`.
- `filter[latitude]` (query, string) — Latitude in degrees North in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS.C2.A084) coordinate system to search `filter[radius]` degrees around with `filter[longitude]`.
- `filter[longitude]` (query, string) — Longitude in degrees East in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS.C2.A084) coordinate system to search `filter[radius]` degrees around with `filter[latitude]`.
- `filter[radius]` (query, number) — The distance is in degrees as if latitude and longitude were on a flat 2D plane and normal Pythagorean distance was calculated.  Over the region MBTA serves, `0.02` degrees is approximately `1` mile. Defaults to `0.01` degrees (approximately a half mile).
- `filter[id]` (query, string) — Filter by `/data/{index}/id` (the stop ID). Multiple `/data/{index}/id` **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[route_type]` (query, string) — Filter by route_type: https://gtfs.org/documentation/schedule/reference/#routestxt.

  Multiple `route_type` **MUST** be a comma-separated (U+002C COMMA, ",") list. One of: `0`, `1`, `2`, `3`, `4`.
- `filter[route]` (query, string) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[service]` (query, string) — Filter by service_id for which stop is in use. Multiple service_ids **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[location_type]` (query, string) — Filter by location_type https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs.md#stopstxt. Multiple location_type **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /stops/{id}



Detail for a specific stop.
**Accessibility**
Wheelchair boarding (`/data/attributes/wheelchair_boarding`) corresponds to [GTFS wheelchair_boarding](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). The MBTA handles parent station inheritance itself, so value can be treated simply:

| Value | Meaning                                       |
|-------|-----------------------------------------------|
| `0`   | No Information                                |
| `1`   | Accessible (if trip is wheelchair accessible) |
| `2`   | Inaccessible                                  |
**Location****World**
Use `/data/attributes/latitude` and `/data/attributes/longitude` to get the location of a stop.
**Entrance**
The stop may be inside a station.  If `/data/relationships/parent_station/data/id` is present, you should look up the parent station (`/stops/{parent_id}`) and use its location to give direction first to the parent station and then route from there to the stop.

Parameters:

- `id` (path, string **required**) — Unique identifier for stop
- `fields[stop]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `child_stops`, `connecting_stops`, `facilities`, `parent_station`.
  <details><summary>details</summary>

  * `child_stops`
  * `connecting_stops`
  * `facilities`
  * `parent_station`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)
  </details>

### GET /transfers



**NOTE:** `filter[from_trip]` **MUST** be present for any transfers to be returned.

List of transfers. Transfer specifies additional rules and overrides for a transfer between trips, routes, and/or stops.
**Transfers from a certain trip**
`/transfers?filter[from_trip]=TRIP_ID`
**Transfers from a set of trips**
`/transfers?filter[from_trip]=TRIP_ID1,TRIP_ID2,TRIP_ID3`

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `min_transfer_time`, `min_walk_time`, `min_wheelchair_time`, `suggested_buffer_time`, `transfer_type`, `wheelchair_transfer` (prefix `-` for descending)
- `fields[transfer]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `from_trip`, `to_trip`, `from_stop`, `to_stop`.
  <details><summary>details</summary>

  * `from_trip`
  * `to_trip`
  * `from_stop`
  * `to_stop`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include     | Description |
  |-------------|-------------|
  | `from_trip` | The trip where a connection between routes begins |
  | `to_trip`   | The trip where a connection between routes ends |
  | `from_stop` | The stop or station where a connection between routes begins |
  | `to_stop`   | The stop or station where a connection between routes ends |
  </details>
- `filter[from_trip]` (query, string) — Filter by trip ID. Multiple trips **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /trips



**NOTE:** A id, route, route_pattern, or name filter **MUST** be present for any trips to be returned.

List of trips, the journies of a particular vehicle through a set of stops on a primary `route` and zero or more alternative `route`s that can be filtered on.
**Accessibility**
Wheelchair accessibility (`/data/{index}/attributes/wheelchair_accessible`) [as defined in GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt):

| Value | Meaning                                            |
|-------|----------------------------------------------------|
| `0`   | No information                                     |
| `1`   | Accessible (at stops allowing wheelchair_boarding) |
| `2`   | Inaccessible                                       |
**Grouping**
Multiple trips **may** be grouped together using `/data/{index}/attributes/block_id`. A block represents a series of trips scheduled to be operated by the same vehicle.
**Naming**
There are 3 names associated with a trip.

| API Field                   | GTFS              | Show users? |
|-----------------------------|-------------------|-------------|
| `/data/attributes/headsign` | `trip_headsign`   | Yes         |
| `/data/attributes/name`     | `trip_short_name` | Yes         |
| `/data/id`                  | `trip_id`         | No          |

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `bikes_allowed`, `block_id`, `direction_id`, `headsign`, `name`, `percentage`, `revenue_status`, `status`, `wheelchair_accessible` (prefix `-` for descending)
- `fields[trip]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `route`, `vehicle`, `service`, `shape`, `predictions`, `route_pattern`, `stops`, `from_trip_transfers`, `occupancies`.
  <details><summary>details</summary>

  * `route`
  * `vehicle`
  * `service`
  * `shape`
  * `predictions`
  * `route_pattern`
  * `stops`
  * `from_trip_transfers`
  * `occupancies`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include         | Description |
  |-----------------|-------------|
  | `route`         | The *primary* route for the trip. |
  | `vehicle`       | The vehicle on this trip. |
  | `service`       | The service controlling when this trip is active. |
  | `shape`         | The shape of the trip. |
  | `route_pattern` | The route pattern for the trip. |
  | `predictions`   | Predictions of when the `vehicle` on this `trip` will arrive at or depart from each stop on the route(s) on the `trip`. |
  | `stops`         | The stops this trip goes through. |
  | `from_trip_transfers`     | The transfers possible from this trip. |
  | `occupancies`   | **EXPERIMENTAL:** The trip's static occupancy data. For information on experimental features, see: https://www.mbta.com/developers/v3-api/versioning.|
  </details>
- `filter[date]` (query, string) — Filter by trips on a particular date The active date is the service date. Trips that begin between midnight and 3am are considered part of the previous service day. The format is ISO8601 with the template of YYYY-MM-DD.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. One of: `0`, `1`.
- `filter[route]` (query, string) — Filter by `/data/{index}/relationships/route/data/id`.

  Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[revenue]` (query, string) — Filter trips by revenue status.
  Revenue status indicates whether or not the vehicle is accepting passengers.
  When filter is not included, the default behavior is to filter by `revenue=REVENUE`.

  Multiple `revenue` types **MUST** be a comma-separated (U+002C COMMA, ",") list. One of: `NON_REVENUE`, `REVENUE`, `NON_REVENUE,REVENUE`.
- `filter[route_pattern]` (query, string) — Filter by route pattern IDs **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[id]` (query, string) — Filter by multiple IDs. **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[name]` (query, string) — Filter by multiple names. **MUST** be a comma-separated (U+002C COMMA, ",") list.

### GET /trips/{id}



Single trip - the journey of a particular vehicle through a set of stops
**Accessibility**
Wheelchair accessibility (`/data/attributes/wheelchair_accessible`) [as defined in GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt):

| Value | Meaning                                            |
|-------|----------------------------------------------------|
| `0`   | No information                                     |
| `1`   | Accessible (at stops allowing wheelchair_boarding) |
| `2`   | Inaccessible                                       |
**Grouping**
Multiple trips **may** be grouped together using `/data/attributes/block_id`. A block represents a series of trips scheduled to be operated by the same vehicle.
**Naming**
There are 3 names associated with a trip.

| API Field                   | GTFS              | Show users? |
|-----------------------------|-------------------|-------------|
| `/data/attributes/headsign` | `trip_headsign`   | Yes         |
| `/data/attributes/name`     | `trip_short_name` | Yes         |
| `/data/id`                  | `trip_id`         | No          |

Parameters:

- `id` (path, string **required**) — Unique identifier for a trip
- `fields[trip]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `route`, `vehicle`, `service`, `shape`, `predictions`, `route_pattern`, `stops`, `from_trip_transfers`, `occupancies`.
  <details><summary>details</summary>

  * `route`
  * `vehicle`
  * `service`
  * `shape`
  * `predictions`
  * `route_pattern`
  * `stops`
  * `from_trip_transfers`
  * `occupancies`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include         | Description |
  |-----------------|-------------|
  | `route`         | The *primary* route for the trip. |
  | `vehicle`       | The vehicle on this trip. |
  | `service`       | The service controlling when this trip is active. |
  | `shape`         | The shape of the trip. |
  | `route_pattern` | The route pattern for the trip. |
  | `predictions`   | Predictions of when the `vehicle` on this `trip` will arrive at or depart from each stop on the route(s) on the `trip`. |
  | `stops`         | The stops this trip goes through. |
  | `from_trip_transfers`     | The transfers possible from this trip. |
  | `occupancies`   | **EXPERIMENTAL:** The trip's static occupancy data. For information on experimental features, see: https://www.mbta.com/developers/v3-api/versioning.|
  </details>

### GET /vehicles



List of vehicles (buses, ferries, and trains)
**Direction****World**
To figure out which way the vehicle is pointing at the location, use `/data/{index}/attributes/bearing`.  This can be the compass bearing, or the direction towards the next stop or intermediate location.
**Trip**
To get the direction around the stops in the trip use `/data/{index}/attributes/direction_id`.
**Location****World**
Use `/data/{index}/attributes/latitude` and `/data/{index}/attributes/longitude` to get the location of a vehicle.
**Trip**
Use `/data/{index}/attributes/current_stop_sequence` to get the stop number along the trip.  Useful for linear stop indicators.  Position relative to the current stop is in `/data/{index}/attributes/current_status`.
**Movement****World**
Use `/data/{index}/attributes/speed` to get the speed of the vehicle in meters per second.

Parameters:

- `page[offset]` (query, integer) — Offset (0-based) of first element in the page
- `page[limit]` (query, integer) — Max number of elements to return
- `sort` — any of: `bearing`, `carriages`, `current_status`, `current_stop_sequence`, `direction_id`, `label`, `latitude`, `longitude`, `occupancy_status`, `revenue_status`, `speed`, `updated_at` (prefix `-` for descending)
- `fields[vehicle]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `trip`, `stop`, `route`.
  <details><summary>details</summary>

  * `trip`
  * `stop`
  * `route`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include | Description                                                                                                                                                                                                                                                                                                                                                  |
  |---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | `trip`  | The trip which the vehicle is currently operating.                                                                                                                                                                                                                                                                                                           |
  | `stop`  | The vehicle's current (when `current_status` is **STOPPED_AT**) or *next* stop.                                                                                                                                                                                                                                                                              |
  | `route` | The one route that is designated for that trip, as in GTFS `trips.txt`.  A trip might also provide service on other routes, identified by the MBTA's `multi_route_trips.txt` GTFS extension. `filter[route]` does consider the multi_route_trips GTFS extension, so it is possible to filter for one route and get a different route included in the response. |
  </details>
- `filter[id]` (query, string) — Filter by multiple IDs. Multiple IDs **MUST** be a comma-separated (U+002C COMMA, ",") list. Cannot be combined with any other filter.
- `filter[trip]` (query, string) — Filter by `/data/{index}/relationships/trip/data/id`. Multiple `/data/{index}/relationships/trip/data/id` **MUST** be a comma-separated (U+002C COMMA, ",") list. Cannot be combined with any other filter.
- `filter[label]` (query, string) — Filter by label. Multiple `label` **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[route]` (query, string) — Filter by route. If the vehicle is on a [multi-route trip](https://groups.google.com/forum/#!msg/massdotdevelopers/1egrhNjT9eA/iy6NFymcCgAJ), it will be returned for any of the routes. Multiple `route_id` **MUST** be a comma-separated (U+002C COMMA, ",") list.
- `filter[direction_id]` (query, string) — Filter by direction of travel along the route. Must be used in conjuction with `filter[route]` to apply.

  The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`.


  Only used if `filter[route]` is also present. One of: `0`, `1`.
- `filter[route_type]` (query, string) — Filter by route_type: https://gtfs.org/documentation/schedule/reference/#routestxt.

  Multiple `route_type` **MUST** be a comma-separated (U+002C COMMA, ",") list. One of: `0`, `1`, `2`, `3`, `4`.
- `filter[revenue]` (query, string) — Filter vehicles by revenue status.
  Revenue status indicates whether or not the vehicle is accepting passengers.
  When filter is not included, the default behavior is to filter by `revenue=REVENUE`.

  Multiple `revenue` types **MUST** be a comma-separated (U+002C COMMA, ",") list. One of: `NON_REVENUE`, `REVENUE`, `NON_REVENUE,REVENUE`.

### GET /vehicles/{id}



Single vehicle (bus, ferry, or train)
**Direction****World**
To figure out which way the vehicle is pointing at the location, use `/data/attributes/bearing`.  This can be the compass bearing, or the direction towards the next stop or intermediate location.
**Trip**
To get the direction around the stops in the trip use `/data/attributes/direction_id`.
**Location****World**
Use `/data/attributes/latitude` and `/data/attributes/longitude` to get the location of a vehicle.
**Trip**
Use `/data/attributes/current_stop_sequence` to get the stop number along the trip.  Useful for linear stop indicators.  Position relative to the current stop is in `/data/attributes/current_status`.
**Movement****World**
Use `/data/attributes/speed` to get the speed of the vehicle in meters per second.

Parameters:

- `id` (path, string **required**) — Unique identifier for a vehicle
- `fields[vehicle]` (string) — sparse fieldset: comma-separated attribute names
- `include` — Relationships to include. Values: `trip`, `stop`, `route`.
  <details><summary>details</summary>

  * `trip`
  * `stop`
  * `route`

  The value of the include parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. [JSONAPI "include" behavior](http://jsonapi.org/format/#fetching-includes)

  | include | Description                                                                                                                                                                                                                                                                                                                                                  |
  |---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | `trip`  | The trip which the vehicle is currently operating.                                                                                                                                                                                                                                                                                                           |
  | `stop`  | The vehicle's current (when `current_status` is **STOPPED_AT**) or *next* stop.                                                                                                                                                                                                                                                                              |
  | `route` | The one route that is designated for that trip, as in GTFS `trips.txt`.  A trip might also provide service on other routes, identified by the MBTA's `multi_route_trips.txt` GTFS extension. `filter[route]` does consider the multi_route_trips GTFS extension, so it is possible to filter for one route and get a different route included in the response. |
  </details>

## Resources

### ActivePeriod

Start and End dates for active alert

- `start` — string. Start Date. Format is ISO8601. Example: `"2017-08-14T14:54:01-04:00"`.
- `end` — string (nullable). End Date. Format is ISO8601. Example: `"2017-08-14T14:54:01-04:00"`.

### Activity

An activity affected by an alert.

| Value                | Description                                                                                                                                                                                                                                                                       |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `"BOARD"`            | Boarding a vehicle. Any passenger trip includes boarding a vehicle and exiting from a vehicle.                                                                                                                                                                                    |
| `"BRINGING_BIKE"`    | Bringing a bicycle while boarding or exiting.                                                                                                                                                                                                                                     |
| `"EXIT"`             | Exiting from a vehicle (disembarking). Any passenger trip includes boarding a vehicle and exiting a vehicle.                                                                                                                                                                      |
| `"PARK_CAR"`         | Parking a car at a garage or lot in a station.                                                                                                                                                                                                                                    |
| `"RIDE"`             | Riding through a stop without boarding or exiting.. Not every passenger trip will include this -- a passenger may board at one stop and exit at the next stop.                                                                                                                    |
| `"STORE_BIKE"`       | Storing a bicycle at a station.                                                                                                                                                                                                                                                   |
| `"USING_ESCALATOR"`  | Using an escalator while boarding or exiting (should only be used for customers who specifically want to avoid stairs.)                                                                                                                                                           |
| `"USING_WHEELCHAIR"` | Using a wheelchair while boarding or exiting. Note that this applies to something that specifically affects customers who use a wheelchair to board or exit; a delay should not include this as an affected activity unless it specifically affects customers using wheelchairs.  |

- `Activity` — string. An activity affected by an alert. | Value | Description | |----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| | `"BOARD"` | Boarding a vehicle. Any passenger trip includes boarding a vehicle and exiting from a vehicle. | | `"BRINGING_BIKE"` | Bringing a bicycle while boarding or exiting. | | `"EXIT"` | Exiting from a vehicle (disembarking). Any passenger trip includes boarding a vehicle and exiting a vehicle. | | `"PARK_CAR"` | Parking a car at a garage or lot in a station. | | `"RIDE"` | Riding through a stop without boarding or exiting.. Not every passenger trip will include this -- a passenger may board at one stop and exit at the next stop. | | `"STORE_BIKE"` | Storing a bicycle at a station. | | `"USING_ESCALATOR"` | Using an escalator while boarding or exiting (should only be used for customers who specifically want to avoid stairs.) | | `"USING_WHEELCHAIR"` | Using a wheelchair while boarding or exiting. Note that this applies to something that specifically affects customers who use a wheelchair to board or exit; a delay should not include this as an affected activity unless it specifically affects customers using wheelchairs. | Example: `"BOARD"`.

### AlertResource

An effect (enumerated in `*/attributes/effect` and human-readable in `*/attributes/service_effect`) on a provided service (facility, route, route type, stop and/or trip in `/*/attributes/informed_entity`) described by a banner (`*/attributes/banner`), short header (`*/attributes/short_header`), header `*/attributes/header`, description (`*/attributes/description`), image (`*/attributes/image`), and image alternative text (`*/attributes/image_alternative_text`) that is active for one or more periods(`*/attributes/active_period`) caused by a cause (`*/attribute/cause`) that somewhere in its lifecycle (enumerated in `*/attributes/lifecycle` and human-readable in `*/attributes/timeframe`).

See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert)
**Descriptions**
There are 7 descriptive attributes.

| JSON pointer                                | Usage                                                                           |
|---------------------------------------------|---------------------------------------------------------------------------------|
| `*/attributes/banner`       | Display as alert across application/website                                     |
| `*/attributes/short_header` | When `*/attributes/header` is too long to display               |
| `*/attributes/header`       | Used before showing and prepended to `*/attributes/description` |
| `*/attributes/description`  | Used when user asks to expand alert.                                            |
| `*/attributes/image`        | URL to descriptive image.                                                       |
| `*/attributes/image_alternative_text`  | Text that describes image linked in url                              |
**Effect**
| JSON pointer                                  |                |
|-----------------------------------------------|----------------|
| `*/attributes/effect`         | Enumerated     |
| `*/attributes/service_effect` | Human-readable |
**Timeline**
There are 3 timeline related attributes

| JSON pointer                                 | Description                                                                              |
|----------------------------------------------|------------------------------------------------------------------------------------------|
| `*/attributes/active_period` | Exact Date/Time ranges alert is active                                                   |
| `*/attributes/lifecycle`     | Enumerated, machine-readable description of `*/attributes/active_period` |
| `*/attributes/timeframe`     | Human-readable description of `*/attributes/active_period`               |
**Notifications**
There are 3 notifications related attributes

| JSON pointer                                                    | Description                                                                                           |
|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `*/attributes/closed_timestamp`                 | Time the alert was closed.                                                                            |
| `*/attributes/last_push_notification_timestamp` | Time to send a new or updated alert notification. Send an "all clear" if equal to closed_timestamp.   |
| `*/attributes/reminder_times`                   | Times to send upcoming alert reminder notifications                                                   |

Attributes:

- `url` — string (nullable). A URL for extra details, such as outline construction or maintenance plans. Example: `"http://www.mbta.com/uploadedfiles/Documents/Schedules_and_Maps/Commuter_Rail/fairmount.pdf?led=6/3/2017%201:22:09%20AM"`.
- `updated_at` — string. Date/Time alert last updated. Format is ISO8601. Example: `"2017-08-14T14:54:01-04:00"`.
- `timeframe` — string (nullable). Summarizes when an alert is in effect. Example: `"Ongoing"`.
- `short_header` — string. A shortened version of `*/attributes/header`. Example: `"All weekend Fairmount Line trains will be bused between Morton St. & Readville due to construction of Blue Hill Ave Station.\n"`.
- `severity` — integer. How severe the alert is from least (`0`) to most (`10`) severe. Example: `10`.
- `service_effect` — string. Summarizes the service and the impact to that service. Example: `"Minor Route 216 delay"`.
- `reminder_times` — array of string (nullable). Times at which a reminder notification should be sent. Example: `["2025-08-17T11:24:00-04:00", "2025-08-17T11:24:01-04:00"]`.
- `lifecycle` — string. Identifies whether alert is a new or old, in effect or upcoming. | Value | |----------------------| | `"NEW"` | | `"ONGOING"` | | `"ONGOING_UPCOMING"` | | `"UPCOMING"` | Example: `"Ongoing"`.
- `last_push_notification_timestamp` — string (nullable). The most recent time at which the alert changed significantly enough that a notification should be sent. When this matches closed_timestamp, an "All Clear" notification should be sent. Example: `"2025-08-17T11:23:00-04:00"`.
- `informed_entity` — array of object. Entities affected by this alert.
  - `trip` — string (nullable). `id` of the affected Trip. Example: `"CR-Weekday-Spring-17-517"`.
  - `stop` — string (nullable). `id` of the affected Stop. Example: `"Auburndale"`.
  - `route_type` — integer (nullable). `type` of the affected Route. | Value | Name | Example | |-------|---------------|------------| | `0` | Light Rail | Green Line | | `1` | Heavy Rail | Red Line | | `2` | Commuter Rail | | | `3` | Bus | | | `4` | Ferry | | Example: `2`.
  - `route` — string (nullable). `id` of the affected Route. Example: `"CR-Worcester"`.
  - `facility` — string (nullable). `id` of the affected Facility. Example: `"405"`.
  - `direction_id` — integer (nullable). `direction_id` of the affected Trip. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`. Example: `0`.
  - `activities` — array of string. Activities affected by this alert. If an entity is a station platform, and the alert only impacts those boarding at that platform and no one else, and the activity `"BOARD"` represents customers boarding at the informed entity, then the entity includes `activities` `["BOARD"]`. If the alert affected customers exiting at the platform too, then `activities` is `["BOARD", "EXIT"]`. It should be noted that the `activities` array includes activities that are specifically affected. Thus if there were activities `"BOARD"`, `"EXIT"`, and `"USING_WHEELCHAIR"` [to board or exit], and a station were closed, then the `activities` array would include `"BOARD"` and `"EXIT"` but it would not be necessary to include the activity `"USING_WHEELCHAIR"`. Any rider entering the station who is `"USING_WHEELCHAIR"` is also a rider who `"BOARD"`s. Using a wheelchair to board is not specifically affected. Example: `["BOARD", "EXIT"]`.
- `image_alternative_text` — string (nullable). Text describing the appearance of the linked image in the image field. Example: `"Shuttle service beginning at North Quincy and ending at Braintree"`.
- `image` — string (nullable). URL of an image to be displayed alongside alert. Example: `"http://example.com/alert_image.png"`.
- `header` — string. This plain-text string will be highlighted, for example in boldface. See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert` `header_text`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert) Example: `"Starting 6/3, all weekend Fairmount Line trains will be bused between Morton St. and Readville in both directions due to construction of the new Blue Hill Avenue Station.\n"`.
- `effect_name` — string. Name of the alert Example: `"Delay"`.
- `effect` — string. The effect of this problem on the affected entity. | Value | |-------| | `"ACCESS_ISSUE"` | | `"ADDITIONAL_SERVICE"` | | `"AMBER_ALERT"` | | `"BIKE_ISSUE"` | | `"CANCELLATION"` | | `"DELAY"` | | `"DETOUR"` | | `"DOCK_CLOSURE"` | | `"DOCK_ISSUE"` | | `"ELEVATOR_CLOSURE"` | | `"ESCALATOR_CLOSURE"` | | `"EXTRA_SERVICE"` | | `"FACILITY_ISSUE"` | | `"MODIFIED_SERVICE"` | | `"NOTICE"` | | `"NO_SERVICE"` | | `"OTHER_EFFECT"` | | `"PARKING_CLOSURE"` | | `"PARKING_ISSUE"` | | `"POLICY_CHANGE"` | | `"SCHEDULE_CHANGE"` | | `"SERVICE_CHANGE"` | | `"SHUTTLE"` | | `"SNOW_ROUTE"` | | `"STATION_CLOSURE"` | | `"STATION_ISSUE"` | | `"STOP_CLOSURE"` | | `"STOP_MOVE"` | | `"STOP_MOVED"` | | `"SUMMARY"` | | `"SUSPENSION"` | | `"TRACK_CHANGE"` | | `"UNKNOWN_EFFECT"` | See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert` `effect`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert) Values: `ACCESS_ISSUE`, `ADDITIONAL_SERVICE`, `AMBER_ALERT`, `BIKE_ISSUE`, `CANCELLATION`, `DELAY`, `DETOUR`, `DOCK_CLOSURE`, `DOCK_ISSUE`, `ELEVATOR_CLOSURE`, `ESCALATOR_CLOSURE`, `EXTRA_SERVICE`, `FACILITY_ISSUE`, `MODIFIED_SERVICE`, `NOTICE`, `NO_SERVICE`, `OTHER_EFFECT`, `PARKING_CLOSURE`, `PARKING_ISSUE`, `POLICY_CHANGE`, `SCHEDULE_CHANGE`, `SERVICE_CHANGE`, `SHUTTLE`, `SNOW_ROUTE`, `STATION_CLOSURE`, `STATION_ISSUE`, `STOP_CLOSURE`, `STOP_MOVE`, `STOP_MOVED`, `SUMMARY`, `SUSPENSION`, `TRACK_CHANGE`, `UNKNOWN_EFFECT`. Example: `"ACCESS_ISSUE"`.
- `duration_certainty` — string. | Value | |-------| | `"UNKNOWN"` | | `"KNOWN"` | | `"ESTIMATED"` | Indicates whether an alert has a KNOWN, ESTIMATED, or UNKNOWN duration. KNOWN duration_certainty alerts are expected to end at the specified end time, ESTIMATED duration_certainty alerts have an estimated end time, and UNKNOWN duration_certainty alerts do not have a known or estimated end time. Values: `UNKNOWN`, `KNOWN`, `ESTIMATED`. Example: `"UNKNOWN"`.
- `description` — string (nullable). This plain-text string will be formatted as the body of the alert (or shown on an explicit "expand" request by the user). The information in the description should add to the information of the header. See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert` `description_text`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert) Example: `"If entering the station, cross Tremont Street to the Boston Common and use Park Street Elevator 978 to the Green Line westbound platform. Red Line platform access is available via the elevator beyond the fare gates. If exiting the station, please travel down the Winter Street Concourse toward Downtown Crossing Station, exit through the fare gates, and take Downtown Crossing Elevator 892 to the street level.\n"`.
- `created_at` — string. Date/Time alert created. Format is ISO8601. Example: `"2017-08-14T14:54:01-04:00"`.
- `closed_timestamp` — string (nullable). The time at which the alert was closed. Example: `"2025-08-17T11:21:00-04:00"`.
- `cause` — string. What is causing the alert. | Value | |-------| | `"ACCIDENT"` | | `"AMTRAK_TRAIN_TRAFFIC"` | | `"COAST_GUARD_RESTRICTION"` | | `"CONSTRUCTION"` | | `"CROSSING_ISSUE"` | | `"DEMONSTRATION"` | | `"DISABLED_BUS"` | | `"DISABLED_TRAIN"` | | `"DRAWBRIDGE_BEING_RAISED"` | | `"DRAWBRIDGE_ISSUE"` | | `"ELECTRICAL_WORK"` | | `"FIRE"` | | `"FIRE_DEPARTMENT_ACTIVITY"` | | `"FLOODING"` | | `"FOG"` | | `"FREIGHT_TRAIN_INTERFERENCE"` | | `"HAZMAT_CONDITION"` | | `"HEAVY_RIDERSHIP"` | | `"HIGH_WINDS"` | | `"HOLIDAY"` | | `"ICE_IN_HARBOR"` | | `"MAINTENANCE"` | | `"MECHANICAL_ISSUE"` | | `"MECHANICAL_PROBLEM"` | | `"MEDICAL_EMERGENCY"` | | `"PARADE"` | | `"POLICE_ACTIVITY"` | | `"POWER_PROBLEM"` | | `"PRESENCE_OF_WHALES"` | | `"RAIL_DEFECT"` | | `"ROUGH_SEAS"` | | `"SEVERE_WEATHER"` | | `"SIGNAL_ISSUE"` | | `"SIGNAL_PROBLEM"` | | `"SINGLE_TRACKING"` | | `"SLIPPERY_RAIL"` | | `"SNOW"` | | `"SPECIAL_EVENT"` | | `"SPEED_RESTRICTION"` | | `"SWITCH_ISSUE"` | | `"SWITCH_PROBLEM"` | | `"TIE_REPLACEMENT"` | | `"TRACK_PROBLEM"` | | `"TRACK_WORK"` | | `"TRAFFIC"` | | `"TRAIN_TRAFFIC"` | | `"UNKNOWN_CAUSE"` | | `"UNRULY_PASSENGER"` | | `"UTILITY_WORK"` | | `"VESSEL_SUBSTITUTION"` | | `"VESSEL_TRAFFIC"` | | `"WEATHER"` | See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert` `Cause`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-cause) Values: `ACCIDENT`, `AMTRAK_TRAIN_TRAFFIC`, `COAST_GUARD_RESTRICTION`, `CONSTRUCTION`, `CROSSING_ISSUE`, `DEMONSTRATION`, `DISABLED_BUS`, `DISABLED_TRAIN`, `DRAWBRIDGE_BEING_RAISED`, `DRAWBRIDGE_ISSUE`, `ELECTRICAL_WORK`, `FIRE`, `FIRE_DEPARTMENT_ACTIVITY`, `FLOODING`, `FOG`, `FREIGHT_TRAIN_INTERFERENCE`, `HAZMAT_CONDITION`, `HEAVY_RIDERSHIP`, `HIGH_WINDS`, `HOLIDAY`, `ICE_IN_HARBOR`, `MAINTENANCE`, `MECHANICAL_ISSUE`, `MECHANICAL_PROBLEM`, `MEDICAL_EMERGENCY`, `PARADE`, `POLICE_ACTIVITY`, `POWER_PROBLEM`, `PRESENCE_OF_WHALES`, `RAIL_DEFECT`, `ROUGH_SEAS`, `SEVERE_WEATHER`, `SIGNAL_ISSUE`, `SIGNAL_PROBLEM`, `SINGLE_TRACKING`, `SLIPPERY_RAIL`, `SNOW`, `SPECIAL_EVENT`, `SPEED_RESTRICTION`, `SWITCH_ISSUE`, `SWITCH_PROBLEM`, `TIE_REPLACEMENT`, `TRACK_PROBLEM`, `TRACK_WORK`, `TRAFFIC`, `TRAIN_TRAFFIC`, `UNKNOWN_CAUSE`, `UNRULY_PASSENGER`, `UTILITY_WORK`, `VESSEL_SUBSTITUTION`, `VESSEL_TRAFFIC`, `WEATHER`. Example: `"ACCIDENT"`.
- `banner` — string (nullable). Set if alert is meant to be displayed prominently, such as the top of every page. Example: `"All service suspended due to severe weather"`.
- `active_period` — array of object. Date/Time ranges when alert is active. See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert` `active_period`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-alert).
  - `start` — string. Start Date. Format is ISO8601. Example: `"2017-08-14T14:54:01-04:00"`.
  - `end` — string (nullable). End Date. Format is ISO8601. Example: `"2017-08-14T14:54:01-04:00"`.

Relationships: `facility`

### FacilityProperty

Name/value pair for additional facility information

- `value` — ['string', 'integer']. The value of the property Example: `"197 Ivory St, Braintree, MA 02184"`.
- `name` — string. The name of the property Example: `"address"`.

### FacilityResource

Amenities at a station stop (`*/relationships/stop`) such as elevators, escalators, parking lots, and bike storage.

An [MBTA extension](https://groups.google.com/forum/#!topic/gtfs-changes/EzC5m9k45pA).  This spec is not yet finalized.
**Accessibility**
Riders with limited mobility can search any facility, either `ELEVATOR` or `ESCALATOR`, while riders that need wheelchair access can search for `ELEVATOR` only.

The lack of an `ELEVATOR` MAY NOT make a stop wheelchair inaccessible.  Riders should check `/stops/{id}` `/data/attributes/wheelchair_boarding` is `1` to guarantee a path is available from the station entrance to the stop or `0` if it MAY be accessible.  Completely avoid `2` as that is guaranteed to be INACCESSIBLE.

Attributes:

- `type` — string. The type of the facility. Values: `BIKE_STORAGE`, `BRIDGE_PLATE`, `ELECTRIC_CAR_CHARGERS`, `ELEVATED_SUBPLATFORM`, `ELEVATOR`, `ESCALATOR`, `FARE_MEDIA_ASSISTANCE_FACILITY`, `FARE_MEDIA_ASSISTANT`, `FARE_VENDING_MACHINE`, `FARE_VENDING_RETAILER`, `FULLY_ELEVATED_PLATFORM`, `OTHER`, `PARKING_AREA`, `PICK_DROP`, `PORTABLE_BOARDING_LIFT`, `RAMP`, `TAXI_STAND`, `TICKET_WINDOW`. Example: `"ELEVATOR"`.
- `short_name` — string. Short name of the facility Example: `"Ashmont platform to lobby"`.
- `properties` — array of object. A list of name/value pairs that apply to the facility. See [MBTA's facility documentation](https://www.mbta.com/developers/gtfs/f#facilities_properties_definitions) for more information on the possible names and values.
  - `value` — ['string', 'integer']. The value of the property Example: `"197 Ivory St, Braintree, MA 02184"`.
  - `name` — string. The name of the property Example: `"address"`.
- `longitude` — number (nullable). Longitude of the facility. Degrees East, in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS.C2.A084) coordinate system. See [GTFS `facilities.txt` `facility_lon`] Example: `42.316115`.
- `long_name` — string. Name of the facility Example: `"SHAWMUT - Ashmont Bound Platform to Lobby"`.
- `latitude` — number (nullable). Latitude of the facility. Degrees North, in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS.C2.A084) coordinate system. See [GTFS `facilities.txt` `facility_lat`] Example: `-71.194994`.

Relationships: `stop`

### InformedEntity

An entity affected by an alert. At least one of the fields other than `activities` will be non-null. The affected entity is the intersection of these fields, not the union: if `stop` and `route` both have values, the alert does not affect the entire route.

See [GTFS Realtime `FeedMessage` `FeedEntity` `Alert` `EntitySelector`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-entityselector).

* `activities` - The activities affected.
* `direction_id` - The direction of the affected `trip`. See     [GTFS `trips.txt` `direction_id`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt).
* `facility` - The facility affected.
* `route` - The route affected. See     [GTFS `routes.txt` `route_id`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt)
* `route_type` - The type of route affected. If present alone, indicates the entire mode of transit is affected. See     [GTFS `routes.txt` `route_type`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt)
* `stop` - The stop affected. See     [GTFS `stops.txt` `stop_id`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt)
* `trip` - The trip affected. See     [GTFS `trips.txt` `trip_id`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt)

- `trip` — string (nullable). `id` of the affected Trip. Example: `"CR-Weekday-Spring-17-517"`.
- `stop` — string (nullable). `id` of the affected Stop. Example: `"Auburndale"`.
- `route_type` — integer (nullable). `type` of the affected Route. | Value | Name | Example | |-------|---------------|------------| | `0` | Light Rail | Green Line | | `1` | Heavy Rail | Red Line | | `2` | Commuter Rail | | | `3` | Bus | | | `4` | Ferry | | Example: `2`.
- `route` — string (nullable). `id` of the affected Route. Example: `"CR-Worcester"`.
- `facility` — string (nullable). `id` of the affected Facility. Example: `"405"`.
- `direction_id` — integer (nullable). `direction_id` of the affected Trip. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`. Example: `0`.
- `activities` — array of string. Activities affected by this alert. If an entity is a station platform, and the alert only impacts those boarding at that platform and no one else, and the activity `"BOARD"` represents customers boarding at the informed entity, then the entity includes `activities` `["BOARD"]`. If the alert affected customers exiting at the platform too, then `activities` is `["BOARD", "EXIT"]`. It should be noted that the `activities` array includes activities that are specifically affected. Thus if there were activities `"BOARD"`, `"EXIT"`, and `"USING_WHEELCHAIR"` [to board or exit], and a station were closed, then the `activities` array would include `"BOARD"` and `"EXIT"` but it would not be necessary to include the activity `"USING_WHEELCHAIR"`. Any rider entering the station who is `"USING_WHEELCHAIR"` is also a rider who `"BOARD"`s. Using a wheelchair to board is not specifically affected. Example: `["BOARD", "EXIT"]`.

### LineResource

Line represents a combination of routes

Attributes:

- `text_color` — string. This field can be used to specify a legible color to use for text drawn against a background of line_color. The color must be provided as a six-character hexadecimal number, for example, `FFD700`. Example: `"000000"`.
- `sort_order` — integer. Lines sort in ascending order
- `short_name` — string. Short, public-facing name for the group of routes represented in this line Example: `"CT2"`.
- `long_name` — string. Lengthier, public-facing name for the group of routes represented in this line Example: `"Sullivan - Ruggles"`.
- `color` — string. In systems that have colors assigned to lines, the route_color field defines a color that corresponds to a line. The color must be provided as a six-character hexadecimal number, for example, `00FFFF`. Example: `"FFFFFF"`.

### LiveFacilityResource

Live data about a given facility.

Attributes:

- `updated_at` — string. Time of last update Example: `"2017-08-14T15:38:58-04:00"`.
- `properties` — array of object. A list of name/value pairs that apply to the facility. See [MBTA's facility documentation](https://www.mbta.com/developers/gtfs/f#facilities_properties_definitions) for more information on the possible names and values.
  - `value` — ['string', 'integer']. The value of the property Example: `"197 Ivory St, Braintree, MA 02184"`.
  - `name` — string. The name of the property Example: `"address"`.

### OccupancyResource

An expected or predicted level of occupancy for a given trip.

Attributes:

- `status` — string. The degree of passenger occupancy for the vehicle. See [GTFS-realtime OccupancyStatus](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-vehiclestopstatus). | _**Value**_ | _**Description**_ | |--------------------------------|-----------------------------------------------------------------------------------------------------| | **MANY_SEATS_AVAILABLE** | Not crowded: the vehicle has a large percentage of seats available. | | **FEW_SEATS_AVAILABLE** | Some crowding: the vehicle has a small percentage of seats available. | | **STANDING_ROOM_ONLY** | Standing room only: the vehicle can currently accommodate only standing passengers. | | **CRUSHED_STANDING_ROOM_ONLY** | Crushed standing room: the vehicle can currently accommodate only standing passengers and has limited space for them. | | **FULL** | Crowded: the vehicle is considered full by most measures, but may still be allowing passengers to board. | | **NOT_ACCEPTING_PASSENGERS** | Not accepting passengers: the vehicle is not accepting passengers, the vehicle or carriage usually accepts passengers for boarding. | | **NO_DATA_AVAILABLE** | No data available: the vehicle doesn't have any occupancy data available at that time. | Example: `"SOME_CROWDING"`.
- `percentage` — integer (nullable). Percentage of seats occupied. Example: `55`.

### PredictionResource

The predicted arrival time (`*/attributes/arrival_time`) and departure time (`*/attributes/departure_time`) to/from a stop (`*/relationships/stop/data/id`) at a given sequence (`*/attriutes/stop_sequence`) along a trip (`*/relationships/trip/data/id`) going a direction (`*/attributes/direction_id`) along a route (`*/relationships/route/data/id`).

See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-tripdescriptor)
See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `StopTimeUpdate`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate)

Attributes:

- `update_type` — string. | Value | Description | |------------------|-------------| | `"MID_TRIP"` | Prediction is for the trip the vehicle is currently on. | | `"AT_TERMINAL"` | Prediction is for a terminal trip that hasn't started yet. | | `"REVERSE_TRIP"` | Prediction is for a trip that hasn't started and the train that will be servicing this trip is currently in the middle of a previous trip. |
- `trip_headsign` — string (nullable). Specifies the headsign for this trip when it differs from the original. Example: `"Park Street"`.
- `stop_sequence` — integer (nullable). The sequence the stop (`*/relationships/stop/data/id`) is arrived at during the trip (`*/relationships/trip/data/id`). The stop sequence is monotonically increasing along the trip, but the `stop_sequence` along the trip are not necessarily consecutive. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `stop_sequence`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate). Example: `19`.
- `status` — string. Status of the schedule Example: `"Approaching"`.
- `schedule_relationship` — string (nullable). How the predicted stop relates to the `Model.Schedule.t` stops. | Value | Description | |-----------------|-------------| | `"ADDED"` | An extra trip that was added in addition to a running schedule, for example, to replace a broken vehicle or to respond to sudden passenger load. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor` `ScheduleRelationship` `ADDED`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship-1) | | `"CANCELLED"` | A trip that existed in the schedule but was removed. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor` `ScheduleRelationship` `CANCELED`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship-1) | | `"NO_DATA"` | No data is given for this stop. It indicates that there is no realtime information available. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `ScheduleRelationship` `NO_DATA`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship) | | `"SKIPPED"` | The stop was originally scheduled, but was skipped. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `ScheduleRelationship`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship) | | `"UNSCHEDULED"` | A trip that is running with no schedule associated to it. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor` `ScheduleRelationship` `UNSCHEDULED`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship-1) | | `null` | Stop was scheduled. See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor` `ScheduleRelationship` `SCHEDULED`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship-1) | See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `TripDescriptor` `ScheduleRelationship`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship-1) See [GTFS Realtime `FeedMesage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `ScheduleRelationship`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-schedulerelationship) Example: `"UNSCHEDULED"`.
- `revenue_status` — string. | Value | Description | |-----------------|-------------| | `"REVENUE"` | Indicates that the associated trip is accepting passengers. | | `"NON_REVENUE"` | Indicates that the associated trip is not accepting passengers. | Example: `"REVENUE"`.
- `last_trip` — boolean. Indicates whether this is a prediction for the last trip before the end of service. Example: `true`.
- `direction_id` — integer. Direction in which trip is traveling: `0` or `1`. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`.
- `departure_uncertainty` — ['integer', 'null']. Uncertainty value for the departure time prediction. Bus and Commuter Rail See [entities tripUpdate stop_time_updates departure uncertainty](https://swiftly-inc.stoplight.io/docs/realtime-standalone/613d1d7f1eae3-gtfs-rt-trip-updates) | Value | Description | |------------------|-------------| | < 300 or omitted | Valid real-time prediction | | 300 | Real-time prediction not available. This code is primarily used when a vehicle has not yet been assigned to the trip, (i.e. because the block has not started yet). It is a schedule-based prediction, but Swiftly adjusts the schedule-based prediction time using observed historical travel times to make predictions more accurate than the schedule | | 301 | Valid real-time prediction, though the bus appears to be stalled or significantly delayed and predictions are not as accurate | | > 301 | Likely invalid prediction, recommend not showing anything (and not showing scheduled time), very rare situation | Subway/Light Rail See [GTFS `Realtime` `FeedMessage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `departure`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate). | Value | Description | |-------|-------------| | 60 | A trip that has already started | | 120 | A terminal/reverse trip departure for a trip that has NOT started and a train is awaiting departure at the origin | | 360 | A terminal/reverse trip for a trip that has NOT started and a train is completing a previous trip | Example: `60`.
- `departure_time` — string (nullable). When the vehicle is now predicted to depart. `null` if the last stop (`*/relationships/stop/data/id`) on the trip (`*/relationships/trip/data/id`). See [GTFS `Realtime` `FeedMessage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `departure`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate). Format is ISO8601. Example: `"2017-08-14T15:38:58-04:00"`.
- `arrival_uncertainty` — ['integer', 'null']. Uncertainty value for the arrival time prediction. Bus and Commuter Rail See [entities tripUpdate stop_time_updates arrival uncertainty](https://swiftly-inc.stoplight.io/docs/realtime-standalone/613d1d7f1eae3-gtfs-rt-trip-updates) | Value | Description | |------------------|-------------| | < 300 or omitted | Valid real-time prediction | | 300 | Real-time prediction not available. This code is primarily used when a vehicle has not yet been assigned to the trip, (i.e. because the block has not started yet). It is a schedule-based prediction, but Swiftly adjusts the schedule-based prediction time using observed historical travel times to make predictions more accurate than the schedule | | 301 | Valid real-time prediction, though the bus appears to be stalled or significantly delayed and predictions are not as accurate | | > 301 | Likely invalid prediction, recommend not showing anything (and not showing scheduled time), very rare situation | Subway/Light Rail See [GTFS `Realtime` `FeedMessage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `arrival`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate). | Value | Description | |--------|-------------| | 60 | A trip that has already started | | 120 | A terminal/reverse trip departure for a trip that has NOT started and a train is awaiting departure at the origin | | 360 | A terminal/reverse trip for a trip that has NOT started and a train is completing a previous trip | Example: `60`.
- `arrival_time` — string (nullable). When the vehicle is now predicted to arrive. `null` if the first stop (`*/relationships/stop/data/id`) on the trip (`*/relationships/trip/data/id`). See [GTFS `Realtime` `FeedMessage` `FeedEntity` `TripUpdate` `StopTimeUpdate` `arrival`](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-stoptimeupdate). Format is ISO8601. Example: `"2017-08-14T15:38:58-04:00"`.

Relationships: `vehicle`, `trip`, `stop`, `schedule`, `route`, `alerts`

### RoutePatternResource

Information about the different variations of service that may be run within a single route_id, including when and how often they are operated.
See [GTFS `route_patterns.txt](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#route_patternstxt) for the base specification.

Attributes:

- `typicality` — integer. Explains how common the route pattern is. For the MBTA, this is within the context of the entire route. Current valid values are: | Value | Description | |-|-| | `0` | Not defined | | `1` | Typical. Pattern is common for the route. Most routes will have only one such pattern per direction. A few routes may have more than 1, such as the Red Line (with one branch to Ashmont and another to Braintree); routes with more than 2 are rare. | | `2` | Pattern is a deviation from the regular route. | | `3` | Pattern represents a highly atypical pattern for the route, such as a special routing which only runs a handful of times per day. | | `4` | Diversions from normal service, such as planned detours, bus shuttles, or snow routes. | | `5` | Canonical trip patterns. | Values: `0`, `1`, `2`, `3`, `4`, `5`.
- `time_desc` — string (nullable). User-facing description of when the route pattern operate. Not all route patterns will include a time description Example: `"Early mornings only"`.
- `sort_order` — integer. Can be used to order the route patterns in a way which is ideal for presentation to customers. Route patterns with smaller sort_order values should be displayed before those with larger values.
- `name` — string. User-facing description of where trips on the route pattern serve. These names are published in the form Destination, Destination via Street or Landmark, Origin - Destination, or Origin - Destination via Street or Landmark. Note that names for bus and subway route patterns currently do not include the origin location, but will in the future. Example: `"Forge Park/495 - South Station via Fairmount"`.
- `direction_id` — integer. Direction in which trip is traveling: `0` or `1`. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`.
- `canonical` — boolean. Indicates whether or not the route pattern can be considered canonical and the default set of stops for the given route and direction. | Value | Description | |-|-| | `true` | Route pattern should be considered canonical for this route in this direction. If branching regularly occurs, this route-direction may have more than one canonical pattern. | | `false` | Route pattern should be not considered canonical for this route in this direction. |

Relationships: `route`, `representative_trip`

### RouteResource

Path a vehicle travels during service. See [GTFS `routes.txt](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt) for the base specification.

Attributes:

- `type` — integer. | Value | Name | Example | |-------|---------------|------------| | `0` | Light Rail | Green Line | | `1` | Heavy Rail | Red Line | | `2` | Commuter Rail | | | `3` | Bus | | | `4` | Ferry | | Example: `1`.
- `text_color` — string. A legible color to use for text drawn against a background of the route's `color` attribute. See [GTFS `routes.txt` `route_text_color`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt). Example: `"000000"`.
- `sort_order` — integer. Routes sort in ascending order
- `short_name` — string. This will often be a short, abstract identifier like "32", "100X", or "Green" that riders use to identify a route, but which doesn't give any indication of what places the route serves. See [GTFS `routes.txt` `route_short_name`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt). Example: `"Red"`.
- `long_name` — string. The full name of a route. This name is generally more descriptive than the `short_name` and will often include the route's destination or stop. See [GTFS `routes.txt` `route_long_name`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt). Example: `"Red Line"`.
- `listed_route` — boolean. Indicates whether the route should be publicly listed. Example: `true`.
- `fare_class` — string. Specifies the fare type of the route, which can differ from the service category. Example: `"Free"`.
- `direction_names` — array of string.
- `direction_destinations` — array of string.
- `description` — string. Details about stops, schedule, and/or service. See [GTFS `routes.txt` `route_desc`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt). Example: `"Rapid Transit"`.
- `color` — string. A color that corresponds to the route, such as the line color on a map." See [GTFS `routes.txt` `route_color`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt). Example: `"FFFFFF"`.

Relationships: `route_patterns`, `line`, `agency`

### ScheduleResource

A schedule is the arrival drop off (`*/attributes/drop_off_type`) time (`*/attributes/arrival_time`) and departure pick up (`*/attributes/pickup_type`) time (`*/attributes/departure_time`) to/from a stop (`*/relationships/stop/data/id`) at a given sequence (`*/attributes/stop_sequence`) along a trip (`*/relationships/trip/data/id`) going in a direction (`*/attributes/direction_id`) on a route (`*/relationships/route/data/id`) when the trip is following a service (`*/relationships/service/data/id`) to determine when it is active.

See [GTFS `stop_times.txt`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) for base specification.

Attributes:

- `timepoint` — boolean. | Value | `*/attributes/arrival_time` and `*/attributes/departure_time` | |---------|---------------------------------------------------------------| | `true` | Exact | | `false` | Estimates | See [GTFS `stop_times.txt` `timepoint`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Example: `false`.
- `stop_sequence` — integer. The sequence the `stop_id` is arrived at during the `trip_id`. The stop sequence is monotonically increasing along the trip, but the `stop_sequence` along the `trip_id` are not necessarily consecutive. See [GTFS `stop_times.txt` `stop_sequence`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Example: `1`.
- `stop_headsign` — string (nullable). Text identifying destination of the trip, overriding trip-level headsign if present.See [GTFS `stop_times.txt` `stop_headsign`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Example: `"Foxboro via Back Bay"`.
- `pickup_type` — integer. How the vehicle departs from `stop_id`. | Value | Description | |-------|-----------------------------------------------| | `0` | Regularly scheduled pickup | | `1` | No pickup available | | `2` | Must phone agency to arrange pickup | | `3` | Must coordinate with driver to arrange pickup | See [GTFS `stop_times.txt` `pickup_type`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Values: `0`, `1`, `2`, `3`. Example: `0`.
- `drop_off_type` — integer. How the vehicle arrives at `stop_id`. | Value | Description | |-------|-----------------------------------------------| | `0` | Regularly scheduled drop off | | `1` | No drop off available | | `2` | Must phone agency to arrange pickup | | `3` | Must coordinate with driver to arrange pickup | See [GTFS `stop_times.txt` `drop_off_type`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Values: `0`, `1`, `2`, `3`. Example: `1`.
- `direction_id` — integer. Direction in which trip is traveling: `0` or `1`. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`.
- `departure_time` — string. Time when the trip departs the given stop. See [GTFS `stop_times.txt` `departure_time`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Format is ISO8601. Example: `"2017-08-14T15:04:00-04:00"`.
- `arrival_time` — string. Time when the trip arrives at the given stop. See [GTFS `stop_times.txt` `arrival_time`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stop_timestxt) Format is ISO8601. Example: `"2017-08-14T15:04:00-04:00"`.

Relationships: `trip`, `stop`, `route`, `prediction`, `added_routes`

### ServiceResource

Service represents a set of dates on which trips run.

Attributes:

- `valid_days` — array of number.
- `start_date` — string. Earliest date which is valid for this service. Format is ISO8601. Example: `"2018-11-19"`.
- `schedule_typicality` — integer. Describes how well this schedule represents typical service for the listed `schedule_type` | Value | Description | |-------|-----------------------------------------------------------------------------| | `0` | Not defined. | | `1` | Typical service with perhaps minor modifications | | `2` | Extra service supplements typical schedules | | `3` | Reduced holiday service is provided by typical Saturday or Sunday schedule | | `4` | Major changes in service due to a planned disruption, such as construction | | `5` | Major reductions in service for weather events or other atypical situations | | `6` | Canonical service contains default stopping patterns for selected routes, including temporarily closed stops; not active on any dates | Values: `0`, `1`, `2`, `3`, `4`, `5`, `6`. Example: `1`.
- `schedule_type` — string (nullable). Description of the schedule type the service_id can be applied. For example, on a holiday, the schedule_type value may be "Saturday" or "Sunday". Current valid values are "Weekday", "Saturday", "Sunday", or "Other" Example: `"Sunday"`.
- `schedule_name` — string (nullable). Description of when the `service_id` is in effect. Example: `"Weekday (no school)"`.
- `removed_dates_notes` — array of string.
- `removed_dates` — array of string.
- `rating_start_date` — string (nullable). Earliest date which is a part of the rating (season) which contains this service. Format is ISO8601. Example: `"2018-12-22"`.
- `rating_end_date` — string (nullable). Latest date which is a part of the rating (season) which contains this service. Format is ISO8601. Example: `"2019-03-14"`.
- `rating_description` — string (nullable). Human-readable description of the rating (season), as it should appear on public-facing websites and applications. Example: `"Winter"`.
- `end_date` — string. Latest date which is valid for this service. Format is ISO8601. Example: `"2018-12-24"`.
- `description` — string (nullable). Human-readable description of the service, as it should appear on public-facing websites and applications. Example: `"Weekday schedule (no school)"`.
- `added_dates_notes` — array of string.
- `added_dates` — array of string.

### ShapeResource

Sequence of geographic points representing a path vehicles will travel on a trip. See [GTFS `shapes.txt`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#shapestxt).

Attributes:

- `polyline` — string. The sequence of points in [Encoded Polyline Algorithm Format](https://developers.google.com/maps/documentation/utilities/polylinealgorithm). Libraries for decoding polylines are available in many languages, for example: * [Elixir](https://hex.pm/packages/polyline) * [JavaScript](https://www.npmjs.com/package/polyline) * [Python](https://pypi.org/project/polyline/)

### StopEventResource

Actual arrival and departure times of vehicles at stops.

Attributes:

- `vehicle_id` — string. The vehicle ID that served this trip. Example: `"y2071"`.
- `trip_id` — string. The trip ID associated with this stop event. Example: `"73885810"`.
- `stop_sequence` — integer. The stop sequence number along the trip. Increases monotonically but values need not be consecutive. Example: `1`.
- `stop_id` — string. The stop ID where the event occurred. Example: `"2231"`.
- `start_date` — string. The service date of the trip in YYYY-MM-DD format. Example: `"2026-02-24"`.
- `route_id` — string. The route ID associated with this stop event. Example: `"64"`.
- `revenue` — string. Whether this stop event is for a revenue trip: - `REVENUE` - A revenue trip - `NON_REVENUE` - A non-revenue trip Values: `REVENUE`, `NON_REVENUE`. Example: `"REVENUE"`.
- `direction_id` — integer. Direction in which the trip is traveling: - `0` - Travel in one direction (e.g. outbound travel) - `1` - Travel in the opposite direction (e.g. inbound travel) Values: `0`, `1`. Example: `0`.
- `departed` — string (nullable). When the vehicle departed from the stop. Format is ISO8601/RFC 3339. `null` if the last stop on the trip or if the vehicle has not yet departed. Example: `"2026-03-13T10:43:00-04:00"`.
- `arrived` — string (nullable). When the vehicle arrived at the stop. Format is ISO8601/RFC 3339. `null` if the first stop on the trip. Example: `"2026-03-13T10:30:00-04:00"`.

Relationships: `vehicle`, `trip`, `stop`, `route`

### StopResource

Physical location where transit can pick-up or drop-off passengers. See https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt for more details and https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs.md#stopstxt for specific extensions.

Attributes:

- `wheelchair_boarding` — integer. Whether there are any vehicles with wheelchair boarding or paths to stops that are wheelchair acessible: 0, 1, 2. Wheelchair boarding (`*/attributes/wheelchair_boarding`) corresponds to [GTFS wheelchair_boarding](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). The MBTA handles parent station inheritance itself, so value can be treated simply: | Value | Meaning | |-------|-----------------------------------------------| | `0` | No Information | | `1` | Accessible (if trip is wheelchair accessible) | | `2` | Inaccessible | Values: `0`, `1`, `2`. Example: `0`.
- `vehicle_type` — integer (nullable). The type of transportation used at the stop. `vehicle_type` will be a valid routes.txt `route_type` value: | Value | Name | Example | |-------|---------------|------------| | `0` | Light Rail | Green Line | | `1` | Heavy Rail | Red Line | | `2` | Commuter Rail | | | `3` | Bus | | | `4` | Ferry | | Example: `3`.
- `platform_name` — string (nullable). A textual description of the platform or track. See [MBTA extensions to GTFS](https://docs.google.com/document/d/1RoQQj3_-7FkUlzFP4RcK1GzqyHp4An2lTFtcmW0wrqw/view). Example: `"Red Line"`.
- `platform_code` — string (nullable). A short code representing the platform/track (like a number or letter). See [GTFS `stops.txt` `platform_code`](https://developers.google.com/transit/gtfs/reference/gtfs-extensions#stopstxt_1). Example: `"5"`.
- `on_street` — string (nullable). The street on which the stop is located. Example: `"Massachusetts Avenue"`.
- `name` — string. Name of a stop or station in the local and tourist vernacular. See [GTFS `stops.txt` `stop_name](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt) Example: `"Parker St @ Hagen Rd"`.
- `municipality` — string (nullable). The municipality in which the stop is located. Example: `"Cambridge"`.
- `longitude` — number. Longitude of the stop or station. Degrees East, in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS.C2.A084) coordinate system. See [GTFS `stops.txt` `stop_lon`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). Example: `42.316115`.
- `location_type` — integer. The type of the stop. | Value | Type | Description | | - | - | - | | `0` | Stop | A location where passengers board or disembark from a transit vehicle. | | `1` | Station | A physical structure or area that contains one or more stops. | | `2` | Station Entrance/Exit | A location where passengers can enter or exit a station from the street. The stop entry must also specify a parent_station value referencing the stop ID of the parent station for the entrance. | | `3` | Generic Node | A location within a station, not matching any other location_type, which can be used to link together pathways defined in pathways.txt. | See also [GTFS `stops.txt` `location_type`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). Values: `0`, `1`, `2`, `3`.
- `latitude` — number. Latitude of the stop or station. Degrees North, in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS.C2.A084) coordinate system. See [GTFS `stops.txt` `stop_lat`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). Example: `-71.194994`.
- `description` — string (nullable). Description of the stop. See [GTFS `stops.txt` `stop_desc`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#stopstxt). Example: `"Alewife - Red Line"`.
- `at_street` — string (nullable). The cross street at which the stop is located. Example: `"Essex Street"`.
- `address` — string (nullable). A street address for the station. See [MBTA extensions to GTFS](https://docs.google.com/document/d/1RoQQj3_-7FkUlzFP4RcK1GzqyHp4An2lTFtcmW0wrqw/view). Example: `"Alewife Brook Parkway and Cambridge Park Drive, Cambridge, MA 02140"`.

Relationships: `parent_station`

### TransferResource

Transfer specifies additional rules and overrides for a transfer.

Attributes:

- `wheelchair_transfer` — integer. Experimental. Identifies whether a transfer is accessible to customers using a wheelchair. | Value | Description | |-------|-------------| | `0` | No accessibility information for the transfer | | `1` | Transfer is wheelchair accessible | | `2` | Not accessible to persons in wheelchairs | Values: `0`, `1`, `2`. Example: `0`.
- `transfer_type` — integer. Indicates the type of connection for the specified (`from_stop_id`, `to_stop_id`) pair. | Value | Description | |-------|-------------| | `0` | Recommended transfer point between route | | `1` | Timed transfer point between two routes. The departing vehicle is expected to wait for the arriving one and leave sufficient time for a rider to transfer between routes. | | `2` | Transfer requires a minimum amount of time between arrival and departure to ensure a connection. The time required to transfer is specified by `min_transfer_time`. | | `3` | Transfers are not possible between routes at the location. | | `4` | Passengers can transfer from one trip to another by staying onboard the same vehicle (an "in-seat transfer"). | | `5` | In-seat transfers are not allowed between sequential trips. The passenger must alight from the vehicle and re-board. | Values: `0`, `1`, `2`, `3`, `4`, `5`. Example: `1`.
- `suggested_buffer_time` — integer (nullable). Experimental. Recommended buffer time to allow to make a successful transfer between two services, in seconds. This is also partly based on the significance of missing the transfer (due to service frequency). Example: `5`.
- `min_wheelchair_time` — integer (nullable). Experimental. Minimum time required to travel by wheelchair `from_stop_id` to `to_stop_id`, in seconds. If the transfer is not wheelchair accessible, this field will be blank. Example: `7`.
- `min_walk_time` — integer (nullable). Experimental. Minimum time required to travel by foot from `from_stop_id` to `to_stop_id`, in seconds. Example: `4`.
- `min_transfer_time` — integer (nullable). Sum of `min_walk_time` and `suggested_buffer_time`, in seconds. Example: `9`.

Relationships: `to_trip`, `to_stop`, `from_trip`, `from_stop`

### TripResource

Representation of the journey of a particular vehicle through a given set of stops. See [GTFS `trips.txt`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt)

Attributes:

- `wheelchair_accessible` — integer. Indicator of wheelchair accessibility: `0`, `1`, `2` Wheelchair accessibility (`*/attributes/wheelchair_accessible`) [as defined in GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt): | Value | Meaning | |-------|----------------------------------------------------| | `0` | No information | | `1` | Accessible (at stops allowing wheelchair_boarding) | | `2` | Inaccessible | Values: `0`, `1`, `2`. Example: `1`.
- `revenue_status` — string. | Value | Description | |-----------------|-------------| | `"REVENUE"` | Indicates that the associated trip is accepting passengers. | | `"NON_REVENUE"` | Indicates that the associated trip is not accepting passengers. | Example: `"REVENUE"`.
- `name` — string. The text that appears in schedules and sign boards to identify the trip to passengers, for example, to identify train numbers for commuter rail trips. See [GTFS `trips.txt` `trip_short_name`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt) Example: `"596"`.
- `headsign` — string. The text that appears on a sign that identifies the trip's destination to passengers. See [GTFS `trips.txt` `trip_headsign`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt). Example: `"Harvard"`.
- `direction_id` — integer. Direction in which trip is traveling: `0` or `1`. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`.
- `block_id` — string. ID used to group sequential trips with the same vehicle for a given service_id. See [GTFS `trips.txt` `block_id`](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt) Example: `"1070"`.
- `bikes_allowed` — integer. Indicator of whether or not bikes are allowed on this trip: `0`, `1`, `2` Bikes allowed (`*/attributes/bikes_allowed`) [as defined in GTFS](https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#tripstxt): | Value | Meaning | |-------|---------------------------------------------------------------------------------| | `0` | No information | | `1` | Vehicle being used on this particular trip can accommodate at least one bicycle | | `2` | No bicycles are allowed on this trip | Values: `0`, `1`, `2`. Example: `1`.

Relationships: `shape`, `service`, `route_pattern`, `route`, `occupancy`, `from_trip_transfers`

### VehicleResource

Current state of a vehicle on a trip.

Attributes:

- `updated_at` — string. Time at which vehicle information was last updated. Format is ISO8601. Example: `"2017-08-14T16:04:44-04:00"`.
- `speed` — number. Speed that the vehicle is traveling in meters per second. See [GTFS-realtime Position speed](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-position). Example: `16`.
- `revenue_status` — string. | Value | Description | |-----------------|-------------| | `"REVENUE"` | Indicates that the associated trip is accepting passengers. | | `"NON_REVENUE"` | Indicates that the associated trip is not accepting passengers. | Example: `"REVENUE"`.
- `occupancy_status` — string (nullable). The degree of passenger occupancy for the vehicle. See [GTFS-realtime OccupancyStatus](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-vehiclestopstatus). Only the following values are used for vehicle-level occupancy status: | _**Value**_ | _**Description**_ | |--------------------------------|-----------------------------------------------------------------------------------------------------| | **MANY_SEATS_AVAILABLE** | Not crowded: the vehicle has a large percentage of seats available. | | **FEW_SEATS_AVAILABLE** | Some crowding: the vehicle has a small percentage of seats available. | | **FULL** | Crowded: the vehicle is considered full by most measures, but may still be allowing passengers to board. | | **NO_DATA_AVAILABLE** | No data available: the vehicle doesn't have any occupancy data available at that time. | Values: `MANY_SEATS_AVAILABLE`, `FEW_SEATS_AVAILABLE`, `FULL`, `NO_DATA_AVAILABLE`. Example: `"FEW_SEATS_AVAILABLE"`.
- `longitude` — number. Longitude of the vehicle's current position. Degrees East, in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#Longitudes_on_WGS.C2.A084) coordinate system. See [GTFS-realtime Position longitude](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-position). Example: `42.32941818237305`.
- `latitude` — number. Latitude of the vehicle's current position. Degrees North, in the [WGS-84](https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS.C2.A084) coordinate system. See [GTFS-realtime Position latitude](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-position). Example: `-71.27239990234375`.
- `label` — string. User visible label, such as the one of on the signage on the vehicle. See [GTFS-realtime VehicleDescriptor label](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-vehicledescriptor). Example: `"1817"`.
- `direction_id` — integer. Direction in which trip is traveling: `0` or `1`. The meaning of `direction_id` varies based on the route. You can programmatically get the direction names from `/routes` `/data/{index}/attributes/direction_names` or `/routes/{id}` `/data/attributes/direction_names`. Values: `0`, `1`.
- `current_stop_sequence` — integer. Index of current stop along trip. See [GTFS-realtime VehiclePosition current_stop_sequence](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-vehicleposition) Example: `8`.
- `current_status` — string. Status of vehicle relative to the stops. See [GTFS-realtime VehicleStopStatus](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-vehiclestopstatus). | _**Value**_ | _**Description**_ | |-------------------|------------------------------------------------------------------------------------------------------------| | **INCOMING_AT** | The vehicle is just about to arrive at the stop (on a stop display, the vehicle symbol typically flashes). | | **STOPPED_AT** | The vehicle is standing at the stop. | | **IN_TRANSIT_TO** | The vehicle has departed the previous stop and is in transit. | Example: `"IN_TRANSIT_TO"`.
- `carriages` — array of object (nullable). Carriage-level crowding details. See [GTFS-realtime multi_carriage_details](https://gtfs.org/documentation/realtime/reference/#message-carriagedetails). Example: `[{"occupancy_status": "MANY_SEATS_AVAILABLE", "occupancy_percentage": 80, "label": "some-carriage"}]`.
  - `occupancy_status` — string. The degree of passenger occupancy for the vehicle. See [GTFS-realtime OccupancyStatus](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#enum-vehiclestopstatus). | _**Value**_ | _**Description**_ | |--------------------------------|-----------------------------------------------------------------------------------------------------| | **MANY_SEATS_AVAILABLE** | Not crowded: the vehicle has a large percentage of seats available. | | **FEW_SEATS_AVAILABLE** | Some crowding: the vehicle has a small percentage of seats available. | | **STANDING_ROOM_ONLY** | Standing room only: the vehicle can currently accommodate only standing passengers. | | **CRUSHED_STANDING_ROOM_ONLY** | Crushed standing room: the vehicle can currently accommodate only standing passengers and has limited space for them. | | **FULL** | Crowded: the vehicle is considered full by most measures, but may still be allowing passengers to board. | | **NOT_ACCEPTING_PASSENGERS** | Not accepting passengers: the vehicle is not accepting passengers, the vehicle or carriage usually accepts passengers for boarding. | | **NO_DATA_AVAILABLE** | No data available: the vehicle doesn't have any occupancy data available at that time. | Values: `EMPTY`, `MANY_SEATS_AVAILABLE`, `FEW_SEATS_AVAILABLE`, `STANDING_ROOM_ONLY`, `CRUSHED_STANDING_ROOM_ONLY`, `FULL`, `NOT_ACCEPTING_PASSENGERS`, `NO_DATA_AVAILABLE`, `NOT_BOARDABLE`.
  - `occupancy_percentage` — integer. Percentage of vehicle occupied, calculated via weight average
  - `label` — string. Carriage-specific label, used as an identifier
- `bearing` — integer. Bearing, in degrees, clockwise from True North, i.e., 0 is North and 90 is East. This can be the compass bearing, or the direction towards the next stop or intermediate location. See [GTFS-realtime Position bearing](https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md#message-position). Example: `174`.

Relationships: `trip`, `stop`, `route`

