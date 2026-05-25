'use client'
import { useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useTerminal } from '@/context/TerminalContext'
import WifiPlaceholder from './WifiPlaceholder'
import Terminal from './Terminal'
import MobileTerminalPill from './MobileTerminalPill'
import type { PortfolioData } from '@/data/types'

export default function Hero({ data }: { data: PortfolioData }) {
  const { hero, terminal } = data
  const { state, transitionTo } = useTerminal()
  const heroRef = useRef<HTMLElement>(null)

  // Auto-detach: when hero fully scrolls out of viewport on desktop, float the terminal
  useEffect(() => {
    const el = heroRef.current
    if (!el || typeof window === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && window.innerWidth > 900) {
          transitionTo('FLOATING')
        }
      },
      { threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [transitionTo])

  // Auto-reset: if viewport shrinks to ≤900px while terminal is FLOATING, reattach it
  useEffect(() => {
    if (typeof window === 'undefined') return
    const check = () => {
      if (window.innerWidth <= 900 && state === 'FLOATING') transitionTo('EMBEDDED')
    }
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [state, transitionTo])

  return (
    <section
      ref={heroRef}
      style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '120px 60px 80px', position: 'relative',
    }}>
      <div className="hero-inner" style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '80px', alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '100px', padding: '8px 18px',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '0.7rem', color: 'var(--accent)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: '32px', animation: 'fadeUp 0.8s ease 0.3s both',
          }}>
            <span style={{
              width: '7px', height: '7px', background: '#4adb6e',
              borderRadius: '50%', animation: 'pulse 2s ease infinite',
            }} />
            {hero.badge}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-dm-serif), serif',
            fontSize: 'clamp(3rem, 5vw, 5.5rem)',
            lineHeight: 1.05, letterSpacing: '-0.02em',
            animation: 'fadeUp 0.8s ease 0.5s both',
          }}>
            {hero.titleLines.map((line, i) => (
              <span key={i}>
                {i === hero.titleAccentLine
                  ? <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{line}</span>
                  : line}
                {i < hero.titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p style={{
            marginTop: '28px', fontSize: '1.05rem', lineHeight: 1.75,
            color: 'var(--text-secondary)', maxWidth: '460px',
            animation: 'fadeUp 0.8s ease 0.7s both',
          }}>
            {hero.subtitle}
          </p>

          <div style={{
            display: 'flex', gap: '20px', marginTop: '44px',
            animation: 'fadeUp 0.8s ease 0.9s both',
          }}>
            <a href={hero.ctaPrimary.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'var(--accent)', color: 'var(--bg-dark)',
              padding: '14px 32px', borderRadius: '3px',
              fontFamily: 'var(--font-instrument-sans), sans-serif',
              fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}>
              {hero.ctaPrimary.label}
            </a>
            <a href={hero.ctaSecondary.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)', padding: '14px 32px', borderRadius: '3px',
              fontFamily: 'var(--font-instrument-sans), sans-serif',
              fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none',
              backdropFilter: 'blur(10px)', transition: 'all 0.3s ease',
            }}>
              {hero.ctaSecondary.label}
            </a>
          </div>
        </div>

        <div style={{ animation: 'fadeUp 0.8s ease 0.6s both' }}>
          {/* Desktop: full terminal card or WiFi placeholder (CSS hides on mobile) */}
          <div className="hero-terminal-col">
            <AnimatePresence mode="wait">
              {state === 'EMBEDDED' ? (
                <m.div
                  key="terminal-embedded"
                  layoutId="terminal"
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <Terminal data={terminal} />
                </m.div>
              ) : (
                <WifiPlaceholder key="wifi-placeholder" />
              )}
            </AnimatePresence>
          </div>

          {/* Mobile: collapsed pill (CSS hides on desktop) */}
          <div className="hero-terminal-pill-col">
            <MobileTerminalPill />
          </div>
        </div>
      </div>
    </section>
  )
}
