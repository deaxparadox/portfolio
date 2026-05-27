// src/components/resume/ResumeSectionTitle.tsx
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"

interface Props { children: string; T: ThemeTokens }

export default function ResumeSectionTitle({ children, T }: Props) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span>
      <span>{children}</span>
      <span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
