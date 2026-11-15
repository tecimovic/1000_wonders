<!-- Source: https://www.mbta.com/developers/v3-api/best-practices — downloaded 2026-11-15, converted to Markdown -->

# Best Practices

When working with the [V3 API](/developers/v3-api), we recommend several best practices.

Skip to any section:

- [Rate Limiting](#rate-limiting)
- [Caching](#caching)
- [Streaming](#streaming)
- [Compression](#compression)
- [Sparse Fieldsets](#sparse-fieldsets)
- [Nested Includes](#nested-includes)
- [Updates](#updates)
- [Alerts](#alerts)
- [Predictions](#predictions)

For guidance on how to consistently show alerts and predictions to riders, read [Real-Time Display Guidelines](/developers/real-time-display-guidelines).

## V3 API Documentation

Read the latest endpoint and resource documentation about available fields, filters, and includes.

[Read the documentation](https://api-v3.mbta.com/docs/swagger/index.html)

## Rate Limiting

Use of the V3 API is subject to certain rate limits:

- Requests made without an API key are limited to 20 requests per minute.
- Requests made with a valid API key are limited to 1,000 requests per minute. If needed, you can request a rate limit increase in the [V3 API Portal](https://api-v3.mbta.com/).

Read [Caching](#caching) and [Sparse Fieldsets](#sparse-fieldsets) for ways to fetch less data and avoid hitting rate limits.

All V3 API responses include HTTP headers, which show your rate limit status:

| Header | Description |  |  |
|----|----|----|----|
| Header | `x-ratelimit-limit` | Description | The maximum number of requests you’re allowed to make per time window |
| Header | `x-ratelimit-remaining` | Description | The number of requests remaining in the current time window |
| Header | `x-ratelimit-reset` | Description | The time at which the current rate limit time window ends in UTC epoch seconds |

## Request a V3 API Key

Requests made with a valid API key are limited to 1,000 requests per minute.

[Request a key](https://api-v3.mbta.com/)

## Caching

The V3 API supports caching via the `Last-Modified` response and `If-Modified-Since` request headers. Each response contains a `Last-Modified` header, specifying the last time that data was updated. If, on subsequent requests, your client passes an `If-Modified-Since` header with that value and the data hasn't changed, you'll receive a 304 Not Modified status code. This cached response won't count against your API key limit. Another advantage of using this header is that you won't receive an update if you hit a server that was updated in the past.

**Note**: This only works for the root data type; included data isn't currently tracked by the `Last-Modified` header.

## Streaming

Often when working with predictions or other real-time data, it’s desirable to get new data as it changes. Rather than using polling for this purpose, the V3 API supports streaming new data in real time.

[Read documentation about streaming](/developers/v3-api/streaming)

## Compression

The V3 API supports gzip compression via the `Accept-Encoding` header. If your HTTP client doesn't do this transparently, you can pass `Accept-Encoding: gzip` as a request header, and the response will be compressed. This can result in ~10x reduction in data size.

**Example:** The full list of routes as of October 2024 is reduced from 86 KB without compression to 7.1 KB with compression.

## Sparse Fieldsets

Each type of data supports a query parameter `fields[type]`, which limits the returned attributes ([reference](https://jsonapi.org/format/#fetching-sparse-fieldsets)).

**Example:** <https://api-v3.mbta.com/routes/?fields%5Broute%5D=short_name,long_name> returns only the names for the routes. If you know what fields you need, this is another good way to reduce the amount of data you receive. This also works for included data types: [https://api-v3.mbta.com/route_patterns?filter\[route\]=CR-Providence&include=representative_trip&fields\[trip\]=headsign](https://api-v3.mbta.com/route_patterns?filter%5Broute%5D=CR-Providence&include=representative_trip&fields%5Btrip%5D=headsign).

## Nested Includes

JSON:API can `include` multiple levels of relationships by connecting the relationship names with dots ([reference](https://jsonapi.org/format/#fetching-includes)).

**Example:** The response for [https://api-v3.mbta.com/routes/Red?include=route_patterns.representative_trip.shape](https://api-v3.mbta.com/routes/Red?include=route_patterns.representative_trip.shape) will include the requested route, its route patterns, the representative trips of those patterns, and the shapes of those trips. This works to any depth of relationships, and it can save you the need to make N+1 requests in many situations.

## Updates

The real-time data can update very frequently, even using `If-Modified-Since` headers to avoid stale data. Predictions update every ~12 seconds, and vehicles update more than once per second. You may want to include some logic in your clients to prevent relative times from bouncing (say between "3 minutes away" and "4 minutes away") if that would be confusing to your users. If you're displaying predictions at that level of granularity, you can also reduce the frequency of updates accordingly.

## Alerts

It’s important to show relevant alerts to riders, so that they can navigate service disruptions. Follow these best practices to query the V3 API for alerts, based on what you know about riders’ trips.

For guidance on showing alerts, read [Real-Time Display Guidelines](/developers/real-time-display-guidelines).

### Route Alerts

If you don’t know where along a route a rider is traveling, filtering alerts only by their origin stop ([see example](https://api-v3.mbta.com/alerts?filter%5bstop%5d=place-knncl)) will likely exclude relevant alerts at other stops along the line. In that case, you should also query for alerts on the entire route ([see example](https://api-v3.mbta.com/alerts?filter%5broute%5d=Red)) and incorporate them.

The same recommendation applies to implementations where alerts are filtered on the client side. Include alerts where any informed entity includes the relevant route. Even if an alert is about a specific stop, it may affect riders.

### Trip Alerts

When you know where a rider is leaving from and going to, consider the alerts on the stops along their route. For example, there might be an alert about shuttles replacing regular service somewhere in the middle of their trip. You can query for multiple stops by comma-separating them in the filter ([see example](https://api-v3.mbta.com/alerts?filter%5Broute%5D=Red&filter%5Bstop%5D=place-pktrm,place-chmnl,place-knncl)).

You can also use the activity field of the Informed Entity to better filter to those alerts. 

- For stops where the rider boards a vehicle (even transfers), filter for the "BOARD" activity.
- For stops where the rider gets off a vehicle (even transfers), filter for the "EXIT" activity.
- For stops the rider travels through, filter for the "RIDE" activity.
- If the user requests accessible trips, filter for the "USING_WHEELCHAIR" activity.

The [documentation](https://api-v3.mbta.com/docs/swagger/index.html) for AlertResource has more detail on other types of activities.

## Predictions

When querying the V3 API for real-time predictions, there are some complexities involved in interpreting and showing this data correctly.

For guidance on how to show statuses, countdowns, headways, and schedules, read [Real-Time Display Guidelines](/developers/real-time-display-guidelines).

### Predictions and Schedules

Predictions may have an associated `schedule`, which represents the stop as it was originally scheduled to occur. The prediction can be thought of as a real-time update to the schedule; the `schedule_relationship` attribute indicates the nature of the update. Its possible values, and their meanings, are listed in the **PredictionResource** section of the [API documentation](https://api-v3.mbta.com/docs/swagger/index.html).

**Note:** Predictions may not have a `schedule`, indicating we know a vehicle is running on the route but cannot match it to a scheduled trip.

### Arrival and Departure Times

Predictions and schedules may include an `arrival_time`, a `departure_time`, both, or (only for predictions) neither. These are the rules for when a time is present:

- The **departure time** is present if, and only if, it's possible for riders to **board** the associated `vehicle` at the associated `stop`. A null departure time is typically seen at the last stop on a trip.
- The **arrival time** is present if, and only if, it's possible for riders to **alight** from the associated `vehicle` at the associated s`top`. A null arrival time is typically seen at the first stop on a trip.
- Commuter Rail predictions with neither a departure time nor arrival time often have a [status field](#status-field) with their boarding status.
- Predictions with no arrival time, departure time, nor status indicate the vehicle will not make the scheduled stop. The `schedule_relationship` field may explain why.

### Status Field

Predictions may have a free-text `status` field, which is synonymous with the `boarding_status` field in [GTFS Realtime](https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs-realtime.md). Status strings are English-language and have no maximum length, though they are typically kept short for display on signage.

