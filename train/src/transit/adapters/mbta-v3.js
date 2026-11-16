// Adapter for the MBTA V3 API (JSON:API over GTFS / GTFS-Realtime data).
// Docs: doc/mbta/README.md and doc/mbta/mbta-v3-api-reference.md.

import { getJson } from '../http.js'
import { GTFS_MODES, humanize } from '../format.js'

export const capabilities = { lines: true, alerts: true, stops: true, predictions: true, facilities: true }

// MBTA's own mode names and colors.
export const modes = {
  ...GTFS_MODES,
  0: { name: 'Light Rail', color: '#00843D' },
  1: { name: 'Subway', color: '#DA291C' },
  2: { name: 'Commuter Rail', color: '#80276C' },
  3: { name: 'Bus', color: '#FFC72C' },
  4: { name: 'Ferry', color: '#008EAA' }
}

// --- JSON:API helpers ---------------------------------------------------------

function includedLookup(doc) {
  const byKey = new Map((doc.included || []).map(r => [r.type + ':' + r.id, r]))
  return (type, id) => (id == null ? null : byKey.get(type + ':' + id) || null)
}
const relId = (resource, name) => resource?.relationships?.[name]?.data?.id ?? null

function toRoute(id, route) {
  const r = route?.attributes || {}
  return {
    id,
    name: r.short_name || r.long_name || id,
    longName: r.long_name || '',
    color: '#' + (r.color || '555555'),
    textColor: '#' + (r.text_color || 'FFFFFF')
  }
}

// --- lines ----------------------------------------------------------------------

// Every publicly listed route, in MBTA's own order (sort_order).
export async function getLines(authority, { signal } = {}) {
  const doc = await getJson(authority, '/routes', {
    sort: 'sort_order',
    'fields[route]': 'short_name,long_name,color,text_color,type'
  }, { signal })
  return doc.data.map(r => ({ ...toRoute(r.id, r), routeType: r.attributes.type }))
}

// --- alerts -------------------------------------------------------------------

export async function getAlerts(authority, { signal } = {}) {
  const doc = await getJson(authority, '/alerts', {
    include: 'routes',
    'fields[alert]': 'header,service_effect,effect,effect_name,cause,severity,lifecycle,timeframe,description,active_period,informed_entity,updated_at,url',
    'fields[route]': 'short_name,long_name,color,text_color'
  }, { signal })
  const lookup = includedLookup(doc)
  return doc.data.map(({ id, attributes: a }) => {
    const entities = a.informed_entity || []
    return {
      id,
      title: a.service_effect || a.header,
      header: a.header,
      description: a.description || '',
      effect: a.effect_name || humanize(a.effect),
      cause: humanize(a.cause),
      severity: a.severity ?? 0,
      lifecycle: a.lifecycle || '',
      timeframe: a.timeframe || '',
      activePeriods: (a.active_period || []).map(p => ({ start: p.start, end: p.end })),
      routeTypes: [...new Set(entities.map(e => e.route_type).filter(t => t != null))],
      routes: [...new Set(entities.map(e => e.route).filter(Boolean))].map(rid => toRoute(rid, lookup('route', rid))),
      updatedAt: a.updated_at,
      url: a.url || ''
    }
  })
}

// --- stops ----------------------------------------------------------------------

function stopKind(a) {
  if (a.location_type === 1) return 'Station'
  if (a.vehicle_type === 3) return 'Bus stop'
  if (a.vehicle_type === 4) return 'Ferry'
  return 'Stop'
}

// Stations and stand-alone stops (platforms are left out: pick their station).
export async function getStops(authority, { signal } = {}) {
  const doc = await getJson(authority, '/stops', {
    'filter[location_type]': '0,1',
    'fields[stop]': 'name,location_type,vehicle_type,municipality'
  }, { signal })
  return doc.data
    .filter(s => s.attributes.location_type === 1 || !relId(s, 'parent_station'))
    .map(({ id, attributes: a }) => {
      const kind = stopKind(a)
      return { id, name: a.name, kind, isStation: kind === 'Station', municipality: a.municipality || '' }
    })
}

// --- predictions ------------------------------------------------------------------

export async function getPredictions(authority, stopId, { signal } = {}) {
  const doc = await getJson(authority, '/predictions', {
    'filter[stop]': stopId,
    include: 'route,trip,stop,vehicle',
    'fields[route]': 'short_name,long_name,color,text_color,type,direction_destinations',
    'fields[trip]': 'headsign',
    'fields[stop]': 'platform_name,platform_code',
    'fields[vehicle]': 'current_status'
  }, { signal })
  const lookup = includedLookup(doc)
  return doc.data.map(p => {
    const a = p.attributes
    const routeId = relId(p, 'route')
    const route = lookup('route', routeId)
    const trip = lookup('trip', relId(p, 'trip'))
    const platform = lookup('stop', relId(p, 'stop'))
    const vehicle = lookup('vehicle', relId(p, 'vehicle'))
    return {
      id: p.id,
      routeType: route?.attributes.type ?? null,
      route: toRoute(routeId, route),
      destination: a.trip_headsign || trip?.attributes.headsign || route?.attributes.direction_destinations?.[a.direction_id] || '',
      platform: platform?.attributes.platform_code
        ? `Track ${platform.attributes.platform_code}`
        : platform?.attributes.platform_name || '',
      arrivalTime: a.arrival_time,
      departureTime: a.departure_time,
      status: a.status || '',
      scheduleRelationship: a.schedule_relationship || 'SCHEDULED',
      nonRevenue: a.revenue === 'NON_REVENUE', // the spec calls it revenue_status; the live API says revenue
      hasVehicle: Boolean(vehicle),
      vehicleStoppedHere: vehicle?.attributes.current_status === 'STOPPED_AT' && relId(vehicle, 'stop') === relId(p, 'stop')
    }
  })
}

// --- facilities ----------------------------------------------------------------------

// Property names that are routing data or plumbing, not useful to riders.
const HIDDEN_PROPERTIES = new Set(['excludes-stop', 'payment-app-id', 'payment-app-url', 'contact-url', 'municipality'])
const YES_NO = new Set(['enclosed', 'secured', 'attended'])

export async function getFacilities(authority, stopId, { signal } = {}) {
  const doc = await getJson(authority, '/facilities', { 'filter[stop]': stopId }, { signal })
  return doc.data.map(({ id, attributes: a }) => {
    const merged = new Map()
    for (const { name, value } of a.properties || []) {
      if (HIDDEN_PROPERTIES.has(name)) continue
      let v = String(value)
      if (YES_NO.has(name)) v = v === '1' ? 'yes' : v === '2' ? 'no' : v
      merged.set(name, merged.has(name) ? merged.get(name) + ', ' + v : v)
    }
    return {
      id,
      type: humanize(a.type),
      name: a.long_name || a.short_name || id,
      properties: [...merged].map(([name, value]) => ({ name: humanize(name.replaceAll('-', '_')), value }))
    }
  })
}
