import {
  CheckOutlined,
  CopyOutlined,
  DownOutlined,
  EditOutlined,
  ReloadOutlined,
  SendOutlined,
  StopOutlined
} from '@ant-design/icons'
// icons moved to top import group
// removed unused Tooltip
import { ChatMessage, WebChatBackend } from '@renderer/services/webchat/ChatBackend'
import { Button, Input } from 'antd'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styled, { createGlobalStyle } from 'styled-components'

const backend = new WebChatBackend('https://api.siliconflow.cn/v1')

interface ModelItem {
  id: string
  object?: string
  created?: number
  owned_by?: string
}

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

  const [availableModels, setAvailableModels] = React.useState<ModelItem[]>([])
  const [selectedModel, setSelectedModel] = React.useState<string>('')

  const [showModelSelector, setShowModelSelector] = React.useState(false)
  const [unusableModels, setUnusableModels] = React.useState<Record<string, string>>({})
  const [errorMessageIndices, setErrorMessageIndices] = React.useState<Set<number>>(new Set())
  // 深度思考收集：索引 => 文本
  const [reasoningMap, setReasoningMap] = React.useState<Record<number, string>>({})
  const [reasoningCollapsed, setReasoningCollapsed] = React.useState<Record<number, boolean>>({})
  const prevTokenTargetIndexRef = React.useRef<number>(-1)
  const reasoningStateRef = React.useRef<{ inFence: boolean; inThink: boolean }>({ inFence: false, inThink: false })

  const appendReasoning = React.useCallback((index: number, text: string) => {
    if (!text) return
    setReasoningMap((prev) => ({ ...prev, [index]: (prev[index] || '') + text }))
  }, [])

  // 处理未带专用前缀的 token，识别常见“思考”包裹格式并路由到思考泡泡
  const processContentToken = React.useCallback(
    (raw: string, index: number): string => {
      let remaining = raw
      let output = ''
      const state = reasoningStateRef.current

      // 逐段处理，支持混合出现
      while (remaining.length > 0) {
        if (state.inFence) {
          const end = remaining.indexOf('```')
          if (end === -1) {
            appendReasoning(index, remaining)
            remaining = ''
            break
          } else {
            appendReasoning(index, remaining.slice(0, end))
            remaining = remaining.slice(end + 3)
            state.inFence = false
            continue
          }
        }
        if (state.inThink) {
          const endTag = remaining.indexOf('</think>')
          if (endTag === -1) {
            appendReasoning(index, remaining)
            remaining = ''
            break
          } else {
            appendReasoning(index, remaining.slice(0, endTag))
            remaining = remaining.slice(endTag + '</think>'.length)
            state.inThink = false
            continue
          }
        }

        // 未处于思考块中，尝试匹配起始标记
        // ```reasoning 栅栏
        const fenceIdx = remaining.indexOf('```reasoning')
        const thinkIdx = remaining.indexOf('<think>')

        const nextIdx = [fenceIdx, thinkIdx].filter((x) => x !== -1).sort((a, b) => a - b)[0] ?? -1
        if (nextIdx === -1) {
          // 全部为正常内容
          output += remaining
          remaining = ''
        } else {
          // 先输出前面的正常内容
          output += remaining.slice(0, nextIdx)
          remaining = remaining.slice(nextIdx)
          if (remaining.startsWith('```reasoning')) {
            // 吃掉行起始标记
            const after = remaining.slice('```reasoning'.length)
            // 可能紧跟换行
            const m = after.match(/^(\r?\n)/)
            remaining = m ? after.slice(m[0].length) : after
            state.inFence = true
            continue
          }
          if (remaining.startsWith('<think>')) {
            remaining = remaining.slice('<think>'.length)
            state.inThink = true
            continue
          }
        }
      }

      return output
    },
    [appendReasoning]
  )

  // 终止控制器
  const abortRef = React.useRef<AbortController | null>(null)

  // fetch 可用模型列表，当 apiKey 可用时
  React.useEffect(() => {
    const fetchModels = async () => {
      if (!apiKey) return
      try {
        const resp = await fetch('https://api.siliconflow.cn/v1/models', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            Accept: 'application/json'
          }
        })
        if (!resp.ok) {
          console.error('获取模型列表失败', resp.status, await resp.text())
          return
        }
        const j = await resp.json()
        const data: ModelItem[] = j.data || []
        setAvailableModels(data)
        // 如果还没选择模型，或者当前 selectedModel 不在返回列表里，设一个默认
        if (!selectedModel || !data.find((m) => m.id === selectedModel)) {
          if (data.length > 0) {
            setSelectedModel('deepseek-ai/DeepSeek-V3.1')
          }
        }
      } catch (e) {
        console.error('fetchModels error:', e)
      }
    }
    fetchModels()
  }, [apiKey, selectedModel])

  const safeSend = async (
    messagesParam: ChatMessage[],
    onToken: (token: string) => void
  ): Promise<{ content: string }> => {
    try {
      const res = await backend.sendMessage({
        messages: messagesParam,
        apiKey: apiKey || undefined,
        model: selectedModel,
        signal: abortRef.current?.signal,
        onToken
      })
      return res
    } catch (err: any) {
      // 捕获错误状态码 + message
      const status = err.status
      const msg = err.message || '未知错误'
      let reason = `错误 ${status}`
      if (status === 403) {
        reason = '权限不足'
      } else if (status === 404) {
        reason = '未找到模型'
      } else if (status === 400) {
        reason = '模型不存在或参数不合法'
      }

      // 如果是 403/404，则从模型列表中直接移除该模型并尝试切换
      if (status === 403 || status === 404) {
        setAvailableModels((prev) => {
          const filtered = prev.filter((m) => m.id !== selectedModel)
          // 如果当前选择的模型被移除，自动切换到第一个可用模型
          if (!filtered.find((m) => m.id === selectedModel)) {
            // const next = filtered[0]?.id || ''
            setSelectedModel('deepseek-ai/DeepSeek-V3.1')
          }
          return filtered
        })
      } else {
        // 其他错误，标记为不可用但不移除
        setUnusableModels((prev) => ({
          ...prev,
          [selectedModel]: `${reason}${msg ? `: ${msg}` : ''}`
        }))
      }
      throw err
    }
  }

  const onSend = async () => {
    if (!input.trim() || loading) return

    if (!apiKey) {
      alert('请先配置API Key')
      setShowApiKeyConfig(true)
      return
    }
    if (!selectedModel) {
      alert('模型列表未加载或无可用模型，请稍候再试')
      return
    }
    if (unusableModels[selectedModel]) {
      alert(`模型"${selectedModel}"不可用：${unusableModels[selectedModel]}`)
      return
    }

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }])
    // 清空错误标记，确保新一条助理消息使用正常配色
    setErrorMessageIndices(new Set())
    // 设置思考目标索引（新助理消息）并初始化折叠状态
    const newAssistantIndex = messages.length + 1
    prevTokenTargetIndexRef.current = newAssistantIndex
    setReasoningMap((prev) => {
      const c = { ...prev }
      delete c[newAssistantIndex]
      return c
    })
    setReasoningCollapsed((prev) => ({ ...prev, [newAssistantIndex]: true }))
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const history = [...messages, userMsg]

    try {
      await safeSend(history, (token) => {
        if (token.startsWith('__REASONING__:')) {
          const t = token.replace('__REASONING__:', '')
          appendReasoning(prevTokenTargetIndexRef.current, t)
          return
        }
        const visible = processContentToken(token, prevTokenTargetIndexRef.current)
        if (!visible) return
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...last,
            content: (last.content || '') + visible
          }
          return updated
        })
      })
    } catch (e: any) {
      console.error('onSend error:', e)
      // 将最后一个助理消息标记为错误并展示错误文本
      setMessages((prev) => {
        const updated = [...prev]
        const idx = updated.length - 1
        if (idx >= 0 && updated[idx].role === 'assistant') {
          const status = e?.status
          const msg = e?.message || '请求失败'
          updated[idx] = { ...updated[idx], content: `请求失败${status ? ` (HTTP ${status})` : ''}：${msg}` }
          setErrorMessageIndices((set) => new Set(set).add(idx))
        }
        return updated
      })
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const onStop = () => {
    abortRef.current?.abort()
  }

  const handleCopyReasoning = async (index: number) => {
    try {
      const text = reasoningMap[index] || ''
      if (!text) return
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('copy reasoning error:', e)
    }
  }

  const handleApiKeySave = () => {
    localStorage.setItem('chat_api_key', apiKey)
    setShowApiKeyConfig(false)
    // 模型列表可能此时要 fetch
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

    const userMessageIndex = index - 1
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return

    setMessages((prev) => prev.slice(0, index))
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    // 清空错误标记，确保新一条助理消息使用正常配色
    setErrorMessageIndices(new Set())
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    // 该次输出的助理索引
    prevTokenTargetIndexRef.current = index
    setReasoningMap((prev) => {
      const c = { ...prev }
      delete c[index]
      return c
    })
    setReasoningCollapsed((prev) => ({ ...prev, [index]: true }))

    const history = messages.slice(0, userMessageIndex + 1)

    try {
      await safeSend(history, (token) => {
        if (token.startsWith('__REASONING__:')) {
          const t = token.replace('__REASONING__:', '')
          appendReasoning(prevTokenTargetIndexRef.current, t)
          return
        }
        const visible = processContentToken(token, prevTokenTargetIndexRef.current)
        if (!visible) return
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...last,
            content: (last.content || '') + visible
          }
          return updated
        })
      })
    } catch (e: any) {
      console.error('handleRegenerateMessage error:', e)
      setMessages((prev) => {
        const updated = [...prev]
        const idx = updated.length - 1
        if (idx >= 0 && updated[idx].role === 'assistant') {
          const status = e?.status
          const msg = e?.message || '请求失败'
          updated[idx] = { ...updated[idx], content: `请求失败${status ? ` (HTTP ${status})` : ''}：${msg}` }
          setErrorMessageIndices((set) => new Set(set).add(idx))
        }
        return updated
      })
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

    setMessages((prev) => {
      const updated = [...prev]
      updated[editingMessage] = { ...updated[editingMessage], content: editContent }
      return updated
    })

    setEditingMessage(null)
    setEditContent('')

    const userMessageIndex = editingMessage
    const nextMessageIndex = userMessageIndex + 1

    if (nextMessageIndex < messages.length && messages[nextMessageIndex].role === 'assistant') {
      setMessages((prev) => prev.slice(0, nextMessageIndex))
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    // 清空错误标记，确保新一条助理消息使用正常配色
    setErrorMessageIndices(new Set())
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    // 新助理索引
    prevTokenTargetIndexRef.current = nextMessageIndex
    setReasoningMap((prev) => {
      const c = { ...prev }
      delete c[nextMessageIndex]
      return c
    })
    setReasoningCollapsed((prev) => ({ ...prev, [nextMessageIndex]: true }))

    const history = messages.slice(0, userMessageIndex + 1)
    history[userMessageIndex] = { ...history[userMessageIndex], content: editContent }

    try {
      await safeSend(history, (token) => {
        if (token.startsWith('__REASONING__:')) {
          const t = token.replace('__REASONING__:', '')
          appendReasoning(prevTokenTargetIndexRef.current, t)
          return
        }
        const visible = processContentToken(token, prevTokenTargetIndexRef.current)
        if (!visible) return
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...last,
            content: (last.content || '') + visible
          }
          return updated
        })
      })
    } catch (e: any) {
      console.error('handleSaveEdit error:', e)
      setMessages((prev) => {
        const updated = [...prev]
        const idx = updated.length - 1
        if (idx >= 0 && updated[idx].role === 'assistant') {
          const status = e?.status
          const msg = e?.message || '请求失败'
          updated[idx] = { ...updated[idx], content: `请求失败${status ? ` (HTTP ${status})` : ''}：${msg}` }
          setErrorMessageIndices((set) => new Set(set).add(idx))
        }
        return updated
      })
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
    if (unusableModels[modelId]) {
      // 不允许选已经标记不可用的模型
      alert(`模型 "${modelId}" 不可用: ${unusableModels[modelId]}`)
      return
    }
    setSelectedModel(modelId)
    setShowModelSelector(false)
  }

  const getCurrentModelName = () => {
    const model = availableModels.find((m) => m.id === selectedModel)
    return model ? model.id : selectedModel
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

            {/* 模型选择 */}
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
                      <ModelName>{model.id}</ModelName>
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
                  {/* 思考过程（折叠），显示在助理泡泡上方 */}
                  {m.role === 'assistant' &&
                    (reasoningMap[i] || (loading && i === prevTokenTargetIndexRef.current)) && (
                      <Row $self={false}>
                        <ReasoningContainer>
                          <ReasoningHeader
                            onClick={() => setReasoningCollapsed((prev) => ({ ...prev, [i]: !prev[i] }))}>
                            <CollapseIcon $collapsed={!!reasoningCollapsed[i]}>
                              <DownOutlined />
                            </CollapseIcon>
                            {loading && i === prevTokenTargetIndexRef.current && !reasoningMap[i]
                              ? '正在思考中…'
                              : '思考过程'}
                          </ReasoningHeader>
                          {!reasoningCollapsed[i] && reasoningMap[i] && (
                            <ReasoningCopy onClick={() => handleCopyReasoning(i)} title="复制思考内容">
                              <CopyOutlined />
                            </ReasoningCopy>
                          )}
                          <ReasoningCollapse $open={!reasoningCollapsed[i] && !!reasoningMap[i]}>
                            <ReasoningBubble>
                              <MarkdownContent>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{reasoningMap[i] || ''}</ReactMarkdown>
                              </MarkdownContent>
                            </ReasoningBubble>
                          </ReasoningCollapse>
                        </ReasoningContainer>
                      </Row>
                    )}
                  <Row $self={m.role === 'user'}>
                    <Bubble $self={m.role === 'user'} $error={m.role === 'assistant' && errorMessageIndices.has(i)}>
                      <MarkdownContent>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </MarkdownContent>
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
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="输入信息以开始对话，Enter发送，Shift+Enter换行..."
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

// 样式
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

// const ModelDescription = styled.div`
//   font-size: 12px;
//   color: var(--subtext);
//   line-height: 1.4;
// `

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

const Bubble = styled.div<{ $self?: boolean; $error?: boolean }>`
  max-width: 72%;
  background: ${(p) => (p.$error ? 'rgba(255, 0, 0, 0.08)' : p.$self ? 'var(--primary)' : 'var(--assistant)')};
  color: ${(p) => (p.$self ? '#fff' : p.$error ? '#7f1d1d' : 'var(--text)')};
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

const MarkdownContent = styled.div`
  animation: fadeInUp 300ms ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const ReasoningContainer = styled.div`
  max-width: 72%;
  background: #fffbe6;
  color: #7a5b00;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #ffe58f;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-bottom: 10px;
  position: relative;
`

const ReasoningHeader = styled.div`
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const ReasoningBubble = styled.div`
  font-size: 12px;
  line-height: 1.5;
  // white-space: pre-wrap;
  word-break: break-word;
`

const CollapseIcon = styled.span<{ $collapsed: boolean }>`
  display: inline-flex;
  transform: rotate(${(p) => (p.$collapsed ? '-90deg' : '0deg')});
  transition: transform 0.15s ease;
  color: #7a5b00;
`

const ReasoningCopy = styled.button`
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #7a5b00;
  opacity: 0.75;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
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
