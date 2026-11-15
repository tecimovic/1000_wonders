// Password-based symmetric encryption using the Web Crypto API
// (works in browsers on HTTPS/localhost, and in Node 20+).
//
//   key        = PBKDF2-SHA256(password, random 16-byte salt, ITERATIONS) → 256 bits
//   ciphertext = AES-256-GCM(key, random 12-byte IV, plaintext)
//
// Everything is packed into one string:  v1.<iterations>.<salt>.<iv>.<ciphertext>
// (base64 parts). GCM is authenticated, so a wrong password fails to decrypt
// rather than producing garbage.

const ITERATIONS = 600000

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const toBase64 = bytes => btoa(String.fromCharCode(...bytes))
const fromBase64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0))

export const cryptoAvailable = () => Boolean(globalThis.crypto?.subtle)

async function deriveKey(password, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptSecret(plaintext, password, iterations = ITERATIONS) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, iterations)
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext)))
  return ['v1', iterations, toBase64(salt), toBase64(iv), toBase64(ciphertext)].join('.')
}

// Returns the plaintext, or null if the password is wrong (or the blob is malformed).
export async function decryptSecret(blob, password) {
  try {
    const [version, iterations, salt, iv, ciphertext] = blob.split('.')
    if (version !== 'v1') return null
    const key = await deriveKey(password, fromBase64(salt), Number(iterations))
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(ciphertext))
    return decoder.decode(plaintext)
  } catch {
    return null
  }
}
