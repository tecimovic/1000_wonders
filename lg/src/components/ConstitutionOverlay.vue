<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { constitution } from '../constitution.js'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const okBtn = ref(null)
const scroller = ref(null)

watch(() => props.open, async (open) => {
  if (!open) return
  await nextTick()
  if (scroller.value) scroller.value.scrollTop = 0
  okBtn.value?.focus()
})

function onKey(e) {
  if (props.open && e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const corners = ['tl', 'tr', 'bl', 'br']
</script>

<template>
  <Teleport to="body">
    <Transition name="decree">
      <div v-if="open" class="decree-backdrop" @click.self="emit('close')">
        <div class="decree" role="dialog" aria-modal="true" aria-labelledby="decree-title">
          <div class="decree-frame" aria-hidden="true"></div>

          <!-- Golden corner flourishes -->
          <svg
            v-for="c in corners"
            :key="c"
            :class="['corner', c]"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <defs>
              <linearGradient :id="`gold-${c}`" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fff3b0" />
                <stop offset="0.45" stop-color="#d4af37" />
                <stop offset="1" stop-color="#8a6212" />
              </linearGradient>
            </defs>
            <g :stroke="`url(#gold-${c})`" fill="none" stroke-width="2.4" stroke-linecap="round">
              <path d="M6 94 V20 Q6 6 20 6 H94" />
              <path d="M14 94 V26 Q14 14 26 14 H94" stroke-width="1.2" />
              <path d="M20 20 C34 22 42 30 44 44 C30 42 22 34 20 20 Z" />
              <path d="M44 44 C52 40 60 42 66 48" />
              <path d="M44 44 C40 52 42 60 48 66" />
              <path d="M30 6 C30 18 40 24 54 22" stroke-width="1.4" />
              <path d="M6 30 C18 30 24 40 22 54" stroke-width="1.4" />
            </g>
            <circle cx="20" cy="20" r="4" :fill="`url(#gold-${c})`" />
            <circle cx="66" cy="48" r="2.4" :fill="`url(#gold-${c})`" />
            <circle cx="48" cy="66" r="2.4" :fill="`url(#gold-${c})`" />
          </svg>

          <div ref="scroller" class="decree-scroll">
            <header class="decree-header">
              <div class="crest" aria-hidden="true">⚜</div>
              <h1 id="decree-title">
                <span v-if="constitution.title.length > 1" class="title-pre">{{ constitution.title[0] }}</span>
                <span class="title-main">{{ constitution.title[constitution.title.length - 1] }}</span>
              </h1>
              <div class="flourish" aria-hidden="true"><span>❦</span></div>
            </header>

            <section v-for="(s, i) in constitution.sections" :key="i" class="decree-section">
              <h2 v-if="s.heading">
                <span class="heading-name">{{ s.heading }}</span>
                <span v-if="s.subtitle" class="heading-sub">{{ s.subtitle }}</span>
              </h2>
              <template v-for="(item, j) in s.content" :key="j">
                <p v-if="item.type === 'p'" :class="{ 'drop-cap': i === 0 && j === 0 }">{{ item.text }}</p>
                <ol v-else class="clauses">
                  <li v-for="cl in item.items" :key="cl.n">
                    <span class="clause-n">{{ cl.n }}</span>
                    <span class="clause-text">{{ cl.text }}</span>
                  </li>
                </ol>
              </template>
              <div v-if="i < constitution.sections.length - 1" class="divider" aria-hidden="true">
                <span>✦ ✦ ✦</span>
              </div>
            </section>

            <footer v-if="constitution.signatories" class="signatories">
              <div class="flourish" aria-hidden="true"><span>❦</span></div>
              <h3>{{ constitution.signatories.heading }}</h3>
              <div class="sig-row">
                <div v-for="name in constitution.signatories.names" :key="name" class="sig">
                  <span class="sig-hand">{{ name }}</span>
                  <span class="sig-line"></span>
                  <span class="sig-print">{{ name }}</span>
                </div>
              </div>
              <div class="seal" aria-hidden="true" title="Sealed by the grace of the Lightning God">
                <span>L·G</span>
              </div>
            </footer>
          </div>

          <div class="decree-actions">
            <button ref="okBtn" type="button" class="ok-btn" @click="emit('close')">Ok</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.decree-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(20, 10, 0, 0.35), rgba(0, 0, 0, 0.7));
  backdrop-filter: blur(2px);
}

