<script setup>
import { ref, watch } from 'vue'
import WorldMap from './components/WorldMap.vue'
import places from '../places.json'

const tabs = [
  { id: 'overworld', label: 'Overworld',  panelClass: 'map-overworld', markerColor: '#4ade80', gridColor: '#22c55e' },
  { id: 'nether',    label: 'The Nether', panelClass: 'map-nether',    markerColor: '#fb923c', gridColor: '#f97316' },
  { id: 'end',       label: 'The End',    panelClass: 'map-end',       markerColor: '#c084fc', gridColor: '#a855f7' }
]

const validMapIds = tabs.map(t => t.id)

function parseInitialSelection() {
  const p = new URLSearchParams(window.location.search)
  const mapId = p.get('map')
  const xStr  = p.get('x')
  const yStr  = p.get('y')
  if (!mapId || xStr === null || yStr === null) return null
  if (!validMapIds.includes(mapId)) return null
  const wx = parseInt(xStr, 10)
  const wz = parseInt(yStr, 10)
  if (isNaN(wx) || isNaN(wz)) return null
  return { mapId, wx, wz }
}

const initial        = parseInitialSelection()
const activeTab      = ref(initial?.mapId ?? 'overworld')
const showNames      = ref(true)
const showCoords     = ref(true)
const showHeight     = ref(true)
const selectedCoords = ref(initial)

watch(selectedCoords, (val) => {
  if (val) {
    const url = new URL(window.location.href)
    url.searchParams.set('map', val.mapId)
    url.searchParams.set('x', val.wx)
    url.searchParams.set('y', val.wz)
    history.replaceState(null, '', url)
  } else {
    history.replaceState(null, '', window.location.pathname)
  }
})
</script>

<template>
  <div class="app-root">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="['tab-btn', tab.id, { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
      <span v-if="selectedCoords" class="selected-coords">
        <template v-if="selectedCoords.name">{{ selectedCoords.name }}: (X:{{ selectedCoords.wx }}, Z:{{ selectedCoords.wz }}<template v-if="selectedCoords.wy !== undefined">, Y:{{ selectedCoords.wy }}</template>)   -   ({{ selectedCoords.type }})</template>
        <template v-else>Coordinates: (X:{{ selectedCoords.wx }}, Z:{{ selectedCoords.wz }})</template>
      </span>
      <span v-else class="selected-coords selected-coords--empty"></span>
      <div class="site-title-block">
        <div class="site-title-text">
          <span class="site-title">World of 1000 wonders</span>
          <span class="site-subtitle">- by the grace of the Lighthing God</span>
        </div>
        <img src="/hexarod.png" class="site-logo" alt="" title="Holy hexarod, by the grace of L.G.!" />
      </div>
    </div>

    <div
      v-for="tab in tabs"
      :key="tab.id"
      v-show="activeTab === tab.id"
      class="tab-panel"
      :class="tab.panelClass"
    >
      <WorldMap
        :places="places[tab.id] ?? []"
        :mapId="tab.id"
        :markerColor="tab.markerColor"
        :gridColor="tab.gridColor"
        v-model:showNames="showNames"
        v-model:showCoords="showCoords"
        v-model:showHeight="showHeight"
        v-model:selectedCoords="selectedCoords"
      />
    </div>
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-color: #08080f;
  background-image:
    radial-gradient(ellipse 60% 40% at 15% 0%,   #1a0840 0%, transparent 60%),
    radial-gradient(ellipse 50% 35% at 85% 100%,  #08280a 0%, transparent 60%);
  color: #ddd8f8;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  border-bottom: 2px solid #22223a;
  padding: 6px 12px 0;
  margin-bottom: 0;
}

.selected-coords {
  flex: 1;
  text-align: center;
  padding-bottom: 0.4em;
  font-size: 0.95em;
  font-weight: 600;
  color: #facc15;
  letter-spacing: 0.03em;
  white-space: nowrap;
  user-select: none;
}

.selected-coords--empty {
  color: transparent;
}

.site-title-block {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-left: auto;
  margin-right: -12px;
}

.site-title-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  padding-bottom: 0.2em;
}

.site-title {
  padding-bottom: 0;
  font-size: 1.2em;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #a855f7, #4ade80, #f97316, #a855f7, #4ade80, #f97316, #a855f7);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-flow 6s linear infinite;
  white-space: nowrap;
  user-select: none;
}

.site-subtitle {
  font-size: 0.7em;
  font-weight: 400;
  color: #6b6b9a;
  white-space: nowrap;
  user-select: none;
  letter-spacing: 0.01em;
}

.site-logo {
  width: 40px;
  height: 40px;
  display: block;
  object-fit: contain;
  margin-left: 20px;
}

@keyframes title-flow {
  0%   { background-position: 0% center; }
  100% { background-position: 50% center; }
}

.tab-btn {
  padding: 0.65em 1.5em;
  font-size: 0.95em;
  font-weight: 600;
  border: 1px solid #22223a;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  margin-bottom: -2px;
  cursor: pointer;
  color: #5858a8;
  background: #0e0e1c;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  background: #16162e;
  color: #a0a0d8;
}

.tab-btn.active.overworld {
  background: linear-gradient(180deg, #0c2e18 0%, #0a1e10 100%);
  color: #6ee89a;
  border-color: #16a34a;
  border-bottom: 2px solid #0a1e10;
}

.tab-btn.active.nether {
  background: linear-gradient(180deg, #2e1208 0%, #1e0c04 100%);
  color: #fdba74;
  border-color: #ea580c;
  border-bottom: 2px solid #1e0c04;
}

.tab-btn.active.end {
  background: linear-gradient(180deg, #1a0840 0%, #100528 100%);
  color: #d8b4fe;
  border-color: #9333ea;
  border-bottom: 2px solid #100528;
}

/* ── Map panels ── */
.app-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#app {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tab-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-overworld {
  background: linear-gradient(145deg, #030f07 0%, #071a0c 40%, #0d2e18 100%);
}

.map-nether {
  background: linear-gradient(145deg, #130200 0%, #2e0800 40%, #5a1200 100%);
}

.map-end {
  background: linear-gradient(145deg, #06020e 0%, #0e0420 40%, #1e0842 100%);
}
</style>
