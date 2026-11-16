<script setup>
import { ref, onMounted } from 'vue'
import LandingPage from './components/LandingPage.vue'
import PasswordPage from './components/PasswordPage.vue'
import { cryptoAvailable } from './crypto.js'
import { unlock, lock } from './transit/authorities.js'
import { readPasswordCookie, savePasswordCookie, clearPasswordCookie } from './passwordCookie.js'

// 'checking' → 'password' or 'landing'. ('unsupported' if the browser can't decrypt.)
const view = ref('checking')
const invalid = ref(false)
const busy = ref(false)

// On load: a stored password that still decrypts the key goes straight in.
onMounted(async () => {
  if (!cryptoAvailable()) {
    view.value = 'unsupported'
    return
  }
  const stored = readPasswordCookie()
  if (stored && (await unlock(stored))) {
    view.value = 'landing'
    return
  }
  if (stored) {
    // A password was stored but no longer works.
    clearPasswordCookie()
    invalid.value = true
  }
  view.value = 'password'
})

async function onSubmit(password) {
  if (!password) {
    invalid.value = false // nothing entered: no error, just stay
    return
  }
  busy.value = true
  const ok = await unlock(password)
  busy.value = false
  if (ok) {
    savePasswordCookie(password) // expires in 7 days
    invalid.value = false
    view.value = 'landing'
  } else {
    invalid.value = true
  }
}

// Logout: delete the cookie, forget the decrypted keys, back to the password page.
function onLogout() {
  clearPasswordCookie()
  lock()
  invalid.value = false
  view.value = 'password'
}
</script>

<template>
  <LandingPage v-if="view === 'landing'" @logout="onLogout" />
  <PasswordPage v-else-if="view === 'password'" :invalid="invalid" :busy="busy" @submit="onSubmit" />
  <div v-else-if="view === 'unsupported'" class="page">
    <p class="sub">This page needs a secure (HTTPS) connection.</p>
  </div>
  <div v-else class="page" aria-busy="true"></div>
</template>

<style>
:root {
  --bg: #070912;
  --ink: #eef0ff;
  --muted: #8c93b8;
  --accent: #ff8a3d;
  --accent-2: #ffd166;
  --line: #262a52;
  --line-soft: #191c3a;
  color-scheme: dark;
}

* { box-sizing: border-box; }

html, body { margin: 0; height: 100%; }

body {
  background: var(--bg);
  color: var(--ink);
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 48px 16px 24px;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, #1c1a4a 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 80% 100%, #3a1d14 0%, transparent 70%),
    var(--bg);
}

header { text-align: center; }

.eyebrow {
  margin: 0 0 12px;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

h1 {
  margin: 0;
  font-size: clamp(34px, 7.5vw, 92px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  text-wrap: balance;
}

h1 span {
  background: linear-gradient(100deg, var(--accent-2), var(--accent) 50%, #e5484d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 18px;
}

footer a {
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
}
footer a:hover { color: var(--ink); }

/* ── Shared building blocks for the app pages ── */
body {
  background:
    radial-gradient(ellipse 80% 40% at 50% 0%, #1c1a4a 0%, transparent 70%),
    var(--bg);
  background-attachment: fixed;
}

.card {
  background: #0d0f22;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px 18px 16px;
  box-shadow: 0 20px 60px -30px #000;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.card h2 { margin: 0; font-size: 18px; letter-spacing: -0.01em; }

.tools { display: flex; gap: 6px; flex-wrap: wrap; }
button.ghost {
  padding: 6px 12px;
  font: inherit;
  font-size: 13px;
  color: var(--ink);
  background: #151834;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
}
button.ghost:hover:not(:disabled) { border-color: var(--accent); }
button.ghost:disabled { opacity: .5; cursor: default; }

.muted { color: var(--muted); }
.small { font-size: 13px; }
.error-box {
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #2a1016;
  border: 1px solid #5c1f29;
  color: #ffb3b3;
}

.route-chip {
  display: inline-block;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}
</style>
