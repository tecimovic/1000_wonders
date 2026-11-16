// Adapter for Transport for London's Unified API (https://api.tfl.gov.uk).
// Docs: doc/tfl/README.md (cheat sheet and quirks) and doc/tfl/swagger.json.
//
// TfL doesn't publish GTFS. The Unified API is its own JSON API, so this
// adapter maps TfL "modes" to GTFS route types and line statuses to alerts.
//
// Authority options used (in supportedTransitAuthorities.json → api):
//   baseUrl            https://api.tfl.gov.uk
//   apiKeyQueryParam   "app_key" (the API also works without a key, rate-limited)
//
// London has ~33,000 stop points, far too many to load into the browser, so
// this adapter searches stops on the server (searchStops / getStop) instead of
// returning them all from getStops.

import { getJson } from '../http.js'
import { GTFS_MODES } from '../format.js'

export const capabilities = { lines: true, alerts: true, stops: true, predictions: true, facilities: true }

// TfL modes the app shows, and the GTFS route type each one is shown as.
// (Codes above 12 are extended GTFS route types: 109 suburban railway,
// 900 tram, 714 rail replacement bus.)
const MODES = {
  tube: 1,
  dlr: 0,
  'elizabeth-line': 2,
  overground: 109,
  tram: 900,
  bus: 3,
  'replacement-bus': 714,
  'river-bus': 4,
  'cable-car': 6
}
const MODE_LIST = Object.keys(MODES).join(',')
const STATION_MODES = new Set(['tube', 'dlr', 'elizabeth-line', 'overground', 'tram', 'river-bus', 'cable-car', 'national-rail'])

export const modes = {
  ...GTFS_MODES,
  0: { name: 'DLR', color: '#00AFAD' },
  1: { name: 'Underground', color: '#0019A8' },
  2: { name: 'Elizabeth line', color: '#6950A1' },
  3: { name: 'Bus', color: '#DC241F' },
  4: { name: 'River bus', color: '#00A0E2' },
  6: { name: 'Cable car', color: '#E21836' },
  109: { name: 'Overground', color: '#FA7B05' },
  714: { name: 'Replacement bus', color: '#DC241F' },
  900: { name: 'Tram', color: '#5FB526' }
}

const MODE_LABEL = {
  tube: 'Underground', dlr: 'DLR', 'elizabeth-line': 'Elizabeth line', overground: 'Overground',
  tram: 'Tram', bus: 'Bus', 'river-bus': 'River bus', 'cable-car': 'Cable car', 'national-rail': 'National Rail'
}
const KIND_ORDER = ['tube', 'elizabeth-line', 'overground', 'dlr', 'tram', 'national-rail', 'river-bus', 'cable-car', 'bus']

// TfL doesn't send line colors; these are its published brand colors.
const LINE_COLORS = {
  bakerloo: ['B36305', 'FFFFFF'],
  central: ['E32017', 'FFFFFF'],
  circle: ['FFD300', '000000'],
  district: ['00782A', 'FFFFFF'],
  'hammersmith-city': ['F3A9BB', '000000'],
  jubilee: ['A0A5A9', '000000'],
  metropolitan: ['9B0056', 'FFFFFF'],
  northern: ['000000', 'FFFFFF'],
  piccadilly: ['003688', 'FFFFFF'],
  victoria: ['0098D4', 'FFFFFF'],
  'waterloo-city': ['95CDBA', '000000'],
  dlr: ['00AFAD', 'FFFFFF'],
  elizabeth: ['6950A1', 'FFFFFF'],
  tram: ['5FB526', 'FFFFFF'],
  liberty: ['61686B', 'FFFFFF'],
  lioness: ['FFA600', '000000'],
  mildmay: ['006FE6', 'FFFFFF'],
  suffragette: ['18A95D', 'FFFFFF'],
  weaver: ['9B0058', 'FFFFFF'],
  windrush: ['DC241F', 'FFFFFF'],
  'london-cable-car': ['E21836', 'FFFFFF']
}
const MODE_COLORS = { bus: ['DC241F', 'FFFFFF'], 'replacement-bus': ['DC241F', 'FFFFFF'], 'river-bus': ['00A0E2', 'FFFFFF'] }

function toRoute(lineId, lineName, modeName) {
  const [color, textColor] = LINE_COLORS[lineId] || MODE_COLORS[modeName] || ['555555', 'FFFFFF']
  return { id: lineId, name: lineName || lineId, longName: '', color: '#' + color, textColor: '#' + textColor }
}

