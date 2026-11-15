// Turns /predictions into rows for display, following MBTA's Real-Time
// Display Guidelines (doc/mbta/mbta-real-time-display-guidelines.md).

import { includedLookup, relId, formatClock } from './api.js'

const SUBWAY = [0, 1]
const COMMUTER_RAIL = 2

function minutesText(seconds) {
  const minutes = Math.floor(seconds / 60 + 0.5) // round half up
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

// What to show in the "When" column, or null if the prediction shouldn't be
// shown at all (riders can't board).
function whenText(p, routeType, vehicle, now) {
  const a = p.attributes
  const arrival = a.arrival_time ? Date.parse(a.arrival_time) : null
  const departure = a.departure_time ? Date.parse(a.departure_time) : null
  const canBoard = departure !== null && departure >= now
  const seconds = ((arrival ?? departure) - now) / 1000

  if (SUBWAY.includes(routeType)) {
    if (a.status) return a.status
    if (!vehicle && !canBoard) return null
    if (arrival === null && departure === null) return null
    if (seconds <= 30) return 'Arriving'
    const stoppedHere = vehicle?.attributes.current_status === 'STOPPED_AT' &&
      relId(vehicle, 'stop') === relId(p, 'stop')
    if (stoppedHere && (seconds <= 90 || (arrival !== null && arrival < now && departure > now))) return 'Boarding'
    return minutesText(seconds)
  }

  if (routeType === COMMUTER_RAIL) {
    if (arrival === null && departure === null) return a.status || null
    if (!canBoard) return a.status || null
    return [formatClock(a.departure_time), a.status].filter(Boolean).join(' · ')
  }

  // Bus, ferry, anything else.
  if (!canBoard) return null
  if (seconds <= 30) return 'Now'
  return minutesText(seconds)
}

// `doc` is a /predictions response with include=route,trip,stop,vehicle.
// Returns { rows, hidden } where hidden counts predictions riders can't board.
export function predictionRows(doc, now = Date.now()) {
  const lookup = includedLookup(doc)
  const rows = []
  let hidden = 0
  for (const p of doc.data) {
    const route = lookup('route', relId(p, 'route'))
    const trip = lookup('trip', relId(p, 'trip'))
    const platform = lookup('stop', relId(p, 'stop'))
    const vehicle = lookup('vehicle', relId(p, 'vehicle'))
    const a = p.attributes
    const cancelled = ['CANCELLED', 'SKIPPED'].includes(a.schedule_relationship)
    const when = cancelled ? (a.schedule_relationship === 'SKIPPED' ? 'Skipped' : 'Cancelled') : whenText(p, route?.attributes.type, vehicle, now)
    if (when === null) {
      hidden++
      continue
    }
    const r = route?.attributes || {}
    rows.push({
      id: p.id,
      sortTime: Date.parse(a.arrival_time || a.departure_time || '') || Infinity,
      cancelled,
      routeName: r.short_name || r.long_name || relId(p, 'route'),
      routeLongName: r.long_name || '',
      routeColor: r.color ? '#' + r.color : '#555',
      routeTextColor: r.text_color ? '#' + r.text_color : '#fff',
      destination: a.trip_headsign || trip?.attributes.headsign || r.direction_destinations?.[a.direction_id] || '',
      platform: platform?.attributes.platform_code
        ? `Track ${platform.attributes.platform_code}`
        : platform?.attributes.platform_name || '',
      arrival: formatClock(a.arrival_time),
      departure: formatClock(a.departure_time),
      when,
      nonRevenue: a.revenue === 'NON_REVENUE'
    })
  }
  rows.sort((x, y) => x.sortTime - y.sortTime)
  return { rows, hidden }
}
