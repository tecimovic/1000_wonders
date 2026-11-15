<script setup>
// Predictions and facilities at one stop, from the selected authority's adapter.
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTransit } from '../transit/authorities.js'
import { formatClock } from '../transit/format.js'
import { predictionRows } from '../transit/predictions.js'

const props = defineProps({
  stop: { type: Object, required: true } // { id, name, kind, municipality }
})

const REFRESH_MS = 30_000

const transit = useTransit()
const timeZone = computed(() => transit.value.authority.timeZone)
const caps = computed(() => transit.value.capabilities)

const predictionList = ref(null)
const predictionsError = ref('')
const predictionsLoading = ref(false)
const predictionsAt = ref(null)
const facilities = ref([])
const facilitiesError = ref('')
const facilitiesLoading = ref(false)
const now = ref(Date.now())

let controller = null
let refreshTimer = null
let clockTimer = null

async function loadPredictions(signal) {
  predictionsLoading.value = true
  try {
    predictionList.value = await transit.value.client.getPredictions(props.stop.id, { signal })
    predictionsError.value = ''
    predictionsAt.value = new Date().toISOString()
    now.value = Date.now()
  } catch (e) {
    if (e.name !== 'AbortError') predictionsError.value = e.message
  } finally {
    if (!signal.aborted) predictionsLoading.value = false
  }
}

async function loadFacilities(signal) {
  facilitiesLoading.value = true
  try {
    facilities.value = await transit.value.client.getFacilities(props.stop.id, { signal })
    facilitiesError.value = ''
  } catch (e) {
    if (e.name !== 'AbortError') facilitiesError.value = e.message
  } finally {
    if (!signal.aborted) facilitiesLoading.value = false
  }
}

function start() {
  controller?.abort()
  controller = new AbortController()
  predictionList.value = null
  facilities.value = []
  predictionsError.value = facilitiesError.value = ''
  const { signal } = controller
  clearInterval(refreshTimer)
  if (caps.value.predictions) {
    loadPredictions(signal)
    refreshTimer = setInterval(() => loadPredictions(signal), REFRESH_MS)
  }
  if (caps.value.facilities) loadFacilities(signal)
}

watch(() => props.stop.id, start)
onMounted(() => {
  start()
  clockTimer = setInterval(() => (now.value = Date.now()), 10_000)
})
onUnmounted(() => {
  controller?.abort()
  clearInterval(refreshTimer)
  clearInterval(clockTimer)
})

const predictions = computed(() =>
  predictionList.value ? predictionRows(predictionList.value, now.value, timeZone.value) : { rows: [], hidden: 0 })

