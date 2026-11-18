// Monsters: everything in a room that kills Billy on touch, moving or not.
// Touching one kills him, and the "Billy has died" screen shows that type's
// deathMessage. A room lists its monsters in rooms.js as
//
//   monsters: [{ type: 'parrot', col: 1, row: 3, dir: 1 }]
//
// (col, row) is the tile the monster starts in (its top-left corner), and
// dir is the starting direction: 1 = right, -1 = left (optional, default 1). The type decides how
// it moves, how big it is and where it hurts. No DOM here: the art is in
// sprites.js (monsterSprite).

import { TILE } from './room.js'

export const MONSTER_TYPES = {
  // A little saguaro. Never moves. Put it on the floor: its tile's bottom is
  // its base.
  cactus: {
    width: 8,
    height: 8,
    // Only where it's actually green, not its whole tile.
    hitbox: { left: 2, right: 6, top: 1, bottom: 8 },
    deathMessage: 'Mind the cactus.',
    update() {}
  },

  // Flies straight across the room at one height, and turns around when it
  // hits something solid (a wall, a locked door). Platforms don't stop it.
  parrot: {
    width: 8,
    height: 8,
    speed: 0.6,           // px per frame
    deathMessage: 'Mind the parrot.',
    // Where it hurts, relative to its top-left: its body, not the empty corners.
    hitbox: { left: 1, right: 7, top: 1, bottom: 6 },
    update(m, room) {
      const type = MONSTER_TYPES.parrot
      const nextX = m.x + m.dir * type.speed
      const edge = m.dir > 0 ? nextX + type.width - 0.001 : nextX
      const col = Math.floor(edge / TILE)
      const rows = [Math.floor(m.y / TILE), Math.floor((m.y + type.height - 0.001) / TILE)]
      if (rows.some(row => room.isSolid(col, row))) {
        // Bounce: stop flush against the wall and turn around.
        m.x = m.dir > 0 ? col * TILE - type.width : (col + 1) * TILE
        m.dir = -m.dir
      } else {
        m.x = nextX
      }
    }
  }
}

/** The room's monsters, at their starting positions. */
export function createMonsters(room) {
  return (room.monsters ?? []).map(spec => {
    if (!MONSTER_TYPES[spec.type]) throw new Error(`Room "${room.title}": unknown monster type "${spec.type}"`)
    return { type: spec.type, x: spec.col * TILE, y: spec.row * TILE, dir: spec.dir ?? 1, tick: 0 }
  })
}

export function deathMessage(m) {
  return MONSTER_TYPES[m.type].deathMessage
}

export function updateMonster(m, room) {
  m.tick++
  MONSTER_TYPES[m.type].update(m, room)
}

/** The monster's deadly area, in room pixels: { left, right, top, bottom }. */
export function monsterHitbox(m) {
  const h = MONSTER_TYPES[m.type].hitbox
  return { left: m.x + h.left, right: m.x + h.right, top: m.y + h.top, bottom: m.y + h.bottom }
}
