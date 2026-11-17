# Dead Set Billy: maintenance guide

Read this before working on Billy. It's meant to replace reading the source:
open a file only when you're about to change it.

**The game:** Billy, a little skeleton, walks and jumps through tile rooms
(retro 8-bit platformer style, our own art). In the one room so far, "The Way
Up", he climbs two platforms, collects the key (it goes into his inventory),
and leaves through the door in the right wall, which unlocks once he has a
key: "Billy is free!". Touching the cactus kills him: he blinks red, then
morphs into a "RIP" gravestone, and a "Billy has died" screen offers a retry.

URL `/billy/`. Run: `npm run dev:billy`. Build: `npm run build`.

---

## 1. How the engine works

### Files (`billy/src/`)

| File | Role |
|---|---|
| `game/engine.js` | `createGame(canvas, inputState, { onStatus })` → `{ start, stop, restart }`. Fixed 60 fps loop, game states, keys/inventory, doors, hazards, drawing. |
| `game/player.js` | `PHYSICS`, `createPlayer(room)`, `updatePlayer(p, input, room)`, `hitbox(p)`. Movement and collisions. No DOM. |
| `game/room.js` | `TILE=8`, `COLS=32`, `ROWS=16`, the tile legend, `parseRoom(data)`. No DOM. |
| `game/rooms.js` | `ROOMS`: the room data (name, colors, ASCII map). No DOM. |
| `game/sprites.js` | All pixel art as strings → offscreen canvases. `billySprite`, `keySprites`, `tileSprites`, `cactusSprite`, `doorSprites`, `itemIconUrls`, `deathSprite`. |
| `game/input.js` | `createInput()` → `state = { walk: -1/0/1 (sticky), jump: bool (held) }`, `set(action, on)`, `attach/detach`. |
| `components/GameScreen.vue` | Inventory bar (4 slots, above the room's top-left), canvas scaled by the largest whole number that fits (`image-rendering: pixelated`), room name, win/death overlays, touch buttons (◀ ■ Jump ▶, touch screens only), Enter/R restarts. |
| `App.vue` | Header: "← All apps", title, controls hint. |

Data flow: `input.js` → `input.state` → `engine.update()` → `onStatus({ state, roomName, inventory })` → `GameScreen.vue`. `onStatus` fires only on changes, not every frame.

### Loop and states (`engine.js`)

- `requestAnimationFrame` accumulates real time and runs fixed 1/60 s updates (at most 5 frames of catch-up after a stall). Then it draws.
- Each `playing` update: `updatePlayer` → if `player.blocked`, set `input.walk = 0` → `touchesHazard()` → `collectKeys()` → `walkedOut()`.
- States: `playing` → `dying` (hit a cactus; if he's in mid-air he falls first; input is ignored) → `dead` (after the animation + `DEAD_PAUSE_FRAMES`). Or `playing` → `won` (walked out through an open door).
- `restart()` = `reset()`: reloads `ROOMS[0]`, empties the inventory, sets `walk = 0`. Only one room is ever loaded today.
- Draw order: background, tiles, keys (cycling colors), doors (brick behind them), cacti, then Billy or the death frame.

### Rooms at runtime (`room.js`)

`parseRoom` returns the data plus `tiles` (grid of `.`, `#`, `=`, `D`), `keys [{col,row,collected}]`, `hazards [{col,row,type:'cactus'}]`, `doors [{col,topRow,bottomRow,locked}]`, `start {col,row}`, and the helpers:

- `tileAt(c, r)`: outside the grid counts as `#`.
- `isSolid(c, r)`: walls and locked doors.
- `canStandOn(c, r)`: solid tiles and platforms.

`player.js` only uses `isSolid` and `canStandOn`, so **new tile behaviour belongs in room.js, not player.js**.

### Movement (`player.js`)

- `PHYSICS = { walkSpeed: 0.8, jumpSpeed: 3.8, gravity: 0.2, maxFall: 4 }` (px per frame). Keep `maxFall` below 8.
- Billy's sprite is 8×16; `x, y` is its top-left, and `x` can be fractional. The hitbox is 6 px wide (1 px in from each side) and 16 px tall.
- Walking speed is constant. Walking is sticky (`input.walk`). Walking into a wall on the ground sets `p.blocked`, and the engine then stops him.
- The jump arc is fixed. Its direction is locked at take-off (`p.moveDir`), with no steering in mid-air. Holding jump re-jumps on landing.
- Walking off a ledge drops him straight down. Hitting a wall in mid-air cancels the sideways motion.
- Landing checks every tile row crossed in the frame. Platforms only catch him if his feet were above them. Rising, his head bumps only solid tiles.
- **Reach:** a jump rises 36 px (4½ tiles). Sideways it covers ~30 px when landing at the same height, ~24 px landing 3 tiles up, ~20 px landing 4 tiles up.

### Items, doors, death

- Key touched → removed from the room, `'key'` added to the inventory, **every door in the room unlocks**. The key isn't used up.
- Open door: Billy wins when his hitbox's middle is inside the door column.
- Cactus hitbox: the tile inset by 2 px left and right and 1 px at the top.
- Death animation (`deathSprite(facing, tick)` in `sprites.js`): 24 frames of blinking red and white, then a 12-step morph (4 frames each). Billy and an 11×12 gravestone share a 12×16 frame, drawn at `x - 2`. Each pixel switches at a seeded-random time, biased bottom-first.
- Sprites are strings: `.` is transparent, other characters come from a palette, and all rows must be the same length. Billy = `BILLY_TOP` (12 rows) + `BILLY_LEGS[stand|stride|pass]` (4 rows), facing right and mirrored for left.

---

## 2. How to add a new room

Rooms live in `billy/src/game/rooms.js`, in the `ROOMS` array. Each room is 32 columns × 16 rows of 8×8 tiles:

```js
{
  id: 'the-way-up',                      // unique, kebab-case
  name: 'The Way Up',                    // shown under the game
  colors: {
    background: '#0b0820', wall: '#8a2d5c', wallMortar: '#4a1232',
    platform: '#3fbf8f', platformShade: '#1d6b52',
    cactus: '#5cc04a', cactusLight: '#a6e85a', cactusShade: '#2f7a2a',
    door: '#8a5a2b', doorShade: '#5a3818', doorLight: '#ffe9a8', doorLightShade: '#e8c46a'
  },
  map: [
    '################################',
    '#..............................#',
    '#..............................#',
    '#..........................K...#',
    '#..............................#',
    '#..............................#',
    '#..............................#',
    '#..............................#',
    '#.................===========..#',
    '#..............................#',
    '#..............................#',
    '#..............................#',
    '#........========..............#',
    '#..............................D',
    '#S......................C......D',
    '################################'
  ]
}
```

| Char | Meaning |
|---|---|
| `.` | empty |
| `#` | wall: solid from every side |
| `=` | platform: stand on it, jump up through it from below |
| `K` | key |
| `C` | cactus: deadly |
| `D` | door: a column of exactly 2 `D`s set into a wall (the sprites are 16 px tall). Locked and solid until Billy has a key; walking through it when open wins. |
| `S` | start: Billy's feet sit on the bottom of this tile. Exactly one per room. |

Steps:

1. Copy the room object, give it a new `id`, `name` and `colors` (every color key above is required), and draw the map. `parseRoom` throws if the rows or columns are the wrong size or there's no `S`.
2. **Check it can be played**, using the reach numbers in section 1. Keep each step up at most 4 tiles. Gaps must fit the sideways reach (or let him jump up through a platform). The hitbox (6 px) must overlap a platform to stand on it.
3. **Today only `ROOMS[0]` is played** (`reset()` in `engine.js`). There are no exits between rooms yet. To play a new room, put it first, or build room switching:
   - add an exit concept (e.g. a door that leads to a room `id`, or open edges);
   - in `engine.js`, load that room and place Billy, keeping the inventory;
   - change `tileAt` so edges with exits aren't walls.
4. A new tile type: add it to the legend comment and `parseRoom` in `room.js`, make it count in `isSolid`/`canStandOn` if it blocks or supports Billy, add its art to `sprites.js`, its colors to every room, and its drawing (and any touch logic) to `engine.js`.
5. Verify the route (section 3), then update the docs (section 3).

---

## 3. How to maintain Billy through AI

**Working rules for an AI session:**

- Start here. Read only the files you'll change. `engine.js`, `player.js` and `sprites.js` are the big ones; `room.js`, `rooms.js` and `input.js` are short.
- Repo rules (from `AGENTS.md`): never commit, leave changes for the owner. After a change that affects what's documented, update **this file** and the short Billy section of `AGENTS.md`, then **regenerate `README.md`** from `AGENTS.md`.
- Keep the art and rooms original: style of the 8-bit platformers, not a copy of any specific game.
- Keep the engine free of Vue and DOM (except `sprites.js` and `engine.js`, which need canvases), so it can be tested in Node.
- Update this file in the same piece of work: the room in section 2, the legend, numbers, states and the history below. It's the memory between sessions.

**Verifying a change (cheapest first):**

1. `npm run build` (CI does the same, and checks that `dist/billy/index.html` exists).
2. **Physics in Node.** `player.js`, `room.js` and `rooms.js` need no DOM. Save this in the scratchpad (not the repo) and run it from the repo root:

   ```js
   import { parseRoom } from './billy/src/game/room.js'
   import { ROOMS } from './billy/src/game/rooms.js'
   import { createPlayer, updatePlayer } from './billy/src/game/player.js'
   const room = parseRoom(ROOMS[0]), p = createPlayer(room), input = { walk: 0, jump: false }
   const tick = () => { updatePlayer(p, input, room); if (p.blocked) input.walk = 0 }
   const until = (c, max = 3000) => { for (let i = 0; i < max && !c(); i++) tick() }
   const jump = () => { input.jump = true; tick(); input.jump = false; until(() => p.onGround) }
   input.walk = 1; until(() => p.x >= 52); jump()   // platform 1: y = 80
   until(() => p.x >= 126); jump()                   // platform 2: y = 48
   until(() => p.x >= 212); input.walk = 0; jump()   // touches the key
   console.log(p.x, p.y)
   ```

   (Use absolute paths in the imports if the script is outside the repo.)
3. **The whole engine in Node** (keys, doors, cactus, states): before importing `engine.js`, set `globalThis.document = { createElement: () => ({ getContext: () => noopProxy, toDataURL: () => '' }) }`, plus `requestAnimationFrame` that stores the callback and `performance.now`. Then call the stored callback with a timestamp growing by 1000/60 per frame. `onStatus` reports `state` and `inventory`.
4. **Real browser.** Playwright's own browsers aren't installed. Use `chromium.launch({ executablePath: '/usr/bin/google-chrome' })`, and import Playwright via its absolute path (`<repo>/node_modules/playwright/index.mjs`) when the script is in the scratchpad. Serve with `npx vite preview --port 4417 --strictPort` (run in the background, then `pkill -f "vite preview --port 4417"`). Open `/billy/`. For exact timings, dispatch `KeyboardEvent`s on `window` with `setTimeout` inside `page.evaluate`; get the times from the Node simulation (frame × 1000/60 ms). Take screenshots and look at them.

**History (newest last):**

1. The engine, the room, a key that won on touch. Created as "Dead Set Willy" (`willy/`).
2. Renamed to "Dead Set Billy" (`billy/`, `/billy/`, `public/billy.svg`, `dev:billy`).
3. Sticky walking: left/right keep him going; ↓/S or a wall stops him; a ■ touch button.
4. Cactus `C` and death: blinking, then a morph into a "RIP" gravestone, then the "Billy has died" overlay.
5. Inventory bar (4 slots), key collected into it; door `D` in the right wall, locked with a padlock until he has a key; walking out = "Billy is free!".
6. This guide.

**Open ideas:** room exits and switching, lives, score, patrolling enemies, more hazards, fall damage, sound.
