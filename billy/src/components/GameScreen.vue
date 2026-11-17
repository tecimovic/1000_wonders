<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createGame, WIDTH, HEIGHT } from '../game/engine.js'
import { createInput } from '../game/input.js'
import { itemIconUrls } from '../game/sprites.js'

const stage = ref(null)
const canvas = ref(null)
const inventoryBar = ref(null)
const scale = ref(3)
const status = ref({ state: 'playing', roomName: '', inventory: [] })

// The inventory always shows this many slots; items fill them from the left.
const INVENTORY_SLOTS = 4
const itemIcons = itemIconUrls()
const ITEM_NAMES = { key: 'Key' }

const input = createInput()
let game = null
let resizeObserver = null

// The biggest whole-number zoom that fits, so pixels stay square and crisp.
function fit() {
  const el = stage.value
  if (!el) return
  const bar = inventoryBar.value
  const barHeight = bar ? bar.offsetHeight + parseFloat(getComputedStyle(bar).marginBottom) : 0
  const s = Math.floor(Math.min(el.clientWidth / WIDTH, (el.clientHeight - barHeight) / HEIGHT))
  scale.value = Math.max(1, s)
}

function onKeyDown(e) {
  const over = status.value.state === 'won' || status.value.state === 'dead'
  if (over && (e.code === 'Enter' || e.code === 'KeyR')) {
    e.preventDefault()
    game.restart()
  }
}

function press(action, on) {
  input.set(action, on)
}

onMounted(() => {
  game = createGame(canvas.value, input.state, { onStatus: s => { status.value = s } })
  input.attach()
  window.addEventListener('keydown', onKeyDown)
  resizeObserver = new ResizeObserver(fit)
  resizeObserver.observe(stage.value)
  fit()
  game.start()
})

onUnmounted(() => {
  game?.stop()
  input.detach()
  window.removeEventListener('keydown', onKeyDown)
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="game">
    <div ref="stage" class="stage">
      <div ref="inventoryBar" class="inventory" :style="{ width: WIDTH * scale + 'px' }">
        <span class="inventory-label">Inventory</span>
        <span
          v-for="i in INVENTORY_SLOTS"
          :key="i"
          class="slot"
          :title="ITEM_NAMES[status.inventory[i - 1]] ?? ''"
        >
          <img v-if="status.inventory[i - 1]" :src="itemIcons[status.inventory[i - 1]]" :alt="ITEM_NAMES[status.inventory[i - 1]]" class="slot-icon" />
        </span>
      </div>
      <div class="screen" :style="{ width: WIDTH * scale + 'px', height: HEIGHT * scale + 'px' }">
        <canvas ref="canvas" class="canvas"></canvas>
        <div v-if="status.state === 'won'" class="overlay">
          <div class="overlay-title">Billy is free!</div>
          <div class="overlay-text">He found the key and walked out the door. That's the whole game, for now.</div>
          <button type="button" class="again" @click="game.restart()">Play again</button>
          <div class="overlay-hint">or press Enter</div>
        </div>
        <div v-else-if="status.state === 'dead'" class="overlay overlay--dead">
          <div class="overlay-title">Billy has died.</div>
          <div class="overlay-text">Rest in peace. And mind the cactus.</div>
          <button type="button" class="again" @click="game.restart()">Try again</button>
          <div class="overlay-hint">or press Enter</div>
        </div>
      </div>
    </div>

    <div class="status" :style="{ width: WIDTH * scale + 'px' }">
      <span class="room-name">{{ status.roomName }}</span>
    </div>

    <div class="touch-controls">
      <button
        v-for="b in [{ action: 'left', label: '◀' }, { action: 'stop', label: '■' }, { action: 'jump', label: 'Jump' }, { action: 'right', label: '▶' }]"
        :key="b.action"
        type="button"
        class="touch-btn"
        @pointerdown.prevent="press(b.action, true)"
        @pointerup="press(b.action, false)"
        @pointercancel="press(b.action, false)"
        @pointerleave="press(b.action, false)"
        @contextmenu.prevent
      >{{ b.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.game {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0 16px 16px;
}

.stage {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.screen {
  position: relative;
  box-shadow: 0 0 0 3px #2a1850, 0 0 40px rgba(138, 45, 92, 0.35);
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(11, 8, 32, 0.78);
  text-align: center;
}

/* Leave the gravestone in view: dim the room only lightly. */
.overlay--dead {
  justify-content: flex-start;
  padding-top: 8%;
  background: rgba(11, 8, 32, 0.45);
}

.overlay--dead .overlay-title {
  color: #ff6b6b;
}

.overlay-title {
  font-size: clamp(20px, 4vw, 40px);
  font-weight: 800;
  color: #ffe14d;
  letter-spacing: 0.04em;
}

.overlay-text,
.overlay-hint {
  color: #b9b0d8;
  font-size: 14px;
}

.again {
  margin-top: 6px;
  padding: 8px 20px;
  font: inherit;
  font-weight: 700;
  color: #0b0820;
  background: #3fbf8f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.again:hover {
  background: #5fdfaf;
}

.status {
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 14px;
  color: #b9b0d8;
}

.room-name {
  color: #f2ecd8;
  font-weight: 700;
}

.inventory {
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.inventory-label {
  margin-right: 4px;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: 13px;
  color: #b9b0d8;
}

.slot {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #120d2e;
  border: 2px solid #2a1850;
  border-radius: 6px;
}

.slot-icon {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  animation: pop-in 0.35s ease-out;
}

@keyframes pop-in {
  0%   { transform: scale(2.2); }
  100% { transform: scale(1); }
}

/* On-screen buttons, only on touch screens. */
.touch-controls {
  display: none;
  gap: 12px;
  width: 100%;
  max-width: 480px;
}

@media (hover: none) and (pointer: coarse) {
  .touch-controls {
    display: flex;
  }
}

.touch-btn {
  flex: 1;
  height: 64px;
  font: inherit;
  font-size: 20px;
  font-weight: 700;
  color: #f2ecd8;
  background: #2a1850;
  border: 2px solid #4a3080;
  border-radius: 12px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.touch-btn:active {
  background: #4a3080;
}
</style>
