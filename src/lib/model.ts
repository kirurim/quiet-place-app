// Two-level model + geometry for the freeform canvas. Everything is precomputed
// once per circle selection so the animation layer stays declarative.

export const WORLD_W = 1100
export const WORLD_H = 1500
export const SCREEN_W = 393
export const SCREEN_H = 820

// Central "+" (add a moment) button, in world coordinates. Your own posts orbit it.
export const HC = { x: 550, y: 760 }

// Initial pan so the center sits ~46% down the screen.
export const INITIAL_PAN = { x: SCREEN_W / 2 - HC.x, y: SCREEN_H * 0.46 - HC.y }

export const AVATAR = 48 // unfolded avatar diameter
export const HUB_D = 70 // center "+" diameter
export const MYPOST_SIZE = 120 // a freshly-created "my post"

export type CircleKey = 'fam' | 'fr'

/** A post you created via the "+", orbiting the center. Scoped to one circle. */
export interface MyPost {
  id: string
  seed: number
  caption: string
  age: 0
  circle: CircleKey
  /** frozen fountain origin (world coords) captured at share time */
  origin: { x: number; y: number }
}

/** Clamp a pan offset so you can't scroll past the dot-grid world bounds. */
export function clampPan(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.min(0, Math.max(SCREEN_W - WORLD_W, x)),
    y: Math.min(0, Math.max(SCREEN_H - WORLD_H, y)),
  }
}

/** Even orbit slot around the center "+" for the index-th of your own posts. */
export function myPostTarget(index: number): { x: number; y: number } {
  const ang = -Math.PI / 2 + index * 1.25
  const r = HUB_D / 2 + MYPOST_SIZE / 2 + 16
  return { x: HC.x + Math.cos(ang) * r, y: HC.y + Math.sin(ang) * r }
}

export interface Circle {
  name: string
  people: number
  seedBase: number
  rims: [string, string]
}

export const CIRCLES: Record<CircleKey, Circle> = {
  fam: { name: 'Family', people: 5, seedBase: 200, rims: ['#e8ff3a', '#b6ff8a'] },
  fr: { name: 'Friends', people: 6, seedBase: 700, rims: ['#7aa2ff', '#b39bff'] },
}

export const CIRCLE_ORDER: CircleKey[] = ['fam', 'fr']

/** Post diameter by age in days (clamped 40–120). */
export const sizeForAge = (d: number): number => (d < 2 ? 120 : d < 5 ? 78 : 40)

export const CAPS = [
  'morning light ☀️',
  'last weekend',
  'found this spot',
  'us, today',
  'little things 🤍',
  'no caption needed',
  'golden hour',
]

export interface PostModel {
  id: string
  seed: number
  age: number
  size: number
  /** optional caption — rendered as the first/main comment in the viewer */
  caption: string
  /** resting target in world coords */
  target: { x: number; y: number }
  growDelay: number // ms
}

export interface AvatarModel {
  id: string
  seed: number
  rim: string
  rim2: string
  fresh: boolean // has a post < 2 days → gets the lime dashed ring
  target: { x: number; y: number }
  flyDelay: number // ms
  unfoldDelay: number // ms
  posts: PostModel[]
}

export interface ClusterModel {
  circleId: CircleKey
  origin: { x: number; y: number } // fountain origin, world coords
  avatars: AvatarModel[]
  settleMs: number // when the goo should fade in
}

export interface LinkPair {
  from: string // avatar id
  to: string // post id
}

export const linksOf = (c: ClusterModel): LinkPair[] =>
  c.avatars.flatMap((a) => a.posts.map((p) => ({ from: a.id, to: p.id })))

export const nodeIdsOf = (c: ClusterModel): string[] =>
  c.avatars.flatMap((a) => [a.id, ...a.posts.map((p) => p.id)])

const rand = () => Math.random()
const TAU = Math.PI * 2

