<script setup>
import { ref } from 'vue'
import WorldMap from './components/WorldMap.vue'
import places from '../places.json'

const tabs = [
  { id: 'overworld', label: 'Overworld',  panelClass: 'map-overworld', markerColor: '#4ade80' },
  { id: 'nether',    label: 'The Nether', panelClass: 'map-nether',    markerColor: '#fb923c' },
  { id: 'end',       label: 'The End',    panelClass: 'map-end',       markerColor: '#c084fc' }
]

const activeTab = ref('overworld')
</script>

<template>
  <header>
    <h1>World of 1000 wonders</h1>
    <p>Scroll to zoom &middot; Shift+scroll to pan horizontally &middot; Ctrl+scroll to pan vertically &middot; Drag to pan</p>
  </header>

  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="['tab-btn', tab.id, { active: activeTab === tab.id }]"
      @click="activeTab = tab.id"
    >{{ tab.label }}</button>
  </div>

  <div
    v-for="tab in tabs"
    :key="tab.id"
    v-show="activeTab === tab.id"
    class="tab-panel"
    :class="tab.panelClass"
  >
    <WorldMap :places="places[tab.id] ?? {}" :markerColor="tab.markerColor" />
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 1.5em;
  min-height: 100vh;
  background-color: #08080f;
  background-image:
    radial-gradient(ellipse 60% 40% at 15% 0%,   #1a0840 0%, transparent 60%),
    radial-gradient(ellipse 50% 35% at 85% 100%,  #08280a 0%, transparent 60%);
  color: #ddd8f8;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

header {
  margin-bottom: 1.25em;
}

h1 {
  margin: 0 0 0.2em;
  font-size: 2.4em;
  letter-spacing: -0.02em;
  background: linear-gradient(100deg, #a78bfa 0%, #60a5fa 45%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  margin: 0;
  font-size: 0.88em;
  color: #6060a0;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 3px;
  border-bottom: 2px solid #22223a;
  padding: 0;
  margin-bottom: 0;
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
.tab-panel {
  border-radius: 0 0 10px 10px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
}

.map-overworld {
  border: 2px solid #16a34a;
  background: linear-gradient(145deg, #030f07 0%, #071a0c 40%, #0d2e18 100%);
}

.map-nether {
  border: 2px solid #c2410c;
  background: linear-gradient(145deg, #130200 0%, #2e0800 40%, #5a1200 100%);
}

.map-end {
  border: 2px solid #7e22ce;
  background: linear-gradient(145deg, #06020e 0%, #0e0420 40%, #1e0842 100%);
}
</style>
