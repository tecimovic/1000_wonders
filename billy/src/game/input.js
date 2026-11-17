// Keyboard (and on-screen button) input. The game reads `state` every frame:
//
//   walk   -1, 0 or 1: the direction Billy has been told to walk. Pressing
//          left or right sets it, and it stays set after the key is
//          released, so he keeps walking on his own. Down stops him. (The
//          engine also sets it back to 0 when he walks into a wall.)
//   jump   whether jump is held right now.

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowDown: 'stop',
  KeyS: 'stop',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump'
}

const WALK = { left: -1, right: 1, stop: 0 }

export function createInput() {
  const state = { walk: 0, jump: false }

  /** Presses (on = true) or releases (on = false) one of the actions. */
  function set(action, on) {
    if (action === 'jump') state.jump = on
    else if (on) state.walk = WALK[action]
  }

  function onKeyDown(e) {
    const action = KEY_MAP[e.code]
    if (!action) return
    set(action, true)
    e.preventDefault()
  }

  function onKeyUp(e) {
    const action = KEY_MAP[e.code]
    if (!action) return
    set(action, false)
    e.preventDefault()
  }

  // A jump key released while the window wasn't focused would otherwise
  // stay held. Walking keeps going, as it would anyway.
  function onBlur() {
    state.jump = false
  }

  return {
    state,
    set,
    attach() {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('blur', onBlur)
    },
    detach() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }
}
