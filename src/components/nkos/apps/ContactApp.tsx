'use client'
import { useState } from 'react'
import portfolioData from '@/data/portfolio.json'
import type { PortfolioData } from '@/data/types'

const data = portfolioData as PortfolioData

export function ContactApp() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(data.contact.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="nk-contact">
      <div className="nk-contact-heading">{data.contact.heading}</div>
      <div className="nk-contact-email" onClick={copyEmail}>
        {copied
          ? <><span className="nk-contact-email-copied">✓</span> Copied!</>
          : <>{data.contact.email}</>
        }
      </div>
      <div className="nk-contact-links">
        {data.contact.socials.map(s => (
          <a
            key={s.label}
            href={s.href === '#' ? undefined : s.href}
            className="nk-contact-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.icon} {s.label}
          </a>
        ))}
      </div>
      <div className="nk-contact-avail">
        <div className="nk-contact-dot" />
        Open to Remote · On-site · Hybrid
      </div>
    </div>
  )
}
