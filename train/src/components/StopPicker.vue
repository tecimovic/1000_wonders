<script setup>
// Type-to-search picker over the selected authority's stations and stops.
// Searches a list loaded once (getStops), or, if the adapter has searchStops,
// asks the API on every (debounced) change of the query.
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTransit } from '../transit/authorities.js'

const props = defineProps({
  modelValue: { type: Object, default: null }, // the selected stop: { id, name, kind, isStation, municipality }
  initialId: { type: String, default: '' }     // pre-select this stop id once loaded
})
const emit = defineEmits(['update:modelValue'])

const transit = useTransit()
const stops = ref([])
const loading = ref(true)
const error = ref('')
const query = ref('')
const open = ref(false)
const active = ref(0)
const MAX_RESULTS = 60
const SEARCH_DELAY_MS = 250

const remote = computed(() => Boolean(transit.value.client.searchStops))
const remoteResults = ref([])
const searching = ref(false)
let searchTimer = null
let searchController = null

async function runSearch(text) {
  searchController?.abort()
  searchController = new AbortController()
  const { signal } = searchController
  searching.value = true
  try {
    const found = await transit.value.client.searchStops(text, { signal })
    if (!signal.aborted) {
      remoteResults.value = found.slice(0, MAX_RESULTS)
      error.value = ''
    }
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e.message
  } finally {
    if (!signal.aborted) searching.value = false
  }
}

watch(query, text => {
  if (!remote.value || !open.value) return
  clearTimeout(searchTimer)
  if (text.trim().length < 2) {
    searchController?.abort()
    remoteResults.value = []
    searching.value = false
    return
  }
  searchTimer = setTimeout(() => runSearch(text), SEARCH_DELAY_MS)
})

onUnmounted(() => {
  clearTimeout(searchTimer)
  searchController?.abort()
})

onMounted(async () => {
  if (remote.value) {
    try {
      if (props.initialId && !props.modelValue) {
        const found = await transit.value.client.getStop?.(props.initialId)
        if (found) select(found)
      }
    } finally {
      loading.value = false
    }
    return
  }
  try {
    const list = await transit.value.client.getStops()
    stops.value = list
      .map(s => ({ ...s, search: (s.name + ' ' + (s.municipality || '') + ' ' + s.id).toLowerCase() }))
      .sort((x, y) => (y.isStation - x.isStation) || x.name.localeCompare(y.name))
    if (props.initialId && !props.modelValue) {
      const found = stops.value.find(s => s.id === props.initialId)
      if (found) select(found)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

watch(() => props.modelValue, s => { if (s) query.value = s.name })

const results = computed(() => {
  if (remote.value) return remoteResults.value
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return stops.value.filter(s => s.isStation).slice(0, MAX_RESULTS)
  const first = words[0]
  return stops.value
    .filter(s => words.every(w => s.search.includes(w)))
    .sort((x, y) =>
      (y.isStation - x.isStation) ||
      (y.name.toLowerCase().startsWith(first) - x.name.toLowerCase().startsWith(first)))
    .slice(0, MAX_RESULTS)
})

watch(results, () => (active.value = 0))

function select(stop) {
  emit('update:modelValue', stop)
  query.value = stop.name
  open.value = false
}

function onInput() {
  open.value = true
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    open.value = true
    active.value = Math.min(active.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = Math.max(active.value - 1, 0)
  } else if (e.key === 'Enter') {
    if (open.value && results.value[active.value]) {
      e.preventDefault()
      select(results.value[active.value])
    }
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function onFocus(e) {
  e.target.select()
  open.value = true
}

// Let a click on an option land before the list closes.
function onBlur() {
  setTimeout(() => {
    open.value = false
    if (props.modelValue) query.value = props.modelValue.name
  }, 150)
}

const optionId = i => 'stop-option-' + i

const placeholder = computed(() => {
  if (loading.value) return 'Loading stops…'
  const examples = transit.value.authority.stopSearchExamples || []
  return (remote.value ? 'Search stops and stations' : `Search ${stops.value.length.toLocaleString()} stops`) + (examples.length ? ` — e.g. ${examples.join(', ')}` : '')
})
</script>

<template>
  <div class="picker">
    <label for="stop-search">Stop or station</label>
    <div class="combo">
      <input
        id="stop-search"
        v-model="query"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        aria-controls="stop-listbox"
        :aria-expanded="open && results.length > 0"
        :aria-activedescendant="open && results.length ? optionId(active) : undefined"
        :placeholder="placeholder"
        :disabled="loading || (!!error && !remote)"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      />
      <ul v-show="open && results.length" id="stop-listbox" role="listbox" class="listbox">
        <li
          v-for="(s, i) in results"
          :id="optionId(i)"
          :key="s.id"
          role="option"
          :aria-selected="i === active"
          :class="{ active: i === active }"
          @mousedown.prevent="select(s)"
          @mousemove="active = i"
        >
          <span class="name">{{ s.name }}</span>
          <span class="meta">
            <span class="kind" :class="{ station: s.isStation }">{{ s.kind }}</span>
            <span v-if="s.municipality"> · {{ s.municipality }}</span>
            <span v-if="!s.isStation"> · #{{ s.id }}</span>
          </span>
        </li>
      </ul>
    </div>
    <p v-if="remote && searching" class="muted small searching">Searching…</p>
    <p v-if="error" class="error-box">{{ error }}</p>
  </div>
</template>

<style scoped>
label {
  display: block; margin-bottom: 8px; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.combo { position: relative; }
input {
  width: 100%; padding: 12px 14px; font: inherit; font-size: 16px; color: var(--ink);
  background: #070912; border: 1px solid #2c3060; border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px #ff8a3d33; }
input:disabled { opacity: .6; }

.listbox {
  position: absolute; z-index: 10; left: 0; right: 0; top: calc(100% + 6px);
  max-height: 340px; overflow-y: auto; margin: 0; padding: 6px; list-style: none;
  background: #0e1024; border: 1px solid #2c3060; border-radius: 12px; box-shadow: 0 20px 50px -10px #000;
}
li {
  display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
  padding: 8px 10px; border-radius: 8px; cursor: pointer;
}
li.active { background: #1c2045; }
.name { font-weight: 600; }
.meta { font-size: 12px; color: var(--muted); white-space: nowrap; }
.kind.station { color: var(--accent-2); font-weight: 600; }
.searching { margin: 6px 0 0; }

@media (max-width: 520px) {
  li { flex-direction: column; gap: 2px; }
}
</style>
