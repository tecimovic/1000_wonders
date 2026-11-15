// API types → adapters. An authority's `api.type` in
// supportedTransitAuthorities.json picks its adapter here.
//
// Every adapter exports the same interface (see "train: transit authorities"
// in AGENTS.md): modes, capabilities, getAlerts, getStops, getPredictions,
// getFacilities. Each function takes the authority (with its decrypted
// `apiKey`) first and returns normalized objects, so the UI never sees
// API-specific formats.

import * as mbtaV3 from './mbta-v3.js'
import * as bkkFutar from './bkk-futar.js'

const adapters = {
  'mbta-v3': mbtaV3,
  'bkk-futar': bkkFutar
}

export function adapterFor(type) {
  const adapter = adapters[type]
  if (!adapter) throw new Error(`No adapter for API type "${type}". Known types: ${Object.keys(adapters).join(', ')}.`)
  return adapter
}
