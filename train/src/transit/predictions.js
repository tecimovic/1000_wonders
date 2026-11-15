// Turns normalized predictions (see adapters/README in AGENTS.md) into rows
// for display. The rules follow MBTA's Real-Time Display Guidelines
// (doc/mbta/mbta-real-time-display-guidelines.md); they only use GTFS-Realtime
// concepts, so they apply to any authority.

import { formatClock } from './format.js'

const SUBWAY = [0, 1]
const RAIL = 2

function minutesText(seconds) {
  const minutes = Math.floor(seconds / 60 + 0.5) // round half up
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

// What to show in the "When" column, or null if riders can't board.
function whenText(p, now, timeZone) {
  const arrival = p.arrivalTime ? Date.parse(p.arrivalTime) : null
  const departure = p.departureTime ? Date.parse(p.departureTime) : null
  const canBoard = departure !== null && departure >= now
  const seconds = ((arrival ?? departure) - now) / 1000

  if (SUBWAY.includes(p.routeType)) {
    if (p.status) return p.status
    if (!p.hasVehicle && !canBoard) return null
    if (arrival === null && departure === null) return null
    if (seconds <= 30) return 'Arriving'
    if (p.vehicleStoppedHere && (seconds <= 90 || (arrival !== null && arrival < now && departure > now))) return 'Boarding'
    return minutesText(seconds)
  }

  if (p.routeType === RAIL) {
    if (arrival === null && departure === null) return p.status || null
    if (!canBoard) return p.status || null
    return [formatClock(p.departureTime, timeZone), p.status].filter(Boolean).join(' · ')
  }

  // Bus, ferry, anything else.
  if (!canBoard) return null
  if (seconds <= 30) return 'Now'
  return minutesText(seconds)
}

// Returns { rows, hidden } where `hidden` counts predictions riders can't board.
export function predictionRows(predictions, now, timeZone) {
  const rows = []
  let hidden = 0
  for (const p of predictions) {
    const cancelled = p.scheduleRelationship === 'CANCELLED' || p.scheduleRelationship === 'SKIPPED'
    const when = cancelled
      ? (p.scheduleRelationship === 'SKIPPED' ? 'Skipped' : 'Cancelled')
      : whenText(p, now, timeZone)
    if (when === null) {
      hidden++
      continue
    }
    rows.push({
      id: p.id,
      sortTime: Date.parse(p.arrivalTime || p.departureTime || '') || Infinity,
      cancelled,
      route: p.route,
      destination: p.destination,
      platform: p.platform,
      arrival: formatClock(p.arrivalTime, timeZone),
      departure: formatClock(p.departureTime, timeZone),
      when,
      nonRevenue: p.nonRevenue
    })
  }
  rows.sort((x, y) => x.sortTime - y.sortTime)
  return { rows, hidden }
}
