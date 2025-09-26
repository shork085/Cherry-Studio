export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatBackend {
  sendMessage(params: {
    messages: ChatMessage[]
    apiKey?: string
    model?: string
    onToken?: (token: string) => void //可选的token回调
    signal?: AbortSignal //可选的中止信号
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
  private endpoint: string //后端api地址

  constructor(endpoint: string = '/api/chat') {
    this.endpoint = endpoint
    console.log('WebChatBackend: endpoint', endpoint)
  }

  async sendMessage(params: {
    messages: ChatMessage[]
    apiKey?: string
    model?: string
    onToken?: (token: string) => void
    signal?: AbortSignal
  }): Promise<{ content: string }> {
    const { messages, apiKey, model, onToken, signal } = params

    let res: Response | null = null
    try {
      // 发送网络请求
      const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'text/event-stream' }
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      res = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'deepseek-ai/DeepSeek-V3.1',
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content
          })),
          stream: true
        }),
        signal
      })
      console.log('sendMessage response status:', res.status)
      console.log('content-type:', res.headers.get('content-type'))
    } catch (e) {
      const error: any = new Error(`Network error: ${e}`)
      error.status = 0
      throw error
    }

    // 如果没有后端或非200，走本地模拟流式输出，便于前端联调
    if (!res || !res.ok) {
      let errText = ''
      // const errorMsg = res ? `API 请求失败 (状态码: ${res.status})` : '网络连接失败'
      // const demo = `API 调用失败: ${errorMsg}\n\n请检查：\n1. API Key 是否正确\n2. 网络连接是否正常\n3. 接口地址是否正确\n\n当前使用本地模拟回复。`
      // console.error('API Error:', errorMsg, res?.status)

      try {
        const errJson = await res.json()
        errText = errJson.message || JSON.stringify(errJson)
      } catch (e) {
        errText = await res.text().catch(() => `HTTP status ${res.status}`)
      }
      const error: any = new Error(`HTTP ${res.status}: ${errText}`)
      error.status = res.status
      error.message = errText
      throw error
    }

    // 处理SSE流式相应
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
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
          const lines = text.split(/\r?\n/)
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue
            if (trimmed === 'data: [DONE]') {
              // 流结束标志
              done = true
              break
            }
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.slice(5).trim()
              try {
                const obj = JSON.parse(jsonStr)
                const delta = obj.choices?.[0]?.delta
                if (!delta) continue
                const content = delta.content
                const reasoning = delta.reasoning_content
                if (content) {
                  full += content
                  onToken?.(content)
                }
                if (reasoning) {
                  // 用特殊前缀标记 reasoning token，供前端区分
                  onToken?.(`__REASONING__:${reasoning}`)
                }
              } catch (e) {
                console.error('Error parsing chunk JSON', e, jsonStr)
              }
            }
          }
        }
      }
      return { content: full }
    }

    // 处理非流式JSON响应
    let json: any = null
    try {
      json = await res.json()
    } catch (e) {
      console.error('Error parsing JSON:', e)
    }
    const content = json?.choices?.[0]?.message?.content || json?.content || ''
    if (content) {
      onToken?.(content)
    }
    return { content }
  }
}
