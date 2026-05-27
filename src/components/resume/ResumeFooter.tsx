// src/components/resume/ResumeFooter.tsx
import type { ThemeTokens } from './types'
import type { FooterData } from '@/data/types'

const mono = "'DM Mono', monospace"

interface Props { T: ThemeTokens; footer: FooterData }

export default function ResumeFooter({ T, footer }: Props) {
  return (
    <footer style={{ paddingBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, letterSpacing: '0.06em' }}>
          {footer.copy}
        </span>
        <span style={{ fontFamily: mono, fontSize: 11, color: T.dimLo, letterSpacing: '0.06em' }}>
          <span style={{ color: T.gold }}>$</span> ./nk --version 2.0
        </span>
      </div>
    </footer>
  )
}
