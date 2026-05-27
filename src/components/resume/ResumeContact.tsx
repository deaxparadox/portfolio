// src/components/resume/ResumeContact.tsx
'use client'
import { useState } from 'react'
import type { ThemeTokens } from './types'
import type { ContactData } from '@/data/types'

const mono = "'DM Mono', monospace"
const sans = "'Syne', sans-serif"

interface Props { T: ThemeTokens; contact: ContactData }

export default function ResumeContact({ T, contact }: Props) {
  const [copied, setCopied] = useState(false)
  const [hov, setHov] = useState(false)

  const copyEmail = () => {
    navigator.clipboard?.writeText(contact.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <section id="contact">
      <SectionTitle T={T}>Get in touch</SectionTitle>
      <p style={{ fontSize: 14, color: T.dim, lineHeight: 1.82, marginBottom: 24, maxWidth: 500, fontFamily: sans, transition: 'color .35s' }}>
        Open to backend engineering and AI projects.
        Whether it&apos;s a full-time role, a contract, or just a conversation — reach out.
      </p>
      <div
        onClick={copyEmail}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          fontFamily: mono, fontSize: 13,
          background: hov ? T.bgTerm : 'transparent',
          border: `1px solid ${hov ? T.borderHv : T.border}`,
          borderRadius: 6, padding: '10px 16px',
          cursor: 'pointer', transition: 'all .2s',
          marginBottom: 24,
        }}
      >
        <span style={{ color: T.gold }}>
          {copied ? '✓ copied!' : contact.email}
        </span>
        {!copied && (
          <span style={{ color: T.dimLo, fontSize: 10, letterSpacing: '0.06em' }}>click to copy</span>
        )}
      </div>
    </section>
  )
}

function SectionTitle({ children, T }: { children: string; T: ThemeTokens }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 13, color: T.gold, letterSpacing: '0.06em', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ opacity: 0.55 }}>~</span><span>{children}</span><span style={{ opacity: 0.55 }}>~</span>
    </div>
  )
}
