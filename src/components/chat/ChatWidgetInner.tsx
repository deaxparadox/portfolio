'use client'
import { useChatContext } from './ChatContext'
import { ChatPanel } from './ChatPanel'

const mono = 'var(--font-jetbrains-mono), monospace'

export function ChatWidgetInner() {
  const { isOpen, closeChat } = useChatContext()

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 250,
      width: 300,
      background: '#0a0800',
      border: '1px solid rgba(245,197,24,0.22)',
      borderRadius: 12,
      boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column',
      maxHeight: 420,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(245,197,24,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: '#f5c518', letterSpacing: '0.12em', fontFamily: mono }}>
          $ deax --chat
        </span>
        <button
          type="button"
          onClick={closeChat}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(245,237,219,0.35)', fontFamily: mono, fontSize: 12,
          }}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatPanel />
      </div>
    </div>
  )
}
