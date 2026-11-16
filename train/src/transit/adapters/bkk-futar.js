// Adapter for BKK FUTÁR (Budapest), an OneBusAway-style JSON API on top of GTFS.
// Docs: doc/bkk/README.md and doc/bkk/futar-api-reference.md.
//
// Authority options used (in supportedTransitAuthorities.json → api):
//   baseUrl            e.g. https://futar.bkk.hu/api/query/v1/ws/otp/api/where
//   apiKeyQueryParam   "key"
//   language           which translation to show ("en" or "hu"), default "en"
//   stopsArea          { south, west, north, east }: where to load stops from

import { getJson } from '../http.js'
import { GTFS_MODES } from '../format.js'

export const capabilities = { lines: true, alerts: true, stops: true, predictions: true, facilities: false }

// FUTÁR's TraverseMode → GTFS route_type (109 = suburban railway, the HÉV).
const ROUTE_TYPE = {
  TRAM: 0, SUBWAY: 1, RAIL: 2, SUBURBAN_RAILWAY: 109, BUS: 3, COACH: 3, FERRY: 4, TROLLEYBUS: 11
}

// BKK's mode names and colors.
export const modes = {
  ...GTFS_MODES,
  0: { name: 'Tram', color: '#FFD800' },
  1: { name: 'Metro', color: '#0A6CB4' },
  2: { name: 'Rail', color: '#7A7A7A' },
  3: { name: 'Bus', color: '#009EE3' },
  4: { name: 'Ferry', color: '#E50475' },
  11: { name: 'Trolleybus', color: '#FF1609' },
  109: { name: 'HÉV (suburban railway)', color: '#00A650' }
}

const STOP_KIND = {
  SUBWAY: 'Metro', SUBURBAN_RAILWAY: 'HÉV', RAIL: 'Rail', TRAM: 'Tram', TROLLEYBUS: 'Trolleybus', BUS: 'Bus', COACH: 'Coach', FERRY: 'Ferry'
}
const KIND_ORDER = ['SUBWAY', 'SUBURBAN_RAILWAY', 'RAIL', 'TRAM', 'TROLLEYBUS', 'BUS', 'COACH', 'FERRY']
const STATION_TYPES = new Set(['SUBWAY', 'SUBURBAN_RAILWAY', 'RAIL'])

// --- helpers ------------------------------------------------------------------

async function futar(authority, path, params, opts) {
  const doc = await getJson(authority, path, params, opts)
  if (doc.status !== 'OK') throw new Error(`${authority.name}: ${doc.text || doc.status}`)
  return doc.data
}

const iso = seconds => (seconds ? new Date(seconds * 1000).toISOString() : null)
const capitalize = text => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '')

function translate(authority, value) {
  if (!value) return ''
  const lang = authority.api.language || 'en'
  return value.translations?.[lang] || value.someTranslation || Object.values(value.translations || {})[0] || ''
}

// Alert descriptions are small HTML snippets; turn them into plain text with line breaks.
function htmlToText(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(
    html.replace(/<li[^>]*>/gi, '\n• ').replace(/<\/(p|div|ul|ol|h\d)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n'),
    'text/html')
  return (doc.body.textContent || '').replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function toRoute(id, r) {
  return {
    id,
    name: r?.shortName || id,
    longName: r?.description || r?.longName || '',
    color: '#' + (r?.color || '555555'),
    textColor: '#' + (r?.textColor || 'FFFFFF')
  }
}

// --- alerts -------------------------------------------------------------------

export async function getAlerts(authority, { signal } = {}) {
  // listView=true is the curated list BKK shows riders (without e.g. MÁV dwell-time notices).
  const data = await futar(authority, '/alert-search.json', { listView: true, includeReferences: 'COMPACT' }, { signal })
  const refs = data.references || {}
  const now = Date.now() / 1000
  return (data.entry.alertIds || []).map(id => refs.alerts?.[id]).filter(a => a && !a.disableApp).map(a => {
    const header = capitalize(translate(authority, a.header).trim())
    const routes = (a.routeIds || []).map(rid => toRoute(rid, refs.routes?.[rid]))
    const routeTypes = new Set((a.vehicleRouteTypes || []).map(t => ROUTE_TYPE[t]).filter(t => t != null))
    for (const rid of a.routeIds || []) {
      const t = ROUTE_TYPE[refs.routes?.[rid]?.type]
      if (t != null) routeTypes.add(t)
    }
    const started = !a.start || a.start <= now
    return {
      id: a.id,
      title: routes.length ? `${header}: ${routes.map(r => r.name).join(', ')}` : header,
      header,
      description: htmlToText(translate(authority, a.description)),
      effect: header || 'Notice',
      cause: '',
      // FUTÁR has no severity; derive one so the UI can rank alerts.
      severity: a.effectType === 'NO_SERVICE' ? 7 : (a.priority ?? 1) >= 2 ? 4 : 3,
      lifecycle: !started ? 'UPCOMING' : now - a.start < 24 * 3600 ? 'NEW' : 'ONGOING',
      timeframe: '',
      activePeriods: a.start ? [{ start: iso(a.start), end: iso(a.end) }] : [],
      routeTypes: [...routeTypes],
      routes,
      updatedAt: iso(a.modifiedTime || a.timestamp),
      url: translate(authority, a.url)
    }
  })
}

// --- stops ----------------------------------------------------------------------

const CACHE_HOURS = 24
const CACHE_VERSION = 2 // bump when the cached shape changes
const TILES = 5        // the area is loaded as TILES × TILES requests…
const PARALLEL = 6     // …this many at a time. One request may return at most ~5,000 stops.

function readCache(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null')
    if (cached && Date.now() - cached.at < CACHE_HOURS * 3600 * 1000) return cached.network
  } catch { /* storage blocked or corrupt */ }
  return null
}
function writeCache(key, network) {
  try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), network })) } catch { /* full or blocked */ }
}

