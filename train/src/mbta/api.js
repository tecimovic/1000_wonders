// Minimal client for the MBTA V3 API (https://api-v3.mbta.com).
// Docs: doc/mbta/README.md and doc/mbta/mbta-v3-api-reference.md.

import { useMbtaApiKey } from '../mbtaApiKey.js'

const BASE_URL = 'https://api-v3.mbta.com'
const apiKey = useMbtaApiKey()

export class MbtaError extends Error {}

// GET a V3 endpoint. `params` values may be strings, numbers or arrays
// (arrays are comma-joined), e.g. { 'filter[stop]': ['a', 'b'], include: 'route' }.
// Returns the parsed JSON:API document.
export async function mbtaGet(path, params = {}, { signal } = {}) {
  const url = new URL(path, BASE_URL)
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(name, Array.isArray(value) ? value.join(',') : String(value))
  }
  const headers = apiKey.value ? { 'x-api-key': apiKey.value } : {}
  let response
  try {
    response = await fetch(url, { headers, signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new MbtaError('Could not reach the MBTA API.')
  }
  if (response.status === 429) throw new MbtaError('Too many requests to the MBTA API. Try again in a minute.')
  if (!response.ok) throw new MbtaError(`The MBTA API answered ${response.status}.`)
  return response.json()
}

// Looks up resources from a document's `included[]` by type and id:
//   const lookup = includedLookup(doc); lookup('route', 'Red')
export function includedLookup(doc) {
  const byKey = new Map((doc.included || []).map(r => [r.type + ':' + r.id, r]))
  return (type, id) => (id == null ? null : byKey.get(type + ':' + id) || null)
}

// The id a relationship points at, or null.
export const relId = (resource, name) => resource?.relationships?.[name]?.data?.id ?? null

// GTFS route_type → mode, with MBTA's mode colors.
export const MODES = {
  0: { name: 'Light Rail', color: '#00843D' },
  1: { name: 'Subway', color: '#DA291C' },
  2: { name: 'Commuter Rail', color: '#80276C' },
  3: { name: 'Bus', color: '#FFC72C' },
  4: { name: 'Ferry', color: '#008EAA' }
}

// Times in the API are Boston local time; show them that way everywhere.
const clock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' })
const dateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
})
export const formatClock = iso => (iso ? clock.format(new Date(iso)) : '')
export const formatDateTime = iso => (iso ? dateTime.format(new Date(iso)) : '')

// "SOME_ENUM_VALUE" → "Some enum value"
export const humanize = value =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ') : ''
