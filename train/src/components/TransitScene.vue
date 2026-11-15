<script setup>
// Deterministic pseudo-random so the city looks the same on every load.
let seed = 11
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

const W = 1200 // width of one repeating copy of a scrolling layer
const GROUND = 400

const stars = Array.from({ length: 55 }, () => ({
  x: rand() * W,
  y: rand() * 170,
  r: 0.6 + rand() * 1.2,
  delay: (rand() * 4).toFixed(2)
}))

// A row of buildings filling one layer copy, with some windows lit.
function skyline({ minH, maxH, minW, maxW, litChance, gap }) {
  const buildings = []
  let x = 0
  while (x < W) {
    const w = Math.min(minW + rand() * (maxW - minW), W - x)
    const h = minH + rand() * (maxH - minH)
    const top = GROUND - h
    const windows = []
    for (let wy = top + 12; wy < GROUND - 16; wy += 16) {
      for (let wx = x + 8; wx < x + w - 12; wx += 13) {
        if (rand() < litChance) windows.push({ x: wx, y: wy })
      }
    }
    buildings.push({ x, w, top, h, windows, antenna: rand() < 0.25 })
    x += w + gap
  }
  return buildings
}

const farCity = skyline({ minH: 130, maxH: 270, minW: 50, maxW: 110, litChance: 0.22, gap: 6 })
const nearCity = skyline({ minH: 60, maxH: 150, minW: 90, maxW: 170, litChance: 0.35, gap: 26 })

// The tram: three articulated sections.
const sections = [
  { x: 250, w: 200 },
  { x: 460, w: 180 },
  { x: 650, w: 210 }
]
const BODY_TOP = 300
const BODY_BOTTOM = 388

// Windows along each section, leaving a slot in the middle for a door.
function windowsFor(s) {
  const doorX = s.x + s.w / 2 - 17
  const out = []
  for (let x = s.x + 10; x + 28 <= s.x + s.w - 8; x += 34) {
    if (x + 28 > doorX - 4 && x < doorX + 38) continue
    out.push(x)
  }
  return { doorX, windows: out }
}
const sectionParts = sections.map(s => ({ ...s, ...windowsFor(s) }))

// Bogies (wheel pairs) under the ends and the joints.
const bogies = [290, 455, 645, 815]
</script>

