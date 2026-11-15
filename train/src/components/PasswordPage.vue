<script setup>
import { ref, onMounted } from 'vue'
import TransitScene from './TransitScene.vue'

defineProps({
  invalid: { type: Boolean, default: false }, // show "Invalid password"
  busy: { type: Boolean, default: false }     // a check is running
})
const emit = defineEmits(['submit'])

const password = ref('')
const input = ref(null)
onMounted(() => input.value?.focus())

function submit() {
  emit('submit', password.value)
}
</script>

<template>
  <div class="page">
    <header>
      <p class="eyebrow">Ticket check · Line 1</p>
      <h1>All <span>aboard?</span></h1>
      <p class="sub">Show your ticket: enter the password to continue.</p>
    </header>

    <form class="ticket" @submit.prevent="submit">
      <label for="password">Password</label>
      <div class="row">
        <input
          id="password"
          ref="input"
          v-model="password"
          type="password"
          autocomplete="current-password"
          :aria-invalid="invalid"
          aria-describedby="password-error"
          :disabled="busy"
        />
        <button type="submit" :disabled="busy">{{ busy ? 'Checking…' : 'Board' }}</button>
      </div>
      <p id="password-error" class="error" role="alert">{{ invalid ? 'Invalid password' : '' }}</p>
    </form>

    <TransitScene class="scene-small" />

    <footer>
      <a href="/">← All apps</a>
    </footer>
  </div>
</template>

<style scoped>
.ticket {
  width: 100%;
  max-width: 420px;
  padding: 20px 20px 8px;
  border-radius: 16px;
  background: #0e1024;
  border: 1px solid #262a52;
  box-shadow: 0 20px 60px -24px #000;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.row { display: flex; gap: 10px; }

input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  font: inherit;
  font-size: 16px;
  color: var(--ink);
  background: #070912;
  border: 1px solid #2c3060;
  border-radius: 10px;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px #ff8a3d33; }
input[aria-invalid="true"] { border-color: #e5484d; }

button {
  padding: 12px 20px;
  font: inherit;
  font-weight: 700;
  color: #1a0d05;
  background: linear-gradient(100deg, var(--accent-2), var(--accent));
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: filter .15s, transform .15s;
}
button:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
button:disabled { opacity: .6; cursor: progress; }

.error {
  min-height: 1.4em;
  margin: 10px 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ff6b6b;
}

.scene-small { max-width: 760px; }
</style>