// transient per-avatar build spec (before centers are placed)
interface Spec {
  i: number
  reach: number
  posts: { age: number; size: number; seed: number; ang: number; r: number; growDelay: number }[]
  flyDelay: number
  unfoldDelay: number
  px: number
  py: number
}

/**
 * Place each cluster's center with rejection sampling so no two clusters (nor
 * the center "+" and its posts) overlap: dist(a,b) > reachA + reachB + gap.
 */
function placeCircles(specs: Spec[]): void {
  const GAP = 18
  const placed: Spec[] = []
  for (const p of specs) {
    let best: { x: number; y: number } | null = null
    for (let t = 0; t < 2000; t++) {
      const x = HC.x + (rand() - 0.5) * 760
      const y = HC.y + (rand() - 0.5) * 940
      if (Math.hypot(x - HC.x, y - HC.y) < p.reach + 195) continue // clear of the "+"
      if (placed.every((q) => Math.hypot(q.px - x, q.py - y) > q.reach + p.reach + GAP)) {
        best = { x, y }
        break
      }
    }
    if (!best) {
      const a = placed.length * 1.7
      const rr = 300 + placed.length * 40
      best = { x: HC.x + Math.cos(a) * rr, y: HC.y + Math.sin(a) * rr }
    }
    p.px = best.x
    p.py = best.y
    placed.push(p)
  }
}

/**
 * Build a full circle cluster: avatars scattered with no overlap, each a
 * hub-and-spoke of posts placed evenly by angle, with staggered fountain delays.
 */
export function buildCluster(
  circleId: CircleKey,
  origin: { x: number; y: number },
  gen: number,
): ClusterModel {
  const c = CIRCLES[circleId]
  let settleMs = 0

  // 1. build specs (posts by angle, cluster reach) before placing centers
  const specs: Spec[] = Array.from({ length: c.people }, (_, i) => {
    const k = 2 + Math.floor(rand() * 2) // 2 or 3 posts
    const base = rand() * TAU
    const flyDelay = 80 + i * 120
    const posts = Array.from({ length: k }, (_, j) => {
      let age = rand() * 7
      if (j === 0 && rand() < 0.55) age = rand() * 2 // bias first post fresh
      const size = sizeForAge(age)
      const growDelay = flyDelay + 820 + j * 120
      settleMs = Math.max(settleMs, growDelay)
      return { age, size, seed: c.seedBase + i * 30 + j * 7, ang: base + (j / k) * TAU, r: AVATAR / 2 + size / 2 + 16, growDelay }
    })
    const reach = AVATAR / 2 + Math.max(...posts.map((p) => p.size)) + 16
    return { i, reach, posts, flyDelay, unfoldDelay: flyDelay + 560, px: 0, py: 0 }
  })

  // 2. place centers without overlap
  placeCircles(specs)

  // 3. resolve final targets
  const avatars: AvatarModel[] = specs.map((s) => ({
    id: `${circleId}-${gen}-a${s.i}`,
    seed: c.seedBase + 500 + s.i * 11,
    rim: c.rims[s.i % 2],
    rim2: c.rims[(s.i + 1) % 2],
    fresh: s.posts.some((ph) => ph.age < 2),
    target: { x: s.px, y: s.py },
    flyDelay: s.flyDelay,
    unfoldDelay: s.unfoldDelay,
    posts: s.posts.map((ph, j) => ({
      id: `${circleId}-${gen}-a${s.i}-p${j}`,
      seed: ph.seed,
      age: ph.age,
      size: ph.size,
      caption: ph.seed % 2 === 0 ? CAPS[ph.seed % CAPS.length] : '',
      target: { x: s.px + Math.cos(ph.ang) * ph.r, y: s.py + Math.sin(ph.ang) * ph.r },
      growDelay: ph.growDelay,
    })),
  }))

  return { circleId, origin, avatars, settleMs: settleMs + 900 }
}
