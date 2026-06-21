<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  places: { type: Object, required: true },
  markerColor: { type: String, default: '#60a5fa' }
})

const MAPSIZE = 1_000_000
const hoveredName = ref(null)
const mapState = ref({ zoom: 1, shiftX: 0, shiftY: 0 })
const isDragging = ref(false)
let dragData = null

const layout = computed(() => {
  const entries = Object.entries(props.places)
  if (entries.length === 0) {
    return { factorX: 1, factorZ: 1, originX: MAPSIZE / 2, originZ: MAPSIZE / 2 }
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
    originZ: (MAPSIZE * -minZ) / rangeZ
  }
})

const markers = computed(() => {
  const { factorX, factorZ, originX, originZ } = layout.value
  return Object.entries(props.places).map(([name, coords]) => ({
    name,
    x: originX + factorX * coords[0],
    z: originZ + factorZ * coords[2],
    wx: coords[0],
    wz: coords[2]
  }))
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
          :width="(m.name.length * 4400 + 4000) * labelScale"
          :height="16000 * labelScale"
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
circle {
  transition: r 0.15s ease-out;
}
text {
  transition: font-size 0.15s ease-out;
}
</style>
