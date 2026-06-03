import { Battery, Cellular, Wifi } from './IconSet'

/** iOS status bar: time + flat cellular / wifi / battery icons. */
export default function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="ic">
        <Cellular />
        <Wifi />
        <Battery />
      </span>
    </div>
  )
}