// "Oxford Circus Underground Station" → "Oxford Circus"
const shortStationName = name =>
  (name || '').replace(/\s+(Underground|DLR|Rail|Tram Stop|Tram|Pier)?\s*Station$/i, '').replace(/\s+Tram Stop$/i, '').trim()

const tidy = text => (text || '').replace(/\s{2,}/g, ' ').trim()

// --- lines ----------------------------------------------------------------------

const byName = new Intl.Collator('en', { numeric: true })

// Every line of the modes the app shows (bus routes sorted 1, 2, …, N9, …).
export async function getLines(authority, { signal } = {}) {
  const lines = await getJson(authority, `/Line/Mode/${MODE_LIST}`, {}, { signal })
  return lines
    .filter(l => MODES[l.modeName] != null)
    .map(l => ({ ...toRoute(l.id, l.name, l.modeName), routeType: MODES[l.modeName] }))
    .sort((a, b) => byName.compare(a.name, b.name))
}

// --- alerts -------------------------------------------------------------------

// TfL statusSeverity (lower is worse, 10 is "Good Service") → 0–10.
const SEVERITY = {
  0: 3, // Special Service (buses: diversions etc.)
  1: 9, // Closed
  2: 9, // Suspended
  3: 8, // Part Suspended
  4: 6, // Planned Closure
  5: 6, // Part Closure
  6: 7, // Severe Delays
  7: 5, // Reduced Service
  8: 4, // Bus Service
  9: 4, // Minor Delays
  11: 5, // Part Closed
  12: 3, // Exit Only
  13: 3, // No Step Free Access
  14: 3, // Change of frequency
  15: 4, // Diverted
  16: 7, // Not Running
  17: 3, // Issues Reported
  19: 1, // Information
  20: 2 // Service Closed
}
const NOT_AN_ALERT = new Set([10, 18]) // Good Service, No Issues

export async function getAlerts(authority, { signal } = {}) {
  const lines = await getJson(authority, `/Line/Mode/${MODE_LIST}/Status`, {}, { signal })
  const now = Date.now()
  // One alert per distinct (status, reason); the lines it applies to become its routes.
  const alerts = new Map()
  for (const line of lines) {
    for (const s of line.lineStatuses || []) {
      if (NOT_AN_ALERT.has(s.statusSeverity)) continue
      // "Service Closed" without a reason is just the end of the day's service.
      if (s.statusSeverity === 20 && !s.reason) continue
      const key = `${s.statusSeverity}|${s.reason || line.id}`
      if (!alerts.has(key)) alerts.set(key, { s, lines: [] })
      alerts.get(key).lines.push(line)
    }
  }
  return [...alerts.values()].map(({ s, lines }, i) => {
    const routes = lines.map(l => toRoute(l.id, l.name, l.modeName))
    const routeTypes = [...new Set(lines.map(l => MODES[l.modeName]).filter(t => t != null))]
    const periods = (s.validityPeriods || []).map(p => ({ start: p.fromDate || null, end: p.toDate || null }))
    const started = !periods.length || periods.some(p => !p.start || Date.parse(p.start) <= now)
    const created = s.disruption?.created
    const effect = s.statusSeverityDescription || 'Notice'
    const reason = tidy(s.reason)
    // Reasons usually start with "PLACE: ..." or "Line name: ...".
    const header = reason ? reason.split(/(?<=[.!?])\s/)[0] : `${effect}: ${routes.map(r => r.name).join(', ')}`
    return {
      id: `tfl-${i}-${lines[0].id}-${s.statusSeverity}`,
      title: `${effect}: ${routes.map(r => r.name).join(', ')}`,
      header,
      description: reason,
      effect,
      cause: s.disruption?.categoryDescription || '',
      severity: SEVERITY[s.statusSeverity] ?? 3,
      lifecycle: !started ? 'UPCOMING' : created && now - Date.parse(created) < 24 * 3600 * 1000 ? 'NEW' : 'ONGOING',
      timeframe: '',
      activePeriods: periods,
      routeTypes,
      routes,
      updatedAt: s.disruption?.lastUpdate || created || null,
      url: ''
    }
  })
}

// --- stops ----------------------------------------------------------------------

