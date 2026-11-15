<!-- Source: https://www.mbta.com/developers/v3-api/streaming — downloaded 2026-11-15, converted to Markdown -->

# Streaming

V3 API “index” endpoints support streaming over the [server-sent event/event stream](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) protocol. For clients that can maintain an open connection to the server, this is a more efficient and lower-latency way to receive data from the V3 API.

To stream updates:

1.  Use the `Accept: text/event-stream` header to tell the server you want streaming updates.
2.  Specify an API key (either with the `X-API-Key` header or the `api_key` query parameter). Anonymous access is not possible for streaming.
3.  Handle the four possible [event types](#event-types).

Currently, only the initial request counts against your API key rate limit. As long as you keep the connection open, it will be treated as a single request.

## Event Types

The V3 API sends four different types of events to keep clients up to date:

- [Reset](#reset)
- [Add](#add)
- [Update](#update)
- [Remove](#remove)

Each [resource/identifier](http://jsonapi.org/format/#document-resource-objects) has a unique (`id`, `type`) pair that can be used to track changes across multiple events.

### Reset

The `reset` event contains the full current state of the endpoint represented as a list of [JSON-API resource objects](http://jsonapi.org/format/#document-resource-objects). It’s always the first event in the stream, but it can also be sent during the connection if the API server determines that it is more efficient than sending individual resource changes.

    event: reset
    data: [{"attributes":{"bearing":315.0,"current_status":"IN_TRANSIT_TO","current_stop_sequence":310,"direction_id":0,"label":"3673-3838","latitude":42.33982849121094,"longitude":-71.15853881835938,"speed":null,"updated_at":"2018-06-08T11:22:55-04:00"},"id":"G-10067","links":{"self":"/vehicles/G-10067"},"relationships":{"route":{"data":{"id":"Green-B","type":"route"}},"stop":{"data":{"id":"70107","type":"stop"}},"trip":{"data":{"id":"36418064","type":"trip"}}},"type":"vehicle"},{"attributes":{"bearing":90.0,"current_status":"IN_TRANSIT_TO","current_stop_sequence":null,"direction_id":1,"label":null,"latitude":42.349124908447266,"longitude":-71.09575653076172,"speed":null,"updated_at":"2018-06-08T11:22:30-04:00"},"id":"0446","links":{"self":"/vehicles/0446"},"relationships":{"route":{"data":{"id":"57","type":"route"}},"stop":{"data":null},"trip":{"data":{"id":"36616656","type":"trip"}}},"type":"vehicle"}]

### Add

The `add` event is sent when new resources are added, and it contains a single [JSON-API resource object](http://jsonapi.org/format/#document-resource-objects).

    event: add
    data: {"attributes":{"bearing":160.0,"current_status":"INCOMING_AT","current_stop_sequence":30,"direction_id":0,"label":"3633-3868","latitude":42.36283874511719,"longitude":-71.05811309814453,"speed":null,"updated_at":"2018-06-08T11:22:55-04:00"},"id":"G-10300","links":{"self":"/vehicles/G-10300"},"relationships":{"route":{"data":{"id":"Green-E","type":"route"}},"stop":{"data":{"id":"70204","type":"stop"}},"trip":{"data":{"id":"36420357","type":"trip"}}},"type":"vehicle"}

### Update

The `update` event is sent when existing resources are updated, and it contains a single [JSON-API resource object](http://jsonapi.org/format/#document-resource-objects).

    event: update
    data: {"attributes":{"bearing":76.0,"current_status":"IN_TRANSIT_TO","current_stop_sequence":8,"direction_id":0,"label":"1633","latitude":42.56092834472656,"longitude":-70.81510162353516,"speed":19.0,"updated_at":"2018-06-08T11:21:52-04:00"},"id":"1633","links":{"self":"/vehicles/1633"},"relationships":{"route":{"data":{"id":"CR-Newburyport","type":"route"}},"stop":{"data":{"id":"Beverly Farms","type":"stop"}},"trip":{"data":{"id":"CR-Weekday-Spring-18-107","type":"trip"}}},"type":"vehicle"}

### Remove

The `remove` event is sent when a resource is removed, and it contains a single [JSON-API resource identifier object](http://jsonapi.org/format/#document-resource-identifier-objects).

    event: remove
    data: {"id":"1723","type":"vehicle"}

## Notes

If you’re using the `include` parameter to fetch related resources, only the primary resource will be tracked for updates. For this reason, you likely want to use vehicles, predictions, or alerts as the primary resource type. The included resources will be combined with the primary resources as a part of the `reset` event.

If you do want to receive updates for a single item, you can use the `filter[id]` query parameter to limit your search to that single resource.

## Example

Worcester line departures from South Station (replace `API_KEY` with your API key):

    curl -sN -H "accept: text/event-stream" -H "x-api-key: API_KEY"
    "https://api-v3.mbta.com/predictions/?filter\\[route\\]=CR-Worcester&filter\\[stop\\]=place-sstat&stop_sequence=1"

