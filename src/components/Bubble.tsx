import { motion } from 'framer-motion'
import { useState } from 'react'
import { AVATAR, myPostTarget, type AvatarModel, type MyPost, type PostModel } from '../lib/model'

export interface Viewable {
  seed: number
  age: number
  caption: string
}

type Common = {
  register: (id: string, el: HTMLElement | null) => void
}

interface AvatarProps extends Common {
  kind: 'avatar'
  data: AvatarModel
  origin: { x: number; y: number }
}

interface PostProps extends Common {
  kind: 'post'
  data: PostModel
  rim: string
  rim2: string
  avatarTarget: { x: number; y: number }
  onOpen: (post: Viewable) => void
}

interface MyPostProps extends Common {
  kind: 'mypost'
  data: MyPost
  index: number
  onOpen: (post: Viewable) => void
}

type Props = AvatarProps | PostProps | MyPostProps

const stop = (e: React.PointerEvent) => e.stopPropagation()

const MY_RIMS = { rim: '#e8ff3a', rim2: '#b6ff8a' }

/**
 * A liquid-glass bubble — a person avatar, one of their posts, or one of your
 * own posts orbiting the "+". Erupts from a fountain origin with spring physics,
 * drifts, is draggable; posts open the viewer on tap (Framer arbitrates tap vs drag).
 */
export default function Bubble(props: Props) {
  const [imgOk, setImgOk] = useState(true)

  const isAvatar = props.kind === 'avatar'
  const isMine = props.kind === 'mypost'

  const size = isAvatar ? AVATAR : isMine ? 120 : props.data.size
  const target = isMine ? myPostTarget(props.index) : props.data.target
  const left = target.x - size / 2
  const top = target.y - size / 2

  // fountain offset: avatars fly from the pill origin, posts grow out of their
  // avatar, my posts erupt from their frozen origin (the pill at share time).
  const from = isAvatar ? props.origin : isMine ? props.data.origin : props.avatarTarget
  const offX = from.x - target.x
  const offY = from.y - target.y

  const rim = isAvatar ? props.data.rim : isMine ? MY_RIMS.rim : props.rim
  const rim2 = isAvatar ? props.data.rim2 : isMine ? MY_RIMS.rim2 : props.rim2
  const seed = props.data.seed
  const old = props.kind === 'post' && props.data.age >= 5

  const className =
    'bubble' +
    (isAvatar ? ' avatar' : ' photo') +
    (isMine ? ' mypost fresh' : '') +
    (old ? ' old' : '')

  // Faithful timeline: avatars fly then size-pop (unfold) a beat later; circle
  // posts grow while flying; my posts erupt immediately on creation.
  const transition = isAvatar
    ? {
        default: { type: 'spring' as const, stiffness: 130, damping: 16, mass: 0.9, delay: props.data.flyDelay / 1000 },
        scale: { type: 'spring' as const, stiffness: 300, damping: 18, delay: props.data.unfoldDelay / 1000 },
        opacity: { duration: 0.4, delay: props.data.flyDelay / 1000 },
      }
    : isMine
      ? {
          default: { type: 'spring' as const, stiffness: 120, damping: 15, mass: 0.9 },
          opacity: { duration: 0.4 },
        }
      : {
          default: { type: 'spring' as const, stiffness: 120, damping: 15, mass: 0.9, delay: props.data.growDelay / 1000 },
          opacity: { duration: 0.4, delay: props.data.growDelay / 1000 },
        }

  const open = () => {
    if (props.kind === 'post') props.onOpen({ seed: props.data.seed, age: props.data.age, caption: props.data.caption })
    else if (props.kind === 'mypost') props.onOpen({ seed: props.data.seed, age: 0, caption: props.data.caption })
  }

  return (
    <motion.div
      className={className}
      style={{ left, top, width: size, height: size }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={stop}
      onTap={open}
      initial={{ x: offX, y: offY, scale: 0, opacity: 0 }}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={transition}
    >
      <div className="bubble-float" style={{ ['--dur' as string]: `${(6 + (seed % 5)).toFixed(1)}s` }}>
        <div className="glass" ref={(el) => props.register(props.data.id, el)} style={{ ['--rim' as string]: rim, ['--rim2' as string]: rim2 }}>
          {imgOk ? (
            <img
              src={`https://picsum.photos/seed/${seed}/280/280`}
              alt=""
              draggable={false}
              onError={() => setImgOk(false)}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(120% 120% at 30% 25%, ${rim}, #16161a)`,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
