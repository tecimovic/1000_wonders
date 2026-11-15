<script setup>
import TransitScene from './components/TransitScene.vue'
</script>

<template>
  <div class="page">
    <header>
      <p class="eyebrow">Now arriving · Line 1</p>
      <h1>Yay, <span>public transportation!</span></h1>
      <p class="sub">Something is being built here. Please mind the gap.</p>
    </header>

    <TransitScene />

    <footer>
      <a href="/">← All apps</a>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #070912;
  --ink: #eef0ff;
  --muted: #8c93b8;
  --accent: #ff8a3d;
  --accent-2: #ffd166;
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
</style>
