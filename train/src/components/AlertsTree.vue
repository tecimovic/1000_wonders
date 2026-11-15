<script setup>
// Current MBTA alerts as a collapsible tree-table: Mode → Effect → Alert → details.
import { ref, computed, onMounted } from 'vue'
import { mbtaGet, includedLookup, MODES, formatDateTime, humanize } from '../mbta/api.js'

const alerts = ref([])
const loading = ref(false)
const error = ref('')
const loadedAt = ref(null)
const expanded = ref(new Set())

const MODE_ORDER = [1, 0, 2, 3, 4, 'other']
const modeInfo = key => MODES[key] || { name: 'Other', color: '#6b7299' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const doc = await mbtaGet('/alerts', {
      include: 'routes',
      'fields[alert]': 'header,service_effect,effect,effect_name,cause,severity,lifecycle,timeframe,description,active_period,informed_entity,updated_at,url',
      'fields[route]': 'short_name,long_name,color,text_color'
    })
    const lookup = includedLookup(doc)
    alerts.value = doc.data.map(a => {
      const entities = a.attributes.informed_entity || []
      const routeIds = [...new Set(entities.map(e => e.route).filter(Boolean))]
      return {
        id: a.id,
        ...a.attributes,
        modes: [...new Set(entities.map(e => e.route_type).filter(t => t != null))],
        routes: routeIds.map(id => {
          const r = lookup('route', id)?.attributes || {}
          return { id, name: r.short_name || r.long_name || id, color: '#' + (r.color || '555555'), text: '#' + (r.text_color || 'FFFFFF') }
        })
      }
    })
    loadedAt.value = new Date().toISOString()
    if (expanded.value.size === 0) expanded.value = new Set(MODE_ORDER.map(m => 'm:' + m)) // first load: open the modes
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
onMounted(load)

const bySeverity = (x, y) => y.severity - x.severity || (y.updated_at || '').localeCompare(x.updated_at || '')

// mode → effect → alerts. An alert affecting several modes is listed under each.
const tree = computed(() => {
  const modes = new Map()
  for (const alert of alerts.value) {
    for (const mode of alert.modes.length ? alert.modes : ['other']) {
      if (!modes.has(mode)) modes.set(mode, new Map())
      const effects = modes.get(mode)
      const effect = alert.effect_name || humanize(alert.effect)
      if (!effects.has(effect)) effects.set(effect, [])
      effects.get(effect).push(alert)
    }
  }
  return MODE_ORDER.filter(m => modes.has(m)).map(mode => {
    const effects = [...modes.get(mode)].map(([name, list]) => ({
      name,
      alerts: list.sort(bySeverity),
      maxSeverity: Math.max(...list.map(a => a.severity))
    })).sort((x, y) => y.maxSeverity - x.maxSeverity || x.name.localeCompare(y.name))
    return {
      mode,
      ...modeInfo(mode),
      effects,
      count: effects.reduce((n, e) => n + e.alerts.length, 0),
      maxSeverity: Math.max(...effects.map(e => e.maxSeverity))
    }
  })
})

// The tree flattened into the rows that are currently visible.
const rows = computed(() => {
  const out = []
  const open = expanded.value
  for (const m of tree.value) {
    const mKey = 'm:' + m.mode
    out.push({ key: mKey, level: 0, kind: 'mode', node: m })
    if (!open.has(mKey)) continue
    for (const e of m.effects) {
      const eKey = `e:${m.mode}:${e.name}`
      out.push({ key: eKey, level: 1, kind: 'effect', node: e })
      if (!open.has(eKey)) continue
      for (const a of e.alerts) {
        const aKey = `a:${m.mode}:${a.id}`
        out.push({ key: aKey, level: 2, kind: 'alert', node: a })
        if (open.has(aKey)) out.push({ key: aKey + ':details', level: 3, kind: 'details', node: a })
      }
    }
  }
  return out
})

function toggle(key) {
  const next = new Set(expanded.value)
  next.has(key) ? next.delete(key) : next.add(key)
  expanded.value = next
}

function expandAll() {
  const keys = []
  for (const m of tree.value) {
    keys.push('m:' + m.mode)
    for (const e of m.effects) keys.push(`e:${m.mode}:${e.name}`)
  }
  expanded.value = new Set(keys)
}
const collapseAll = () => (expanded.value = new Set())

const severityClass = s => (s >= 7 ? 'sev-high' : s >= 4 ? 'sev-mid' : 'sev-low')
const periodText = p => `${formatDateTime(p.start)} – ${p.end ? formatDateTime(p.end) : 'until further notice'}`
</script>

<template>
  <section class="card" aria-labelledby="alerts-title">
    <div class="card-head">
      <h2 id="alerts-title">Service alerts <span v-if="alerts.length" class="count">{{ alerts.length }}</span></h2>
      <div class="tools">
        <button type="button" class="ghost" @click="expandAll" :disabled="!alerts.length">Expand all</button>
        <button type="button" class="ghost" @click="collapseAll" :disabled="!alerts.length">Collapse all</button>
        <button type="button" class="ghost" @click="load" :disabled="loading">{{ loading ? 'Loading…' : 'Refresh' }}</button>
      </div>
    </div>

    <p v-if="error" class="error-box">{{ error }}</p>
    <p v-else-if="loading && !alerts.length" class="muted">Loading alerts…</p>
    <p v-else-if="!alerts.length" class="muted">No current alerts.</p>

    <div v-if="alerts.length" class="table-wrap">
      <table class="tree">
        <thead>
          <tr>
            <th>Alert</th>
            <th class="col-sev">Severity</th>
            <th class="col-status">Status</th>
            <th class="col-updated">Updated</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in rows" :key="row.key">
            <tr v-if="row.kind === 'details'" class="details-row">
              <td colspan="4">
                <div class="details">
                  <p class="header-text">{{ row.node.header }}</p>
                  <p v-if="row.node.description" class="description">{{ row.node.description }}</p>
                  <dl>
                    <template v-if="row.node.active_period?.length">
                      <dt>Active</dt>
                      <dd><div v-for="(p, i) in row.node.active_period" :key="i">{{ periodText(p) }}</div></dd>
                    </template>
                    <dt>Cause</dt>
                    <dd>{{ humanize(row.node.cause) }}</dd>
                    <template v-if="row.node.routes.length">
                      <dt>Routes</dt>
                      <dd class="chips">
                        <span v-for="r in row.node.routes" :key="r.id" class="route-chip" :style="{ background: r.color, color: r.text }">{{ r.name }}</span>
                      </dd>
                    </template>
                    <template v-if="row.node.url">
                      <dt>More</dt>
                      <dd><a :href="row.node.url" target="_blank" rel="noopener">{{ row.node.url }}</a></dd>
                    </template>
                  </dl>
                </div>
              </td>
            </tr>
            <tr v-else :class="['row-' + row.kind]">
              <td>
                <button
                  type="button"
                  class="toggle"
                  :style="{ paddingLeft: 8 + row.level * 22 + 'px' }"
                  :aria-expanded="expanded.has(row.key)"
                  @click="toggle(row.key)"
                >
                  <span class="chevron" aria-hidden="true">▸</span>
                  <template v-if="row.kind === 'mode'">
                    <span class="mode-dot" :style="{ background: row.node.color }"></span>
                    <strong>{{ row.node.name }}</strong>
                    <span class="count">{{ row.node.count }}</span>
                  </template>
                  <template v-else-if="row.kind === 'effect'">
                    <span>{{ row.node.name }}</span>
                    <span class="count">{{ row.node.alerts.length }}</span>
                  </template>
                  <template v-else>
                    <span class="alert-title">{{ row.node.service_effect || row.node.header }}</span>
                  </template>
                </button>
              </td>
              <td class="col-sev">
                <span class="sev" :class="severityClass(row.kind === 'alert' ? row.node.severity : row.node.maxSeverity)">
                  {{ row.kind === 'alert' ? row.node.severity : 'max ' + row.node.maxSeverity }}
                </span>
              </td>
              <td class="col-status">
                <template v-if="row.kind === 'alert'">
                  <span class="lifecycle" :class="'lc-' + row.node.lifecycle">{{ humanize(row.node.lifecycle) }}</span>
                  <span v-if="row.node.timeframe" class="muted small"> · {{ row.node.timeframe }}</span>
                </template>
              </td>
              <td class="col-updated muted small">{{ row.kind === 'alert' ? formatDateTime(row.node.updated_at) : '' }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <p v-if="loadedAt" class="muted small foot">
      Loaded {{ formatDateTime(loadedAt) }} (Boston time). Alerts that affect several modes are listed under each one.
    </p>
  </section>
</template>

<style scoped>
.table-wrap { overflow-x: auto; margin: 0 -4px; }
table.tree { width: 100%; border-collapse: collapse; font-size: 14px; }
th {
  text-align: left; font-weight: 600; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted); padding: 8px 10px; border-bottom: 1px solid var(--line);
}
td { padding: 0 10px; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }
.col-sev { width: 90px; white-space: nowrap; }
.col-status { width: 220px; }
.col-updated { width: 130px; white-space: nowrap; }

.toggle {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 9px 8px; background: none; border: 0; color: inherit; font: inherit; text-align: left; cursor: pointer;
}
.toggle:hover { color: #fff; }
.toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; border-radius: 6px; }
.chevron { display: inline-block; width: 12px; color: var(--muted); transition: transform .15s; flex: none; }
.toggle[aria-expanded="true"] .chevron { transform: rotate(90deg); }

.row-mode td { background: #12152e; }
.row-mode strong { font-size: 15px; }
.row-effect td { background: #0e1126; }
.mode-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.alert-title { line-height: 1.35; }

.count {
  font-size: 12px; font-weight: 600; color: var(--muted);
  background: #1c2045; border-radius: 999px; padding: 1px 8px;
}
h2 .count { font-size: 13px; vertical-align: middle; }

.sev { display: inline-block; min-width: 28px; text-align: center; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.sev-high { background: #4a1418; color: #ff8b8b; }
.sev-mid { background: #4a2e10; color: #ffbf75; }
.sev-low { background: #1b2146; color: #a9b1e0; }

.lifecycle { font-weight: 600; font-size: 13px; }
.lc-NEW { color: #7fd7ff; }
.lc-UPCOMING, .lc-ONGOING_UPCOMING { color: #c9a8ff; }

.details-row td { background: #0a0c1d; padding: 0; }
.details { padding: 12px 16px 16px 82px; }
.header-text { margin: 0 0 8px; font-weight: 600; line-height: 1.45; }
.description { margin: 0 0 12px; white-space: pre-line; color: #c8cdf0; line-height: 1.5; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0; font-size: 13px; }
dt { color: var(--muted); }
dd { margin: 0; overflow-wrap: anywhere; }
dd a { color: #8fc1ff; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }

.foot { margin: 10px 0 0; }

@media (max-width: 640px) {
  .col-status, .col-updated { display: none; }
  .details { padding-left: 16px; }
}
</style>
