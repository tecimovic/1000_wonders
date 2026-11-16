<script setup>
// All lines of the selected authority, grouped by mode (Bus, Underground, ...).
// Each mode is a collapsible group; lines keep the order the adapter returns.
import { ref, computed, onMounted } from 'vue'
import { useTransit } from '../transit/authorities.js'
import { sortModes } from '../transit/format.js'

const transit = useTransit()
const lines = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    lines.value = await transit.value.client.getLines()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
onMounted(load)

const modeInfo = key => transit.value.modes[key] || { name: 'Other', color: '#6b7299' }

const groups = computed(() => {
  const byMode = new Map()
  for (const line of lines.value) {
    const mode = line.routeType ?? 'other'
    if (!byMode.has(mode)) byMode.set(mode, [])
    byMode.get(mode).push(line)
  }
  return sortModes(byMode.keys()).map(mode => {
    const list = byMode.get(mode)
    return {
      mode,
      ...modeInfo(mode),
      lines: list,
      // Show descriptions only if the lines have any (beyond repeating the name).
      described: list.some(l => l.longName && l.longName !== l.name)
    }
  })
})
</script>

<template>
  <section class="card" aria-labelledby="lines-title">
    <div class="card-head">
      <h2 id="lines-title">Lines <span v-if="lines.length" class="count">{{ lines.length }}</span></h2>
      <div class="tools">
        <button type="button" class="ghost" @click="load" :disabled="loading">{{ loading ? 'Loading…' : 'Refresh' }}</button>
      </div>
    </div>

    <p v-if="error" class="error-box">{{ error }}</p>
    <p v-else-if="loading && !lines.length" class="muted">Loading lines…</p>
    <p v-else-if="!lines.length" class="muted">No lines found.</p>

    <div v-if="groups.length" class="groups">
      <details v-for="g in groups" :key="g.mode" class="group">
        <summary>
          <span class="chevron" aria-hidden="true">▸</span>
          <span class="mode-dot" :style="{ background: g.color }"></span>
          <strong>{{ g.name }}</strong>
          <span class="count">{{ g.lines.length }}</span>
        </summary>
        <ul v-if="g.described" class="described">
          <li v-for="l in g.lines" :key="l.id">
            <span class="route-chip" :style="{ background: l.color, color: l.textColor }">{{ l.name }}</span>
            <span v-if="l.longName && l.longName !== l.name" class="long-name">{{ l.longName }}</span>
          </li>
        </ul>
        <ul v-else class="chips">
          <li v-for="l in g.lines" :key="l.id">
            <span class="route-chip" :style="{ background: l.color, color: l.textColor }">{{ l.name }}</span>
          </li>
        </ul>
      </details>
    </div>
  </section>
</template>

<style scoped>
.groups { display: grid; gap: 1px; border-radius: 10px; overflow: hidden; background: var(--line-soft); }
.group { background: #0d0f22; }

summary {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 8px; background: #12152e; cursor: pointer; list-style: none; font-size: 14px;
}
summary::-webkit-details-marker { display: none; }
summary:hover { color: #fff; }
summary:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; border-radius: 6px; }
summary strong { font-size: 15px; }
.chevron { display: inline-block; width: 12px; color: var(--muted); transition: transform .15s; flex: none; }
.group[open] .chevron { transform: rotate(90deg); }
.mode-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }

.count {
  font-size: 12px; font-weight: 600; color: var(--muted);
  background: #1c2045; border-radius: 999px; padding: 1px 8px;
}
h2 .count { font-size: 13px; vertical-align: middle; }

ul { list-style: none; margin: 0; padding: 12px 12px 14px 38px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.described {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 6px 18px; font-size: 13px;
}
.described li { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.long-name { color: #c8cdf0; line-height: 1.35; overflow-wrap: anywhere; }

@media (max-width: 640px) {
  ul { padding-left: 12px; }
}
</style>
