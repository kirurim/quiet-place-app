// Circle membership store for the self profile. Module-level so add/remove
// survives reopening the overlay and switching segments.
import type { CircleKey } from './model'

export interface Member {
  seed: number
  name: string
}

const NAMES = ['mishka', 'kalindi', 'hak1883', 'noa', 'leo.r', 'sonya', 'theo', 'dasha']

const seedOf = (name: string, i: number) => (name.charCodeAt(0) + i * 13) * 5

const members: Record<CircleKey, Member[]> = {
  fam: ['mishka', 'kalindi', 'hak1883', 'noa', 'leo.r'].map((name, i) => ({ name, seed: seedOf(name, i) })),
  fr: ['sonya', 'theo', 'dasha', 'noa', 'kalindi', 'leo.r'].map((name, i) => ({ name, seed: seedOf(name, i) })),
}

export const listMembers = (circle: CircleKey): Member[] => members[circle]

export const removeMember = (circle: CircleKey, seed: number): void => {
  members[circle] = members[circle].filter((m) => m.seed !== seed)
}

let addCount = 0
export const addMember = (circle: CircleKey): void => {
  const name = NAMES[addCount % NAMES.length]
  members[circle] = [...members[circle], { name, seed: seedOf(name, members[circle].length + ++addCount) }]
}
