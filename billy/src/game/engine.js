// The game loop: a fixed 60 updates per second (independent of the screen's
// refresh rate), drawing to a canvas at the room's native resolution. The
// page scales the canvas up with crisp pixels.

import { TILE, COLS, ROWS, parseRoom } from './room.js'
import { ROOMS } from './rooms.js'
import { createPlayer, updatePlayer, hitbox } from './player.js'
import {
  billySprite, keySprites, tileSprites, cactusSprite, doorSprites,
  deathSprite, DEATH_ANIMATION_FRAMES, DEATH_FRAME_OFFSET_X
} from './sprites.js'

export const WIDTH = COLS * TILE
export const HEIGHT = ROWS * TILE

const STEP_MS = 1000 / 60
const KEY_FLASH_FRAMES = 6
// How long the gravestone stands alone before the "you died" screen.
const DEAD_PAUSE_FRAMES = 30
const NO_INPUT = { walk: 0, jump: false }

/**
 * Creates the game on `canvas`, reading the controls from `input` ({ walk,
 * jump }, see input.js). `onStatus` is called with { state, roomTitle,
 * roomDescription, inventory } whenever one of those changes. inventory is a list of item
 * types (e.g. ['key']). state is one of:
 *   'playing'
 *   'dying'   touched something deadly; the death animation is running
 *   'dead'    the animation is over (show "you died")
 *   'won'     Billy walked out through an open door: he's free
 */
export function createGame(canvas, input, { onStatus = () => {} } = {}) {
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  const keyImages = keySprites()

  let room, tiles, cactus, doorImages, player, state, frame, deathTick, inventory
  let rafId = null
  let lastTime = 0
  let pending = 0

  function status() {
    onStatus({
      state,
      roomTitle: room.title,
      roomDescription: room.description,
      inventory: [...inventory]
    })
  }

  function reset() {
    room = parseRoom(ROOMS[0])
    tiles = tileSprites(room.colors)
    cactus = cactusSprite(room.colors)
    doorImages = doorSprites(room.colors)
    player = createPlayer(room)
    input.walk = 0
    state = 'playing'
    frame = 0
    deathTick = 0
    inventory = []
    status()
  }

  function collectKeys() {
    const box = hitbox(player)
    for (const key of room.keys) {
      if (key.collected) continue
      const kx = key.col * TILE
      const ky = key.row * TILE
      if (box.right > kx + 1 && box.left < kx + TILE - 1 && box.bottom > ky && box.top < ky + TILE) {
        key.collected = true
        inventory.push('key')
        // Having a key opens every door.
        for (const door of room.doors) door.locked = false
        status()
      }
    }
  }

  // Through an open door: his middle is inside the doorway.
  function walkedOut() {
    const box = hitbox(player)
    const middle = (box.left + box.right) / 2
    return room.doors.some(d =>
      !d.locked &&
      middle >= d.col * TILE && middle < (d.col + 1) * TILE &&
      box.bottom > d.topRow * TILE && box.top < (d.bottomRow + 1) * TILE)
  }

  // A cactus hurts only where it's actually green, not its whole tile.
  function touchesHazard() {
    const box = hitbox(player)
    return room.hazards.some(h => {
      const hx = h.col * TILE
      const hy = h.row * TILE
      return box.right > hx + 2 && box.left < hx + TILE - 2 && box.bottom > hy + 1 && box.top < hy + TILE
    })
  }

  function update() {
    frame++
    if (state === 'playing') {
      updatePlayer(player, input, room)
      // Walking into a wall stops him: he doesn't keep pushing against it.
      if (player.blocked) input.walk = 0
      if (touchesHazard()) {
        state = 'dying'
        player.moveDir = 0
        status()
        return
      }
      collectKeys()
      if (walkedOut()) {
        state = 'won'
        input.walk = 0
        status()
      }
    } else if (state === 'dying') {
      // If he died in mid-air, he drops to the ground first, then the
      // gravestone animation plays where he lands.
      if (!player.onGround) {
        updatePlayer(player, NO_INPUT, room)
        return
      }
      deathTick++
      if (deathTick >= DEATH_ANIMATION_FRAMES + DEAD_PAUSE_FRAMES) {
        state = 'dead'
        status()
      }
    }
  }

  function draw() {
    ctx.fillStyle = room.colors.background
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const img = tiles[room.tiles[row][col]]
        if (img) ctx.drawImage(img, col * TILE, row * TILE)
      }
    }

    const keyImg = keyImages[Math.floor(frame / KEY_FLASH_FRAMES) % keyImages.length]
    for (const key of room.keys) {
      if (!key.collected) ctx.drawImage(keyImg, key.col * TILE, key.row * TILE)
    }

    // Doors sit in walls: brick behind (it shows at the arch's corners).
    for (const d of room.doors) {
      for (let row = d.topRow; row <= d.bottomRow; row++) ctx.drawImage(tiles['#'], d.col * TILE, row * TILE)
      ctx.drawImage(d.locked ? doorImages.locked : doorImages.open, d.col * TILE, d.topRow * TILE)
    }

    for (const h of room.hazards) {
      ctx.drawImage(cactus, h.col * TILE, h.row * TILE)
    }

    const x = Math.round(player.x)
    const y = Math.round(player.y)
    if (state === 'dying' || state === 'dead') {
      const img = player.onGround ? deathSprite(player.facing, deathTick) : billySprite(player)
      ctx.drawImage(img, player.onGround ? x - DEATH_FRAME_OFFSET_X : x, y)
    } else {
      ctx.drawImage(billySprite(player), x, y)
    }
  }

  function loop(time) {
    // Cap the catch-up after a stall (e.g. a background tab) at a few frames.
    pending += Math.min(time - lastTime, STEP_MS * 5)
    lastTime = time
    while (pending >= STEP_MS) {
      update()
      pending -= STEP_MS
    }
    draw()
    rafId = requestAnimationFrame(loop)
  }

  reset()

  return {
    start() {
      if (rafId !== null) return
      lastTime = performance.now()
      pending = 0
      rafId = requestAnimationFrame(loop)
    },
    stop() {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
    },
    restart: reset
  }
}
