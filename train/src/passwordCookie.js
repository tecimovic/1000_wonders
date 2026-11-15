// Remembers the password that unlocks the MBTA API key, for 7 days.

const NAME = 'mbtaApiKeyPassword'
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60
const ATTRIBUTES = '; Path=/train/; SameSite=Strict' + (location.protocol === 'https:' ? '; Secure' : '')

// The stored password, or null if there is none.
export function readPasswordCookie() {
  const entry = document.cookie.split('; ').find(c => c.startsWith(NAME + '='))
  const value = entry ? decodeURIComponent(entry.slice(NAME.length + 1)) : ''
  return value || null
}

export function savePasswordCookie(password) {
  document.cookie = `${NAME}=${encodeURIComponent(password)}; Max-Age=${MAX_AGE_SECONDS}${ATTRIBUTES}`
}

export function clearPasswordCookie() {
  document.cookie = `${NAME}=; Max-Age=0${ATTRIBUTES}`
}