const facilityGroups = computed(() => {
  const groups = new Map()
  for (const f of facilities.value) {
    if (!groups.has(f.type)) groups.set(f.type, [])
    groups.get(f.type).push(f)
  }
  return [...groups]
    .map(([label, list]) => ({ label, list: [...list].sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
</script>

<template>
  <div class="details">
    <h3 class="stop-title">
      {{ stop.name }}
      <span class="muted small">{{ stop.kind }}<template v-if="stop.municipality"> · {{ stop.municipality }}</template> · {{ stop.id }}</span>
    </h3>

    <!-- predictions -->
    <section v-if="caps.predictions" aria-labelledby="pred-title">
      <div class="sub-head">
        <h4 id="pred-title">Arrivals &amp; departures</h4>
        <span class="muted small">
          <template v-if="predictionsAt">Updated {{ formatClock(predictionsAt, timeZone) }} · refreshes every 30 s</template>
          <template v-else-if="predictionsLoading">Loading…</template>
        </span>
      </div>
      <p v-if="predictionsError" class="error-box">{{ predictionsError }}</p>
      <p v-else-if="predictionList && !predictions.rows.length" class="muted">
        No upcoming predictions at this stop right now.
      </p>
      <div v-if="predictions.rows.length" class="table-wrap">
        <table class="predictions">
          <thead>
            <tr>
              <th>Route</th>
              <th>To</th>
              <th class="col-platform">Platform</th>
              <th class="col-time">Arrives</th>
              <th class="col-time">Departs</th>
              <th class="col-when">When</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in predictions.rows" :key="r.id" :class="{ cancelled: r.cancelled }">
              <td>
                <span class="route-chip" :style="{ background: r.route.color, color: r.route.textColor }" :title="r.route.longName">{{ r.route.name }}</span>
              </td>
              <td>{{ r.destination }}<span v-if="r.nonRevenue" class="muted small"> (not in service)</span></td>
              <td class="col-platform muted">{{ r.platform }}</td>
              <td class="col-time">{{ r.arrival || '—' }}</td>
              <td class="col-time">{{ r.departure || '—' }}</td>
              <td class="col-when"><strong>{{ r.when }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="predictions.hidden" class="muted small">
        {{ predictions.hidden }} more {{ predictions.hidden === 1 ? 'prediction is' : 'predictions are' }} hidden: riders can't board
        (last stop of the trip, or already departed).
      </p>
    </section>

    <!-- facilities -->
    <section v-if="caps.facilities" aria-labelledby="fac-title">
      <div class="sub-head">
        <h4 id="fac-title">Facilities <span v-if="facilities.length" class="count">{{ facilities.length }}</span></h4>
      </div>
      <p v-if="facilitiesError" class="error-box">{{ facilitiesError }}</p>
      <p v-else-if="facilitiesLoading" class="muted">Loading…</p>
      <p v-else-if="!facilities.length" class="muted">No facilities listed for this stop.</p>
      <div v-else class="facility-groups">
        <div v-for="g in facilityGroups" :key="g.label" class="facility-group">
          <h5>{{ g.label }} <span class="count">{{ g.list.length }}</span></h5>
          <ul>
            <li v-for="f in g.list" :key="f.id">
              <details v-if="f.properties.length">
                <summary>{{ f.name }}</summary>
                <dl>
                  <template v-for="p in f.properties" :key="p.name">
                    <dt>{{ p.name }}</dt>
                    <dd>{{ p.value }}</dd>
                  </template>
                </dl>
              </details>
              <span v-else>{{ f.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.details { margin-top: 20px; display: grid; gap: 24px; }
.stop-title { margin: 0; font-size: 22px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
.sub-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
h4 { margin: 0; font-size: 15px; letter-spacing: .02em; }

.table-wrap { overflow-x: auto; }
table.predictions { width: 100%; border-collapse: collapse; font-size: 14px; }
th {
  text-align: left; font-weight: 600; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted); padding: 8px 10px; border-bottom: 1px solid var(--line);
}
td { padding: 9px 10px; border-bottom: 1px solid var(--line-soft); }
.col-time { white-space: nowrap; font-variant-numeric: tabular-nums; }
.col-when { white-space: nowrap; text-align: right; }
th.col-when { text-align: right; }
.col-when strong { color: var(--accent-2); }
tr.cancelled td { color: var(--muted); }
tr.cancelled .col-when strong { color: #ff8b8b; }
tr.cancelled td:nth-child(2) { text-decoration: line-through; }

.count {
  font-size: 12px; font-weight: 600; color: var(--muted); background: #1c2045; border-radius: 999px; padding: 1px 8px;
}

.facility-groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; align-items: start; }
.facility-group { background: #0a0c1d; border: 1px solid var(--line-soft); border-radius: 12px; padding: 12px 14px; }
h5 { margin: 0 0 8px; font-size: 14px; }
ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; font-size: 13px; }
summary { cursor: pointer; color: #d6daf6; }
summary:hover { color: #fff; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; margin: 8px 0 4px 14px; font-size: 12px; }
dt { color: var(--muted); }
dd { margin: 0; overflow-wrap: anywhere; }

@media (max-width: 640px) {
  .col-platform, .col-time { display: none; }
}
</style>