// FUTÁR has no "all stops" or "all routes" endpoint. Both come from one tiled
// load of stops-for-location over api.stopsArea: the stops, plus the routes
// serving them (from the response's references). Shared by getStops and
// getLines, and cached in localStorage for 24 h.
const loading = new Map() // authority id → Promise of { stops, lines }

function loadNetwork(authority, signal) {
  if (!loading.has(authority.id)) {
    const p = fetchNetwork(authority, signal)
    p.catch(() => loading.delete(authority.id))
    loading.set(authority.id, p)
  }
  return loading.get(authority.id)
}

async function fetchNetwork(authority, signal) {
  const cacheKey = `network:v${CACHE_VERSION}:${authority.id}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  const { south, west, north, east } = authority.api.stopsArea
  const latStep = (north - south) / TILES
  const lonStep = (east - west) / TILES
  const tiles = []
  for (let i = 0; i < TILES; i++) {
    for (let j = 0; j < TILES; j++) {
      tiles.push({
        lat: (south + (i + 0.5) * latStep).toFixed(5),
        lon: (west + (j + 0.5) * lonStep).toFixed(5),
        latSpan: (latStep / 2).toFixed(5),
        lonSpan: (lonStep / 2).toFixed(5)
      })
    }
  }

  const all = new Map()
  const routes = new Map()
  let next = 0
  async function worker() {
    while (next < tiles.length) {
      const tile = tiles[next++]
      const data = await futar(authority, '/stops-for-location.json', { ...tile, includeReferences: 'COMPACT' }, { signal })
      if (data.limitExceeded) throw new Error(`${authority.name}: too many stops in one area. Increase TILES in bkk-futar.js.`)
      for (const s of data.list) all.set(s.id, s)
      for (const [id, r] of Object.entries(data.references?.routes || {})) routes.set(id, r)
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker))

  // Which vehicle types stop at each stop area (from its platforms).
  const typesByArea = new Map()
  for (const s of all.values()) {
    if (s.parentStationId && s.type) {
      if (!typesByArea.has(s.parentStationId)) typesByArea.set(s.parentStationId, new Set())
      typesByArea.get(s.parentStationId).add(s.type)
    }
  }

  const stops = [...all.values()]
    .filter(s => s.locationType === 1 || !s.parentStationId)
    .map(s => {
      const types = typesByArea.get(s.id) || new Set(s.type ? [s.type] : [])
      const kinds = KIND_ORDER.filter(t => types.has(t)).map(t => STOP_KIND[t])
      return {
        id: s.id,
        name: s.name,
        kind: kinds.join(', ') || 'Stop',
        isStation: [...types].some(t => STATION_TYPES.has(t)),
        municipality: s.localityName || '' // a postal code, e.g. 1013
      }
    })

  const lines = [...routes]
    .filter(([, r]) => ROUTE_TYPE[r.type] != null)
    .sort(([, a], [, b]) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(([id, r]) => ({ ...toRoute(id, r), routeType: ROUTE_TYPE[r.type] }))

  const network = { stops, lines }
  writeCache(cacheKey, network)
  return network
}

// Stop areas (like stations) and stand-alone stops. Platforms are left out:
// pick their stop area, which returns departures for all of its platforms.
export async function getStops(authority, { signal } = {}) {
  return (await loadNetwork(authority, signal)).stops
}

// --- lines ----------------------------------------------------------------------

// The routes that serve stops in api.stopsArea, in BKK's order (sortOrder).
export async function getLines(authority, { signal } = {}) {
  return (await loadNetwork(authority, signal)).lines
}

// --- predictions ------------------------------------------------------------------

export async function getPredictions(authority, stopId, { signal } = {}) {
  const data = await futar(authority, '/arrivals-and-departures-for-stop.json', {
    stopId,
    minutesBefore: 0,
    minutesAfter: 90,
    limit: 60,
    includeVehicleFromTrip: true,
    includeReferences: 'COMPACT'
  }, { signal })
  const refs = data.references || {}
  return (data.entry.stopTimes || []).map(st => {
    const trip = refs.trips?.[st.tripId]
    const routeId = trip?.routeId || st.vehicle?.routeId
    const route = refs.routes?.[routeId]
    const platform = refs.stops?.[st.stopId]
    return {
      id: `${st.tripId}:${st.stopId}:${st.stopSequence}`,
      routeType: ROUTE_TYPE[route?.type] ?? null,
      route: toRoute(routeId, route),
      destination: st.stopHeadsign || trip?.tripHeadsign || '',
      platform: platform?.platformCode ? `Platform ${platform.platformCode}` : '',
      arrivalTime: iso(st.predictedArrivalTime ?? st.arrivalTime),
      departureTime: iso(st.predictedDepartureTime ?? st.departureTime),
      status: '',
      scheduleRelationship: st.canceled ? 'CANCELLED' : 'SCHEDULED',
      nonRevenue: false,
      hasVehicle: Boolean(st.vehicle),
      vehicleStoppedHere: st.vehicle?.status === 'STOPPED_AT' && st.vehicle.stopId === st.stopId
    }
  })
}

// --- facilities ----------------------------------------------------------------------

export async function getFacilities() {
  return [] // FUTÁR has no facilities data (capabilities.facilities is false)
}
