const BASE_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL ?? ''

const VALID_SECTIONS = new Set([
  'hero', 'skills', 'projects', 'glimpse', 'experience', 'contact',
])

export async function createSession(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat/session/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!res.ok) throw new Error('session_create_failed')
  const data = await res.json()
  return data.thread_id as string
}

export interface StreamCallbacks {
  onToken: (content: string) => void
  onScroll: (section: string) => void
  onDone: () => void
  onError: (msg: string) => void
}

export async function streamMessage(
  message: string,
  threadId: string,
  callbacks: StreamCallbacks,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/api/chat/message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id: threadId }),
    })
  } catch {
    callbacks.onError('network_error')
    return
  }

  if (res.status === 400) { callbacks.onError('session_expired'); return }
  if (!res.ok) { callbacks.onError('server_error'); return }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const json = line.slice(6).trim()
        if (!json) continue
        try {
          const event = JSON.parse(json)
          if (event.type === 'token' && event.content) {
            callbacks.onToken(event.content)
          } else if (event.type === 'action' && event.action === 'scroll') {
            const section = event.section
            if (typeof section === 'string' && VALID_SECTIONS.has(section)) {
              callbacks.onScroll(section)
            }
          } else if (event.type === 'done') {
            callbacks.onDone()
            return
          }
        } catch {
          // malformed event — ignore
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
  callbacks.onDone()
}
