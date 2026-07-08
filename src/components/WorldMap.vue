<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  places:        { type: Object,  required: true },
  markerColor:   { type: String,  default: '#60a5fa' },
  gridColor:     { type: String,  default: '#60a5fa' },
  showNames:     { type: Boolean, default: true },
  showCoords:    { type: Boolean, default: true },
  showHeight:    { type: Boolean, default: true },
  selectedCoords: { type: Object, default: null },
  mapId:          { type: String, required: true },
})

const emit = defineEmits(['update:showNames', 'update:showCoords', 'update:showHeight', 'update:selectedCoords'])

const MAPSIZE = 1_000_000
const hoveredName = ref(null)
const mapState = ref({ zoom: 1, shiftX: 0, shiftY: 0 })
const isDragging = ref(false)
let dragData = null
let didDrag = false

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
    wy: coords[1],
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

// Pentagon "house" silhouette (roof peak + straight walls) — the church's nave
// without its tower, scaled down to read as a small standalone house.
const HOUSE_SHAPE = [
  [0, -0.55], [0.65, 0.05], [0.65, 1], [-0.65, 1], [-0.65, 0.05]
]

// A tiny doorway centered under the roof peak.
const HOUSE_DOOR = { x: -0.13, y: 0.65, w: 0.26, h: 0.35 }

function housePoints(cx, cz, r) {
  return HOUSE_SHAPE.map(([dx, dz]) => `${cx + dx * r},${cz + dz * r}`).join(' ')
}

function houseDoorRect(cx, cz, r) {
  return {
    x: cx + HOUSE_DOOR.x * r,
    y: cz + HOUSE_DOOR.y * r,
    width: HOUSE_DOOR.w * r,
    height: HOUSE_DOOR.h * r
  }
}

// "Village" silhouette: a low nave with a peaked roof, joined to a taller spired
// tower on the right, in [-1, 1] unit space. Outline traced clockwise from the
// nave's roof peak.
const CHURCH_SHAPE = [
  [-0.45, -0.5],  // nave roof peak
  [0.1, 0.05],    // nave/tower shared wall, top
  [0.1, -0.5],    // tower left wall, up to spire base
  [0.4, -1],      // tower spire peak
  [0.7, -0.5],    // tower right wall, spire base
  [0.7, 1],       // tower right wall, base
  [0.1, 1],       // nave/tower shared wall, base
  [-1, 1],        // nave left wall, base
  [-1, 0.05],     // nave left wall, top
]

// A large doorway cut into the nave, centered under the roof peak.
const CHURCH_DOOR = { x: -0.62, y: 0.35, w: 0.35, h: 0.65 }

function churchPoints(cx, cz, r) {
  return CHURCH_SHAPE.map(([dx, dz]) => `${cx + dx * r},${cz + dz * r}`).join(' ')
}

function churchDoorRect(cx, cz, r) {
  return {
    x: cx + CHURCH_DOOR.x * r,
    y: cz + CHURCH_DOOR.y * r,
    width: CHURCH_DOOR.w * r,
    height: CHURCH_DOOR.h * r
  }
}

// "Portal" icon: a picture-frame square — a solid square with a smaller square
// hole cut out of its center. Drawn at 80% of the usual icon size.
const PORTAL_SCALE = 0.8

function portalFrameRect(cx, cz, r) {
  const s = r * PORTAL_SCALE
  return { x: cx - s, y: cz - s, width: 2 * s, height: 2 * s }
}

function portalHoleRect(cx, cz, r) {
  const hole = r * PORTAL_SCALE * 0.5
  return { x: cx - hole, y: cz - hole, width: 2 * hole, height: 2 * hole }
}

function isSelected(m) {
  const s = props.selectedCoords
  return s !== null && s.mapId === props.mapId && s.wx === m.wx && s.wz === m.wz
}

// Render selected marker second-to-last, hovered marker last, so they paint on top.
const sortedMarkers = computed(() => {
  const h = hoveredName.value
  const copy = [...markers.value]
  const selIdx = copy.findIndex(m => isSelected(m))
  if (selIdx !== -1 && copy[selIdx].name !== h) copy.push(copy.splice(selIdx, 1)[0])
  if (h) {
    const idx = copy.findIndex(m => m.name === h)
    if (idx !== -1) copy.push(copy.splice(idx, 1)[0])
  }
  return copy
})

// Keep dots/text at constant visual pixel size when zoomed in past 1×.
const labelScale = computed(() => {
  const zoom = mapState.value.zoom
  if (zoom >= 1.5) return 4.5 / zoom
  // Below zoom 1.5, interpolate from 3 (at zoom 1.5) down to 1.5 (at zoom 0.2).
  return 1.5 + (zoom - 0.2) * (1.5 / 1.3)
})