.decree {
  --gold-1: #fff3b0;
  --gold-2: #d4af37;
  --gold-3: #8a6212;
  --ink: #2a1a08;
  --crimson: #6e1111;

  position: relative;
  width: 80vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  border-radius: 6px;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255, 250, 230, 0.9) 0%, rgba(255, 250, 230, 0) 70%),
    radial-gradient(ellipse at 0% 0%, rgba(140, 90, 20, 0.35) 0%, transparent 40%),
    radial-gradient(ellipse at 100% 100%, rgba(140, 90, 20, 0.35) 0%, transparent 40%),
    radial-gradient(ellipse at 100% 0%, rgba(140, 90, 20, 0.22) 0%, transparent 35%),
    radial-gradient(ellipse at 0% 100%, rgba(140, 90, 20, 0.22) 0%, transparent 35%),
    repeating-linear-gradient(0deg, rgba(120, 80, 20, 0.025) 0 2px, transparent 2px 5px),
    #ecd9ac;
  box-shadow:
    0 0 0 3px #6b4a0e,
    0 0 0 6px var(--gold-2),
    0 0 0 8px #fff1b8,
    0 0 0 11px var(--gold-3),
    0 0 60px 14px rgba(212, 175, 55, 0.35),
    0 30px 90px rgba(0, 0, 0, 0.8),
    inset 0 0 80px rgba(110, 70, 10, 0.45);
}

/* Inner double gold rule */
.decree-frame {
  position: absolute;
  inset: 16px;
  border: 3px double var(--gold-3);
  outline: 1px solid rgba(212, 175, 55, 0.7);
  outline-offset: 5px;
  pointer-events: none;
  border-radius: 2px;
}

.corner {
  position: absolute;
  width: clamp(56px, 9vw, 110px);
  height: clamp(56px, 9vw, 110px);
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(60, 30, 0, 0.5));
  z-index: 2;
}
.corner.tl { top: 4px; left: 4px; }
.corner.tr { top: 4px; right: 4px; transform: scaleX(-1); }
.corner.bl { bottom: 4px; left: 4px; transform: scaleY(-1); }
.corner.br { bottom: 4px; right: 4px; transform: scale(-1, -1); }

.decree-scroll {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 34px 34px 0;
  padding: 1.5rem clamp(1rem, 6vw, 5.5rem) 2rem;
  font-family: 'EB Garamond', 'Garamond', 'Times New Roman', serif;
  font-size: clamp(1.02rem, 1.25vw, 1.22rem);
  line-height: 1.6;
  scrollbar-color: var(--gold-3) transparent;
  scrollbar-width: thin;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 1.5rem, #000 calc(100% - 1.5rem), transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0, #000 1.5rem, #000 calc(100% - 1.5rem), transparent 100%);
}

/* ── Title ── */
.decree-header {
  text-align: center;
}

.crest {
  font-size: 2.6em;
  line-height: 1;
  color: var(--gold-2);
  text-shadow: 0 1px 0 #fff6c8, 0 2px 3px rgba(80, 40, 0, 0.5);
}

h1 {
  margin: 0.2em 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Cinzel Decorative', 'Cinzel', 'Trajan Pro', serif;
  font-weight: 700;
  line-height: 1.15;
}

.title-pre {
  font-family: 'Cinzel', serif;
  font-size: 0.55em;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--crimson);
}

.title-main {
  font-size: clamp(1.7rem, 3.6vw, 3.2rem);
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #fff1a8 0%, #d4af37 35%, #9a6c10 60%, #e9c85a 85%, #7a5208 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 0 rgba(60, 30, 0, 0.6)) drop-shadow(0 0 1px rgba(60, 30, 0, 0.4));
}

.flourish {
  display: flex;
  align-items: center;
  gap: 0.8em;
  margin: 1em auto 1.4em;
  max-width: 34em;
  color: var(--gold-3);
  font-size: 1.5em;
}
.flourish::before,
.flourish::after {
  content: '';
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold-2) 30%, var(--gold-3));
}
.flourish::after {
  background: linear-gradient(270deg, transparent, var(--gold-2) 30%, var(--gold-3));
}

/* ── Sections ── */
.decree-section {
  max-width: 48em;
  margin: 0 auto;
}

h2 {
  margin: 0.4em 0 0.8em;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: 'Cinzel', 'Trajan Pro', serif;
  font-weight: 700;
}

.heading-name {
  font-size: 1.35em;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--crimson);
}

.heading-sub {
  margin-top: 0.2em;
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 1.15em;
  letter-spacing: 0.02em;
  color: #5a3b0c;
}

p {
  margin: 0 0 1em;
  text-align: justify;
  hyphens: auto;
}

