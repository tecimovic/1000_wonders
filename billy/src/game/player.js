// Billy's movement. Old-school platformer rules:
//
// - On the ground he walks left or right at a constant speed. One press of
//   left or right sets him walking that way, and he keeps going on his own
//   until he's told to stop (down) or walks into a wall.
// - A jump always follows the same arc. Its direction is fixed at take-off
//   (left, right or straight up): there's no steering in mid-air.
// - Walking off a ledge drops him straight down.
// - Hitting a wall in mid-air stops the sideways motion; he drops on down.
// - Holding jump jumps again as soon as he lands.
//
// Positions are in pixels; x, y is the top-left of his 8×16 sprite. One
// update is one frame at 60 fps.

import { TILE } from './room.js'

export const PHYSICS = {
  walkSpeed: 0.8,   // px per frame
  jumpSpeed: 3.8,   // initial upward speed, px per frame
  gravity: 0.2,     // px per frame², added to the vertical speed each frame
  maxFall: 4        // terminal falling speed, px per frame (keep it < TILE)
}

export const PLAYER_WIDTH = 8
export const PLAYER_HEIGHT = 16

// The part of the sprite that collides: narrower than the sprite, so he can
// stand right at a platform's edge the way it looks like he should.
const HIT_LEFT = 1
const HIT_WIDTH = 6

const EPS = 0.001

export function createPlayer(room) {
  return {
    x: room.start.col * TILE,
    y: (room.start.row + 1) * TILE - PLAYER_HEIGHT,
    vy: 0,
    onGround: true,
    moveDir: 0,      // -1, 0, 1: walking direction, or the direction of the current jump/fall
    facing: 1,       // -1 left, 1 right
    walkTick: 0,     // drives the walking animation
    blocked: false   // true when he walked into a wall on the ground this frame
  }
}

/** The player's collision box, in pixels. */
export function hitbox(p) {
  return { left: p.x + HIT_LEFT, right: p.x + HIT_LEFT + HIT_WIDTH, top: p.y, bottom: p.y + PLAYER_HEIGHT }
}

function colsOf(x) {
  const left = x + HIT_LEFT
  return [Math.floor(left / TILE), Math.floor((left + HIT_WIDTH - EPS) / TILE)]
}

function hitsWall(room, x, y) {
  const [c0, c1] = colsOf(x)
  const r0 = Math.floor(y / TILE)
  const r1 = Math.floor((y + PLAYER_HEIGHT - EPS) / TILE)
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      if (room.isSolid(c, r)) return true
    }
  }
  return false
}

function supportedAt(room, x, row) {
  const [c0, c1] = colsOf(x)
  for (let c = c0; c <= c1; c++) {
    if (room.canStandOn(c, row)) return true
  }
  return false
}

/**
 * Advances the player by one frame. `input` is { walk, jump }: walk is the
 * direction he's been told to walk (-1, 0, 1), jump whether jump is held.
 */
export function updatePlayer(p, input, room) {
  const dir = input.walk
  p.blocked = false

  if (p.onGround) {
    p.moveDir = dir
    if (dir) p.facing = dir
    if (input.jump) {
      p.vy = -PHYSICS.jumpSpeed
      p.onGround = false
    }
  }

  // ── Horizontal ──
  if (p.moveDir) {
    const nx = p.x + p.moveDir * PHYSICS.walkSpeed
    if (!hitsWall(room, nx, p.y)) {
      p.x = nx
    } else {
      // Snap flush against the wall.
      if (p.moveDir > 0) {
        p.x = Math.floor((nx + HIT_LEFT + HIT_WIDTH) / TILE) * TILE - HIT_LEFT - HIT_WIDTH
      } else {
        p.x = (Math.floor((nx + HIT_LEFT) / TILE) + 1) * TILE - HIT_LEFT
      }
      if (p.onGround) p.blocked = true
      else p.moveDir = 0
    }
  }

  // ── Vertical ──
  if (p.onGround) {
    const footRow = Math.round((p.y + PLAYER_HEIGHT) / TILE)
    if (!supportedAt(room, p.x, footRow)) {
      // Walked off a ledge: fall straight down.
      p.onGround = false
      p.vy = 0
      p.moveDir = 0
    }
  }

  if (!p.onGround) {
    p.vy = Math.min(p.vy + PHYSICS.gravity, PHYSICS.maxFall)
    let ny = p.y + p.vy

    if (p.vy > 0) {
      // Falling: land on the first wall or platform top crossed this frame.
      // Platforms only catch him if his feet were above them before.
      const oldBottom = p.y + PLAYER_HEIGHT
      const newBottom = ny + PLAYER_HEIGHT
      for (let r = Math.ceil(oldBottom / TILE - EPS); r * TILE <= newBottom; r++) {
        if (supportedAt(room, p.x, r)) {
          ny = r * TILE - PLAYER_HEIGHT
          p.vy = 0
          p.onGround = true
          break
        }
      }
    } else if (p.vy < 0) {
      // Rising: bump his head on walls (platforms let him through).
      const headRow = Math.floor(ny / TILE)
      const [c0, c1] = colsOf(p.x)
      for (let c = c0; c <= c1; c++) {
        if (room.isSolid(c, headRow)) {
          ny = (headRow + 1) * TILE
          p.vy = 0
          break
        }
      }
    }
    p.y = ny
  }

  p.walkTick = p.onGround && p.moveDir ? p.walkTick + 1 : 0
}
