// Display helpers shared by all transit authorities.

// GTFS routes.txt route_type → mode. Adapters may override names and colors
// (see `modes` in each adapter).
export const GTFS_MODES = {
  0: { name: 'Light Rail', color: '#4caf7d' },
  1: { name: 'Subway', color: '#e05555' },
  2: { name: 'Rail', color: '#a066c8' },
  3: { name: 'Bus', color: '#f2c14e' },
  4: { name: 'Ferry', color: '#3aa7c4' },
  5: { name: 'Cable Tram', color: '#c98a4b' },
  6: { name: 'Aerial Lift', color: '#8a9bd6' },
  7: { name: 'Funicular', color: '#8a9bd6' },
  11: { name: 'Trolleybus', color: '#f2c14e' },
  12: { name: 'Monorail', color: '#8a9bd6' }
}

// The order modes are listed in: rail-like modes first, buses after them.
// Extended route types (109 suburban railway, 714 replacement bus, 900 tram)
// sit next to their basic type; unknown types go last.
const MODE_ORDER = [1, 0, 900, 109, 2, 12, 11, 3, 714, 4, 5, 6, 7]
const modeRank = mode => {
  const i = MODE_ORDER.indexOf(Number(mode))
  return i === -1 ? MODE_ORDER.length : i
}
export const sortModes = modes => [...modes].sort((a, b) => modeRank(a) - modeRank(b))

const cache = new Map()
function formatter(timeZone, options) {
  const key = timeZone + JSON.stringify(options)
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat('en-US', { timeZone, ...options }))
  return cache.get(key)
}

// Times are shown in the transit authority's own time zone.
export const formatClock = (iso, timeZone) =>
  iso ? formatter(timeZone, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso)) : ''
export const formatDateTime = (iso, timeZone) =>
  iso ? formatter(timeZone, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso)) : ''

// "SOME_ENUM_VALUE" → "Some enum value"
export const humanize = value =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ') : ''
