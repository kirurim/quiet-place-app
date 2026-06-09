// Circle membership store for the self profile. Module-level so add/remove
// survives reopening the overlay and switching segments. Full names only.
import { NAMES, type CircleKey } from './model'

export interface Member {
  id: number
  name: string
}

let uid = 0
const make = (name: string): Member => ({ id: uid++, name })

const members: Record<CircleKey, Member[]> = {
  fam: ['Sage Savani', 'Edward Michaels', 'Warren Lo', 'Eli Bauer', 'Suzie Webb'].map(make),
  fr: ['Sonya Reed', 'Theo Marsh', 'Dasha Vinn', 'Noa Frank', 'Leo Ray', 'Mia Larsen'].map(make),
}

export const listMembers = (circle: CircleKey): Member[] => members[circle]

export const removeMember = (circle: CircleKey, id: number): void => {
  members[circle] = members[circle].filter((m) => m.id !== id)
}

let addCount = 0
export const addMember = (circle: CircleKey): void => {
  const name = NAMES[addCount++ % NAMES.length]
  members[circle] = [...members[circle], make(name)]
}
