'use client'
import { ChatPanel } from '@/components/chat/ChatPanel'

export function DeaxApp() {
  return (
    <div className="nk-deax">
      <div className="nk-deax-hdr">
        <span>🤖</span>
        <span>$ deax --chat</span>
      </div>
      <div className="nk-deax-body">
        <ChatPanel />
      </div>
    </div>
  )
}
