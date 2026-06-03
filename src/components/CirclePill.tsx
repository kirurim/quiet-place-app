interface Props {
  name: string
  active: boolean
  onClick: () => void
}

/** A circle selector at the bottom dock; the fountain erupts from here. */
export default function CirclePill({ name, active, onClick }: Props) {
  return (
    <button className={`pill${active ? ' active' : ''}`} onClick={onClick}>
      {name}
    </button>
  )
}
