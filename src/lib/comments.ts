// Comment store for the post viewer. A nested (one level) tree kept in a
// module-level Map keyed by post seed, so appends + reply-toggle state survive
// the viewer remounting when you reopen a post.

export const NAMES = ['mishka', 'kalindi', 'hak1883', 'noa', 'leo.r', 'sonya', 'theo', 'dasha']
export const REACTS = [
  'so warm 🤍',
  'miss you all',
  'where is this?',
  'beautiful',
  'the best',
  '💛 mine',
  'love it',
  'sending a hug',
  'when again?',
]

export interface Comment {
  id: string
  who: string
  text: string
  avatar: number
  mine?: boolean
  date: string
  replies: Comment[]
}

const store = new Map<number, Comment[]>()
const openReplies = new Map<number, Set<string>>()
let uid = 0
const nextId = () => `c${uid++}`

function seedComments(seed: number): Comment[] {
  const count = 2 + (seed % 6) // 2–7
  return Array.from({ length: count }, (_, i) => {
    const hasReply = i % 3 === 0
    return {
      id: nextId(),
      who: NAMES[(seed + i + 3) % NAMES.length],
      text: REACTS[(seed + i) % REACTS.length],
      avatar: seed + 10 + i,
      date: `5-${10 + ((seed + i) % 18)}`,
      replies: hasReply
        ? [
            {
              id: nextId(),
              who: NAMES[(seed + i + 1) % NAMES.length],
              text: REACTS[(seed + i + 4) % REACTS.length],
              avatar: seed + 50 + i,
              date: `5-${12 + ((seed + i) % 16)}`,
              replies: [],
            },
          ]
        : [],
    }
  })
}

export function getComments(seed: number): Comment[] {
  let c = store.get(seed)
  if (!c) {
    c = seedComments(seed)
    store.set(seed, c)
  }
  return c
}

export function addComment(seed: number, text: string): void {
  getComments(seed).push({ id: nextId(), who: 'you', text, avatar: 1, mine: true, date: 'now', replies: [] })
}

export function addReply(seed: number, parentId: string, text: string): void {
  const parent = getComments(seed).find((c) => c.id === parentId)
  if (!parent) return
  parent.replies.push({ id: nextId(), who: 'you', text, avatar: 1, mine: true, date: 'now', replies: [] })
  getOpenReplies(seed).add(parentId)
}

export function getOpenReplies(seed: number): Set<string> {
  let s = openReplies.get(seed)
  if (!s) {
    s = new Set()
    openReplies.set(seed, s)
  }
  return s
}

export function toggleReplies(seed: number, id: string): void {
  const s = getOpenReplies(seed)
  if (s.has(id)) s.delete(id)
  else s.add(id)
}
