// src/components/resume/ResumeLink.tsx
'use client'
import { useState } from 'react'
import type { ThemeTokens } from './types'

const mono = "'DM Mono', monospace"

interface Props {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
  T: ThemeTokens
}

export default function ResumeLink({ href, children, style = {}, T }: Props) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: mono, fontSize: 'inherit',
        color: hov ? T.goldLt : T.gold,
        textDecoration: 'none',
        borderBottom: `1px solid ${hov ? T.gold : T.border}`,
        paddingBottom: 1,
        transition: 'color .18s, border-color .18s',
        ...style,
      }}
    >{children}</a>
  )
}
