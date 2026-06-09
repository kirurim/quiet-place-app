import { initials } from '../lib/model'

/**
 * One avatar rule everywhere: if the person has an ACTIVE (non-expired) photo,
 * show it; otherwise show their initials in a monogram circle (the same flat
 * dark-glass pill surface as the canvas avatars). `className` carries the slot's
 * size (e.g. `cmt-av`, `v-ava`); the monogram variant adds `mono`.
 */
export default function Avatar({
  name,
  photo,
  className = '',
  onClick,
}: {
  name: string
  photo?: string
  className?: string
  onClick?: () => void
}) {
  return photo ? (
    <img className={className} src={photo} alt="" onClick={onClick} />
  ) : (
    <div className={`${className} mono`} onClick={onClick}>
      {initials(name)}
    </div>
  )
}
