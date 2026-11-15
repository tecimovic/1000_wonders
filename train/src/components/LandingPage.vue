<script setup>
import { ref, watch, computed } from 'vue'
import AlertsTree from './AlertsTree.vue'
import StopPicker from './StopPicker.vue'
import StopDetails from './StopDetails.vue'
import { useTransit, authorityChoices, selectAuthority } from '../transit/authorities.js'

const transit = useTransit()
const authority = computed(() => transit.value.authority)
const caps = computed(() => transit.value.capabilities)

// The selected authority and stop are kept in the URL
// (?authority=mbta&stop=place-pktrm) so they survive reloads and can be shared.
let initialStopId = new URLSearchParams(location.search).get('stop') || ''
const stop = ref(null)

function updateUrl() {
  const url = new URL(location.href)
  url.searchParams.set('authority', authority.value.id)
  if (stop.value) url.searchParams.set('stop', stop.value.id)
  else url.searchParams.delete('stop')
  history.replaceState(null, '', url)
}
watch(stop, updateUrl)
watch(() => authority.value.id, () => {
  // Stop ids belong to one authority: start over with no stop.
  initialStopId = ''
  stop.value = null
  updateUrl()
}, { immediate: false })
updateUrl()

function onAuthorityChange(event) {
  selectAuthority(event.target.value)
}
</script>

<template>
  <div class="app-page">
    <header class="topbar">
      <div class="heading">
        <p class="eyebrow">{{ authority.region }} · live</p>
        <h1 class="title">
          <label for="authority-select">Currently showing:</label>
          <span class="select-wrap">
            <!-- Invisible copy of the selected name: sizes the box to it, not to the longest option. -->
            <span class="sizer" aria-hidden="true">{{ authority.name }}</span>
            <select id="authority-select" :value="authority.id" @change="onAuthorityChange">
              <option v-for="a in authorityChoices" :key="a.id" :value="a.id" :disabled="!a.available">
                {{ a.name }}{{ a.available ? '' : ' (key unavailable)' }}
              </option>
            </select>
          </span>
        </h1>
      </div>
      <a href="/" class="back">← All apps</a>
    </header>

    <!-- Remount everything when the authority changes, so no data mixes between systems. -->
    <main :key="authority.id">
      <section v-if="caps.stops" class="card" aria-label="Stop information">
        <div class="card-head">
          <h2>Stop</h2>
        </div>
        <StopPicker v-model="stop" :initial-id="initialStopId" />
        <StopDetails v-if="stop" :stop="stop" />
        <p v-else class="muted hint">Pick a stop to see its arrivals, departures and facilities.</p>
      </section>

      <AlertsTree v-if="caps.alerts" />
    </main>

    <footer class="credits muted small">
      Real-time data from the
      <a :href="authority.api.docs || authority.website" target="_blank" rel="noopener">{{ authority.fullName || authority.name }}</a>.
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
.heading { min-width: 0; }
.topbar .eyebrow { margin-bottom: 6px; }

.title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 14px;
  font-size: clamp(24px, 4vw, 40px);
  text-align: left;
}
.title label { color: var(--ink); }

.select-wrap { position: relative; display: inline-block; max-width: 100%; line-height: 1.3; }
.select-wrap::after {
  content: '▾';
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.55em;
  color: var(--accent);
  pointer-events: none;
}
.sizer { visibility: hidden; white-space: nowrap; padding-right: 28px; font-weight: 800; letter-spacing: -0.04em; }
select {
  position: absolute;
  inset: 0;
  width: 100%;
  appearance: none;
  line-height: inherit;
  padding: 0 28px 2px 0;
  font: inherit;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--accent-2);
  background: transparent;
  border: none;
  border-bottom: 2px dashed #ff8a3d66;
  cursor: pointer;
  text-overflow: ellipsis;
}
select:hover { border-bottom-color: var(--accent); }
select:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 4px; }
option { font-size: 16px; font-weight: 600; letter-spacing: normal; color: var(--ink); background: #0e1024; }

.back { color: var(--muted); text-decoration: none; font-size: 14px; white-space: nowrap; padding-bottom: 6px; }
.back:hover { color: var(--ink); }

main { display: grid; gap: 20px; }
.hint { margin: 14px 0 0; }

.credits { margin-top: 24px; text-align: center; }
.credits a { color: inherit; }
</style>
