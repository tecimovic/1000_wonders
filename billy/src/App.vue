<script setup>
import GameScreen from './components/GameScreen.vue'
</script>

<template>
  <div class="app-root">
    <header class="top">
      <a href="/" class="all-apps-link">← All apps</a>
      <h1 class="title">Dead Set Billy</h1>
      <span class="help">← → walk · ↓ stop · ↑ or Space jump</span>
    </header>
    <GameScreen />
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  margin: 0;
}

body {
  overflow: hidden;
  background: #07051a;
  color: #f2ecd8;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.app-root {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
}

.all-apps-link {
  font-size: 0.85em;
  color: #6b6b9a;
  text-decoration: none;
  white-space: nowrap;
}

.all-apps-link:hover {
  color: #f2ecd8;
}

.title {
  margin: 0;
  font-size: 1.3em;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #f2ecd8;
}

.help {
  margin-left: auto;
  font-size: 0.85em;
  color: #6b6b9a;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .help {
    display: none;
  }
}
</style>
