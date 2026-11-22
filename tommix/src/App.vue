<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PinballLayer from './components/PinballLayer.vue'
import { tommix } from './songs.js'

const SOURCE_URL = 'https://platycore.org/?p=396'
const { intro, songs } = tommix

const score = ref(0)
const shownScore = computed(() => String(score.value).padStart(8, '0'))
const message = ref('INSERT COIN')
let messageTimer = 0
function flash(text, ms = 1600) {
  message.value = text
  clearTimeout(messageTimer)
  messageTimer = setTimeout(() => (message.value = idleMessage()), ms)
}
function idleMessage() {
  const s = songs.find((x) => x.slug === active.value)
  return s ? `NOW PLAYING · ${s.title.toUpperCase()}` : 'REPLAY · REPLAY · REPLAY'
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const calm = ref(reducedMotion.matches)
const freakOut = ref(false)
const pinball = ref(null)
watch(calm, (c) => pinball.value?.setPaused(c))

function onEvent(name) {
  if (name === 'tilt') flash('TILT!  TILT!  TILT!', 3000)
  else if (name === 'drain') flash('BALL LOST · KERNEL PANIC')
  else if (name === 'launch') flash('EXTRA BALL')
}

// Mirror: smashing it shatters the glass and turns everything up.
const shards = ref([])
function smashMirror() {
  freakOut.value = !freakOut.value
  if (!freakOut.value) { flash('MIRROR MENDED'); return }
  score.value += 1000000
  flash('MIRROR SMASHED · +1,000,000', 2500)
  shards.value = Array.from({ length: 18 }, (_, i) => ({
    id: Date.now() + i,
    style: {
      '--dx': `${(Math.random() - 0.5) * 260}px`,
      '--dy': `${80 + Math.random() * 260}px`,
      '--rot': `${(Math.random() - 0.5) * 540}deg`,
      clipPath: `polygon(${Math.random() * 100}% 0%, 100% ${Math.random() * 100}%, ${Math.random() * 100}% 100%, 0% ${Math.random() * 100}%)`,
      left: `${(i % 6) * 16.6}%`,
      top: `${Math.floor(i / 6) * 33}%`
    }
  }))
  setTimeout(() => (shards.value = []), 1400)
}

// Which song is on screen: highlighted in the track list and kept in the URL.
const active = ref(location.hash.slice(1))
let observer = null
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          active.value = e.target.id
          history.replaceState(null, '', '#' + e.target.id)
          message.value = idleMessage()
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' }
  )
  document.querySelectorAll('.song').forEach((el) => observer.observe(el))
  if (active.value) document.getElementById(active.value)?.scrollIntoView()
  message.value = 'INSERT COIN · PRESS Z / M TO FLIP'
})
onBeforeUnmount(() => observer?.disconnect())

function hueOf(i) {
  return Math.round((i * 360) / Math.max(1, songs.length))
}

const marquee = [
  'DEAF', 'DUMB', 'BLIND', 'SEGFAULT', 'SIGNAL 9', 'TILT', 'EXTRA BALL',
  'KERNEL WIZARD', 'REPLAY', 'CORE DUMPED', 'NO SENSE OF SMELL REQUIRED', 'ROOT ACCESS'
].join('  ✺  ')
</script>

