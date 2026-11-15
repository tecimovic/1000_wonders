<script setup>
import { ref, watch } from 'vue'
import AlertsTree from './AlertsTree.vue'
import StopPicker from './StopPicker.vue'
import StopDetails from './StopDetails.vue'

// The selected stop is kept in the URL (?stop=place-pktrm) so it survives reloads
// and can be shared.
const initialStopId = new URLSearchParams(location.search).get('stop') || ''
const stop = ref(null)

watch(stop, s => {
  const url = new URL(location.href)
  if (s) url.searchParams.set('stop', s.id)
  else url.searchParams.delete('stop')
  history.replaceState(null, '', url)
})
</script>

<template>
  <div class="app-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Boston · MBTA live</p>
        <h1 class="title">Yay, <span>public transportation!</span></h1>
      </div>
      <a href="/" class="back">← All apps</a>
    </header>

    <main>
      <AlertsTree />

      <section class="card" aria-label="Stop information">
        <div class="card-head">
          <h2>Stop</h2>
        </div>
        <StopPicker v-model="stop" :initial-id="initialStopId" />
        <StopDetails v-if="stop" :stop="stop" />
        <p v-else class="muted hint">Pick a stop to see its arrivals, departures and facilities.</p>
      </section>
    </main>

    <footer class="credits muted small">
      Real-time data from the <a href="https://www.mbta.com/developers/v3-api" target="_blank" rel="noopener">MBTA V3 API</a>.
    </footer>
  </div>
</template>

<style scoped>
.app-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.topbar {
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
}
.topbar .eyebrow { margin-bottom: 6px; }
.title {
  font-size: clamp(26px, 4.5vw, 44px);
  text-align: left;
}
.back { color: var(--muted); text-decoration: none; font-size: 14px; white-space: nowrap; padding-bottom: 6px; }
.back:hover { color: var(--ink); }

main { display: grid; gap: 20px; }
.hint { margin: 14px 0 0; }

.credits { margin-top: 24px; text-align: center; }
.credits a { color: inherit; }
</style>
