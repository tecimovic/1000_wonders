// Pixel art, drawn as strings: one character per pixel, '.' is transparent,
// any other character is looked up in the palette. Each sprite is turned
// into a small offscreen canvas once, and drawn from there every frame.

// Billy, a cheerful skeleton, facing right. 8×16. Head, ribcage, then legs.
const BILLY_TOP = [
  '..WWWW..',
  '.WWWWWW.',
  '.WWWKWKW',
  '.WWWWWWW',
  '..WWWWW.',
  '..W.W.W.',
  '...WW...',
  '.WWWWWW.',
  'W.W..W.W',
  'W.WWWW.W',
  'W..WW..W',
  '..WWWW..'
]

const BILLY_LEGS = {
  stand: ['..W..W..', '..W..W..', '..W..W..', '..WW.WW.'],
  stride: ['..W..W..', '.W....W.', '.W....W.', '.WW...WW'],
  pass: ['...WW...', '...WW...', '..W..W..', '..WW.WW.']
}

const BILLY_PALETTE = { W: '#f2ecd8', K: '#1a1030' }

// The walking cycle, and the pose in mid-air.
const WALK_CYCLE = ['stride', 'stand', 'pass', 'stand']
const AIR_POSE = 'stride'
const FRAMES_PER_STEP = 5

export const KEY_ROWS = [
  '..YYY...',
  '.Y...Y..',
  '.Y...Y..',
  '..YYY...',
  '...Y....',
  '...YY...',
  '...Y....',
  '...YYY..'
]

// The key cycles through these colors, so it's easy to spot.
export const KEY_COLORS = ['#ffe14d', '#ff8a3d', '#ff4d8b', '#7df9ff']

const BRICK = [
  'RRRMRRRR',
  'RRRMRRRR',
  'RRRMRRRR',
  'MMMMMMMM',
  'RRRRRRRM',
  'RRRRRRRM',
  'RRRRRRRM',
  'MMMMMMMM'
]

const PLANK = [
  'PPPPPPPP',
  'pPpPpPpP',
  'p.p.p.p.',
  '........',
  '........',
  '........',
  '........',
  '........'
]

function makeSprite(rows, palette, flip = false) {
  const canvas = document.createElement('canvas')
  canvas.width = rows[0].length
  canvas.height = rows.length
  const ctx = canvas.getContext('2d')
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ch === '.') return
      ctx.fillStyle = palette[ch]
      ctx.fillRect(flip ? canvas.width - 1 - x : x, y, 1, 1)
    })
  })
  return canvas
}

let billyCache = null

function billySprites() {
  if (!billyCache) {
    billyCache = {}
    for (const [pose, legs] of Object.entries(BILLY_LEGS)) {
      const rows = [...BILLY_TOP, ...legs]
      billyCache[pose] = {
        1: makeSprite(rows, BILLY_PALETTE),
        [-1]: makeSprite(rows, BILLY_PALETTE, true)
      }
    }
  }
  return billyCache
}

/** The sprite canvas for the player in his current state. */
export function billySprite(player) {
  let pose = 'stand'
  if (!player.onGround) pose = AIR_POSE
  else if (player.walkTick > 0) pose = WALK_CYCLE[Math.floor(player.walkTick / FRAMES_PER_STEP) % WALK_CYCLE.length]
  return billySprites()[pose][player.facing]
}

export function keySprites() {
  return KEY_COLORS.map(color => makeSprite(KEY_ROWS, { Y: color }))
}

export function tileSprites(colors) {
  return {
    '#': makeSprite(BRICK, { R: colors.wall, M: colors.wallMortar }),
    '=': makeSprite(PLANK, { P: colors.platform, p: colors.platformShade })
  }
}

// Doors are 8 wide and 8 × (number of D tiles) tall; these are 16 tall,
// drawn over the wall's brick. Locked: planks with a padlock. Open: the
// door swung aside, with daylight streaming in.
const DOOR_LOCKED = [
  '..BBBB..',
  '.BBBBBB.',
  'BBbBBbBB',
  'BBbBBbBB',
  'BBbBBbBB',
  'BBbBBbBB',
  'BBbYYbBB',
  'BBYbbYBB',
  'BBYYYYBB',
  'BBYKKYBB',
  'BBYYYYBB',
  'BBbBBbBB',
  'BBbBBbBB',
  'BBbBBbBB',
  'BBbBBbBB',
  'BBbBBbBB'
]

const DOOR_OPEN = [
  '..LLLL..',
  '.LLLLLL.',
  'BlLLLLLL',
  'BlLLLLLL',
  'BlLLlLLL',
  'BlLLLLLL',
  'BlLLLLLL',
  'BlLLLLlL',
  'BlLLLLLL',
  'BlLlLLLL',
  'BlLLLLLL',
  'BlLLLLLL',
  'BlLLLlLL',
  'BlLLLLLL',
  'BlLLLLLL',
  'BlLLLLLL'
]

