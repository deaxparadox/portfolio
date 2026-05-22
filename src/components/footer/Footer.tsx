import type { FooterData } from '@/data/types'

export default function Footer({ footer }: { footer: FooterData }) {
  return (
    <footer style={{
      padding: '40px 60px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      borderTop: '1px solid rgba(232,200,74,0.06)',
    }}>
      <span style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em',
      }}>
        {footer.copy}
      </span>
      <span style={{
        fontFamily: 'var(--font-dm-serif), serif',
        fontSize: '0.9rem', color: 'rgba(232,200,74,0.4)', fontStyle: 'italic',
      }}>
        {footer.signature}
      </span>
    </footer>
  )
}