<template>
  <div class="scene" role="img" aria-label="A city tram gliding along a street at night, powered from an overhead wire">
    <svg viewBox="0 0 1200 460" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0b0e26" />
          <stop offset="0.65" stop-color="#1d1840" />
          <stop offset="1" stop-color="#4a2440" />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stop-color="#fff3c4" stop-opacity="0.45" />
          <stop offset="1" stop-color="#fff3c4" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="beam" cx="0" cy="0.5" r="1">
          <stop offset="0" stop-color="#ffe7a8" stop-opacity="0.5" />
          <stop offset="1" stop-color="#ffe7a8" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff1c2" />
          <stop offset="1" stop-color="#ffc56b" />
        </linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4f1e8" />
          <stop offset="1" stop-color="#cfcabb" />
        </linearGradient>
        <radialGradient id="lampGlow">
          <stop offset="0" stop-color="#ffd27a" stop-opacity="0.5" />
          <stop offset="1" stop-color="#ffd27a" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="460" fill="url(#sky)" />

      <!-- stars + moon -->
      <circle v-for="(s, i) in stars" :key="'s' + i" :cx="s.x" :cy="s.y" :r="s.r"
        class="star" :style="{ animationDelay: s.delay + 's' }" />
      <circle cx="980" cy="80" r="80" fill="url(#moonGlow)" />
      <circle cx="980" cy="80" r="30" fill="#fff3c4" />
      <circle cx="994" cy="71" r="26" fill="#161638" />

      <!-- far skyline (slow) -->
      <g class="layer far">
        <g v-for="k in 2" :key="'f' + k" :transform="`translate(${(k - 1) * W} 0)`">
          <g v-for="(b, i) in farCity" :key="i">
            <rect :x="b.x" :y="b.top" :width="b.w" :height="b.h" fill="#1a1b3f" />
            <line v-if="b.antenna" :x1="b.x + b.w / 2" :y1="b.top" :x2="b.x + b.w / 2" :y2="b.top - 26" stroke="#1a1b3f" stroke-width="3" />
            <circle v-if="b.antenna" :cx="b.x + b.w / 2" :cy="b.top - 27" r="2.5" class="beacon" />
            <rect v-for="(w, j) in b.windows" :key="j" :x="w.x" :y="w.y" width="5" height="7" fill="#ffd166" opacity="0.35" />
          </g>
        </g>
      </g>

      <!-- near buildings (faster) -->
      <g class="layer near">
        <g v-for="k in 2" :key="'n' + k" :transform="`translate(${(k - 1) * W} 0)`">
          <g v-for="(b, i) in nearCity" :key="i">
            <rect :x="b.x" :y="b.top" :width="b.w" :height="b.h" fill="#11122c" />
            <rect :x="b.x - 3" :y="b.top - 4" :width="b.w + 6" height="5" fill="#181a3a" />
            <rect v-for="(w, j) in b.windows" :key="j" :x="w.x" :y="w.y" width="6" height="8" fill="#ffe7a8" opacity="0.7" class="win" />
          </g>
        </g>
      </g>

      <!-- street -->
      <rect x="0" y="400" width="1200" height="60" fill="#0b0b1a" />
      <rect x="0" y="398" width="1200" height="3" fill="#7d82ad" />
      <rect x="0" y="406" width="1200" height="2" fill="#4b4f78" />
      <g class="layer dashes">
        <rect v-for="n in 30" :key="'d' + n" :x="(n - 1) * 80" y="438" width="40" height="4" rx="2" fill="#3b3f63" />
      </g>

      <!-- catenary poles + street lamps (scroll with the street) -->
      <g class="layer street">
        <g v-for="k in 2" :key="'p' + k" :transform="`translate(${(k - 1) * W} 0)`">
          <g v-for="px in [100, 500, 900]" :key="px">
            <circle :cx="px + 30" cy="250" r="60" fill="url(#lampGlow)" />
            <rect :x="px - 3" y="222" width="6" height="178" fill="#2b2e52" />
            <rect :x="px" y="226" width="34" height="3" fill="#2b2e52" />
            <rect :x="px + 22" y="246" width="16" height="5" rx="2" fill="#2b2e52" />
            <rect :x="px + 24" y="250" width="12" height="3" rx="1.5" fill="#ffe2a0" />
          </g>
        </g>
      </g>

      <!-- overhead contact wire -->
      <line x1="0" y1="232" x2="1200" y2="232" stroke="#8e93bd" stroke-width="1.5" />

      <!-- the tram -->
      <g class="tram">
        <!-- headlight beam on the road ahead -->
        <path d="M882 362 L1200 330 L1200 420 Z" fill="url(#beam)" />

        <!-- pantograph on the middle section, touching the wire -->
        <g class="panto" stroke="#3a3f66" stroke-width="3" fill="none" stroke-linecap="round">
          <path d="M528 296 L550 262 L536 234" />
          <path d="M572 296 L550 262 L564 234" />
          <line x1="526" y1="234" x2="574" y2="234" stroke="#c9cde8" stroke-width="3" />
        </g>
        <rect x="524" y="292" width="52" height="8" rx="2" fill="#3a3f66" />
        <circle cx="550" cy="233" r="5" class="spark" />

        <!-- roof equipment -->
        <rect x="300" y="292" width="70" height="9" rx="3" fill="#3a3f66" />
        <rect x="700" y="292" width="80" height="9" rx="3" fill="#3a3f66" />

        <!-- articulation bellows -->
        <rect x="448" y="306" width="14" height="78" fill="#2a2f4d" />
        <rect x="638" y="306" width="14" height="78" fill="#2a2f4d" />

        <!-- rear + front noses -->
        <path :d="`M256 ${BODY_TOP} Q226 ${BODY_TOP} 222 330 L218 ${BODY_BOTTOM} L256 ${BODY_BOTTOM} Z`" fill="url(#body)" />
        <path :d="`M854 ${BODY_TOP} Q884 ${BODY_TOP} 890 330 L894 ${BODY_BOTTOM} L854 ${BODY_BOTTOM} Z`" fill="url(#body)" />
        <!-- front windscreen + rear window -->
        <path d="M858 308 Q880 308 884 330 L886 354 L858 354 Z" fill="url(#glass)" class="win" />
        <path d="M252 308 Q230 308 227 330 L225 354 L252 354 Z" fill="url(#glass)" class="win" />

        <!-- sections -->
        <g v-for="(s, i) in sectionParts" :key="'sec' + i">
          <rect :x="s.x" :y="BODY_TOP" :width="s.w" :height="BODY_BOTTOM - BODY_TOP" rx="6" fill="url(#body)" />
          <!-- window band -->
          <rect :x="s.x + 4" y="306" :width="s.w - 8" height="52" rx="4" fill="#1a1e3a" />
          <rect v-for="wx in s.windows" :key="wx" :x="wx" y="310" width="28" height="44" rx="3" fill="url(#glass)" class="win" />
          <!-- door: two glazed leaves, full height -->
          <rect :x="s.doorX" y="308" width="34" height="78" rx="3" fill="#1a1e3a" />
          <rect :x="s.doorX + 3" y="311" width="13" height="72" rx="2" fill="url(#glass)" class="win" />
          <rect :x="s.doorX + 18" y="311" width="13" height="72" rx="2" fill="url(#glass)" class="win" />
        </g>

        <!-- livery stripe + skirt, full length -->
        <path d="M222 360 L890 360 L891 370 L220 370 Z" fill="#ff8a3d" />
        <path d="M220 370 L891 370 L893 382 L219 382 Z" fill="#e5484d" />
        <path d="M218 382 L894 382 L894 390 L218 390 Z" fill="#2a2f4d" />

        <!-- destination display -->
        <rect x="856" y="296" width="30" height="10" rx="2" fill="#14162e" />
        <text x="871" y="304" text-anchor="middle" class="dest">1</text>

        <!-- lights -->
        <circle cx="888" cy="362" r="5" fill="#fff3c4" />
        <rect x="219" y="356" width="5" height="10" rx="2" fill="#ff4d4d" class="tail" />

        <!-- wheels peeking out under the skirt -->
        <g v-for="bx in bogies" :key="'b' + bx">
          <g class="wheel"><circle :cx="bx - 14" cy="394" r="8" /><path :d="`M${bx - 14} 386 V402 M${bx - 22} 394 H${bx - 6}`" /></g>
          <g class="wheel"><circle :cx="bx + 14" cy="394" r="8" /><path :d="`M${bx + 14} 386 V402 M${bx + 6} 394 H${bx + 22}`" /></g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.scene {
  width: 100%;
  max-width: 1100px;
  aspect-ratio: 1200 / 460;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #23264a;
  box-shadow: 0 30px 80px -20px #000, 0 0 0 1px #ffffff08 inset;
}

