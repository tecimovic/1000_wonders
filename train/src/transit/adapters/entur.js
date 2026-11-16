// Adapter for Entur's Journey Planner v3 (GraphQL), Norway's national API for
// all public transport. Used for Oslo (Ruter, plus the trains and other
// operators that serve Ruter's stops).
// Docs: doc/entur/README.md and doc/entur/journey-planner-v3.graphql.
//
// Entur needs no API key, but every client must name itself in an
// ET-Client-Name header ("<company>-<application>"): put it in `api.headers`.
//
// Authority options used (in supportedTransitAuthorities.json → api):
//   baseUrl     https://api.entur.io/journey-planner/v3
//   headers     { "ET-Client-Name": "..." }
//   language    which translation of alert texts to show ("en" or "no"), default "en"
//   stopsArea   { south, west, north, east }: where to load stops from
//   codespace   e.g. "RUT": only stops served by this codespace's lines (and
//               train stations) are kept. Entur covers all of Norway; this
//               keeps the app to one region.

import { postJson } from '../http.js'
import { GTFS_MODES } from '../format.js'

export const capabilities = { lines: true, alerts: true, stops: true, predictions: true, facilities: false }

// Entur TransportMode → GTFS route type (200 = coach, an extended route type).
// Modes left out (air, taxi, carpool, snowAndIce) aren't shown.
const ROUTE_TYPE = {
  tram: 0, metro: 1, rail: 2, bus: 3, water: 4, cableway: 6, lift: 6, funicular: 7, trolleybus: 11, monorail: 12, coach: 200
}

// Ruter's mode names and colors (trains use Vy's green).
export const modes = {
  ...GTFS_MODES,
  0: { name: 'Tram', color: '#0B91EF' },
  1: { name: 'Metro (T-bane)', color: '#EC700C' },
  2: { name: 'Train', color: '#00824A' },
  3: { name: 'Bus', color: '#E60000' },
  4: { name: 'Ferry', color: '#682C88' },
  200: { name: 'Coach', color: '#76A300' }
}

const STOP_KIND = { rail: 'Train', metro: 'Metro', tram: 'Tram', bus: 'Bus', coach: 'Coach', water: 'Ferry' }
const KIND_ORDER = ['rail', 'metro', 'tram', 'bus', 'coach', 'water']
const STATION_MODES = new Set(['rail', 'metro'])

// --- helpers ------------------------------------------------------------------

async function graphql(authority, query, variables, signal) {
  const doc = await postJson(authority, '/graphql', { query, variables }, { signal })
  if (doc.errors?.length) throw new Error(`${authority.name}: ${doc.errors[0].message}`)
  return doc.data
}

const LINE_FIELDS = 'id publicCode name transportMode presentation { colour textColour }'

function toRoute(line) {
  const name = line?.publicCode || line?.name?.trim() || line?.id || ''
  const longName = line?.name?.trim() || ''
  const fallback = modes[ROUTE_TYPE[line?.transportMode]]?.color || '#555555'
  return {
    id: line?.id || '',
    name,
    longName: longName === name ? '' : longName,
    color: line?.presentation?.colour ? '#' + line.presentation.colour : fallback,
    textColor: line?.presentation?.textColour ? '#' + line.presentation.textColour : '#FFFFFF'
  }
}

const codespaceOf = id => (id || '').split(':')[0]
const natural = new Intl.Collator('en', { numeric: true })

// --- the network: stops and lines -------------------------------------------------

const CACHE_HOURS = 24
const CACHE_VERSION = 1 // bump when the cached shape changes

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

