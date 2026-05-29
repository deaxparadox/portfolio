import { createSession, streamMessage } from '@/components/chat/chatApi'

function makeStream(events: object[]) {
  const encoder = new TextEncoder()
  const chunks = events.map(e => encoder.encode(`data: ${JSON.stringify(e)}\n\n`))
  let i = 0
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) controller.enqueue(chunks[i++])
      else controller.close()
    },
  })
}

describe('createSession', () => {
  it('returns thread_id on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 201,
      json: async () => ({ thread_id: 'abc-123' }),
    }) as jest.Mock
    expect(await createSession()).toBe('abc-123')
  })
})

describe('streamMessage', () => {
  it('fires onToken for each token event', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      body: makeStream([
        { type: 'token', content: 'Hello' },
        { type: 'token', content: ' world' },
        { type: 'done' },
      ]),
    }) as jest.Mock
    const tokens: string[] = []
    const onDone = jest.fn()
    await streamMessage('hi', 'tid', {
      onToken: t => tokens.push(t),
      onScroll: jest.fn(), onDone, onError: jest.fn(),
    })
    expect(tokens).toEqual(['Hello', ' world'])
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('fires onScroll only for valid sections, not invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      body: makeStream([
        { type: 'action', action: 'scroll', section: 'projects' },
        { type: 'action', action: 'scroll', section: 'evil-script' },
        { type: 'done' },
      ]),
    }) as jest.Mock
    const scrolled: string[] = []
    await streamMessage('show', 'tid', {
      onToken: jest.fn(),
      onScroll: s => scrolled.push(s),
      onDone: jest.fn(), onError: jest.fn(),
    })
    expect(scrolled).toEqual(['projects'])
  })

  it('fires onError with session_expired on 400', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 }) as jest.Mock
    const onError = jest.fn()
    await streamMessage('hi', 'bad', {
      onToken: jest.fn(), onScroll: jest.fn(), onDone: jest.fn(), onError,
    })
    expect(onError).toHaveBeenCalledWith('session_expired')
  })

  it('fires onDone on done event', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      body: makeStream([{ type: 'done' }]),
    }) as jest.Mock
    const onDone = jest.fn()
    await streamMessage('hi', 'tid', {
      onToken: jest.fn(), onScroll: jest.fn(), onDone, onError: jest.fn(),
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('fires onError with network_error on fetch rejection', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch')) as jest.Mock
    const onError = jest.fn()
    await streamMessage('hi', 'tid', {
      onToken: jest.fn(), onScroll: jest.fn(), onDone: jest.fn(), onError,
    })
    expect(onError).toHaveBeenCalledWith('network_error')
  })
})
