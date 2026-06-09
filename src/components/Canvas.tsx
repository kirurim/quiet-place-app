import { motion, type MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildCluster,
  clampPan,
  SCREEN_H,
  SCREEN_W,
  WORLD_H,
  WORLD_W,
  type CircleKey,
  type MyPost,
} from '../lib/model'
import Bubble, { type Viewable } from './Bubble'
import CenterAdd from './CenterAdd'
import GooLayer from './GooLayer'

interface Props {
  active: CircleKey
  gen: number
  myPosts: MyPost[]
  panX: MotionValue<number>
  panY: MotionValue<number>
  seen: Set<string>
  overlayOpen: boolean
  onOpen: (post: Viewable) => void
  onAddClick: () => void
  onPanStart: () => void
}

/**
 * The freeform dark canvas. A large WORLD layer pans when you drag empty space;
 * the center "+", goo and bubble clusters live inside it. Owns the live element
 * refs that the goo measures each frame.
 */
export default function Canvas({ active, gen, myPosts, panX, panY, seen, overlayOpen, onOpen, onAddClick, onPanStart }: Props) {
  const visibleMy = myPosts.filter((p) => p.circle === active)
  const canvasRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const bubbleRefs = useRef<Map<string, HTMLElement>>(new Map())
  const myRefs = useRef<Map<string, HTMLElement>>(new Map())

  const [settled, setSettled] = useState(false)

  // Build the cluster fresh per selection. The fountain erupts from the active
  // pill (screen bottom-center) converted to world coords using current pan.
  const cluster = useMemo(() => {
    const origin = { x: SCREEN_W / 2 - panX.get(), y: SCREEN_H - 58 - panY.get() }
    return buildCluster(active, origin, gen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, gen])

  // Drop cluster refs on switch so the goo never reads stale elements. (myRefs is
  // never cleared here — your own posts persist across circle switches.)
  useEffect(() => {
    bubbleRefs.current.clear()
    setSettled(false)
    const t = setTimeout(() => setSettled(true), cluster.settleMs)
    return () => clearTimeout(t)
  }, [cluster])

  const register = (id: string, el: HTMLElement | null) => {
    if (el) bubbleRefs.current.set(id, el)
    else bubbleRefs.current.delete(id)
  }
  const registerMy = (id: string, el: HTMLElement | null) => {
    if (el) myRefs.current.set(id, el)
    else myRefs.current.delete(id)
  }

  // Manual pan — only on empty space (bubbles stopPropagation on pointerdown).
  const pan = useRef({ down: false, sx: 0, sy: 0, px: 0, py: 0, scale: 1 })
  const onPointerDown = (e: React.PointerEvent) => {
    const c = canvasRef.current
    if (!c) return
    onPanStart() // a manual grab cancels any running re-center animation
    const rect = c.getBoundingClientRect()
    pan.current = {
      down: true,
      sx: e.clientX,
      sy: e.clientY,
      px: panX.get(),
      py: panY.get(),
      scale: rect.width / c.offsetWidth || 1,
    }
    c.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const p = pan.current
    if (!p.down) return
    const { x, y } = clampPan(p.px + (e.clientX - p.sx) / p.scale, p.py + (e.clientY - p.sy) / p.scale)
    panX.set(x)
    panY.set(y)
  }
  const onPointerUp = () => {
    pan.current.down = false
  }

  return (
    <div
      className="canvas"
      ref={canvasRef}
      style={{ visibility: overlayOpen ? 'hidden' : 'visible' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <motion.div
        className="world"
        ref={worldRef}
        style={{ x: panX, y: panY, width: WORLD_W, height: WORLD_H }}
      >
        <GooLayer
          cluster={cluster}
          myPosts={visibleMy}
          worldRef={worldRef}
          hubRef={hubRef}
          bubbleRefs={bubbleRefs}
          myRefs={myRefs}
          settled={settled}
        />
        <CenterAdd ref={hubRef} onClick={onAddClick} />
        {cluster.avatars.map((a) => (
          <Bubble key={a.id} kind="avatar" data={a} origin={cluster.origin} register={register} />
        ))}
        {cluster.avatars.flatMap((a) =>
          a.posts.map((p) => (
            <Bubble
              key={p.id}
              kind="post"
              data={p}
              rim={a.rim}
              rim2={a.rim2}
              avatarTarget={a.target}
              seen={seen.has(p.id)}
              onOpen={onOpen}
              register={register}
            />
          )),
        )}
        {visibleMy.map((p, i) => (
          <Bubble key={p.id} kind="mypost" data={p} index={i} seen={seen.has(p.id)} onOpen={onOpen} register={registerMy} />
        ))}
      </motion.div>
    </div>
  )
}
