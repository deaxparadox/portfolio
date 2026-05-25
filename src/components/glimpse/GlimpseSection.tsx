import BentoReads    from './BentoReads'
import BentoToolbox  from './BentoToolbox'
import BentoHeatmap  from './BentoHeatmap'
import BentoHobbies  from './BentoHobbies'
import BentoLocation from './BentoLocation'
import BentoQuote    from './BentoQuote'
import type { GlimpseData } from '@/data/types'

export default function GlimpseSection({ glimpse }: { glimpse: GlimpseData }) {
  return (
    <section id="glimpse" style={{ padding: '110px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-label reveal">About Me</div>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '56px',
        }}>
          A glimpse into{' '}
          <span style={{ color: 'var(--accent)' }}>my world</span>
        </h2>
        <div className="bento">
          <BentoReads    reads={glimpse.reads}       />
          <BentoToolbox                               />
          <BentoHeatmap                               />
          <BentoHobbies  hobbies={glimpse.hobbies}   />
          <BentoLocation location={glimpse.location} />
          <BentoQuote    quote={glimpse.quote}        />
        </div>
      </div>
    </section>
  )
}