<template>
  <div class="tommix" :class="{ calm, freak: freakOut }">
    <div class="bg swirl" aria-hidden="true"></div>
    <div class="bg rings" aria-hidden="true"></div>
    <div class="bg veil" aria-hidden="true"></div>
    <PinballLayer ref="pinball" :paused="calm" @score="score += $event" @event="onEvent" />

    <div class="shards" aria-hidden="true">
      <span v-for="s in shards" :key="s.id" class="shard" :style="s.style"></span>
    </div>

    <!-- Backglass: score display -->
    <div class="backglass" role="status">
      <span class="label">SCORE</span>
      <span class="digits">{{ shownScore }}</span>
      <span class="msg">{{ message }}</span>
    </div>

    <main>
      <nav class="top">
        <a href="/">← All apps</a>
        <span class="controls">
          <button type="button" title="Shake the pinball table (too much and it tilts)" @click="pinball?.nudge()">Nudge</button>
          <button type="button" @click="smashMirror">{{ freakOut ? 'Mend the mirror' : 'Smash the mirror' }}</button>
          <button type="button" @click="calm = !calm">{{ calm ? 'Wake up' : 'Calm down' }}</button>
        </span>
      </nav>

      <header class="hero">
        <p class="kicker">a filk in {{ songs.length }} parts, after The Who's <em>Tommy</em></p>
        <h1 class="title" aria-label="Tommix">
          <span v-for="(ch, i) in 'TOMMIX'" :key="i" :style="{ '--i': i }">{{ ch }}</span>
        </h1>
        <p class="kicker">the rock opera of a kernel hacker</p>
      </header>

      <div class="marquee" aria-hidden="true"><span>{{ marquee }}  ✺  {{ marquee }}  ✺  </span></div>

      <section v-if="intro.length" class="card intro">
        <p v-for="(p, i) in intro" :key="i">{{ p }}</p>
      </section>

      <nav class="tracks" aria-label="Songs">
        <a
          v-for="(s, i) in songs"
          :key="s.slug"
          :href="'#' + s.slug"
          :class="{ on: active === s.slug }"
          :style="{ '--hue': hueOf(i) }"
        >
          <b>{{ s.number }}</b> {{ s.title }}
        </a>
      </nav>

      <article
        v-for="(s, i) in songs"
        :id="s.slug"
        :key="s.slug"
        class="card song"
        :style="{ '--hue': hueOf(i) }"
      >
        <header>
          <span class="num">{{ String(s.number).padStart(2, '0') }}</span>
          <h2>{{ s.title }}</h2>
        </header>
        <div v-if="s.instrumental" class="instrumental">
          <div class="disc" aria-hidden="true"></div>
          <p>{{ s.stanzas[0] || '(instrumental)' }}</p>
        </div>
        <div v-else class="lyrics">
          <p v-for="(stanza, k) in s.stanzas" :key="k">
            <span v-for="(line, j) in stanza.split('\n')" :key="j">{{ line }}</span>
          </p>
        </div>
      </article>

      <footer class="card outro">
        <p>
          Originally posted at
          <a :href="SOURCE_URL" target="_blank" rel="noopener">platycore.org</a>. To be sung to
          the music of <em>Tommy</em>.
        </p>
        <p class="help">
          Pinball: <kbd>Z</kbd> / <kbd>M</kbd> (or the Shift keys) flip, <kbd>N</kbd> nudges
          (careful), <kbd>B</kbd> adds a ball. On a phone, use the ◀ ▶ buttons. Leave it alone and it plays itself.
        </p>
      </footer>
    </main>

    <!-- Touch flippers -->
    <div class="flipbar">
      <button
        type="button"
        aria-label="Left flipper"
        @pointerdown.prevent="pinball?.flip('left', true)"
        @pointerup="pinball?.flip('left', false)"
        @pointerleave="pinball?.flip('left', false)"
      >◀</button>
      <button
        type="button"
        aria-label="Right flipper"
        @pointerdown.prevent="pinball?.flip('right', true)"
        @pointerup="pinball?.flip('right', false)"
        @pointerleave="pinball?.flip('right', false)"
      >▶</button>
    </div>
  </div>
</template>

<style>
:root {
  color-scheme: dark;
  --ink: #fff4fb;
  --dim: #d9c3ff;
  --pink: #ff2bd6;
  --amber: #ffb000;
  --cyan: #19e3ff;
  --lime: #9dff3a;
  --void: #0b0016;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 90px; }
body {
  margin: 0;
  background: var(--void);
  color: var(--ink);
  font-family: 'Space Mono', ui-monospace, monospace;
  overflow-x: hidden;
}
</style>

<style scoped>
.tommix { position: relative; min-height: 100vh; overflow-x: clip; }

/* ---------- Background layers ---------- */
.bg { position: fixed; pointer-events: none; }
.swirl {
  inset: -60vmax;
  z-index: 0;
  background: repeating-conic-gradient(
    from 0deg at 50% 50%,
    #ff2bd6 0deg 14deg, #6a00ff 14deg 30deg, #ffb000 30deg 44deg,
    #00c2a8 44deg 60deg, #ff3d00 60deg 74deg, #1a0040 74deg 90deg
  );
  filter: blur(40px) saturate(1.3);
  animation: spin 80s linear infinite, hue 24s linear infinite;
  will-change: transform, filter;
}
.rings {
  inset: 0;
  z-index: 0;
  background: repeating-radial-gradient(circle at 50% 120%, rgba(0, 0, 0, 0.55) 0 18px, transparent 18px 36px);
  animation: breathe 9s ease-in-out infinite;
  mix-blend-mode: multiply;
}
.veil {
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(11, 0, 22, 0.35), rgba(11, 0, 22, 0.85) 75%),
    rgba(11, 0, 22, 0.35);
}
.freak .swirl { animation-duration: 12s, 4s; filter: blur(18px) saturate(2); }
.freak .rings { animation-duration: 2.5s; }
.freak .veil { background: radial-gradient(ellipse at 50% 40%, rgba(11, 0, 22, 0.1), rgba(11, 0, 22, 0.7) 80%); }
.calm .swirl, .calm .rings, .calm .title span, .calm .marquee span, .calm .disc,
.calm .card::before { animation-play-state: paused; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes hue { to { filter: blur(40px) saturate(1.3) hue-rotate(360deg); } }
@keyframes breathe { 50% { transform: scale(1.15); opacity: 0.7; } }

/* ---------- Mirror shards ---------- */
.shards { position: fixed; inset: 0; z-index: 30; pointer-events: none; }
.shard {
  position: absolute;
  width: 17%;
  height: 34%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(180, 220, 255, 0.35) 50%, rgba(255, 255, 255, 0.7));
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.9);
  animation: shatter 1.3s cubic-bezier(0.3, 0, 0.8, 1) forwards;
}
@keyframes shatter {
  0% { transform: none; opacity: 0.95; }
  100% { transform: translate(var(--dx), calc(var(--dy) + 60vh)) rotate(var(--rot)); opacity: 0; }
}