.drop-cap::first-letter {
  float: left;
  margin: 0.06em 0.1em 0 0;
  font-family: 'Cinzel Decorative', serif;
  font-size: 2.9em;
  line-height: 0.8;
  color: var(--crimson);
  text-shadow: 1px 1px 0 var(--gold-2);
}

.clauses {
  clear: both;
  list-style: none;
  margin: 0 0 1em;
  padding: 0;
}

.clauses li {
  display: flex;
  gap: 0.9em;
  margin-bottom: 0.65em;
  text-align: justify;
}

.clause-n {
  flex: none;
  width: 1.9em;
  height: 1.9em;
  margin-top: 0.05em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.85em;
  color: #3a2504;
  background: radial-gradient(circle at 35% 30%, var(--gold-1), var(--gold-2) 55%, var(--gold-3));
  box-shadow: 0 0 0 1px #6b4a0e, 0 1px 2px rgba(60, 30, 0, 0.5);
}

.clause-text {
  flex: 1;
}

.divider {
  margin: 1.6em 0 1.4em;
  text-align: center;
  color: var(--gold-3);
  letter-spacing: 0.6em;
  font-size: 0.9em;
}

/* ── Signatories ── */
.signatories {
  max-width: 48em;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

h3 {
  margin: 0 0 1.2em;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-size: 1em;
  color: var(--crimson);
}

.sig-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5em 3em;
}

.sig {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 11em;
}

.sig-hand {
  font-family: 'Pinyon Script', 'Brush Script MT', cursive;
  font-size: 1.9em;
  line-height: 1.2;
  color: #1c2a5a;
  transform: rotate(-3deg);
}

.sig-line {
  align-self: stretch;
  height: 1px;
  background: var(--ink);
  opacity: 0.6;
}

.sig-print {
  margin-top: 0.2em;
  font-family: 'Cinzel', serif;
  font-size: 0.72em;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #5a3b0c;
}

.seal {
  width: 5.5em;
  height: 5.5em;
  margin: 1.8em auto 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 46% 54% 50% 50% / 52% 48% 52% 48%;
  background: radial-gradient(circle at 38% 32%, #d34a3a, #8e1414 55%, #4e0606);
  box-shadow:
    inset 0 0 0 0.45em rgba(0, 0, 0, 0.15),
    inset 0 0 0 0.55em rgba(255, 140, 120, 0.25),
    0 3px 6px rgba(40, 0, 0, 0.5);
  transform: rotate(-8deg);
}
.seal span {
  font-family: 'Cinzel Decorative', serif;
  font-weight: 700;
  font-size: 1.3em;
  color: #5a0808;
  text-shadow: 0 1px 0 rgba(255, 150, 130, 0.45), 0 -1px 0 rgba(0, 0, 0, 0.4);
}

/* ── Ok button ── */
.decree-actions {
  display: flex;
  justify-content: center;
  padding: 0.9rem 0 2.1rem;
  position: relative;
  z-index: 3;
}

.ok-btn {
  min-width: 9em;
  padding: 0.55em 2.2em;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #3a2504;
  cursor: pointer;
  border: 2px solid #6b4a0e;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff3b0 0%, #e7c55a 40%, #b8891d 60%, #e0bc50 100%);
  box-shadow:
    inset 0 1px 0 #fffbe0,
    0 0 0 3px #ecd9ac,
    0 0 0 4px var(--gold-3),
    0 4px 10px rgba(60, 30, 0, 0.45);
  text-shadow: 0 1px 0 rgba(255, 245, 200, 0.7);
  transition: filter 0.15s, transform 0.15s;
}
.ok-btn:hover {
  filter: brightness(1.08) saturate(1.1);
  transform: translateY(-1px);
}
.ok-btn:active {
  transform: translateY(1px);
}
.ok-btn:focus-visible {
  outline: 2px solid var(--crimson);
  outline-offset: 6px;
}

/* ── Entrance ── */
.decree-enter-active,
.decree-leave-active {
  transition: opacity 0.3s ease;
}
.decree-enter-active .decree,
.decree-leave-active .decree {
  transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2), opacity 0.3s;
}
.decree-enter-from,
.decree-leave-to {
  opacity: 0;
}
.decree-enter-from .decree,
.decree-leave-to .decree {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}

@media (max-width: 600px) {
  .decree {
    width: 92vw;
    height: 86vh;
  }
  .decree-scroll {
    margin: 26px 22px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .decree-enter-active .decree,
  .decree-leave-active .decree {
    transition: opacity 0.2s;
  }
}
</style>
