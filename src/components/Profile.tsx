import { AnimatePresence, motion } from 'framer-motion'
import { useReducer, useState } from 'react'
import { addMember, listMembers, removeMember } from '../lib/members'
import { CIRCLES, initials, type CircleKey } from '../lib/model'
import { Chevron, Close, Plus } from './IconSet'

export type ProfileTarget = { kind: 'person'; seed: number; name: string } | { kind: 'self' } | null

interface Props {
  target: ProfileTarget
  active: CircleKey
  myName: string
  onRename: (name: string) => void
  onClose: () => void
}

/** Person profile (tap author) or your own profile / settings (tap the gear). */
export default function Profile({ target, active, myName, onRename, onClose }: Props) {
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
          {target.kind === 'self' ? (
            <Self active={active} myName={myName} onRename={onRename} onClose={onClose} />
          ) : (
            <Person seed={target.seed} name={target.name} active={active} onClose={onClose} />
          )}
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

function Person({ seed, name, active, onClose }: { seed: number; name: string; active: CircleKey; onClose: () => void }) {
  const [seg, setSeg] = useState<string>(active)
  const tint = CIRCLES[active].rims[0]
  const SEGS = [
    { key: 'fam', label: 'Family' },
    { key: 'fr', label: 'Friends' },
    { key: 'remove', label: 'Remove' },
  ]
  return (
    <>
      <img className="p-photo" src={`https://picsum.photos/seed/${seed}/900/1300`} alt="" />
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

function Self({ active, myName, onRename, onClose }: { active: CircleKey; myName: string; onRename: (n: string) => void; onClose: () => void }) {
  const [, bump] = useReducer((x) => x + 1, 0)
  const [seg, setSeg] = useState<CircleKey>(active)
  const [notif, setNotif] = useState(true)
  const [val, setVal] = useState(myName)

  const commit = () => {
    const n = val.trim() || myName
    setVal(n)
    onRename(n)
  }

  const SEGS: { key: CircleKey; label: string }[] = [
    { key: 'fam', label: 'Family' },
    { key: 'fr', label: 'Friends' },
  ]

  return (
    <>
      <CloseBtn onClose={onClose} />
      <div className="p-body">
        <div className="p-name-row">
          <input
            className="p-name p-name-edit"
            value={val}
            spellCheck={false}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          />
        </div>

        <div className="p-seg">
          {SEGS.map((s) => (
            <button key={s.key} className={`seg${seg === s.key ? ' active' : ''}`} onClick={() => setSeg(s.key)}>
              {s.label}
            </button>
          ))}
        </div>

        <div>
          {listMembers(seg).map((m) => (
            <div className="mrow" key={m.id}>
              <div className="mmono">{initials(m.name)}</div>
              <span className="mn">{m.name}</span>
              <button className="rm" onClick={() => { removeMember(seg, m.id); bump() }}>
                Remove
              </button>
            </div>
          ))}
          <div className="mrow" onClick={() => { addMember(seg); bump() }}>
            <div className="mav">
              <Plus size={20} />
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
