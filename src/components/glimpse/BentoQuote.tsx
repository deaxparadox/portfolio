import type { GlimpseQuote } from '@/data/types'

export default function BentoQuote({ quote }: { quote: GlimpseQuote }) {
  const lines = quote.text.split('\n')
  return (
    <div className="bc bc-quote">
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '4px 0' }}>
        <div style={{ fontFamily: 'var(--font-dm-serif), serif', fontSize: '72px', color: 'var(--accent)', lineHeight: .7, marginBottom: '8px', opacity: .35 }}>
          &quot;
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '22px', fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: '14px' }}>
          {lines.map((line, i) => (
            <span key={i}>
              {i === 1
                ? <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>{line}</em>
                : line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          — {quote.author}
        </div>
      </div>
    </div>
  )
}
