'use client'
import type { Message } from './ChatContext'

const mono = 'var(--font-jetbrains-mono), monospace'

type Props = Pick<Message, 'id' | 'role' | 'content'> & { streaming?: boolean }

export function ChatMessage({ role, content, streaming }: Props) {
  const isUser = role === 'user'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <span style={{
        fontSize: 8, letterSpacing: '0.10em',
        color: isUser ? 'rgba(245,237,219,0.35)' : 'rgba(245,197,24,0.45)',
        marginBottom: 3, fontFamily: mono,
      }}>
        {isUser ? 'YOU' : 'DEAX'}
      </span>
      <div style={{
        maxWidth: 220,
        background: isUser ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isUser ? 'rgba(245,197,24,0.20)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: isUser ? '10px 10px 2px 10px' : '2px 10px 10px 10px',
        padding: '7px 10px',
        fontSize: 11,
        color: '#f5eddb',
        fontFamily: mono,
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        {content}
        {streaming && <span style={{ animation: 'chat-blink .8s steps(1) infinite', display: 'inline-block' }}>▊</span>}
      </div>
    </div>
  )
}
