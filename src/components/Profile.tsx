import { AnimatePresence, motion } from 'framer-motion'
import { useReducer, useState } from 'react'
import { NAMES } from '../lib/comments'
import { addMember, listMembers, removeMember } from '../lib/members'
import { CIRCLES, type CircleKey } from '../lib/model'
import { Chevron, Close, Plus } from './IconSet'

export type ProfileTarget = { kind: 'person'; seed: number } | { kind: 'self' } | null

interface Props {
  target: ProfileTarget
  active: CircleKey
  onClose: () => void
}

/** Person profile (tap author) or your own profile (tap the gear). Slides up. */
export default function Profile({ target, active, onClose }: Props) {
  return (
    <AnimatePresence>
      {target && (
        <motion.div
          key={target.kind === 'self' ? 'self' : target.seed}
          className={`profile${target.kind === 'self' ? ' self' : ''}`}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          {target.kind === 'self' ? <Self active={active} onClose={onClose} /> : <Person seed={target.seed} active={active} onClose={onClose} />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-top">
      <button className="v-x" style={{ marginLeft: 0 }} onClick={onClose} aria-label="Close">
        <Close />
      </button>
    </div>
  )
}

function Person({ seed, active, onClose }: { seed: number; active: CircleKey; onClose: () => void }) {
  const [seg, setSeg] = useState<string>(active)
  const tint = CIRCLES[active].rims[0]
  const name = NAMES[seed % NAMES.length]
  const SEGS = [
    { key: 'fam', label: 'Family' },
    { key: 'fr', label: 'Friends' },
    { key: 'remove', label: 'Remove' },
  ]
  return (
    <>
      <img className="p-photo" src={`https://picsum.photos/seed/${seed}/600/900`} alt="" />
      <div className="p-grad" style={{ background: `linear-gradient(180deg,transparent 30%,${tint}33 56%,#0c0c0e 82%)` }} />
      <CloseBtn onClose={onClose} />
      <div className="p-body">
        <h2 className="p-name">{name}</h2>
        <div className="p-meta">in your circle · last post 9h ago</div>
        <div className="p-seg">
          {SEGS.map((s) => (
            <button key={s.key} className={`seg${seg === s.key ? ' active' : ''}`} onClick={() => setSeg(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function Self({ active, onClose }: { active: CircleKey; onClose: () => void }) {
  const [, bump] = useReducer((x) => x + 1, 0)
  const [seg, setSeg] = useState<CircleKey>(active)
  const [notif, setNotif] = useState(true)
  const SEGS: { key: CircleKey; label: string }[] = [
    { key: 'fam', label: 'Family' },
    { key: 'fr', label: 'Friends' },
  ]
  return (
    <>
      <img className="p-photo" src="https://picsum.photos/seed/7/600/700" alt="" />
      <div className="p-grad" />
      <CloseBtn onClose={onClose} />
      <div className="p-body">
        <h2 className="p-name">You</h2>
        <div className="p-meta">your quiet space</div>

        <div className="p-seg">
          {SEGS.map((s) => (
            <button key={s.key} className={`seg${seg === s.key ? ' active' : ''}`} onClick={() => setSeg(s.key)}>
              {s.label}
            </button>
          ))}
        </div>

        <div>
          {listMembers(seg).map((m) => (
            <div className="mrow" key={m.seed}>
              <img src={`https://picsum.photos/seed/${m.seed}/80/80`} alt="" />
              <span className="mn">{m.name}</span>
              <button className="rm" onClick={() => { removeMember(seg, m.seed); bump() }}>
                Remove
              </button>
            </div>
          ))}
          <div className="mrow" onClick={() => { addMember(seg); bump() }}>
            <div className="mav">
              <Plus size={18} />
            </div>
            <span className="mn dim">Add someone</span>
            <button className="rm add">Add</button>
          </div>
        </div>

        <div className="p-sect">Settings</div>
        <div className="srow">
          <span className="sl">Notifications</span>
          <div className={`tgl${notif ? ' on' : ''}`} onClick={() => setNotif((v) => !v)} />
        </div>
        <div className="srow act" onClick={onClose}>
          <span className="sl">Log out</span>
          <span className="chev"><Chevron /></span>
        </div>
        <div className="srow act danger" onClick={onClose}>
          <span className="sl">Delete account</span>
          <span className="chev"><Chevron /></span>
        </div>
      </div>
    </>
  )
}
