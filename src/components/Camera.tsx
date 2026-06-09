import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { CIRCLES, type CircleKey } from '../lib/model'
import { Back, Close } from './IconSet'

interface Props {
  open: boolean
  seed: number
  active: CircleKey
  onShare: (caption: string) => void
  onClose: () => void
}

/**
 * The "add a moment" camera, opened from the center "+". Slides up: a viewfinder
 * with a round shutter → a preview of the shot, shared with the active circle.
 */
export default function Camera({ open, seed, active, onShare, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && <Flow key="cam" seed={seed} active={active} onShare={onShare} onClose={onClose} />}
    </AnimatePresence>
  )
}

function Flow({ seed, active, onShare, onClose }: { seed: number; active: CircleKey; onShare: (c: string) => void; onClose: () => void }) {
  const [stage, setStage] = useState<'view' | 'preview'>('view')
  const [caption, setCaption] = useState('')

  return (
    <motion.div
      className="camera"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      {stage === 'view' ? (
        <>
          <img className="v-photo" src={`https://picsum.photos/seed/${seed}/900/1300`} alt="" />
          <div className="v-scrim" />
          <div className="cam-top">
            <button className="v-x" style={{ marginLeft: 0 }} onClick={onClose} aria-label="Close">
              <Close />
            </button>
            <span className="cam-title">New moment</span>
            <span style={{ width: 32 }} />
          </div>
          <p className="cam-hint">frame today's moment</p>
          <div className="cam-bar">
            <button className="shutter" onClick={() => setStage('preview')} aria-label="Shoot" />
          </div>
        </>
      ) : (
        <>
          <img className="v-photo" src={`https://picsum.photos/seed/${seed}/900/1300`} alt="" />
          <div className="v-scrim" />
          <div className="cam-top">
            <button className="v-x" style={{ marginLeft: 0 }} onClick={() => setStage('view')} aria-label="Back">
              <Back />
            </button>
            <div className="cam-tt">
              <div className="cam-title">Share</div>
              <div className="cam-sub">
                share with: <b>{CIRCLES[active].name}</b>
              </div>
            </div>
            <span style={{ width: 32 }} />
          </div>
          <div className="cam-share">
            <div className="v-input">
              <input
                className="v-field"
                placeholder="add a caption… (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <button className="v-act primary" onClick={() => onShare(caption)}>
                Share
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
