import { animate, useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Viewable } from './components/Bubble'
import Camera from './components/Camera'
import Canvas from './components/Canvas'
import CirclePill from './components/CirclePill'
import { Gear } from './components/IconSet'
import IPhoneFrame from './components/IPhoneFrame'
import PostViewer from './components/PostViewer'
import Profile, { type ProfileTarget } from './components/Profile'
import { CIRCLES, CIRCLE_ORDER, INITIAL_PAN, SCREEN_H, SCREEN_W, type CircleKey, type MyPost } from './lib/model'

export default function App() {
  const [active, setActive] = useState<CircleKey>('fam')
  const [gen, setGen] = useState(0)
  const [myPosts, setMyPosts] = useState<MyPost[]>([])

  const [openPost, setOpenPost] = useState<Viewable | null>(null)
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const [profile, setProfile] = useState<ProfileTarget>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [pendingSeed, setPendingSeed] = useState(900)

  // Open a post and mark it seen (drops its "new" dashed ring).
  const openViewer = (v: Viewable) => {
    setOpenPost(v)
    setSeen((s) => (s.has(v.id) ? s : new Set(s).add(v.id)))
  }

  // Pan lives here so the share handler can freeze a post's fountain origin and
  // the re-center animation can drive it on circle switch.
  const panX = useMotionValue(INITIAL_PAN.x)
  const panY = useMotionValue(INITIAL_PAN.y)
  const recenter = useRef<{ stop: () => void }[]>([])
  const stopRecenter = () => recenter.current.forEach((c) => c.stop())

  // Switching a circle re-erupts the fountain and re-centers the canvas.
  const switchCircle = (key: CircleKey) => {
    if (key === active) return
    setActive(key)
    setGen((g) => g + 1)
  }

  useEffect(() => {
    if (gen === 0) return
    stopRecenter()
    recenter.current = [
      animate(panX, INITIAL_PAN.x, { duration: 0.5, ease: 'easeInOut' }),
      animate(panY, INITIAL_PAN.y, { duration: 0.5, ease: 'easeInOut' }),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen])

  const openCamera = () => {
    setPendingSeed(900 + Math.floor(Math.random() * 100000))
    setCameraOpen(true)
  }

  const share = (caption: string) => {
    const origin = { x: SCREEN_W / 2 - panX.get(), y: SCREEN_H - 58 - panY.get() }
    setMyPosts((prev) => [...prev, { id: `my-${pendingSeed}`, seed: pendingSeed, caption, age: 0, circle: active, origin }])
    setCameraOpen(false)
  }

  return (
    <IPhoneFrame>
      <div className="topbar">
        <button className="you" onClick={() => setProfile({ kind: 'self' })} aria-label="Your profile">
          <Gear />
        </button>
      </div>

      <Canvas
        active={active}
        gen={gen}
        myPosts={myPosts}
        panX={panX}
        panY={panY}
        seen={seen}
        onOpen={openViewer}
        onAddClick={openCamera}
        onPanStart={stopRecenter}
      />

      <div className="dock">
        {CIRCLE_ORDER.map((key) => (
          <CirclePill key={key} name={CIRCLES[key].name} active={key === active} onClick={() => switchCircle(key)} />
        ))}
      </div>

      <PostViewer post={openPost} onClose={() => setOpenPost(null)} onOpenProfile={(seed) => setProfile({ kind: 'person', seed })} />
      <Profile target={profile} active={active} onClose={() => setProfile(null)} />
      <Camera open={cameraOpen} seed={pendingSeed} active={active} onShare={share} onClose={() => setCameraOpen(false)} />
    </IPhoneFrame>
  )
}