/* ---------- Backglass (score) ---------- */
.backglass {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: baseline;
  gap: 12px;
  max-width: calc(100vw - 32px);
  padding: 8px 16px;
  border-radius: 10px;
  background: #120006;
  border: 2px solid var(--amber);
  box-shadow: 0 0 18px rgba(255, 176, 0, 0.5), inset 0 0 14px rgba(255, 80, 0, 0.35);
  color: #ff8a1c;
  text-shadow: 0 0 6px #ff6a00;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
}
.backglass .label { font-size: 11px; letter-spacing: 0.2em; opacity: 0.75; }
.backglass .digits { font-size: 22px; letter-spacing: 0.12em; font-variant-numeric: tabular-nums; }
.backglass .msg { font-size: 11px; letter-spacing: 0.12em; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

/* ---------- Content ---------- */
main {
  position: relative;
  z-index: 2;
  max-width: 760px;
  margin: 0 auto;
  padding: 72px 16px 140px;
}
nav.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
nav.top a { color: var(--ink); text-decoration: none; opacity: 0.85; }
nav.top a:hover { opacity: 1; text-decoration: underline; }
.controls { display: flex; gap: 8px; flex-wrap: wrap; }
button {
  font: inherit;
  font-size: 13px;
  color: var(--ink);
  background: rgba(20, 0, 40, 0.7);
  border: 1px solid var(--pink);
  border-radius: 999px;
  padding: 6px 14px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 43, 214, 0.4);
}
button:hover { background: rgba(255, 43, 214, 0.25); }
button:focus-visible, a:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }

.hero { text-align: center; margin: 48px 0 20px; }
.kicker {
  margin: 0;
  color: var(--dim);
  font-size: 14px;
  letter-spacing: 0.06em;
  text-shadow: 0 2px 8px #000;
}
.title {
  margin: 8px 0;
  font-family: Monoton, 'Space Mono', sans-serif;
  font-weight: 400;
  font-size: clamp(56px, 17vw, 150px);
  line-height: 1;
  letter-spacing: 0.02em;
}
.title span {
  display: inline-block;
  color: hsl(calc(var(--i) * 60), 100%, 62%);
  text-shadow: 0 0 12px currentColor, 0 0 40px currentColor;
  animation: wobble 3.2s ease-in-out infinite, glow 6s linear infinite;
  animation-delay: calc(var(--i) * -0.4s), calc(var(--i) * -1s);
}
@keyframes wobble {
  0%, 100% { transform: translateY(0) rotate(-4deg) scale(1); }
  50% { transform: translateY(-10px) rotate(4deg) scale(1.08); }
}
@keyframes glow { to { filter: hue-rotate(360deg); } }

