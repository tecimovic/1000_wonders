<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  places:      { type: Object, required: true },
  markerColor: { type: String, default: '#60a5fa' },
  gridColor:   { type: String, default: '#60a5fa' },
  showNames:   { type: Boolean, default: true },
  showCoords:  { type: Boolean, default: true },
})

const emit = defineEmits(['update:showNames', 'update:showCoords'])

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
const labelScale = computed(() => {
  const zoom = mapState.value.zoom
  if (zoom >= 1.5) return 4.5 / zoom
  // Below zoom 1.5, interpolate from 3 (at zoom 1.5) down to 1.5 (at zoom 0.2).
  return 1.5 + (zoom - 0.2) * (1.5 / 1.3)
})

// Circles shrink twice as fast when zoomed out: half of labelScale at min zoom.
const dotScale = computed(() => {
  const zoom = mapState.value.zoom
  if (zoom >= 1.5) return 4.5 / zoom
  return 0.75 + (zoom - 0.2) * (2.25 / 1.3)
})

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

// ── HUD controls ──────────────────────────────────────────────────────────────

const PAN_FRACTION = 0.15

function pan(direction) {
  const s = { ...mapState.value }
  const step = (MAPSIZE / s.zoom) * PAN_FRACTION
  if (direction === 'up')    s.shiftY -= step
  if (direction === 'down')  s.shiftY += step
  if (direction === 'left')  s.shiftX -= step
  if (direction === 'right') s.shiftX += step
  mapState.value = s
}

function centerMap() {
  const { originX, originZ } = layout.value
  const size = MAPSIZE / mapState.value.zoom
  mapState.value = { ...mapState.value, shiftX: originX - size / 2, shiftY: originZ - size / 2 }
}

function zoomIn()    { mapState.value = { ...mapState.value, zoom: Math.min(mapState.value.zoom * 1.5, 20) } }
function zoomOut()   { mapState.value = { ...mapState.value, zoom: Math.max(mapState.value.zoom / 1.5, 0.2) } }
function zoomReset() { mapState.value = { zoom: 1, shiftX: 0, shiftY: 0 } }
</script>

<template>
  <div class="map-wrapper">
    <svg
      :viewBox="viewBox"
      :style="{ cursor: isDragging ? 'grabbing' : 'default' }"
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
          :r="7000 * dotScale"
          :fill="markerColor"
          opacity="0.15"
          pointer-events="none"
        />
        <circle
          :cx="m.x" :cy="m.z"
          :r="(hoveredName === m.name ? 4000 : 2500) * dotScale"
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
          v-if="showNames || hoveredName === m.name"
          :x="m.x" :y="m.z + 5000 * labelScale"
          :font-size="(hoveredName === m.name ? 7500 : 5000) * labelScale"
          class="place-name"
          pointer-events="none"
        >{{ m.name }}</text>
        <text
          v-if="showCoords || hoveredName === m.name"
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

    <!-- ── HUD ── -->
    <div class="map-hud">
      <div class="hud-controls">
        <!-- Zoom panel -->
        <div class="hud-panel zoom-panel">
          <button class="hud-btn" title="Zoom in"    @click="zoomIn">+</button>
          <button class="hud-btn" title="Reset zoom" @click="zoomReset">1</button>
          <button class="hud-btn" title="Zoom out"   @click="zoomOut">&minus;</button>
        </div>

        <!-- D-pad panel -->
        <div class="hud-panel dpad-panel">
          <button class="hud-btn dpad-up"     title="Pan up"    @click="pan('up')">&#9650;</button>
          <button class="hud-btn dpad-left"   title="Pan left"  @click="pan('left')">&#9664;</button>
          <button class="hud-btn dpad-center" title="Center on 0,0" @click="centerMap">&#8853;</button>
          <button class="hud-btn dpad-right"  title="Pan right" @click="pan('right')">&#9654;</button>
          <button class="hud-btn dpad-down"   title="Pan down"  @click="pan('down')">&#9660;</button>
        </div>
      </div>

      <!-- Toggles -->
      <label class="coord-toggle">
        <input type="checkbox" :checked="showNames"  @change="emit('update:showNames',  $event.target.checked)" />
        <span>Location name</span>
      </label>
      <label class="coord-toggle">
        <input type="checkbox" :checked="showCoords" @change="emit('update:showCoords', $event.target.checked)" />
        <span>Coordinates</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.world-map {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.axis {
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 5;
}

.place-marker {
  cursor: pointer;
}

.place-name  { fill: #e8e8ff; }
.place-coord { fill: #94a3b8; }
.place-desc  { fill: #c4b5fd; }

circle { transition: r 0.15s ease-out; }
text   { transition: font-size 0.15s ease-out; }

/* ── HUD ── */
.map-hud {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  pointer-events: none;
}

.hud-controls {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.hud-panel {
  background: rgba(8, 8, 20, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 5px;
  backdrop-filter: blur(6px);
  pointer-events: all;
}

/* Zoom: vertical stack */
.zoom-panel {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* D-pad: sparse 3×3 grid */
.dpad-panel {
  display: grid;
  grid-template-columns: repeat(3, 36px);
  grid-template-rows: repeat(3, 36px);
  gap: 3px;
}

.dpad-up     { grid-column: 2; grid-row: 1; }
.dpad-left   { grid-column: 1; grid-row: 2; }
.dpad-center { grid-column: 2; grid-row: 2; }
.dpad-right  { grid-column: 3; grid-row: 2; }
.dpad-down   { grid-column: 2; grid-row: 3; }

.hud-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  color: #b0b0d8;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  user-select: none;
}

.hud-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.28);
  color: #ffffff;
}

.hud-btn:active {
  background: rgba(255, 255, 255, 0.28);
}

/* ── Coord toggle ── */
.coord-toggle {
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(8, 8, 20, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 6px 10px;
  backdrop-filter: blur(6px);
  color: #b0b0d8;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
}

.coord-toggle:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.28);
}

.coord-toggle input[type="checkbox"] {
  accent-color: #60a5fa;
  cursor: pointer;
}
</style>
