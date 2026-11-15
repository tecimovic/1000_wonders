#!/usr/bin/env node
// Encrypts a secret (e.g. a transit API key) with a password, for embedding in
// the source code. Use the same password as the existing keys: the app unlocks
// all of them with the one password the user types in.
// Prints only the encrypted string. The secret and password are read from
// stdin (prompted when interactive), never from arguments, so they don't land
// in shell history.
//
//   node train/scripts/encrypt-secret.mjs
//
// Paste the output into the authority's "encryptedApiKey" in
// train/src/supportedTransitAuthorities.json.

import { createInterface } from 'node:readline/promises'
import { encryptSecret, decryptSecret } from '../src/crypto.js'

async function readInputs() {
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stderr })
    const secret = await rl.question('Secret: ')
    const password = await rl.question('Password: ')
    rl.close()
    return [secret, password]
  }
  let text = ''
  for await (const chunk of process.stdin) text += chunk
  return text.split(/\r?\n/)
}

const [secret, password] = await readInputs()
if (!secret || !password) {
  console.error('Both a secret and a password are required.')
  process.exit(1)
}

const blob = await encryptSecret(secret, password)
if ((await decryptSecret(blob, password)) !== secret) {
  console.error('Round-trip check failed.')
  process.exit(1)
}
console.log(blob)
