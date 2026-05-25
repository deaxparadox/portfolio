export default function SectionDivider() {
  return (
    <div style={{
      position: 'relative', zIndex: 1,
      margin: '0 80px', height: '1px',
      background: 'linear-gradient(90deg, transparent, var(--accent-deep), transparent)',
      opacity: 0.3,
    }} />
  )
}