// User-adjustable multiplier for location name/coordinate text. Follows zoom
// continuously (no floor/ceiling) times the manual font-size preference.
// Default/reset value is half the original 1x baseline.
const DEFAULT_FONT_SCALE = 0.5
const fontScale = ref(DEFAULT_FONT_SCALE)
const textScale = computed(() => (4.5 / mapState.value.zoom) * fontScale.value)

// Circles shrink twice as fast when zoomed out: half of labelScale at min zoom.
const dotScale = computed(() => {
  const zoom = mapState.value.zoom
  if (zoom >= 1.5) return 4.5 / zoom
  return 0.75 + (zoom - 0.2) * (2.25 / 1.3)
})

// Matches the radius used to draw a marker's icon, so the label can anchor to its corner.
function iconRadius(m) {
  const r = (hoveredName.value === m.name ? 4000 : 2500) * dotScale.value
  return m.description === 'portal' ? r * PORTAL_SCALE : r
}

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
  didDrag = false
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
  const dx = event.clientX - dragData.startX
  const dy = event.clientY - dragData.startY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true
  const d = dragData
  mapState.value = {
    ...mapState.value,
    shiftX: d.startShiftX - dx * d.scaleX,
    shiftY: d.startShiftY - dy * d.scaleY
  }
}

function selectMarker(m) {
  if (didDrag) return
  const already = isSelected(m)
  emit('update:selectedCoords', already ? null : { mapId: props.mapId, wx: m.wx, wy: m.wy, wz: m.wz, name: m.name, type: m.description })
}

function onMouseup() {
  isDragging.value = false
  dragData = null
  document.removeEventListener('mousemove', onMousemove)
  document.removeEventListener('mouseup', onMouseup)
}

function onMapClick(event) {
  if (didDrag) return
  const svgEl = event.currentTarget
  const pt = svgEl.createSVGPoint()
  pt.x = event.clientX
  pt.y = event.clientY
  const svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse())
  const svgX = svgPt.x
  const svgZ = svgPt.y
  const { factorX, factorZ, originX, originZ } = layout.value
  const wx = Math.round((svgX - originX) / factorX)
  const wz = Math.round((svgZ - originZ) / factorZ)
  const s = props.selectedCoords
  const isCustomLocation = !markers.value.some(m => m.wx === wx && m.wz === wz)
  if (s && s.mapId === props.mapId && s.wx === wx && s.wz === wz && isCustomLocation) {
    emit('update:selectedCoords', null)
  } else {
    emit('update:selectedCoords', { mapId: props.mapId, wx, wz })
  }
}

const customSelectionSvg = computed(() => {
  const s = props.selectedCoords
  if (!s || s.mapId !== props.mapId) return null
  if (markers.value.some(m => m.wx === s.wx && m.wz === s.wz)) return null
  const { factorX, factorZ, originX, originZ } = layout.value
  return {
    x: originX + factorX * s.wx,
    z: originZ + factorZ * s.wz
  }
})

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

function fontIncrease() { fontScale.value *= 1.2 }
function fontDecrease() { fontScale.value /= 1.2 }
function fontReset()    { fontScale.value = DEFAULT_FONT_SCALE }
</script>

