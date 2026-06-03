import { useEffect, useRef, type RefObject } from 'react'
import { WORLD_H, WORLD_W, type ClusterModel, type MyPost } from '../lib/model'

interface Props {
  cluster: ClusterModel
  myPosts: MyPost[]
  worldRef: RefObject<HTMLDivElement>
  hubRef: RefObject<HTMLDivElement>
  bubbleRefs: RefObject<Map<string, HTMLElement>>
  myRefs: RefObject<Map<string, HTMLElement>>
  settled: boolean
}

const HUB_ID = '__hub__'
const neckWidth = (rA: number, rB: number) => Math.max(16, Math.min(34, Math.min(rA, rB) * 1.05))

interface Group {
  key: string
  nodes: string[]
  links: { from: string; to: string; key: string }[]
  gated: boolean
}

/**
 * The metaball "goo" behind the glass bubbles. One small filtered <g> PER cluster
 * (each avatar + its posts, plus the "+" + your posts) so neighbours fuse only
 * within a cluster, the filter regions stay small, and nothing flashes near the
 * buttons during the fountain (avatar groups are gated until the cluster settles).
 *
 * React renders the stable node/link set once (flat ref maps); the rAF loop
 * mutates attributes imperatively at ~30fps so necks track drift + drag.
 */
export default function GooLayer({ cluster, myPosts, worldRef, hubRef, bubbleRefs, myRefs, settled }: Props) {
  const circleRefs = useRef<Map<string, SVGCircleElement>>(new Map())
  const lineRefs = useRef<Map<string, SVGLineElement>>(new Map())

  const groups: Group[] = cluster.avatars.map((a) => ({
    key: a.id,
    nodes: [a.id, ...a.posts.map((p) => p.id)],
    links: a.posts.map((p) => ({ from: a.id, to: p.id, key: a.id + p.id })),
    gated: true,
  }))
  const hubGroup: Group = {
    key: 'hub',
    nodes: myPosts.length ? [HUB_ID, ...myPosts.map((p) => p.id)] : [],
    links: myPosts.map((p) => ({ from: HUB_ID, to: p.id, key: HUB_ID + p.id })),
    gated: false,
  }
  const allGroups = [...groups, hubGroup]

  useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (t - last < 33) return // ~30fps
      last = t
      const world = worldRef.current
      if (!world) return
      const wr = world.getBoundingClientRect()
      const scale = wr.width / WORLD_W || 1

      const elOf = (id: string) => (id === HUB_ID ? hubRef.current : bubbleRefs.current?.get(id) ?? myRefs.current?.get(id))
      const center = (id: string) => {
        const el = elOf(id)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
          x: (r.left - wr.left + r.width / 2) / scale,
          y: (r.top - wr.top + r.height / 2) / scale,
          r: r.width / 2 / scale,
        }
      }

      for (const g of allGroups) {
        for (const l of g.links) {
          const ln = lineRefs.current.get(l.key)
          const a = center(l.from)
          const b = center(l.to)
          if (!ln || !a || !b) continue
          ln.setAttribute('x1', String(a.x))
          ln.setAttribute('y1', String(a.y))
          ln.setAttribute('x2', String(b.x))
          ln.setAttribute('y2', String(b.y))
          ln.setAttribute('stroke-width', String(neckWidth(a.r, b.r)))
        }
        for (const id of g.nodes) {
          const c = circleRefs.current.get(id)
          const p = center(id)
          if (!c || !p || p.r <= 3) continue
          c.setAttribute('cx', String(p.x))
          c.setAttribute('cy', String(p.y))
          c.setAttribute('r', String(p.r))
        }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, myPosts, worldRef, hubRef, bubbleRefs, myRefs])

  const setLineRef = (key: string) => (el: SVGLineElement | null) => {
    if (el) lineRefs.current.set(key, el)
    else lineRefs.current.delete(key)
  }
  const setCircleRef = (key: string) => (el: SVGCircleElement | null) => {
    if (el) circleRefs.current.set(key, el)
    else circleRefs.current.delete(key)
  }

  return (
    <svg className="goo" width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
        </filter>
      </defs>

      {allGroups.map((g) => (
        <g
          key={g.key}
          filter="url(#goo)"
          fill="var(--neck)"
          stroke="var(--neck)"
          style={{ opacity: g.gated && !settled ? 0 : 1, transition: 'opacity .5s ease' }}
        >
          {g.links.map((l) => (
            <line key={l.key} ref={setLineRef(l.key)} strokeLinecap="round" />
          ))}
          {g.nodes.map((id) => (
            <circle key={id} ref={setCircleRef(id)} />
          ))}
        </g>
      ))}
    </svg>
  )
}
