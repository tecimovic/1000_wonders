<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  places: { type: Object, required: true },
  markerColor: { type: String, default: '#60a5fa' },
  gridColor:   { type: String, default: '#60a5fa' }
})

const MAPSIZE = 1_000_000
const hoveredName = ref(null)
const mapState = ref({ zoom: 1, shiftX: 0, shiftY: 0 })
const isDragging = ref(false)
let dragData = null

const layout = computed(() => {
  const entries = Object.entries(props.places)
  if (entries.length === 0) {
    return { factorX: 1, factorZ: 1, originX: MAPSIZE / 2, originZ: MAPSIZE / 2, minX: -1, maxX: 1, minZ: -1, maxZ: 1 }
  }

  let maxX = -Infinity, minX = Infinity, maxZ = -Infinity, minZ = Infinity
  for (const [, coords] of entries) {
    const x = coords[0], z = coords[2]
    if (x > maxX) maxX = x
    if (x < minX) minX = x
    if (z > maxZ) maxZ = z
    if (z < minZ) minZ = z
  }

  const rangeX = maxX - minX || 1
  const rangeZ = maxZ - minZ || 1

  return {
    factorX: (MAPSIZE * 0.9) / rangeX,
    factorZ: (MAPSIZE * 0.9) / rangeZ,
    originX: (MAPSIZE * -minX) / rangeX,
    originZ: (MAPSIZE * -minZ) / rangeZ,
    minX, maxX, minZ, maxZ
  }
})

const markers = computed(() => {
  const { factorX, factorZ, originX, originZ } = layout.value
  return Object.entries(props.places).map(([name, coords]) => ({
    name,
    x: originX + factorX * coords[0],
    z: originZ + factorZ * coords[2],
    wx: coords[0],
    wz: coords[2],
    description: typeof coords[3] === 'string' ? coords[3] : null
  }))
})

const gridLines = computed(() => {
  const { factorX, factorZ, originX, originZ, minX, maxX, minZ, maxZ } = layout.value
  const step = 100
  const x0 = Math.floor(minX / step) * step
  const x1 = Math.ceil(maxX / step) * step
  const z0 = Math.floor(minZ / step) * step
  const z1 = Math.ceil(maxZ / step) * step

  const svgX0 = originX + factorX * x0
  const svgX1 = originX + factorX * x1
  const svgZ0 = originZ + factorZ * z0
  const svgZ1 = originZ + factorZ * z1

  const verticals = []
  for (let wx = x0; wx <= x1; wx += step) {
    verticals.push({ svgX: originX + factorX * wx, major: wx % 1000 === 0, zero: wx === 0 })
  }
  const horizontals = []
  for (let wz = z0; wz <= z1; wz += step) {
    horizontals.push({ svgZ: originZ + factorZ * wz, major: wz % 1000 === 0, zero: wz === 0 })
  }
  return { verticals, horizontals, svgX0, svgX1, svgZ0, svgZ1 }
})

// Render hovered marker last so it paints on top of all others.
const sortedMarkers = computed(() => {
  const h = hoveredName.value
  if (!h) return markers.value
  const idx = markers.value.findIndex(m => m.name === h)
  if (idx === -1) return markers.value
  const copy = [...markers.value]
  copy.push(copy.splice(idx, 1)[0])
  return copy
})

// Keep dots/text at constant visual pixel size when zoomed in past 1×.
const labelScale = computed(() => 1.5 / Math.max(1.5, mapState.value.zoom))

const viewBox = computed(() => {
  const { zoom, shiftX, shiftY } = mapState.value
  const size = MAPSIZE / zoom
  return `${shiftX} ${shiftY} ${size} ${size}`
})

function onWheel(event) {
  event.preventDefault()
  const s = { ...mapState.value }
  const panStep = 15000 / s.zoom
  if (event.deltaY < 0) {
    if (event.shiftKey) s.shiftX -= panStep
    else if (event.ctrlKey) s.shiftY -= panStep
    else s.zoom = Math.min(s.zoom * 1.15, 20)
  } else {
    if (event.shiftKey) s.shiftX += panStep
    else if (event.ctrlKey) s.shiftY += panStep
    else s.zoom = Math.max(s.zoom / 1.15, 0.2)
  }
  mapState.value = s
}

function onMousedown(event) {
  if (event.button !== 0) return
  event.preventDefault()
  const s = mapState.value
  const size = MAPSIZE / s.zoom
  const svgEl = event.currentTarget
  isDragging.value = true
  dragData = {
    startX: event.clientX,
    startY: event.clientY,
    startShiftX: s.shiftX,
    startShiftY: s.shiftY,
    scaleX: size / svgEl.clientWidth,
    scaleY: size / svgEl.clientHeight
  }
  document.addEventListener('mousemove', onMousemove)
  document.addEventListener('mouseup', onMouseup)
}

