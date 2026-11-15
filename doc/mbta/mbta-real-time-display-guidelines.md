<!-- Source: https://www.mbta.com/developers/real-time-display-guidelines — downloaded 2026-11-15, converted to Markdown -->

# Real-Time Display Guidelines

To consistently show [GTFS Realtime](/node/3146) and [V3 API](/node/3142) real-time service information to riders, follow these guidelines.

- [Destinations](#destinations)
- [Real-Time Messages](#real-time-messages)
  1.  [Alerts](#alerts)
  2.  [Service Ended](#service-ended)
  3.  [First Trip](#first-trip)
  4.  [Status or Predictions](#status-or-predictions)
  5.  [Headways or Schedule](#headways-or-schedule)

To learn about guideline updates, read the [changelog](#changelog).

Please share any questions and feedback in the [MBTA Developers Google Group](https://groups.google.com/g/massdotdevelopers).

## Destinations

A destination is the last stop riders can travel to on an MBTA route. In the [V3 API](/developers/v3-api), it is the `headsign` attribute of the `trip` associated with the `vehicle` of the prediction.

A rider’s possible destinations depend on the stop where they begin their trip. For example, when a rider gets on the Red Line at Park Street, their destination might be a permanent terminal, like Alewife, Ashmont, or Braintree, or a temporary terminal during disrupted service.

To help riders use transit, destinations and relevant [real-time messages](#real-time-messages) appear on our website, mobile app, screens, and other touchpoints.

![A photo of a big rail map next to the stairs leading out of Park Street Station](https://cdn.mbta.com/sites/default/files/styles/max_650x650/public/media/2021-04/2021-04-02-park-street-station-interior-red-line-alewife.jpg?itok=GJO8Yah-)

At Park Street, a sign shows Alewife as the destination for trains departing the nearby platform.

## Real-Time Messages

To evaluate what real-time information to share with riders, follow these steps for each [destination](#destinations):

1.  [Alerts](#alerts)
2.  [Service Ended](#service-ended)
3.  [First Trip](#first-trip)
4.  [Status or Predictions](#status-or-predictions)
5.  [Headways or Schedule](#headways-or-schedule)

Depending on how many characters fit on a screen, use a regular or compact version of a message.

For  Commuter Rail, show the track number (`platform_code` in the V3 API; [example call](https://api-v3.mbta.com/predictions?filter%5Bstop%5D=place-north&include=stop)) next to the [status or predictions](#status-or-predictions) if available.

### Alerts

If there are planned work, station, or service [alerts](/alerts), show them to riders. Prioritize showing the following alert types over other real-time messages:

- For all modes, service suspension and station/stop closure alerts
- For  Bus, detour and snow route alerts

Informational alerts (in the V3 API, "severity" is "1;" in GTFS Realtime, "severity_level" is "INFO") can have a more muted visual treatment compared with more severe alerts.

For guidance on querying the V3 API for alerts, read [Best Practices](/node/3554#alerts).

Next, evaluate if a service ended message should be shown.

### Service Ended

If service has ended for the day, communicate that to riders. For example:

| Regular Message | Compact Message |  |  |
|----|----|----|----|
| Regular Message | Service has ended for the day. | Compact Message | Service ended |

Otherwise, evaluate if a first trip message should be shown.

### First Trip

Show the first scheduled `arrival_time` or, at terminals, `departure_time` if the current time is later than 3:30 AM, service has not yet started, and either:

- There are no predicted departures, or
- The mode is  Subway (route type `0` or `1`), and the current time is more than 40 minutes before the first scheduled departure at a given stop

For example:

| Regular Message | Compact Message             |                 |      |
|-----------------|-----------------------------|-----------------|------|
| Regular Message | Oak Grove train due 5:42 AM | Compact Message | 5:42 |

In places that show departures for the rest of the day, show a list of [predictions](#status-or-predictions) below the first trip message.

If a first trip message does not apply, next evaluate if a status or prediction should be shown.

### Status or Predictions

![Photo of the Walnut Avenue bus shelter, which has a large digital screen that shows predictions and other information for riders.](https://cdn.mbta.com/sites/default/files/styles/max_650x650/public/media/2022-04/2021-11-15-bus-shelter-columbus-ave.jpg?itok=0cNSTfnc)

The MBTA shows predictions to riders throughout the system, for example, on digital signs at bus shelters.

If prediction data is:

- Unavailable, skip this section and read [Headways or Schedule](#headways-or-schedule).
- Available for a given stop, you can show the statuses of incoming vehicles or how many minutes away they are.

Select a mode below, read the steps in order, and follow the first applicable “show” or “do not show” instruction.

 Subway Status or Predictions

1.  If `status` is present, show status in place of predictions. For example:

    | Regular Message | Compact Message        |                 |         |
    |-----------------|------------------------|-----------------|---------|
    | Regular Message | Stopped *x* stops away | Compact Message | Stopped |

2.  If vehicle data is unavailable and the predicted `departure_time` is null or in the past, do not show this prediction because riders won't be able to board.

3.  Calculate the number of seconds until the vehicle reaches the stop: Subtract the current time from the `arrival_time` (if available) or the `departure_time` (if not). Call this value "seconds."
    - If seconds ≤ 30, show:

      | Regular Message | Compact Message |                 |     |
      |-----------------|-----------------|-----------------|-----|
      | Regular Message | Arriving        | Compact Message | ARR |

    - If the status of the associated vehicle is "STOPPED_AT,” the vehicle’s stop is same as the prediction’s stop (or a child stop of the prediction's stop), and either:

      - Seconds ≤ 90, or
      - The prediction's arrival time is in the past, and its departure time is in the future

      Show:

      | Regular Message | Compact Message |                 |     |
      |-----------------|-----------------|-----------------|-----|
      | Regular Message | Boarding        | Compact Message | BRD |

4.  Round the seconds value to the nearest whole number of minutes, rounding up if exactly in between. Call this value "minutes."

    - If minutes \< 60, show minutes.
    - If minutes ≥ 60, show hours and minutes.

    For example:

    [TABLE]

1.  If `status` is present, show status in place of predictions. For example:

    | Regular Message | Compact Message        |                 |         |
    |-----------------|------------------------|-----------------|---------|
    | Regular Message | Stopped *x* stops away | Compact Message | Stopped |

2.  If vehicle data is unavailable and the predicted `departure_time` is null or in the past, do not show this prediction because riders won't be able to board.

3.  Calculate the number of seconds until the vehicle reaches the stop: Subtract the current time from the `arrival_time` (if available) or the `departure_time` (if not). Call this value "seconds."
    - If seconds ≤ 30, show:

      | Regular Message | Compact Message |                 |     |
      |-----------------|-----------------|-----------------|-----|
      | Regular Message | Arriving        | Compact Message | ARR |

    - If the status of the associated vehicle is "STOPPED_AT,” the vehicle’s stop is same as the prediction’s stop (or a child stop of the prediction's stop), and either:

      - Seconds ≤ 90, or
      - The prediction's arrival time is in the past, and its departure time is in the future

      Show:

      | Regular Message | Compact Message |                 |     |
      |-----------------|-----------------|-----------------|-----|
      | Regular Message | Boarding        | Compact Message | BRD |

4.  Round the seconds value to the nearest whole number of minutes, rounding up if exactly in between. Call this value "minutes."

    - If minutes \< 60, show minutes.
    - If minutes ≥ 60, show hours and minutes.

    For example:

    [TABLE]

 Bus Status or Predictions

1.  If the predicted `departure_time` is null or in the past, do not show this prediction because riders won’t be able to board.

2.  Calculate the number of seconds until the vehicle reaches the stop: Subtract the current time from the `arrival_time` (if available) or the `departure_time` (if not). Call this value "seconds."
    - If seconds is ≤ 30, show "Now."

3.  Round the seconds value to the nearest whole number of minutes, rounding up if exactly in between. Call this value "minutes."

    - If minutes \< 60, show minutes.
    - If minutes ≥ 60, show hours and minutes.

    For example:

[TABLE]

1.  If the predicted `departure_time` is null or in the past, do not show this prediction because riders won’t be able to board.

2.  Calculate the number of seconds until the vehicle reaches the stop: Subtract the current time from the `arrival_time` (if available) or the `departure_time` (if not). Call this value "seconds."
    - If seconds is ≤ 30, show "Now."

3.  Round the seconds value to the nearest whole number of minutes, rounding up if exactly in between. Call this value "minutes."

    - If minutes \< 60, show minutes.
    - If minutes ≥ 60, show hours and minutes.

    For example:

[TABLE]

 Commuter Rail Status or Predictions

1.  If the predicted `departure_time` and `arrival_time` are both null, and status is present, show the status and crossed-out scheduled departure time. For example:

    | Regular Message | Compact Message      |                 |                   |
    |-----------------|----------------------|-----------------|-------------------|
    | Regular Message | ~~12:34 PM~~ Delayed | Compact Message | ~~12:34~~ Delayed |

2.  If the predicted `departure_time` is null or in the past and `status` is not present, do not show this prediction because riders won’t be able to board.

3.  Otherwise, show the predicted departure time, `status` (if present), track number (if known), and scheduled departure time (if different from the predicted departure time). For example:

    [TABLE]

1.  If the predicted `departure_time` and `arrival_time` are both null, and status is present, show the status and crossed-out scheduled departure time. For example:

    | Regular Message | Compact Message      |                 |                   |
    |-----------------|----------------------|-----------------|-------------------|
    | Regular Message | ~~12:34 PM~~ Delayed | Compact Message | ~~12:34~~ Delayed |

2.  If the predicted `departure_time` is null or in the past and `status` is not present, do not show this prediction because riders won’t be able to board.

3.  Otherwise, show the predicted departure time, `status` (if present), track number (if known), and scheduled departure time (if different from the predicted departure time). For example:

    [TABLE]

 Ferry Status or Predictions

1.  If the predicted `departure_time` is null or in the past, do not show this prediction because riders won’t be able to board.

2.  Otherwise, show the predicted departure time, `status` (if present), vessel name, and scheduled departure time (if different from the predicted departure time). For example:

    | Regular Message | Compact Message     |                 |       |
    |-----------------|---------------------|-----------------|-------|
    | Regular Message | 11:45 AM Harbor Gem | Compact Message | 11:45 |

1.  If the predicted `departure_time` is null or in the past, do not show this prediction because riders won’t be able to board.

2.  Otherwise, show the predicted departure time, `status` (if present), vessel name, and scheduled departure time (if different from the predicted departure time). For example:

    | Regular Message | Compact Message     |                 |       |
    |-----------------|---------------------|-----------------|-------|
    | Regular Message | 11:45 AM Harbor Gem | Compact Message | 11:45 |

### Headways or Schedule

For  Subway only, if a countdown is not available, show headways that describe how often riders should expect a vehicle to arrive at a given stop. For example:

| Regular Message | Compact Message |                 |             |
|-----------------|-----------------|-----------------|-------------|
| Regular Message | Every 8–13 min  | Compact Message | Every 8–13m |

For other modes, show the next scheduled `arrival_time` or, at terminals, `departure_time`.

For a trip with `schedule_relationship` "CANCELED" or "SKIPPED" (see our [GTFS Realtime Trip Updates enhanced feed](https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs-realtime.md#enhanced-json-feeds)), show a crossed-out scheduled stop time or hide the trip.

## Changelog

Read the changelog

### October 2026

- “Countdowns” are now called “predictions.”
- The [Status or Predictions](#status-or-predictions) section is now broken down by mode and includes ferry.
- Commuter Rail and ferry prediction messages now use departure time.

### February 2026

Under [Status or Countdown](#status-or-predictions), we:

- Removed the "Approaching" message for a  Subway vehicle ≤ 60 seconds from a stop because it could conflict with the vehicle status. We still communicate “Arriving” when a vehicle is ≤ 30 seconds from a stop.
- Changed the compact message for a  Bus ≤ 30 seconds from a stop from "NOW" to "Now," for readability.

### December 2025

We moved relevant information from V3 API [Best Practices](/node/3554) to Real-Time Display Guidelines. Boarding Status and Countdown sections combined into [Status or Countdown](#status-or-predictions).

### September 2025

Real-Time Display Guidelines published.

### October 2026

- “Countdowns” are now called “predictions.”
- The [Status or Predictions](#status-or-predictions) section is now broken down by mode and includes ferry.
- Commuter Rail and ferry prediction messages now use departure time.

### February 2026

Under [Status or Countdown](#status-or-predictions), we:

- Removed the "Approaching" message for a  Subway vehicle ≤ 60 seconds from a stop because it could conflict with the vehicle status. We still communicate “Arriving” when a vehicle is ≤ 30 seconds from a stop.
- Changed the compact message for a  Bus ≤ 30 seconds from a stop from "NOW" to "Now," for readability.

### December 2025

We moved relevant information from V3 API [Best Practices](/node/3554) to Real-Time Display Guidelines. Boarding Status and Countdown sections combined into [Status or Countdown](#status-or-predictions).

### September 2025

Real-Time Display Guidelines published.

