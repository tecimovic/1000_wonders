// Rooms are grids of 8×8 tiles, COLS wide and ROWS tall. A room's map is an
// array of ROWS strings, each COLS characters long, one character per tile:
//
//   .   empty
//   #   wall: solid from every side
//   =   platform: you can stand on it, and jump up through it from below
//   K   a key (empty space with a key in it)
//   C   a cactus: deadly to touch (empty space with a cactus in it)
//   D   a door. Put it in a wall, as a column of D tiles (two, for Billy's
//       height); each column of D's is one door. Doors start locked and
//       are solid until Billy has a key; then they open, and walking
//       through one is the way out.
//   S   where Billy starts: his feet rest on the bottom of this tile
//
// See rooms.js for the rooms themselves.

export const TILE = 8
export const COLS = 32
export const ROWS = 16

export const EMPTY = '.'
export const WALL = '#'
export const PLATFORM = '='
export const DOOR = 'D'

export function parseRoom(data) {
  if (data.map.length !== ROWS) {
    throw new Error(`Room "${data.name}": map has ${data.map.length} rows, expected ${ROWS}`)
  }
  const tiles = []
  const keys = []
  const hazards = []
  const doors = []
  const doorAt = {}   // "col,row" → door
  let start = null
  data.map.forEach((line, row) => {
    if (line.length !== COLS) {
      throw new Error(`Room "${data.name}": row ${row} has ${line.length} columns, expected ${COLS}`)
    }
    const tileRow = []
    ;[...line].forEach((ch, col) => {
      if (ch === 'K') keys.push({ col, row, collected: false })
      if (ch === 'C') hazards.push({ col, row, type: 'cactus' })
      if (ch === 'S') start = { col, row }
      if (ch === DOOR) {
        // Continue the door right above, or start a new one.
        let door = doorAt[`${col},${row - 1}`]
        if (!door) {
          door = { col, topRow: row, bottomRow: row, locked: true }
          doors.push(door)
        }
        door.bottomRow = row
        doorAt[`${col},${row}`] = door
      }
      tileRow.push(ch === WALL || ch === PLATFORM || ch === DOOR ? ch : EMPTY)
    })
    tiles.push(tileRow)
  })
  if (!start) throw new Error(`Room "${data.name}": no start tile (S)`)

  const room = {
    ...data,
    tiles,
    keys,
    hazards,
    doors,
    start,
    // Anything outside the room counts as wall, until rooms get exits.
    tileAt(col, row) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return WALL
      return tiles[row][col]
    },
    doorAt(col, row) {
      return doorAt[`${col},${row}`] ?? null
    },
    /** Blocks movement from every side: walls, and locked doors. */
    isSolid(col, row) {
      const tile = room.tileAt(col, row)
      return tile === WALL || (tile === DOOR && room.doorAt(col, row).locked)
    },
    /** Something Billy can stand on: anything solid, and platforms. */
    canStandOn(col, row) {
      return room.isSolid(col, row) || room.tileAt(col, row) === PLATFORM
    }
  }
  return room
}