// Entur has no "all stops of a region" query, and its stopPlacesByBbox
// `authority` filter returns nothing. So: load every stop in api.stopsArea with
// the ids of the lines at each quay, keep the stops served by api.codespace
// (and train stations), then load the details of the lines at those stops. Shared by getStops,
// getLines and getAlerts, and cached in localStorage for 24 h.
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
  const { stopPlacesByBbox } = await graphql(authority, `
    query ($south: Float!, $west: Float!, $north: Float!, $east: Float!) {
      stopPlacesByBbox(minimumLatitude: $south, minimumLongitude: $west, maximumLatitude: $north,
                       maximumLongitude: $east, filterByInUse: true, multiModalMode: parent) {
        id name transportMode
        tariffZones { id name }
        quays(filterByInUse: true) { lines { id } }
      }
    }`, { south, west, north, east }, signal)

  const codespace = authority.api.codespace
  const stops = []
  const lineIds = new Set()     // lines at stops the codespace serves
  const stationLines = new Set() // lines at train stations it doesn't serve: only their trains are kept
  for (const s of stopPlacesByBbox) {
    const ids = (s.quays || []).flatMap(q => q?.lines || []).map(l => l.id)
    const stopModes = s.transportMode || []
    // Train stations are kept even without the codespace's lines: Ruter serves
    // Jernbanetorget, not Oslo S next to it.
    const served = !codespace || ids.some(id => codespaceOf(id) === codespace)
    if (!served && !stopModes.includes('rail')) continue
    ids.forEach(id => (served ? lineIds : stationLines).add(id))
    // Ruter's own zones (RUT:TariffZone:…) are the ones riders know: "Zone 1", "2V", …
    const zones = [...new Set((s.tariffZones || [])
      .filter(z => z && codespaceOf(z.id) === codespace && z.id.includes(':TariffZone:'))
      .map(z => z.name))]
    stops.push({
      id: s.id,
      name: s.name,
      kind: KIND_ORDER.filter(m => stopModes.includes(m)).map(m => STOP_KIND[m]).join(', ') || 'Stop',
      isStation: stopModes.some(m => STATION_MODES.has(m)),
      municipality: zones.length ? `Zone ${zones.join(', ')}` : ''
    })
  }

  const { lines: details } = await graphql(authority, `
    query ($ids: [ID]) { lines(ids: $ids) { ${LINE_FIELDS} } }`, { ids: [...new Set([...lineIds, ...stationLines])] }, signal)
  const lines = details
    .filter(l => l && ROUTE_TYPE[l.transportMode] != null)
    .filter(l => lineIds.has(l.id) || l.transportMode === 'rail')
    .map(l => ({ ...toRoute(l), routeType: ROUTE_TYPE[l.transportMode] }))
    .sort((a, b) => natural.compare(a.name, b.name))

  const network = { stops, lines }
  writeCache(cacheKey, network)
  return network
}

// Stop places (a multi-modal station like Oslo S is one stop; its departures
// include all of its parts).
export async function getStops(authority, { signal } = {}) {
  return (await loadNetwork(authority, signal)).stops
}

// --- lines ----------------------------------------------------------------------

// The lines that serve the region's stops, sorted by name (1, 2, …, 10, …).
export async function getLines(authority, { signal } = {}) {
  return (await loadNetwork(authority, signal)).lines
}

// --- alerts -------------------------------------------------------------------

// Entur's severity is nearly always "normal"; general info messages rank lowest.
const SEVERITY = { verySevere: 9, severe: 7, normal: 5, slight: 3, verySlight: 2, noImpact: 1, unknown: 3 }

function translate(authority, texts) {
  const lang = authority.api.language || 'en'
  const list = (texts || []).filter(t => t.value?.trim())
  const pick = list.find(t => t.language === lang) || list.find(t => t.language === 'no' || t.language === 'nb') || list[0]
  return pick?.value.trim() || ''
}

