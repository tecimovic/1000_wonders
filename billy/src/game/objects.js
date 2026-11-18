// Objects: things lying around a room that Billy picks up by touching them.
// A picked-up object leaves the room and goes into his inventory (shown
// above the room). A room lists its objects in rooms.js as
//
//   objects: [{ type: 'key', col: 27, row: 3 }]
//
// (col, row) is the tile the object sits in (its top-left corner). The type
// decides its name, where it can be touched, and what picking it up does. No
// DOM here: the art is in sprites.js (OBJECT_ART).

import { TILE } from './room.js'

export const OBJECT_TYPES = {
  key: {
    name: 'Key',          // shown on the inventory slot
    width: 8,
    height: 8,
    // Where it can be touched, relative to its top-left.
    hitbox: { left: 1, right: 7, top: 0, bottom: 8 },
    // Having a key opens every door in the room. It isn't used up.
    onCollect({ room }) {
      for (const door of room.doors) door.locked = false
    }
  }
}

/** The room's objects, all still lying where the room puts them. */
export function createObjects(room) {
  return (room.objects ?? []).map(spec => {
    if (!OBJECT_TYPES[spec.type]) throw new Error(`Room "${room.title}": unknown object type "${spec.type}"`)
    return { type: spec.type, x: spec.col * TILE, y: spec.row * TILE, collected: false }
  })
}

/** Where object `o` can be touched, in room pixels: { left, right, top, bottom }. */
export function objectHitbox(o) {
  const h = OBJECT_TYPES[o.type].hitbox
  return { left: o.x + h.left, right: o.x + h.right, top: o.y + h.top, bottom: o.y + h.bottom }
}

/**
 * Billy picks up `o`: it leaves the room, goes into `game.inventory`, and its
 * type's onCollect (if any) runs with `game` = { room, inventory }.
 */
export function collectObject(o, game) {
  o.collected = true
  game.inventory.push(o.type)
  OBJECT_TYPES[o.type].onCollect?.(game)
}

export function objectName(type) {
  return OBJECT_TYPES[type]?.name ?? ''
}
