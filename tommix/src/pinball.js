// A little self-playing pinball table drawn on a full-screen canvas behind
// the songbook. Plain JS, no Vue.
//
//   const table = createPinball(canvas, { onScore, onEvent })
//   table.flip('left' | 'right', down)   // player takes over a flipper
//   table.launch()                        // add another ball (max 4)
//   table.nudge()                         // shake the table (too much = TILT)
//   table.setPaused(bool)
//   table.destroy()
//
// The flippers play themselves until the player touches them, and go back to
// autoplay after a few seconds of no input (the wizard plays by sense of smell).

const GRAVITY = 900 // px/s²
const BALL_R = 11
const MAX_BALLS = 4
const FLIP_UP = -0.5 // rad, flipper raised
const FLIP_DOWN = 0.52 // rad, flipper at rest
const FLIP_SPEED = 22 // rad/s
const AUTOPLAY_AFTER = 4 // s without input

export function createPinball(canvas, { onScore = () => {}, onEvent = () => {} } = {}) {
  const ctx = canvas.getContext('2d')
  let W = 0
  let H = 0
  let dpr = 1
  let bumpers = []
  let walls = []
  let flippers = []
  let balls = []
  let particles = []
  let texts = []
  let paused = false
  let raf = 0
  let last = 0
  let t = 0
  let lastInput = -999
  let tiltMeter = 0
  let tiltUntil = 0

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'

    const cx = W / 2
    const s = Math.min(W / 900, H / 800, 1.3)
    const r = Math.max(22, 38 * s)
    const hues = [310, 45, 190, 120, 270, 15]
    const spots = [
      [0.5, 0.2], [0.3, 0.32], [0.7, 0.32],
      [0.5, 0.45], [0.18, 0.55], [0.82, 0.55]
    ]
    bumpers = spots.map(([x, y], i) => ({
      x: W * x, y: H * y, r: i === 3 ? r * 1.25 : r, hue: hues[i], flash: 0, spin: Math.random() * 6
    }))

    const len = Math.min(W * 0.17, 130)
    const gap = Math.max(BALL_R * 3.2, 34)
    const py = H - 70
    const lp = { x: cx - gap / 2 - len, y: py }
    const rp = { x: cx + gap / 2 + len, y: py }
    flippers = [
      { side: 'left', p: lp, len, dir: 1, a: FLIP_DOWN, w: 0, down: false, auto: false },
      { side: 'right', p: rp, len, dir: -1, a: FLIP_DOWN, w: 0, down: false, auto: false }
    ]
    // Guide rails from the side walls down to the flipper pivots.
    const railY = py - Math.max(120, H * 0.18)
    walls = [
      { a: { x: 0, y: railY }, b: { x: lp.x, y: lp.y } },
      { a: { x: W, y: railY }, b: { x: rp.x, y: rp.y } }
    ]
    for (const b of balls) {
      b.x = Math.min(Math.max(b.x, BALL_R), W - BALL_R)
      b.y = Math.min(b.y, H * 0.6)
    }
  }

  function newBall() {
    return {
      x: W - 30 - Math.random() * 40,
      y: H * 0.55,
      vx: -(150 + Math.random() * 250),
      vy: -(900 + Math.random() * 300),
      trail: [],
      hue: Math.random() * 360
    }
  }

  function launch() {
    if (balls.length >= MAX_BALLS) return
    balls.push(newBall())
    onEvent('launch')
  }

  function flipperTip(f) {
    return { x: f.p.x + f.dir * Math.cos(f.a) * f.len, y: f.p.y + Math.sin(f.a) * f.len }
  }

  function score(points, x, y, label) {
    if (t < tiltUntil) return
    onScore(points)
    texts.push({ x, y, text: label || '+' + points, life: 1, hue: Math.random() * 360 })
  }

  function burst(x, y, hue, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = 80 + Math.random() * 260
      particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, hue: hue + Math.random() * 60 })
    }
  }

  // Collide a ball with segment a–b (thickness th). surfaceVel(px, py) gives
  // the segment's own velocity at a point (for moving flippers).
  function collideSegment(ball, a, b, th, bounce, surfaceVel) {
    const abx = b.x - a.x
    const aby = b.y - a.y
    const l2 = abx * abx + aby * aby || 1
    let u = ((ball.x - a.x) * abx + (ball.y - a.y) * aby) / l2
    u = Math.max(0, Math.min(1, u))
    const qx = a.x + abx * u
    const qy = a.y + aby * u
    let dx = ball.x - qx
    let dy = ball.y - qy
    const d = Math.hypot(dx, dy)
    const min = BALL_R + th
    if (d >= min || d === 0) return false
    dx /= d
    dy /= d
    ball.x = qx + dx * min
    ball.y = qy + dy * min
    const sv = surfaceVel ? surfaceVel(qx, qy) : { x: 0, y: 0 }
    const rvx = ball.vx - sv.x
    const rvy = ball.vy - sv.y
    const vn = rvx * dx + rvy * dy
    if (vn < 0) {
      ball.vx = sv.x + rvx - (1 + bounce) * vn * dx
      ball.vy = sv.y + rvy - (1 + bounce) * vn * dy
    }
    return true
  }

  function stepFlippers(dt) {
    const idle = t - lastInput > AUTOPLAY_AFTER
    for (const f of flippers) {
      if (idle) {
        // Autoplay: flip when a ball is falling onto this flipper.
        const tip = flipperTip(f)
        const lo = Math.min(f.p.x, tip.x) - 10
        const hi = Math.max(f.p.x, tip.x) + 10
        f.auto = balls.some((b) => b.vy > -50 && b.x > lo && b.x < hi && b.y > f.p.y - f.len * 0.9 && b.y < f.p.y + 30)
      } else {
        f.auto = false
      }
      const want = f.down || f.auto ? FLIP_UP : FLIP_DOWN
      const prev = f.a
      if (f.a > want) f.a = Math.max(want, f.a - FLIP_SPEED * dt)
      else if (f.a < want) f.a = Math.min(want, f.a + FLIP_SPEED * 0.6 * dt)
      f.w = (f.a - prev) / dt
    }
  }

  function stepBall(b, dt) {
    b.vy += GRAVITY * dt
    b.x += b.vx * dt
    b.y += b.vy * dt

    if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * 0.8 }
    if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * 0.8 }
    if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy) * 0.8 }

    for (const bm of bumpers) {
      const dx = b.x - bm.x
      const dy = b.y - bm.y
      const d = Math.hypot(dx, dy)
      const min = BALL_R + bm.r
      if (d < min && d > 0) {
        const nx = dx / d
        const ny = dy / d
        b.x = bm.x + nx * min
        b.y = bm.y + ny * min
        const vn = b.vx * nx + b.vy * ny
        if (vn < 0) {
          b.vx -= 2 * vn * nx
          b.vy -= 2 * vn * ny
        }
        // Bumpers kick.
        b.vx += nx * 320
        b.vy += ny * 320
        bm.flash = 1
        burst(b.x, b.y, bm.hue)
        score(bm === bumpers[3] ? 500 : 100, bm.x, bm.y - bm.r - 10)
        onEvent('bumper')
      }
    }

    for (const w of walls) collideSegment(b, w.a, w.b, 4, 0.4)

    for (const f of flippers) {
      const tip = flipperTip(f)
      const hit = collideSegment(b, f.p, tip, 7, 0.25, (qx, qy) => {
        // v = ω × r, ω around the z axis (the flipper's own sign flips with dir).
        const w = f.w * f.dir
        return { x: -w * (qy - f.p.y), y: w * (qx - f.p.x) }
      })
      if (hit && Math.abs(f.w) > 5) onEvent('flip-hit')
    }

    // Speed limit, so nothing tunnels.
    const sp = Math.hypot(b.vx, b.vy)
    const max = 1700
    if (sp > max) { b.vx *= max / sp; b.vy *= max / sp }

    b.hue = (b.hue + dt * 120) % 360
    b.trail.push({ x: b.x, y: b.y, hue: b.hue })
    if (b.trail.length > 22) b.trail.shift()
  }

  function step(dt) {
    t += dt
    tiltMeter = Math.max(0, tiltMeter - dt * 0.6)
    stepFlippers(dt)
    // Sub-steps for stable collisions.
    const n = 4
    for (let i = 0; i < n; i++) for (const b of balls) stepBall(b, dt / n)

    const before = balls.length
    balls = balls.filter((b) => b.y < H + 40)
    if (balls.length < before) onEvent('drain')
    if (balls.length === 0) launch()

    for (const bm of bumpers) {
      bm.flash = Math.max(0, bm.flash - dt * 3)
      bm.spin += dt * (0.6 + bm.flash * 6)
    }
    for (const p of particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.96
      p.vy *= 0.96
      p.life -= dt * 1.4
    }
    particles = particles.filter((p) => p.life > 0)
    for (const tx of texts) { tx.y -= dt * 50; tx.life -= dt * 0.9 }
    texts = texts.filter((tx) => tx.life > 0)
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const tilted = t < tiltUntil

    // Bumpers: op-art target rings.
    for (const bm of bumpers) {
      ctx.save()
      ctx.translate(bm.x, bm.y)
      ctx.rotate(bm.spin)
      const rings = 5
      for (let i = rings; i > 0; i--) {
        const rr = (bm.r * i) / rings
        const hue = (bm.hue + i * 40 + t * 40) % 360
        ctx.beginPath()
        ctx.arc(0, 0, rr, 0, Math.PI * 2)
        ctx.fillStyle = i % 2 ? `hsla(${hue},100%,${55 + bm.flash * 30}%,0.9)` : 'rgba(10,0,25,0.9)'
        ctx.fill()
      }
      // Star in the middle.
      ctx.beginPath()
      for (let k = 0; k < 10; k++) {
        const rr = k % 2 ? bm.r * 0.18 : bm.r * 0.42
        const a = (k / 10) * Math.PI * 2
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(255,255,255,${0.7 + bm.flash * 0.3})`
      ctx.fill()
      ctx.restore()
      if (bm.flash > 0) {
        ctx.beginPath()
        ctx.arc(bm.x, bm.y, bm.r + 14 * bm.flash + 4, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${bm.hue},100%,70%,${bm.flash})`
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    // Rails.
    ctx.lineCap = 'round'
    for (const w of walls) {
      ctx.beginPath()
      ctx.moveTo(w.a.x, w.a.y)
      ctx.lineTo(w.b.x, w.b.y)
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 8
      ctx.stroke()
      ctx.strokeStyle = `hsla(${(t * 60) % 360},100%,65%,0.8)`
      ctx.lineWidth = 3
      ctx.stroke()
    }

    // Flippers.
    for (const f of flippers) {
      const tip = flipperTip(f)
      ctx.beginPath()
      ctx.moveTo(f.p.x, f.p.y)
      ctx.lineTo(tip.x, tip.y)
      ctx.strokeStyle = tilted ? '#555' : f.side === 'left' ? '#ff2bd6' : '#19e3ff'
      ctx.lineWidth = 16
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(f.p.x, f.p.y, 9, 0, Math.PI * 2)
      ctx.fillStyle = '#ffb000'
      ctx.fill()
    }

    // Particles.
    for (const p of particles) {
      ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.life})`
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    }

    // Balls with rainbow trails.
    for (const b of balls) {
      b.trail.forEach((pt, i) => {
        const k = i / b.trail.length
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, BALL_R * k, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},100%,60%,${k * 0.5})`
        ctx.fill()
      })
      const g = ctx.createRadialGradient(b.x - 4, b.y - 4, 1, b.x, b.y, BALL_R)
      g.addColorStop(0, '#fff')
      g.addColorStop(0.5, '#c8c8dc')
      g.addColorStop(1, '#3b3b5a')
      ctx.beginPath()
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
    }

    // Floating score texts.
    ctx.font = 'bold 16px "Space Mono", monospace'
    ctx.textAlign = 'center'
    for (const tx of texts) {
      ctx.fillStyle = `hsla(${tx.hue},100%,70%,${tx.life})`
      ctx.fillText(tx.text, tx.x, tx.y)
    }

    if (tilted) {
      ctx.font = `${Math.min(W / 5, 160)}px Monoton, sans-serif`
      ctx.fillStyle = `rgba(255,40,60,${0.5 + 0.4 * Math.sin(t * 12)})`
      ctx.fillText('TILT', W / 2, H * 0.5)
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.033, (now - (last || now)) / 1000)
    last = now
    if (paused) return
    step(dt)
    draw()
  }

  function flip(side, down) {
    lastInput = t
    const f = flippers.find((x) => x.side === side)
    if (f && !(t < tiltUntil)) f.down = down
  }

  function nudge() {
    lastInput = t
    tiltMeter += 1
    if (tiltMeter > 3.2) {
      tiltUntil = t + 3
      tiltMeter = 0
      for (const f of flippers) f.down = false
      onEvent('tilt')
      return
    }
    for (const b of balls) {
      b.vx += (Math.random() - 0.5) * 500
      b.vy -= 250
    }
    onEvent('nudge')
  }

  function setPaused(p) {
    paused = p
    if (!p) last = 0
  }

  window.addEventListener('resize', layout)
  layout()
  launch()
  raf = requestAnimationFrame(frame)

  return {
    flip,
    launch,
    nudge,
    setPaused,
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layout)
    }
  }
}
