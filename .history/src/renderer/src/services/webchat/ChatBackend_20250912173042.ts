export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatBackend {
  sendMessage(params: {
    messages: ChatMessage[]
    onToken?: (token: string) => void
    signal?: AbortSignal
  }): Promise<{ content: string }>
}

/**
 * 一个最小可用的Web后端实现。
 * 期望后端暴露 /api/chat 接口，支持：
 * - POST JSON: { messages: ChatMessage[] }
 * - 返回SSE流：每行以 `data: <token>`
 * - 或一次性JSON: { content: string }
 */
export class WebChatBackend implements ChatBackend {
  private endpoint: string

  constructor(endpoint: string = '/api/chat') {
    this.endpoint = endpoint
  }

  async sendMessage(params: {
    messages: ChatMessage[]
    onToken?: (token: string) => void
    signal?: AbortSignal
  }): Promise<{ content: string }> {
    const { messages, onToken, signal } = params

    let res: Response | null = null
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, stream: true }),
        signal
      })
    } catch (e) {
      // 忽略网络错误，走本地模拟
    }

    // 如果没有后端或非200，走本地模拟流式输出，便于前端联调
    if (!res || !res.ok) {
      const demo = '这是一个本地模拟的流式回复，用于在没有后端接口时预览前端效果。\n你可以在设置好 /api/chat 后获得真实模型回答。'
      for (const ch of demo) {
        // 模拟打字机效果
        await new Promise((r) => setTimeout(r, 12))
        onToken?.(ch)
      }
      return { content: demo }
    }

    // 尝试SSE流
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream')) {
      const reader = res.body?.getReader()
      if (!reader) return { content: '' }
      const decoder = new TextDecoder('utf-8')
      let done = false
      let full = ''
      while (!done) {
        const chunk = await reader.read()
        done = !!chunk.done
        if (chunk.value) {
          const text = decoder.decode(chunk.value, { stream: true })
          // SSE 行解析：以 "data: " 开头的行
          const lines = text.split(/\r?\n/)
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data:')) {
              const token = trimmed.slice(5).trim()
              if (token && token !== '[DONE]') {
                full += token
                onToken?.(token)
              }
            }
          }
        }
      }
      return { content: full }
    }

    // 非流式一次性返回JSON
    const json = await res.json().catch(() => null)
    const content = json?.content ?? ''
    if (content && onToken) {
      onToken(content)
    }
    return { content }
  }
}
