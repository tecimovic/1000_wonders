<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { createPinball } from '../pinball.js'

const props = defineProps({ paused: Boolean })
const emit = defineEmits(['score', 'event'])
const canvas = ref(null)
let table = null

// Z / left Shift = left flipper, M / right Shift = right flipper,
// N = nudge, B = extra ball. Ignored while typing in a field.
const keys = { KeyZ: 'left', ShiftLeft: 'left', KeyM: 'right', ShiftRight: 'right' }

function onKey(e, down) {
  if (!table || e.target.closest?.('input, textarea')) return
  const side = keys[e.code]
  if (side) { table.flip(side, down); return }
  if (!down || e.repeat) return
  if (e.code === 'KeyN') table.nudge()
  if (e.code === 'KeyB') table.launch()
}
const keydown = (e) => onKey(e, true)
const keyup = (e) => onKey(e, false)

onMounted(() => {
  table = createPinball(canvas.value, {
    onScore: (n) => emit('score', n),
    onEvent: (name) => emit('event', name)
  })
  table.setPaused(props.paused)
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
})
onBeforeUnmount(() => {
  table?.destroy()
  window.removeEventListener('keydown', keydown)
  window.removeEventListener('keyup', keyup)
})

defineExpose({
  flip: (side, down) => table?.flip(side, down),
  nudge: () => table?.nudge(),
  launch: () => table?.launch(),
  setPaused: (p) => table?.setPaused(p)
})
</script>

<template>
  <canvas ref="canvas" class="pinball" aria-hidden="true"></canvas>
</template>

<style scoped>
.pinball {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
