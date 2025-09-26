import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Button, Input } from 'antd'
import {
  SendOutlined,
  StopOutlined,
  CopyOutlined,
  CheckOutlined,
  ReloadOutlined,
  EditOutlined,
  DownOutlined
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { ChatMessage, WebChatBackend } from '@renderer/services/webchat/ChatBackend'

const backend = new WebChatBackend('https://api.siliconflow.cn/v1')

// 可用的模型列表
const availableModels = [
  { id: 'deepseek-ai/DeepSeek-V3.1', name: 'DeepSeek V3.1', description: '最新版本，推理能力强' },
  { id: 'deepseek-ai/deepseek-chat', name: 'DeepSeek Chat', description: '对话优化版本' },
  { id: 'deepseek-ai/deepseek-coder', name: 'DeepSeek Coder', description: '代码生成专用' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', description: '阿里通义千问大模型' },
  { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', description: 'Meta开源大模型' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic对话模型' }
]

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #f5f7fb;
    --panel: #ffffff;
    --text: #1f2328;
    --subtext: #6b7280;
    --border: #e5e7eb;
    --primary: #1677ff;
    --assistant: #f3f4f6;
  }
  html, body, #root { height: 100%; margin: 0; }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans'; }
`

const WebChatPage: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('chat_api_key') || '')
  const [showApiKeyConfig, setShowApiKeyConfig] = React.useState(!apiKey)
  const [copiedMessages, setCopiedMessages] = React.useState<Set<number>>(new Set())
  const [editingMessage, setEditingMessage] = React.useState<number | null>(null)
  const [editContent, setEditContent] = React.useState('')
  const [selectedModel, setSelectedModel] = React.useState('deepseek-ai/DeepSeek-V3.1')
  const [showModelSelector, setShowModelSelector] = React.useState(false)
  // 终止控制器
  const abortRef = React.useRef<AbortController | null>(null)

  const onSend = async () => {
    if (!input.trim() || loading) return

    // 确保apiKey已设置
    if (!apiKey) {
      alert('请先配置API Key')
      setShowApiKeyConfig(true)
      return
    }

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const history = [...messages, userMsg]

    try {
      await backend.sendMessage({
        messages: history,
        apiKey: apiKey || undefined,
        model: selectedModel,
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (!last || last.role !== 'assistant') return prev
            // 更新最后一条消息的内容
            const updated = [...prev]
            updated[updated.length - 1] = { ...last, content: (last.content || '') + token }
            return updated
          })
        }
      })
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const onStop = () => {
    abortRef.current?.abort()
  }

  const handleApiKeySave = () => {
    localStorage.setItem('chat_api_key', apiKey)
    setShowApiKeyConfig(false)
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value)
  }

  const handleCopyMessage = async (index: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessages((prev) => new Set(prev).add(index))
      setTimeout(() => {
        setCopiedMessages((prev) => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleRegenerateMessage = async (index: number) => {
    if (loading) return

    // 找到要重新生成的消息之前的用户消息
    const userMessageIndex = index - 1
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return

    const userMessage = messages[userMessageIndex]

    // 移除当前AI回复和之后的所有消息
    setMessages((prev) => prev.slice(0, index))

    // 添加新的AI回复占位
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const history = messages.slice(0, userMessageIndex + 1)

    try {
      await backend.sendMessage({
        messages: history,
        apiKey: apiKey || undefined,
        model: selectedModel,
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (!last || last.role !== 'assistant') return prev
            const updated = [...prev]
            updated[updated.length - 1] = { ...last, content: (last.content || '') + token }
            return updated
          })
        }
      })
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleEditMessage = (index: number, content: string) => {
    setEditingMessage(index)
    setEditContent(content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editingMessage === null) return

    // 更新消息内容
    setMessages((prev) => {
      const updated = [...prev]
      updated[editingMessage] = { ...updated[editingMessage], content: editContent }
      return updated
    })

    // 清除编辑状态
    setEditingMessage(null)
    setEditContent('')

    // 重新发送消息（删除当前AI回复并重新生成）
    const userMessageIndex = editingMessage
    const nextMessageIndex = userMessageIndex + 1

    // 如果后面有AI回复，删除它
    if (nextMessageIndex < messages.length && messages[nextMessageIndex].role === 'assistant') {
      setMessages((prev) => prev.slice(0, nextMessageIndex))
    }

    // 添加新的AI回复占位
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const history = messages.slice(0, userMessageIndex + 1)
    history[userMessageIndex] = { ...history[userMessageIndex], content: editContent }

    try {
      await backend.sendMessage({
        messages: history,
        apiKey: apiKey || undefined,
        model: selectedModel,
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (!last || last.role !== 'assistant') return prev
            const updated = [...prev]
            updated[updated.length - 1] = { ...last, content: (last.content || '') + token }
            return updated
          })
        }
      })
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditContent('')
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setShowModelSelector(false)
  }

  const getCurrentModelName = () => {
    const model = availableModels.find((m) => m.id === selectedModel)
    return model ? model.name : selectedModel
  }

  // 点击外部关闭模型选择器
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelSelector) {
        const target = event.target as Element
        if (!target.closest('[data-model-selector]')) {
          setShowModelSelector(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showModelSelector])

  if (showApiKeyConfig) {
    return (
      <Shell>
        <GlobalStyle />
        <ChatCard>
          <ApiKeyConfig>
            <h3>配置 API Key</h3>
            <p>请输入你的大模型 API Key 以开始对话</p>
            <Input.Password
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="输入 API Key..."
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" onClick={handleApiKeySave} disabled={!apiKey.trim()}>
              保存并开始
            </Button>
          </ApiKeyConfig>
        </ChatCard>
      </Shell>
    )
  }

  return (
    <Shell>
      <GlobalStyle />
      <ChatCard>
        <Header>
          <HeaderLeft>
            <span>Cherry Studio · Chat</span>
            <ModelSelector data-model-selector>
              <ModelButton onClick={() => setShowModelSelector(!showModelSelector)}>
                {getCurrentModelName()}
                <DownOutlined />
              </ModelButton>
              {showModelSelector && (
                <ModelDropdown>
                  {availableModels.map((model) => (
                    <ModelOption
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      $selected={model.id === selectedModel}>
                      <ModelName>{model.name}</ModelName>
                      <ModelDescription>{model.description}</ModelDescription>
                    </ModelOption>
                  ))}
                </ModelDropdown>
              )}
            </ModelSelector>
          </HeaderLeft>
          <Button size="small" onClick={() => setShowApiKeyConfig(true)}>
            重新配置 API Key
          </Button>
        </Header>
        <Messages>
          {messages.map((m, i) => (
            <MessageContainer key={i} $self={m.role === 'user'}>
              {editingMessage === i ? (
                <EditContainer $self={m.role === 'user'}>
                  <EditTextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    placeholder="编辑消息..."
                  />
                  <EditActions>
                    <ActionButton onClick={handleSaveEdit} title="保存">
                      <CheckOutlined />
                    </ActionButton>
                    <ActionButton onClick={handleCancelEdit} title="取消">
                      <StopOutlined />
                    </ActionButton>
                  </EditActions>
                </EditContainer>
              ) : (
                <>
                  <Row $self={m.role === 'user'}>
                    <Bubble $self={m.role === 'user'}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </Bubble>
                  </Row>
                  <MessageActions $self={m.role === 'user'}>
                    <ActionButton onClick={() => handleCopyMessage(i, m.content)} title="复制">
                      {copiedMessages.has(i) ? <CheckOutlined /> : <CopyOutlined />}
                    </ActionButton>
                    {m.role === 'user' && (
                      <ActionButton onClick={() => handleEditMessage(i, m.content)} title="编辑">
                        <EditOutlined />
                      </ActionButton>
                    )}
                    {m.role === 'assistant' && !loading && (
                      <ActionButton onClick={() => handleRegenerateMessage(i)} title="重新生成">
                        <ReloadOutlined />
                      </ActionButton>
                    )}
                  </MessageActions>
                </>
              )}
            </MessageContainer>
          ))}
        </Messages>
        <Composer>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="输入你的问题..."
          />
          <IconButton
            type="primary"
            onClick={loading ? onStop : onSend}
            icon={loading ? <StopOutlined /> : <SendOutlined />}
            disabled={!loading && !input.trim()}
          />
        </Composer>
      </ChatCard>
    </Shell>
  )
}

const Shell = styled.div`
  height: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

const ChatCard = styled.div`
  width: min(100%, 1080px);
  height: min(100%, 780px);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
`

const Header = styled.div`
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const ModelSelector = styled.div`
  position: relative;
`

const ModelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--assistant);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: var(--primary);
  }
`

const ModelDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
`

const ModelOption = styled.div<{ $selected?: boolean }>`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  background: ${(p) => (p.$selected ? 'var(--primary-10)' : 'transparent')};
  transition: background 0.2s ease;

  &:hover {
    background: ${(p) => (p.$selected ? 'var(--primary-20)' : 'var(--assistant)')};
  }

  &:last-child {
    border-bottom: none;
  }
`

const ModelName = styled.div`
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
`

const ModelDescription = styled.div`
  font-size: 12px;
  color: var(--subtext);
  line-height: 1.4;
`

const ApiKeyConfig = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;

  h3 {
    margin-bottom: 8px;
    color: var(--text);
  }

  p {
    margin-bottom: 24px;
    color: var(--subtext);
  }
`

const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(#fafbff, #fff);
`

const MessageContainer = styled.div<{ $self?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: ${(p) => (p.$self ? 'flex-end' : 'flex-start')};
  margin-bottom: 8px;
`

const Row = styled.div<{ $self?: boolean }>`
  display: flex;
  width: 100%;
  justify-content: ${(p) => (p.$self ? 'flex-end' : 'flex-start')};
`

const MessageActions = styled.div<{ $self?: boolean }>`
  display: flex;
  gap: 4px;
  margin-top: 4px;
  justify-content: ${(p) => (p.$self ? 'flex-end' : 'flex-start')};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${MessageContainer}:hover & {
    opacity: 1;
  }
`

const ActionButton = styled.button`
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const EditContainer = styled.div<{ $self?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: ${(p) => (p.$self ? 'flex-end' : 'flex-start')};
  gap: 8px;
`

const EditTextArea = styled(Input.TextArea)`
  max-width: 72%;
  background: #fff;
  border-radius: 14px !important;
  padding: 10px 12px !important;
  border: 2px solid var(--primary) !important;
`

const EditActions = styled.div`
  display: flex;
  gap: 4px;
  justify-content: flex-end;
`

const Bubble = styled.div<{ $self?: boolean }>`
  max-width: 72%;
  background: ${(p) => (p.$self ? 'var(--primary)' : 'var(--assistant)')};
  color: ${(p) => (p.$self ? '#fff' : 'var(--text)')};
  padding: 0px 12px;
  border-radius: 16px;
  border-top-${(p) => (p.$self ? 'right' : 'left')}-radius: 6px;
  // white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  p {
    margin: 0.5em 0;
  }
  strong {
    font-weight: bold;
  }
  em {
    font-style: italic;
  }
  code {
    background: rgba(0,0,0,0.06);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }
`

const Composer = styled.div`
  padding: 12px;
  border-top: 1px solid var(--border);
  background: var(--panel);
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

const TextArea = styled(Input.TextArea)`
  background: #fff;
  border-radius: 14px !important;
  padding: 10px 12px !important;
`

const IconButton = styled(Button)`
  border-radius: 50% !important;
  height: 33px;
  width: 45px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export default WebChatPage
