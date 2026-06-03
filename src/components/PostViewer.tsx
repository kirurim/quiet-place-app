import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useReducer, useRef, useState } from 'react'
import {
  addComment,
  addReply,
  getComments,
  getOpenReplies,
  NAMES,
  toggleReplies,
  type Comment,
} from '../lib/comments'
import type { Viewable } from './Bubble'
import { Close, Mic, Play, Send } from './IconSet'

const fmtAge = (a: number) => (a < 1 ? `${Math.max(1, Math.round(a * 24))}h` : `${Math.round(a)}d`)

interface Props {
  post: Viewable | null
  onClose: () => void
  onOpenProfile: (seed: number) => void
}

/**
 * Full-screen post viewer that slides up. A TikTok-style comment sheet sits at
 * the bottom: collapsed peek vs. drag/tap-expanded scrollable list, with replies.
 */
export default function PostViewer({ post, onClose, onOpenProfile }: Props) {
  return (
    <AnimatePresence>
      {post && <Sheet key={post.seed} post={post} onClose={onClose} onOpenProfile={onOpenProfile} />}
    </AnimatePresence>
  )
}

function Sheet({ post, onClose, onOpenProfile }: { post: Viewable; onClose: () => void; onOpenProfile: (seed: number) => void }) {
  const { seed, age, caption } = post
  const [, bump] = useReducer((x) => x + 1, 0)
  const [draft, setDraft] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string; who: string } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const grip = useRef({ y: 0, moved: false })

  const meta = useMemo(() => {
    const bars = Array.from({ length: 20 }, (_, i) => 4 + ((seed * 3 + i * 7) % 14))
    return {
      src: `https://picsum.photos/seed/${seed}/280/280`,
      name: NAMES[seed % NAMES.length],
      time: fmtAge(age),
      voice: { who: NAMES[(seed + 5) % NAMES.length], avatar: seed + 30, bars, dur: `0:0${1 + (seed % 9)}` },
    }
  }, [seed, age])

  const comments = getComments(seed)
  const openSet = getOpenReplies(seed)

  const startReply = (id: string, who: string) => {
    setReplyTo({ id, who })
    setDraft(`@${who} `)
    setExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const submit = () => {
    const t = draft.trim()
    if (!t) return
    if (replyTo) {
      addReply(seed, replyTo.id, t.replace(/^@\S+\s*/, ''))
      setReplyTo(null)
    } else {
      addComment(seed, t)
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
      })
    }
    setDraft('')
    setExpanded(true)
    bump()
  }

  // grip: finger-drag to snap, tap to toggle
  const onGripDown = (e: React.PointerEvent) => {
    e.preventDefault()
    grip.current = { y: e.clientY, moved: false }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onGripMove = (e: React.PointerEvent) => {
    const dy = e.clientY - grip.current.y
    if (Math.abs(dy) > 10) {
      grip.current.moved = true
      setExpanded(dy < 0)
    }
  }
  const onGripUp = () => {
    if (!grip.current.moved) setExpanded((x) => !x)
  }

  return (
    <motion.div
      className="viewer"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <img className="v-photo" src={meta.src} alt="" />
      <div className="v-scrim" />

      <div className="v-top">
        <img className="v-ava" src={`https://picsum.photos/seed/${seed}/60/60`} alt="" onClick={() => onOpenProfile(seed)} />
        <span className="v-name" onClick={() => onOpenProfile(seed)}>
          {meta.name}
        </span>
        <span className="v-time">{meta.time}</span>
        <button className="v-x" onClick={onClose} aria-label="Close">
          <Close />
        </button>
      </div>

      <div className={`v-sheet${expanded ? ' expanded' : ''}`}>
        <div className="v-grip" onPointerDown={onGripDown} onPointerMove={onGripMove} onPointerUp={onGripUp} />

        <div className="v-list" ref={listRef}>
          {caption && (
            <div className="cmt main">
              <img className="cmt-av" src={`https://picsum.photos/seed/${seed}/60/60`} alt="" />
              <div className="cmt-body">
                <div className="cmt-name">{meta.name}</div>
                <div className="cmt-text">{caption}</div>
              </div>
            </div>
          )}
          <div className="cmt">
            <img className="cmt-av" src={`https://picsum.photos/seed/${meta.voice.avatar}/60/60`} alt="" />
            <div className="cmt-body">
              <div className="cmt-name">{meta.voice.who}</div>
              <div className="cmt-voice">
                <Play />
                <div className="v-wave">
                  {meta.voice.bars.map((h, i) => (
                    <i key={i} style={{ height: `${h}px` }} />
                  ))}
                </div>
                <span>{meta.voice.dur}</span>
              </div>
            </div>
          </div>

          {comments.map((c) => (
            <CommentRow
              key={c.id}
              c={c}
              open={openSet.has(c.id)}
              onReply={startReply}
              onToggle={() => {
                toggleReplies(seed, c.id)
                bump()
              }}
            />
          ))}
        </div>

        <div className="v-input">
          <input
            ref={inputRef}
            className="v-field"
            placeholder={replyTo ? `Reply to ${replyTo.who}…` : 'Add a reaction…'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            maxLength={50}
          />
          <button className="v-act icon" aria-label="Voice">
            <Mic />
          </button>
          <button className="v-act primary icon" onClick={submit} aria-label="Send">
            <Send />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function CommentRow({ c, open, onReply, onToggle }: { c: Comment; open: boolean; onReply: (id: string, who: string) => void; onToggle: () => void }) {
  return (
    <div className="cmt">
      <img className="cmt-av" src={`https://picsum.photos/seed/${c.avatar}/60/60`} alt="" />
      <div className="cmt-body">
        <div className="cmt-name">{c.who}</div>
        <div className="cmt-text">{c.text}</div>
        <div className="cmt-meta">
          <span>{c.date}</span>
          <span className="rep" onClick={() => onReply(c.id, c.who)}>
            Reply
          </span>
        </div>
        {c.replies.length > 0 && (
          <>
            <div className="cmt-vr" onClick={onToggle}>
              {open ? 'Hide replies' : `View ${c.replies.length} ${c.replies.length > 1 ? 'replies' : 'reply'}`}
            </div>
            {open &&
              c.replies.map((r) => (
                <div className="cmt-reply" key={r.id}>
                  <img className="cmt-av" src={`https://picsum.photos/seed/${r.avatar}/60/60`} alt="" />
                  <div className="cmt-body">
                    <div className="cmt-name">{r.who}</div>
                    <div className="cmt-text">{r.text}</div>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  )
}
