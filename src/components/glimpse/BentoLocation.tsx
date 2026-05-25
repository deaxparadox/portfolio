import type { GlimpseLocation } from '@/data/types'

export default function BentoLocation({ location }: { location: GlimpseLocation }) {
  return (
    <div className="bc bc-location">
      <div className="bc-label">Location</div>
      <div className="bc-title">Based in</div>
      <div className="loc-map">
        <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5 }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="loc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(245,197,24,0.15)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="300" height="120" fill="url(#loc-grid)"/>
          <circle cx="150" cy="60" r="35" fill="none" stroke="rgba(245,197,24,0.18)" strokeWidth="1"/>
          <circle cx="150" cy="60" r="65" fill="none" stroke="rgba(245,197,24,0.08)" strokeWidth="1"/>
          <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(245,197,24,0.12)" strokeWidth="0.5"/>
          <line x1="150" y1="0" x2="150" y2="120" stroke="rgba(245,197,24,0.12)" strokeWidth="0.5"/>
        </svg>
        <div className="loc-pin">
          <div className="loc-pin-dot" />
          <div className="loc-pin-label">{location.pin}</div>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-dm-serif), serif', fontSize: '20px', color: 'var(--text-primary)', marginTop: '10px', letterSpacing: '-0.5px' }}>
        {location.city}, {location.country}
      </div>
      <div style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '.1em', marginTop: '3px' }}>
        {location.availability}
      </div>
    </div>
  )
}
