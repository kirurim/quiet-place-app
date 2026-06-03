import { useEffect, useState, type ReactNode } from 'react'
import { SCREEN_H as H, SCREEN_W as W } from '../lib/model'
import StatusBar from './StatusBar'

/**
 * Realistic iPhone shell: rounded body, notch, 9:41 status bar.
 * The screen interior is a fixed 393×820 so the freeform px-math stays exact;
 * a CSS transform scales the whole device to fit smaller viewports.
 */
export default function IPhoneFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => {
      const s = Math.min(1, (window.innerHeight * 0.96) / H, window.innerWidth / (W + 40))
      setScale(s)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="stage" style={{ ['--scale' as string]: scale }}>
      <div className="device">
        <div className="screen">
          <div className="notch" />

          <StatusBar />

          {children}
        </div>
      </div>
    </div>
  )
}
