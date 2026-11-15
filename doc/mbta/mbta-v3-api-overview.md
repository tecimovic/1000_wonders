<!-- Source: https://www.mbta.com/developers/v3-api — downloaded 2026-11-15, converted to Markdown -->

# V3 API

The V3 API presents [General Transit Feed Specification (GTFS)](/developers/gtfs), [GTFS Realtime](/developers/gtfs-realtime), and MBTA-specific data. It uses the [JSON:API](http://jsonapi.org) format, so you can get started using any of the [available libraries](http://jsonapi.org/implementations/).

## V3 API Documentation

Read the latest endpoint and resource documentation about available fields, filters, and includes.

[Read the documentation](https://api-v3.mbta.com/docs/swagger/index.html)

Skip to any section below:

- [Request an API Key](#key)
- [Make Basic Calls](#calls)
  - [Filter Data](#filter)
  - [Include Relationships](#include)
- [Use Best Practices](#best-practices)
- [Learn About API Updates](#updates)

## Request an API Key

We recommend using a V3 API key early in your development process. A valid key is required to make a default of 1,000 requests per minute, control the [version](/developers/v3-api/versioning), and [stream](/developers/v3-api/best-practices#streaming) requests.

[Request a free key](https://api-v3.mbta.com/)

## Make Basic Calls

The following V3 API calls are available. To read endpoint documentation for a call, click its link:

| Call | Description |  |  |
|----|----|----|----|
| Call | [/alerts](https://api-v3.mbta.com/docs/swagger/index.html#/Alert) | Description | Communications to riders about disrupted MBTA operations |
| Call | [/facilities](https://api-v3.mbta.com/docs/swagger/index.html#/Facility) | Description | Amenities at stops, such as elevators, escalators, parking lots, and bike racks |
| Call | [/lines](https://api-v3.mbta.com/docs/swagger/index.html#/Line) | Description | Lines for all modes (for example, `line-Green`) |
| Call | [/predictions](https://api-v3.mbta.com/docs/swagger/index.html#/Prediction) | Description | Predicted arrival/departure times |
| Call | [/routes](https://api-v3.mbta.com/docs/swagger/index.html#/Route) | Description | Routes for each line (for example, `Green-B`) |
| Call | [/route_patterns](https://api-v3.mbta.com/docs/swagger/index.html#/RoutePattern) | Description | Possible patterns of travel for each route |
| Call | [/schedules](https://api-v3.mbta.com/docs/swagger/index.html#/Schedule) | Description | Scheduled arrival/departure times (`stop_time`) |
| Call | [/services](https://api-v3.mbta.com/docs/swagger/index.html#/Service) | Description | Dates when trips occur |
| Call | [/shapes](https://api-v3.mbta.com/docs/swagger/index.html#/Shape) | Description | [Polylines](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) that describe trip shapes, which can be shown on a map |
| Call | [/stops](https://api-v3.mbta.com/docs/swagger/index.html#/Stop) | Description | Places where riders board a vehicle, disembark from a vehicle, or navigate a station |
| Call | [/trips](https://api-v3.mbta.com/docs/swagger/index.html#/Trip) | Description | Movement of vehicles from one route end to the other |
| Call | [/vehicles](https://api-v3.mbta.com/docs/swagger/index.html#/Vehicle) | Description | Vehicle positions, including direction, latitude, and longitude |

Each call returns the object described. Following the JSON:API standard, you can [filter](#filter) and [sort](https://jsonapi.org/format/#fetching-sorting) the list in various ways, and you can [include](#include) other objects with related information.

### Filter Data

The following examples of [filtering](https://jsonapi.org/format/#fetching-filtering) use the /routes call. To test a call, click its link:

[TABLE]

### Include Relationships

An arrival time doesn't mean much unless you know where the vehicle is arriving and where it's going next. Some objects are defined largely by their relationship to other objects. Those other objects can be [included](https://jsonapi.org/format/#fetching-includes) in the results, and you can [nest included resources](https://mbta.com/developers/v3-api/best-practices#nested-includes).

The following examples of including use the /schedules call with the same filters. To test a call, click its link:

[TABLE]

The following example returns predictions with useful information about their related stops. To test the call, click its link:

[TABLE]

## Use Best Practices

[](/developers/v3-api/best-practices)

Best Practices

Learn helpful tips for using the V3 API.

[](/developers/v3-api/streaming)

Streaming

Learn how to stream updates on predictions, vehicle locations, and alerts.