function onMousemove(event) {
  if (!dragData) return
  const d = dragData
  mapState.value = {
    ...mapState.value,
    shiftX: d.startShiftX - (event.clientX - d.startX) * d.scaleX,
    shiftY: d.startShiftY - (event.clientY - d.startY) * d.scaleY
  }
}

function onMouseup() {
  isDragging.value = false
  dragData = null
  document.removeEventListener('mousemove', onMousemove)
  document.removeEventListener('mouseup', onMouseup)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMousemove)
  document.removeEventListener('mouseup', onMouseup)
})
</script>

<template>
  <svg
    :viewBox="viewBox"
    :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
    class="world-map"
    @wheel.prevent="onWheel"
    @mousedown="onMousedown"
  >
    <!-- Grid -->
    <line
      v-for="(vl, i) in gridLines.verticals"
      :key="'gv' + i"
      :x1="vl.svgX" :y1="gridLines.svgZ0"
      :x2="vl.svgX" :y2="gridLines.svgZ1"
      :stroke="gridColor"
      :stroke-width="(vl.zero ? 2500 : vl.major ? 1250 : 800) * labelScale"
      :opacity="vl.zero ? 0.65 : vl.major ? 0.45 : 0.18"
    />
    <line
      v-for="(hl, i) in gridLines.horizontals"
      :key="'gh' + i"
      :x1="gridLines.svgX0" :y1="hl.svgZ"
      :x2="gridLines.svgX1" :y2="hl.svgZ"
      :stroke="gridColor"
      :stroke-width="(hl.zero ? 2500 : hl.major ? 1250 : 800) * labelScale"
      :opacity="hl.zero ? 0.65 : hl.major ? 0.45 : 0.18"
    />

    <!-- Axes -->
    <line
      class="axis"
      :x1="0" :y1="layout.originZ"
      :x2="MAPSIZE" :y2="layout.originZ"
    />
    <line
      class="axis"
      :x1="layout.originX" :y1="0"
      :x2="layout.originX" :y2="MAPSIZE"
    />

    <g
      v-for="m in sortedMarkers"
      :key="m.name"
      class="place-marker"
    >
      <!-- glow halo behind the dot -->
      <circle
        v-if="hoveredName === m.name"
        :cx="m.x" :cy="m.z"
        :r="7000 * labelScale"
        :fill="markerColor"
        opacity="0.15"
        pointer-events="none"
      />
      <circle
        :cx="m.x" :cy="m.z"
        :r="(hoveredName === m.name ? 4000 : 2500) * labelScale"
        :fill="markerColor"
        @mouseenter="hoveredName = m.name"
        @mouseleave="hoveredName = null"
      />
      <template v-if="hoveredName === m.name">
        <rect
          :x="m.x - 2000 * labelScale"
          :y="m.z - 2000 * labelScale"
          :width="Math.max(m.name.length * 4400, (m.description || '').length * 3200 + 2000, 8000) * labelScale + 4000 * labelScale"
          :height="(m.description ? 22000 : 16000) * labelScale"
          fill="#0a0a18"
          fill-opacity="0.92"
          :stroke="markerColor"
          :stroke-width="600 * labelScale"
          :rx="2000 * labelScale"
          pointer-events="none"
        />
      </template>
      <text
        :x="m.x" :y="m.z + 5000 * labelScale"
        :font-size="(hoveredName === m.name ? 7500 : 5000) * labelScale"
        class="place-name"
        pointer-events="none"
      >{{ m.name }}</text>
      <text
        :x="m.x" :y="m.z + 12000 * labelScale"
        :font-size="(hoveredName === m.name ? 6000 : 4000) * labelScale"
        class="place-coord"
        pointer-events="none"
      >({{ m.wx }},{{ m.wz }})</text>
      <text
        v-if="hoveredName === m.name && m.description"
        :x="m.x" :y="m.z + 19000 * labelScale"
        :font-size="6000 * labelScale"
        class="place-desc"
        pointer-events="none"
      >{{ m.description }}</text>
    </g>
  </svg>
</template>

<style scoped>
.world-map {
  display: block;
  width: 100%;
  min-height: 400px;
}
.axis {
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 5;
}
.place-marker {
  cursor: pointer;
}
.place-name {
  fill: #e8e8ff;
}
.place-coord {
  fill: #94a3b8;
}
.place-desc {
  fill: #c4b5fd;
}
circle {
  transition: r 0.15s ease-out;
}
text {
  transition: font-size 0.15s ease-out;
}
</style>
