import type { ContactData } from '@/data/types'

export default function ContactSection({ contact }: { contact: ContactData }) {
  return (
    <section id="contact" style={{
      background: 'var(--glass-bg)',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', textAlign: 'center', padding: '100px 60px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '0.68rem', color: 'var(--accent)',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
          marginBottom: '16px',
        }}>
          Get in touch
        </div>

        <h2 style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
          lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 0,
        }}>
          {contact.heading}
        </h2>

        <a href={`mailto:${contact.email}`} style={{
          fontFamily: 'var(--font-dm-serif), serif',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: 'var(--text-primary)', textDecoration: 'none',
          letterSpacing: '-0.02em', display: 'block',
          margin: '20px 0 50px', transition: 'color 0.3s ease',
        }}>
          {contact.email}
        </a>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {contact.socials.map(social => (
            <a key={social.label} href={social.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '0.72rem', color: 'var(--text-secondary)',
              textDecoration: 'none', letterSpacing: '0.1em',
              border: '1px solid rgba(232,200,74,0.15)',
              padding: '12px 24px', borderRadius: '3px', transition: 'all 0.3s ease',
            }}>
              {social.icon} {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