<template>
  <div class="map-wrapper">
    <svg
      :viewBox="viewBox"
      :style="{ cursor: isDragging ? 'grabbing' : 'crosshair' }"
      class="world-map"
      @wheel.prevent="onWheel"
      @mousedown="onMousedown"
      @click="onMapClick"
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
        <!-- selection halo -->
        <circle
          v-if="isSelected(m)"
          :cx="m.x" :cy="m.z"
          :r="5500 * dotScale"
          fill="none"
          stroke="#facc15"
          :stroke-width="900 * dotScale"
          opacity="0.9"
          pointer-events="none"
        />
        <template v-if="m.description === 'house'">
          <polygon
            :points="housePoints(m.x, m.z, (hoveredName === m.name ? 4000 : 2500) * dotScale)"
            :fill="markerColor"
            style="cursor: pointer"
            @mouseenter="hoveredName = m.name"
            @mouseleave="hoveredName = null"
            @click.stop="selectMarker(m)"
          />
          <rect
            v-bind="houseDoorRect(m.x, m.z, (hoveredName === m.name ? 4000 : 2500) * dotScale)"
            fill="#0a0a18"
            pointer-events="none"
          />
        </template>
        <template v-else-if="m.description === 'village'">
          <polygon
            :points="churchPoints(m.x, m.z, (hoveredName === m.name ? 4000 : 2500) * dotScale)"
            :fill="markerColor"
            style="cursor: pointer"
            @mouseenter="hoveredName = m.name"
            @mouseleave="hoveredName = null"
            @click.stop="selectMarker(m)"
          />
          <rect
            v-bind="churchDoorRect(m.x, m.z, (hoveredName === m.name ? 4000 : 2500) * dotScale)"
            fill="#0a0a18"
            pointer-events="none"
          />
        </template>
        <template v-else-if="m.description === 'portal'">
          <rect
            v-bind="portalFrameRect(m.x, m.z, (hoveredName === m.name ? 4000 : 2500) * dotScale)"
            :fill="markerColor"
            style="cursor: pointer"
            @mouseenter="hoveredName = m.name"
            @mouseleave="hoveredName = null"
            @click.stop="selectMarker(m)"
          />
          <rect
            v-bind="portalHoleRect(m.x, m.z, (hoveredName === m.name ? 4000 : 2500) * dotScale)"
            fill="#0a0a18"
            pointer-events="none"
          />
        </template>
        <circle
          v-else
          :cx="m.x" :cy="m.z"
          :r="(hoveredName === m.name ? 4000 : 2500) * dotScale"
          :fill="markerColor"
          style="cursor: pointer"
          @mouseenter="hoveredName = m.name"
          @mouseleave="hoveredName = null"
          @click.stop="selectMarker(m)"
        />
        <!--
          Text grows via a geometric `scale` transform rather than by scaling the
          `font-size` attribute directly: Chromium clamps the *used* value of
          font-size to 10000 (in local units), so pushing textScale into font-size
          silently stops growing glyphs past that point even though the attribute
          keeps climbing. A transform has no such ceiling.

          The group is anchored at the icon's top-right corner (not the marker
          center), and text uses a "hanging" baseline, so the label's top-left
          corner lands on that corner instead of overlapping the icon.
        -->
        <g
          :transform="`translate(${m.x + iconRadius(m)} ${m.z - iconRadius(m)}) scale(${textScale})`"
          pointer-events="none"
        >
          <rect
            v-if="hoveredName === m.name"
            :x="-2000"
            :y="-2000"
            :width="Math.max(m.name.length * 4400, (m.description || '').length * 3200 + 2000, 8000) + 4000"
            :height="m.description ? 22000 : 16000"
            fill="#0a0a18"
            fill-opacity="0.92"
            :stroke="markerColor"
            stroke-width="600"
            rx="2000"
          />
          <text
            v-if="showNames || hoveredName === m.name"
            x="0" y="0"
            dominant-baseline="hanging"
            :font-size="hoveredName === m.name ? 7500 : 5000"
            class="place-name"
          >{{ m.name }}</text>
          <text
            v-if="showCoords || hoveredName === m.name"
            x="0" y="7000"
            dominant-baseline="hanging"
            :font-size="hoveredName === m.name ? 6000 : 4000"
            class="place-coord"
          >(X:{{ m.wx }}, Z:{{ m.wz }}<template v-if="showHeight">, Y:{{ m.wy }}</template>)</text>
          <text
            v-if="hoveredName === m.name && m.description"
            x="0" y="14000"
            dominant-baseline="hanging"
            font-size="6000"
            class="place-desc"
          >{{ m.description }}</text>
        </g>
      </g>

      <!-- Custom selection cross (click on empty map) -->
      <g v-if="customSelectionSvg">
        <line
          :x1="customSelectionSvg.x - 3500 * dotScale"
          :y1="customSelectionSvg.z"
          :x2="customSelectionSvg.x + 3500 * dotScale"
          :y2="customSelectionSvg.z"
          stroke="#facc15"
          :stroke-width="700 * dotScale"
          pointer-events="none"
        />
        <line
          :x1="customSelectionSvg.x"
          :y1="customSelectionSvg.z - 3500 * dotScale"
          :x2="customSelectionSvg.x"
          :y2="customSelectionSvg.z + 3500 * dotScale"
          stroke="#facc15"
          :stroke-width="700 * dotScale"
          pointer-events="none"
        />
      </g>
    </svg>

    <!-- ── HUD ── -->
    <div class="map-hud">
      <div class="hud-controls">
        <!-- Font size panel -->
        <div class="hud-panel font-panel">
          <button class="hud-btn" title="Increase font size" @click="fontIncrease">+</button>
          <button class="hud-btn hud-btn-abc" title="Reset font size" @click="fontReset">Abc</button>
          <button class="hud-btn" title="Decrease font size" @click="fontDecrease">&minus;</button>
        </div>

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
      <label class="coord-toggle" :class="{ disabled: !showCoords }">
        <input type="checkbox" :checked="showHeight" :disabled="!showCoords" @change="emit('update:showHeight', $event.target.checked)" />
        <span>Height</span>
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

/* Zoom / font size: vertical stack */
.zoom-panel,
.font-panel {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hud-btn-abc {
  font-size: 11px;
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

.coord-toggle.disabled {
  cursor: default;
  opacity: 0.5;
}

.coord-toggle.disabled:hover {
  color: #b0b0d8;
  border-color: rgba(255, 255, 255, 0.1);
}

.coord-toggle.disabled input[type="checkbox"] {
  cursor: default;
}
</style>
