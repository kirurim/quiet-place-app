// One consistent flat icon set — 2px stroke, currentColor.

type P = { size?: number }

export const Send = ({ size = 20 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V6" />
    <path d="M6 12l6-6 6 6" />
  </svg>
)

export const Mic = ({ size = 20 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v4" />
  </svg>
)

export const Play = ({ size = 12 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M7 5l12 7-12 7z" />
  </svg>
)

export const Close = ({ size = 18 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const Back = ({ size = 20 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const Chevron = ({ size = 18 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export const Plus = ({ size = 26 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

export const Gear = ({ size = 20 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
)

// status bar icons
export const Cellular = () => (
  <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
    <rect x="0" y="7" width="3" height="4" rx="1" />
    <rect x="5" y="5" width="3" height="6" rx="1" />
    <rect x="10" y="2.5" width="3" height="8.5" rx="1" />
    <rect x="15" y="0" width="3" height="11" rx="1" />
  </svg>
)

export const Wifi = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <path d="M1.2 4.4a11 11 0 0 1 14.6 0" />
    <path d="M3.7 6.9a7 7 0 0 1 9.6 0" />
    <path d="M6.2 9.4a3 3 0 0 1 4.6 0" />
  </svg>
)

export const Battery = () => (
  <svg width="26" height="12" viewBox="0 0 26 12">
    <rect x="1" y="1" width="21" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth={1} opacity={0.4} />
    <rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="currentColor" />
    <rect x="23.5" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" opacity={0.4} />
  </svg>
)