svg { display: block; width: 100%; height: 100%; }

.star { fill: #fff; animation: twinkle 4s ease-in-out infinite; }
@keyframes twinkle { 0%, 100% { opacity: .9 } 50% { opacity: .25 } }

.beacon { fill: #ff4d4d; animation: blink 2s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0.15; } }

/* Parallax: each layer holds two 1200px copies and scrolls by one copy, so it loops seamlessly.
   Street-level things (poles, dashes) share one speed: 72px/s. */
.layer { animation: scroll linear infinite; }
.far { animation-duration: 80s; }
.near { animation-duration: 36s; }
.street { animation-duration: 16.667s; }
.dashes { animation: dashes 1.111s linear infinite; }
@keyframes scroll { to { transform: translateX(-1200px); } }
@keyframes dashes { to { transform: translateX(-80px); } }

/* Trams glide — just a gentle sway. */
.tram { animation: sway 1.4s ease-in-out infinite alternate; }
@keyframes sway { to { transform: translateY(-1px); } }

.panto { animation: panto 1.4s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: bottom; }
@keyframes panto { to { transform: scaleY(1.03); } }

.spark { fill: #9fd8ff; opacity: 0; animation: spark 3.3s linear infinite; }
@keyframes spark {
  0%, 86%, 100% { opacity: 0; r: 3; }
  88% { opacity: 1; r: 7; }
  90% { opacity: .2; r: 4; }
  92% { opacity: .9; r: 6; }
}

.wheel { fill: #2a2f4d; stroke: #9aa0c8; stroke-width: 2.5; animation: spin .7s linear infinite; transform-box: fill-box; transform-origin: center; }
.wheel path { stroke-width: 1.5; fill: none; }
@keyframes spin { to { transform: rotate(360deg); } }

.win { animation: flicker 5s ease-in-out infinite; }
@keyframes flicker { 0%, 100% { opacity: 1 } 47% { opacity: .88 } 50% { opacity: 1 } }

.tail { filter: drop-shadow(0 0 4px #ff4d4d); }

.dest {
  font: 700 9px ui-monospace, monospace;
  fill: #ffb347;
}

@media (prefers-reduced-motion: reduce) {
  .layer, .dashes, .tram, .panto, .spark, .wheel, .win, .star, .beacon { animation: none; }
}
</style>
