export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export interface SendOptions {
  signal?: AbortSignal
}

export interface StreamChunk {
  type: 'text' | 'done' | 'error'
  data?: string
  error?: string
}

export interface ChatBackend {
  send(messages: ChatMessage[], onChunk: (chunk: StreamChunk) => void, options?: SendOptions): { abort: () => void }
}
