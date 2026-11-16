// The transit authorities the app can show, and which one is selected.
//
// The list itself is train/src/supportedTransitAuthorities.json. Every API key
// in it is encrypted with the same password; unlock(password) decrypts them
// all and keeps the plaintext keys in memory only.

import { ref, shallowRef, computed } from 'vue'
import supportedTransitAuthorities from '../supportedTransitAuthorities.json'
import { decryptSecret } from '../crypto.js'
import { adapterFor } from './adapters/index.js'

export { supportedTransitAuthorities }

const STORAGE_KEY = 'transitAuthority'
const byId = id => supportedTransitAuthorities.find(a => a.id === id)

const keys = shallowRef(new Map()) // authority id → decrypted API key ('' if none needed)
const currentId = ref(initialId())

function initialId() {
  const fromUrl = new URLSearchParams(location.search).get('authority')
  let saved = null
  try { saved = localStorage.getItem(STORAGE_KEY) } catch { /* storage blocked */ }
  return [fromUrl, saved].find(id => id && byId(id)) || supportedTransitAuthorities[0].id
}

// Decrypts every authority's API key with the password. Returns true if the
// password is right, i.e. it opens at least one key. (All keys use the same
// password; an authority whose key doesn't open is shown as unavailable.)
export async function unlock(password) {
  const results = await Promise.all(supportedTransitAuthorities.map(async a => {
    const encrypted = a.api.encryptedApiKey
    return [a.id, encrypted ? await decryptSecret(encrypted, password) : '', Boolean(encrypted)]
  }))
  keys.value = new Map(results.filter(([, key]) => key !== null).map(([id, key]) => [id, key]))
  const anyEncrypted = results.some(([, , encrypted]) => encrypted)
  return !anyEncrypted || results.some(([, key, encrypted]) => encrypted && key !== null)
}

export const isAvailable = id => keys.value.has(id)

// All authorities, for a picker.
export const authorityChoices = computed(() =>
  supportedTransitAuthorities.map(a => ({ id: a.id, name: a.name, available: isAvailable(a.id) })))

export function selectAuthority(id) {
  if (!byId(id)) return
  currentId.value = id
  try { localStorage.setItem(STORAGE_KEY, id) } catch { /* storage blocked */ }
}

// The selected authority, with its decrypted key and a ready-to-use client:
//   const transit = useTransit()
//   await transit.value.client.getAlerts({ signal })
const current = computed(() => {
  let authority = byId(currentId.value)
  if (!isAvailable(authority.id)) {
    authority = supportedTransitAuthorities.find(a => isAvailable(a.id)) || authority
  }
  const withKey = { ...authority, apiKey: keys.value.get(authority.id) ?? null }
  const adapter = adapterFor(authority.api.type)
  const client = {}
  // searchStops and getStop are optional: adapters for systems with too many
  // stops to load at once search on the server instead of using getStops.
  for (const name of ['getLines', 'getAlerts', 'getStops', 'getPredictions', 'getFacilities', 'searchStops', 'getStop']) {
    if (adapter[name]) client[name] = (...args) => adapter[name](withKey, ...args)
  }
  return { authority: withKey, adapter, client, modes: adapter.modes, capabilities: adapter.capabilities }
})

export const useTransit = () => current
