import type { GlimpseReads } from '@/data/types'

export default function BentoReads({ reads }: { reads: GlimpseReads }) {
  return (
    <div className="bc bc-reads">
      <div className="bc-label">My Reads</div>
      <div className="bc-title">What&apos;s on my shelf</div>
      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginTop: '12px' }}>
        <div style={{
          width: '68px', minWidth: '68px', height: '96px', borderRadius: '5px',
          background: 'linear-gradient(135deg, #e8900a, #f5c518)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: 'var(--bg-dark)', textAlign: 'center', padding: '8px',
          lineHeight: 1.3, fontWeight: 500,
          boxShadow: '4px 4px 16px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '5px', bottom: 0,
            background: 'rgba(0,0,0,.25)', borderRadius: '5px 0 0 5px',
          }} />
          ATOMIC<br/>HABITS<br/>—<br/>James Clear
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-instrument-sans), sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {reads.title}
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '.06em', marginBottom: '8px' }}>
            {reads.author}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>
            &quot;{reads.quote}&quot;
          </div>
        </div>
      </div>
    </div>
  )
}