export async function getAlerts(authority, { signal } = {}) {
  const network = await loadNetwork(authority, signal)
  const areaLines = new Set(network.lines.map(l => l.id))
  const areaStops = new Set(network.stops.map(s => s.id))
  // Situations are published per codespace: ask for those of the region's lines.
  const codespaces = [...new Set(network.lines.map(l => codespaceOf(l.id)))]

  // Stops are often given as a quay (platform) only, so ask for both.
  const stop = 'stopPlace { id parent { id } } quay { stopPlace { id parent { id } } }'
  const { situations } = await graphql(authority, `
    query ($codespaces: [String]) {
      situations(codespaces: $codespaces) {
        id severity reportType creationTime versionedAtTime
        summary { value language } description { value language } advice { value language }
        infoLinks { uri }
        validityPeriods { startTime endTime }
        affects {
          __typename
          ... on AffectedLine { line { ${LINE_FIELDS} } }
          ... on AffectedStopPlace { ${stop} }
          ... on AffectedStopPlaceOnLine { ${stop} line { ${LINE_FIELDS} } }
          ... on AffectedServiceJourney { serviceJourney { line { ${LINE_FIELDS} } } }
          ... on AffectedStopPlaceOnServiceJourney { ${stop} serviceJourney { line { ${LINE_FIELDS} } } }
        }
      }
    }`, { codespaces }, signal)

  const now = Date.now()
  const alerts = []
  for (const s of situations) {
    const lines = new Map()
    let touchesAreaStop = false
    for (const a of s.affects || []) {
      const line = a.line || a.serviceJourney?.line
      if (line && ROUTE_TYPE[line.transportMode] != null) lines.set(line.id, line)
      const sp = a.stopPlace || a.quay?.stopPlace
      if (sp && (areaStops.has(sp.id) || areaStops.has(sp.parent?.id))) touchesAreaStop = true
    }
    // Codespaces like Vy's cover all of Norway: keep only what touches the region.
    if (!touchesAreaStop && ![...lines.keys()].some(id => areaLines.has(id))) continue

    const general = s.reportType === 'general'
    // A whole line affected (detour, closure) vs. only some of its stops (moved, closed).
    const wholeLine = (s.affects || []).some(a => a.__typename === 'AffectedLine' || a.__typename === 'AffectedServiceJourney')
    const periods = (s.validityPeriods || []).map(p => ({ start: p.startTime || null, end: p.endTime || null }))
    const started = !periods.length || periods.some(p => !p.start || Date.parse(p.start) <= now)
    const summary = translate(authority, s.summary)
    alerts.push({
      id: s.id,
      title: summary,
      header: summary,
      description: [translate(authority, s.description), translate(authority, s.advice)].filter(Boolean).join('\n\n'),
      effect: general ? 'Information' : wholeLine || !touchesAreaStop ? 'Line changes' : 'Stop changes',
      cause: '',
      severity: general ? 1 : SEVERITY[s.severity] ?? 5,
      lifecycle: !started ? 'UPCOMING' : s.creationTime && now - Date.parse(s.creationTime) < 24 * 3600 * 1000 ? 'NEW' : 'ONGOING',
      timeframe: '',
      activePeriods: periods,
      routeTypes: [...new Set([...lines.values()].map(l => ROUTE_TYPE[l.transportMode]))],
      routes: [...lines.values()].map(toRoute).sort((a, b) => natural.compare(a.name, b.name)),
      updatedAt: s.versionedAtTime || s.creationTime || null,
      url: s.infoLinks?.[0]?.uri || ''
    })
  }
  return alerts
}

// --- predictions ------------------------------------------------------------------

export async function getPredictions(authority, stopId, { signal } = {}) {
  const { stopPlace } = await graphql(authority, `
    query ($id: String!) {
      stopPlace(id: $id) {
        estimatedCalls(numberOfDepartures: 60, timeRange: 5400, includeCancelledTrips: true) {
          date realtime cancellation extraCall
          expectedArrivalTime expectedDepartureTime actualArrivalTime actualDepartureTime
          quay { id publicCode }
          destinationDisplay { frontText }
          serviceJourney { id line { ${LINE_FIELDS} } }
        }
      }
    }`, { id: stopId }, signal)
  return (stopPlace?.estimatedCalls || []).map(c => {
    const line = c.serviceJourney.line
    const routeType = ROUTE_TYPE[line.transportMode] ?? null
    const code = c.quay?.publicCode
    return {
      id: `${c.serviceJourney.id}:${c.date}:${c.quay?.id}`,
      routeType,
      route: toRoute(line),
      destination: c.destinationDisplay?.frontText || '',
      platform: code ? `${routeType === 2 ? 'Track' : 'Platform'} ${code}` : '',
      arrivalTime: c.expectedArrivalTime || null,
      departureTime: c.expectedDepartureTime || null,
      status: '',
      scheduleRelationship: c.cancellation ? 'CANCELLED' : c.extraCall ? 'ADDED' : 'SCHEDULED',
      nonRevenue: false,
      hasVehicle: c.realtime,
      vehicleStoppedHere: Boolean(c.actualArrivalTime && !c.actualDepartureTime)
    }
  })
}

// --- facilities ----------------------------------------------------------------------

export async function getFacilities() {
  return [] // the Journey Planner has no facilities data (capabilities.facilities is false)
}