export function doorSprites(colors) {
  return {
    locked: makeSprite(DOOR_LOCKED, { B: colors.door, b: colors.doorShade, Y: '#ffe14d', K: '#1a1030' }),
    open: makeSprite(DOOR_OPEN, { B: colors.door, L: colors.doorLight, l: colors.doorLightShade })
  }
}

/** Icons for the inventory, as image URLs, by item type. */
export function itemIconUrls() {
  return {
    key: makeSprite(KEY_ROWS, { Y: KEY_COLORS[0] }).toDataURL()
  }
}

// A little saguaro, 8×8, sitting on the floor.
const CACTUS = [
  '...LG...',
  '.L.LG...',
  '.L.LG.G.',
  '.LGLG.G.',
  '..GLGGG.',
  '...LG...',
  '...LG...',
  '..sLGs..'
]

export function cactusSprite(colors) {
  return makeSprite(CACTUS, { G: colors.cactus, L: colors.cactusLight, s: colors.cactusShade })
}

// The gravestone Billy turns into: 11×12, with "RIP" carved in it and a bit
// of dirt at the bottom.
const GRAVESTONE = [
  '...SSSSS...',
  '.SSSSSSSSS.',
  'SSSSSSSSSSs',
  'SDDSSDSDDSs',
  'SDSDSDSDSDs',
  'SDDSSDSDDSs',
  'SDSDSDSDSSs',
  'SSSSSSSSSSs',
  'SSSSSSSSSSs',
  'SSSSSSSSSSs',
  'SSSSSSSSSSs',
  'mmmmmmmmmmm'
]

const GRAVE_PALETTE = { S: '#9a98b0', s: '#5e5c78', D: '#2c2a40', m: '#6b4a2e' }

// ── Death: Billy flashes, then morphs pixel by pixel into the gravestone ──
//
// Both are placed in one 12×16 frame: Billy (8 wide) at x = 2, the stone
// (11×12) at the bottom. So the frame is drawn at (billy.x - 2, billy.y).

export const DEATH_FRAME_OFFSET_X = 2
const DEATH_W = 12
const DEATH_H = 16
const FLASH_FRAMES = 24        // Billy blinks red and white
const FLASH_EVERY = 4
const MORPH_STEPS = 12
const FRAMES_PER_MORPH_STEP = 4
export const DEATH_ANIMATION_FRAMES = FLASH_FRAMES + MORPH_STEPS * FRAMES_PER_MORPH_STEP

const DEATH_RED = '#ff4d4d'

// Each sprite as a 12×16 grid of colors (null = transparent).
function toGrid(rows, palette, offsetX, offsetY, flip = false) {
  const grid = Array.from({ length: DEATH_H }, () => Array(DEATH_W).fill(null))
  const w = rows[0].length
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ch === '.') return
      grid[offsetY + y][offsetX + (flip ? w - 1 - x : x)] = palette[ch]
    })
  })
  return grid
}

function gridToCanvas(grid) {
  const canvas = document.createElement('canvas')
  canvas.width = DEATH_W
  canvas.height = DEATH_H
  const ctx = canvas.getContext('2d')
  grid.forEach((row, y) => row.forEach((color, x) => {
    if (!color) return
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
  }))
  return canvas
}

// Small seeded random generator, so the morph looks the same every time.
function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}

let deathCache = {}

function deathFrames(facing) {
  if (deathCache[facing]) return deathCache[facing]
  const billyRows = [...BILLY_TOP, ...BILLY_LEGS.stand]
  const flip = facing < 0
  const white = toGrid(billyRows, BILLY_PALETTE, DEATH_FRAME_OFFSET_X, 0, flip)
  const red = toGrid(billyRows, { W: DEATH_RED, K: BILLY_PALETTE.K }, DEATH_FRAME_OFFSET_X, 0, flip)
  const stone = toGrid(GRAVESTONE, GRAVE_PALETTE, 0, DEATH_H - GRAVESTONE.length)

  // When each pixel switches from Billy to stone: partly random, partly by
  // height, so the stone seems to rise out of the ground as Billy crumbles.
  const random = seededRandom(7)
  const switchAt = Array.from({ length: DEATH_H }, (_, y) =>
    Array.from({ length: DEATH_W }, () => 0.55 * random() + 0.45 * (1 - y / (DEATH_H - 1))))

  const morph = []
  for (let step = 1; step <= MORPH_STEPS; step++) {
    const t = step / MORPH_STEPS
    morph.push(gridToCanvas(red.map((row, y) => row.map((c, x) => (switchAt[y][x] < t ? stone[y][x] : c)))))
  }

  deathCache[facing] = { white: gridToCanvas(white), red: gridToCanvas(red), morph }
  return deathCache[facing]
}

/** The 12×16 death-animation frame, `tick` frames after Billy died. */
export function deathSprite(facing, tick) {
  const frames = deathFrames(facing)
  if (tick < FLASH_FRAMES) {
    return Math.floor(tick / FLASH_EVERY) % 2 === 0 ? frames.red : frames.white
  }
  const step = Math.floor((tick - FLASH_FRAMES) / FRAMES_PER_MORPH_STEP)
  return frames.morph[Math.min(step, MORPH_STEPS - 1)]
}
