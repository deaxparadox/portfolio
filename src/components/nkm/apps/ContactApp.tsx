'use client'
import { useState } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export function ContactApp() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(data.contact.email)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="nkm-contact">
      <div className="nkm-contact-heading">{data.contact.heading}</div>
      <div className="nkm-contact-email" onClick={copyEmail}>
        <span style={{ fontSize: 20 }}>✉️</span>
        <span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 12 }}>
          {copied ? <span className="nkm-contact-copied">✓ Copied!</span> : data.contact.email}
        </span>
      </div>
      <div className="nkm-contact-links">
        {data.contact.socials.map(s => (
          <a
            key={s.label}
            href={s.href === '#' ? undefined : s.href}
            className="nkm-contact-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="nkm-contact-link-ico">{s.icon}</span>
            <span className="nkm-contact-link-name">{s.label}</span>
            <span className="nkm-contact-link-arr">›</span>
          </a>
        ))}
      </div>
      <div className="nkm-contact-avail">
        <div className="nkm-contact-dot" />
        <span className="nkm-contact-avail-text">Open to Remote · On-site · Hybrid</span>
      </div>
    </div>
  )
}
