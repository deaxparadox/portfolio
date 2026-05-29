'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createSession, streamMessage } from './chatApi'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface ChatContextValue {
  isOpen: boolean
  messages: Message[]
  threadId: string | null
  isStreaming: boolean
  openChat: () => void
  closeChat: () => void
  sendMessage: (text: string) => Promise<void>
  ensureSession: () => Promise<string>
}

const ChatContext = createContext<ChatContextValue>({
  isOpen: false, messages: [], threadId: null, isStreaming: false,
  openChat: () => {}, closeChat: () => {},
  sendMessage: async () => {}, ensureSession: async () => '',
})

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const msgIdRef = useRef(0)
  const threadIdRef = useRef<string | null>(null)
  threadIdRef.current = threadId
  const sessionPromiseRef = useRef<Promise<string> | null>(null)

  const ensureSession = useCallback(async (): Promise<string> => {
    if (threadIdRef.current) return threadIdRef.current
    if (sessionPromiseRef.current) return sessionPromiseRef.current
    sessionPromiseRef.current = createSession().then(id => {
      setThreadId(id)
      sessionPromiseRef.current = null
      return id
    }).catch(err => {
      sessionPromiseRef.current = null
      throw err
    })
    return sessionPromiseRef.current
  }, [])

  const openChat = useCallback(async () => {
    try { await ensureSession() } catch { return }
    setIsOpen(true)
  }, [ensureSession])

  const closeChat = useCallback(() => setIsOpen(false), [])

  const sendMessage = useCallback(async (text: string) => {
    let tid: string
    try { tid = await ensureSession() } catch { return }

    const userId = String(++msgIdRef.current)
    const assistantId = String(++msgIdRef.current)

    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', content: text },
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])
    setIsStreaming(true)

    let errorCode = ''
    await streamMessage(text, tid, {
      onToken(content) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + content } : m
        ))
      },
      onScroll(section) {
        document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
      },
      onDone() {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false } : m
        ))
        setIsStreaming(false)
      },
      onError(msg) { errorCode = msg },
    })

    if (errorCode === 'session_expired') {
      setThreadId(null)
      try {
        const newTid = await createSession()
        setThreadId(newTid)
        await streamMessage(text, newTid, {
          onToken(content) {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + content } : m
            ))
          },
          onScroll(section) {
            document.querySelector('#' + section)?.scrollIntoView({ behavior: 'smooth' })
          },
          onDone() {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, streaming: false } : m
            ))
            setIsStreaming(false)
          },
          onError() {
            setMessages(prev => prev.map(m =>
              m.id === assistantId
                ? { ...m, content: 'Could not reach Deax. Try again.', streaming: false }
                : m
            ))
            setIsStreaming(false)
          },
        })
      } catch {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Could not reach Deax. Try again.', streaming: false }
            : m
        ))
        setIsStreaming(false)
      }
    } else if (errorCode) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Could not reach Deax. Try again.', streaming: false }
          : m
      ))
      setIsStreaming(false)
    }
  }, [ensureSession])

  return (
    <ChatContext.Provider value={{
      isOpen, messages, threadId, isStreaming,
      openChat, closeChat, sendMessage, ensureSession,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  return useContext(ChatContext)
}