.marquee {
  overflow: hidden;
  white-space: nowrap;
  margin: 18px -16px 28px;
  padding: 8px 0;
  background: repeating-linear-gradient(90deg, var(--amber) 0 24px, #1a0006 24px 48px);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.15em;
  transform: rotate(-2deg);
}
.marquee span {
  display: inline-block;
  padding: 2px 0;
  background: #1a0006;
  animation: scroll 40s linear infinite;
}
@keyframes scroll { to { transform: translateX(-50%); } }

.card {
  position: relative;
  margin: 0 0 28px;
  padding: 22px 24px;
  border-radius: 18px;
  background: rgba(12, 0, 26, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  isolation: isolate;
}
.card::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 20px;
  padding: 2px;
  background: conic-gradient(from var(--a, 0deg), hsl(var(--hue, 300), 100%, 60%), var(--amber), var(--cyan), hsl(var(--hue, 300), 100%, 60%));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  filter: drop-shadow(0 0 8px hsl(var(--hue, 300), 100%, 60%));
  animation: border-spin 8s linear infinite;
}
@property --a { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes border-spin { to { --a: 360deg; } }

.intro p { margin: 0 0 12px; line-height: 1.6; color: var(--dim); white-space: pre-wrap; }
.intro p:last-child { margin-bottom: 0; }

.tracks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 36px;
  justify-content: center;
}
.tracks a {
  color: var(--ink);
  text-decoration: none;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(12, 0, 26, 0.8);
  border: 1px solid hsl(var(--hue), 100%, 60%);
  transition: transform 0.15s, background 0.15s, box-shadow 0.15s;
}
.tracks a b { color: hsl(var(--hue), 100%, 68%); margin-right: 2px; }
.tracks a:hover { transform: scale(1.08) rotate(-2deg); }
.tracks a.on {
  background: hsl(var(--hue), 100%, 45%);
  box-shadow: 0 0 16px hsl(var(--hue), 100%, 60%);
}
.tracks a.on b { color: #fff; }

.song header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; }
.song .num {
  font-family: Monoton, sans-serif;
  font-size: 34px;
  color: hsl(var(--hue), 100%, 65%);
  text-shadow: 0 0 10px hsl(var(--hue), 100%, 55%);
  flex: none;
}
.song h2 {
  margin: 0;
  font-family: Shrikhand, Georgia, serif;
  font-weight: 400;
  font-size: clamp(24px, 6vw, 36px);
  line-height: 1.15;
  background: linear-gradient(90deg, hsl(var(--hue), 100%, 70%), var(--amber), hsl(calc(var(--hue) + 120), 100%, 70%));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  overflow-wrap: anywhere;
}
.lyrics p {
  margin: 0 0 1.1em;
  white-space: pre-wrap;
  line-height: 1.65;
  font-size: 15.5px;
  overflow-wrap: anywhere;
}
.lyrics p:last-child { margin-bottom: 0; }
/* One line of the song per span; long lines wrap with a hanging indent. */
.lyrics span { display: block; padding-left: 1.5em; text-indent: -1.5em; }

.instrumental { display: flex; align-items: center; gap: 18px; }
.instrumental p { margin: 0; font-style: italic; color: var(--dim); letter-spacing: 0.2em; }
.disc {
  width: 84px;
  height: 84px;
  flex: none;
  border-radius: 50%;
  background:
    radial-gradient(circle, #0b0016 0 6px, hsl(var(--hue), 100%, 60%) 6px 18px, transparent 18px),
    repeating-radial-gradient(circle, #111 0 2px, #2a2a3a 2px 4px);
  box-shadow: 0 0 18px hsl(var(--hue), 100%, 55%);
  animation: spin 1.8s linear infinite;
  position: relative;
}
.disc::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(transparent 0 40deg, rgba(255, 255, 255, 0.25) 60deg, transparent 80deg);
}

.outro p { margin: 0 0 10px; color: var(--dim); line-height: 1.6; }
.outro p:last-child { margin: 0; }
.outro a { color: var(--cyan); }
.help { font-size: 13px; }
kbd {
  font: inherit;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--dim);
  background: rgba(255, 255, 255, 0.08);
}

/* ---------- Touch flippers ---------- */
.flipbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 10px;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  pointer-events: none;
}
.flipbar button {
  pointer-events: auto;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  width: 56px;
  height: 56px;
  padding: 0;
  font-size: 20px;
  opacity: 0.75;
}
.flipbar button:active { background: var(--pink); opacity: 1; }

@media (max-width: 520px) {
  .backglass { gap: 8px; padding: 6px 12px; }
  .backglass .digits { font-size: 18px; }
  .card { padding: 18px 16px; }
  .lyrics p { font-size: 14.5px; }
  .flipbar { padding: 0 8px; }
  .flipbar button { width: 46px; height: 46px; font-size: 16px; opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .swirl, .rings, .title span, .marquee span, .disc, .card::before, .shard { animation: none !important; }
}
</style>