function toStop(s) {
  const stopModes = (s.modes || []).filter(m => MODE_LABEL[m])
  const isStation = stopModes.some(m => STATION_MODES.has(m)) || s.id?.startsWith('HUB')
  const kinds = KIND_ORDER.filter(m => stopModes.includes(m)).map(m => MODE_LABEL[m])
  const letter = s.stopLetter || s.indicator
  const towards = s.towards ? `towards ${s.towards}` : ''
  const zone = s.zone ? `Zone ${s.zone}` : ''
  return {
    id: s.id || s.naptanId,
    name: tidy(isStation ? shortStationName(s.name || s.commonName) : s.name || s.commonName),
    kind: kinds.join(', ') || 'Stop',
    isStation,
    municipality: [letter && !/^Stop$/i.test(letter) ? letter : '', towards, zone].filter(Boolean).join(' · ')
  }
}

// Not used: London has too many stops for one list (see searchStops).
export async function getStops() {
  return []
}

// Stops whose name matches `query`, searched by TfL.
export async function searchStops(authority, query, { signal } = {}) {
  const q = query.trim()
  if (q.length < 2) return []
  const data = await getJson(authority, `/StopPoint/Search/${encodeURIComponent(q)}`,
    { modes: MODE_LIST, maxResults: 50 }, { signal })
  return (data.matches || []).map(toStop)
}

// --- stop details (used for predictions, facilities, and getStop) ----------------------

const details = new Map() // stop id → Promise of the /StopPoint/{id} response

function stopPoint(authority, stopId, signal) {
  if (!details.has(stopId)) {
    const p = getJson(authority, `/StopPoint/${encodeURIComponent(stopId)}`, {}, { signal })
    p.catch(() => details.delete(stopId))
    details.set(stopId, p)
  }
  return details.get(stopId)
}

// One stop by id (e.g. from ?stop= in the URL), or null.
export async function getStop(authority, stopId, { signal } = {}) {
  try {
    const s = await stopPoint(authority, stopId, signal)
    return toStop({ ...s, id: s.naptanId, name: s.commonName })
  } catch {
    return null
  }
}

// --- predictions ------------------------------------------------------------------

// Arrivals only exist on stations (940G…, 910G…) and on single bus stops
// (490…). Hubs (HUB…) and bus stop clusters (490G…) return none, so those are
// expanded into their arrival-capable children.
const ARRIVAL_TYPES = new Set(['NaptanMetroStation', 'NaptanRailStation', 'NaptanPublicBusCoachTram', 'NaptanFerryPort'])
const MAX_CHILD_REQUESTS = 16

function arrivalIds(s) {
  if (ARRIVAL_TYPES.has(s.stopType)) return [s.naptanId]
  return (s.children || []).flatMap(arrivalIds)
}

export async function getPredictions(authority, stopId, { signal } = {}) {
  const s = await stopPoint(authority, stopId, signal)
  const ids = arrivalIds(s).slice(0, MAX_CHILD_REQUESTS)
  if (!ids.length) ids.push(stopId)
  const lists = await Promise.all(ids.map(id =>
    getJson(authority, `/StopPoint/${encodeURIComponent(id)}/Arrivals`, {}, { signal })))
  return lists.flat().filter(a => MODES[a.modeName] != null).map(a => ({
    id: `${a.id}:${a.naptanId}:${a.vehicleId}`,
    routeType: MODES[a.modeName],
    route: toRoute(a.lineId, a.lineName, a.modeName),
    destination: shortStationName(a.destinationName) || a.towards || '',
    platform: !a.platformName || a.platformName === 'null' ? ''
      : a.modeName === 'bus' || a.modeName === 'replacement-bus' ? `Stop ${a.platformName}` : a.platformName,
    // TfL only predicts arrival; treat it as the departure as well.
    arrivalTime: a.expectedArrival || null,
    departureTime: a.expectedArrival || null,
    status: '',
    scheduleRelationship: 'SCHEDULED',
    nonRevenue: false,
    hasVehicle: Boolean(a.vehicleId),
    vehicleStoppedHere: a.timeToStation <= 30 && /^At /i.test(a.currentLocation || '')
  }))
}

// --- facilities ----------------------------------------------------------------------

const FACILITY_CATEGORIES = new Set(['Facility', 'Accessibility'])
const spaced = key => (key === 'WiFi' ? 'Wi-Fi' : key.replace(/([a-z])([A-Z])/g, '$1 $2'))

export async function getFacilities(authority, stopId, { signal } = {}) {
  const s = await stopPoint(authority, stopId, signal)
  return (s.additionalProperties || [])
    .filter(p => FACILITY_CATEGORIES.has(p.category) && p.value)
    .map((p, i) => ({
      id: `${p.category}-${p.key}-${i}`,
      type: p.category === 'Facility' ? 'Facilities' : 'Accessibility',
      name: `${spaced(p.key)}: ${tidy(p.value)}`,
      properties: []
    }))
}
