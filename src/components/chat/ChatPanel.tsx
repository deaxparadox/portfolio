'use client'
import { useRef, useEffect, useState } from 'react'
import { useChatContext } from './ChatContext'
import { ChatMessage } from './ChatMessage'

const mono = 'var(--font-jetbrains-mono), monospace'

export function ChatPanel() {
  const { messages, isStreaming, sendMessage } = useChatContext()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'thin',
      }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 10, color: 'rgba(245,237,219,0.30)', fontFamily: mono, textAlign: 'center', marginTop: 20 }}>
            Ask me anything about Nitish's work.
          </div>
        )}
        {messages.map(m => (
          <ChatMessage key={m.id} id={m.id} role={m.role} content={m.content} streaming={m.streaming} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid rgba(245,197,24,0.10)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <style>{`@keyframes chat-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask anything…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#f5eddb', fontFamily: mono, fontSize: 11,
            opacity: isStreaming ? 0.4 : 1,
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: isStreaming || !input.trim() ? 'rgba(245,197,24,0.3)' : '#f5c518',
            border: 'none', cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
            color: '#0a0800', fontFamily: mono, fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
