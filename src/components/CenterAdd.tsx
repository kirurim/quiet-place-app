import { forwardRef } from 'react'
import { HC } from '../lib/model'
import { Plus } from './IconSet'

interface Props {
  onClick: () => void
}

/**
 * The center "+" — your "add a moment" action. A dark-glass circle (same surface
 * as the bottom pills) with a flat plus icon, no ring. Clicking opens the camera;
 * your own posts orbit and goo-connect to it. forwardRef so the goo can measure it.
 */
const CenterAdd = forwardRef<HTMLDivElement, Props>(function CenterAdd({ onClick }, ref) {
  return (
    <div
      ref={ref}
      className="hub"
      style={{ left: HC.x, top: HC.y }}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Plus />
    </div>
  )
})

export default CenterAdd
