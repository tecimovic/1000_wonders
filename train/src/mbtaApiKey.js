import { shallowRef, readonly } from 'vue'
import { decryptSecret } from './crypto.js'
import { encryptedMbtaApiKey } from './secrets.js'

// The decrypted MBTA API key, shared by the whole app.
// null until unlock() succeeds. Read it anywhere with useMbtaApiKey().
const apiKey = shallowRef(null)

export function useMbtaApiKey() {
  return readonly(apiKey)
}

// Tries to decrypt the key with the password. Returns true on success.
export async function unlock(password) {
  const key = await decryptSecret(encryptedMbtaApiKey, password)
  apiKey.value = key
  return key !== null
}
