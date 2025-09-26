import { ChatBackend, ChatMessage, StreamChunk } from './chatBackend'

// 通过浏览器 fetch + ReadableStream 连接后端 SSE/流式接口
// 约定后端路径 /api/chat，POST body: { messages }
// 约定返回为 text/event-stream 或分段文本，每行以 `data:` 前缀承载内容，`[DONE]` 结束。
export class WebChatBackend implements ChatBackend {
  private endpoint: string

  constructor(endpoint: string = '/api/chat') {
    this.endpoint = endpoint
  }

  send(messages: ChatMessage[], onChunk: (chunk: StreamChunk) => void) {
    const controller = new AbortController()

    const run = async () => {
      try {
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
          signal: controller.signal
        })
        if (!res.body) {
          onChunk({ type: 'error', error: 'No response body' })
          return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let idx: number
          // 逐行解析（兼容text/event-stream或按行分段）
          while ((idx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, idx).trim()
            buffer = buffer.slice(idx + 1)
            if (!line) continue
            const data = line.startsWith('data:') ? line.slice(5).trim() : line
            if (data === '[DONE]') {
              onChunk({ type: 'done' })
              return
            }
            onChunk({ type: 'text', data })
          }
        }
        if (buffer.trim()) {
          const data = buffer.startsWith('data:') ? buffer.slice(5).trim() : buffer.trim()
          if (data === '[DONE]') {
            onChunk({ type: 'done' })
          } else {
            onChunk({ type: 'text', data })
            onChunk({ type: 'done' })
          }
        } else {
          onChunk({ type: 'done' })
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        onChunk({ type: 'error', error: e?.message || 'Network error' })
      }
    }

    run()
    return { abort: () => controller.abort() }
  }
}


