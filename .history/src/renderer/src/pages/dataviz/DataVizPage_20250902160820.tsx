import { useTheme } from '@renderer/context/ThemeProvider'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const DataVizPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIsLoading(false)
      // 向Vue应用发送主题信息
      iframe.contentWindow?.postMessage(
        {
          type: 'THEME_CHANGE',
          theme: theme
        },
        '*'
      )
    }

    const handleError = () => {
      setIsLoading(false)
      console.error('Failed to load Vue application')
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)

    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
    }
  }, [theme])

  // 优先尝试使用自定义元素（离线/本地可用），失败则回退到 iframe（开发中）
  const canUseCE = typeof customElements !== 'undefined' && !!customElements.get('data-viz-app')

  return (
    <Container>
      {isLoading && <LoadingOverlay>加载数据可视化...</LoadingOverlay>}
      {canUseCE ? (
        <DataVizElement id="data-viz-ce" />
      ) : (
        <StyledIframe
          ref={iframeRef}
          src="http://localhost:5174/"
          title="数据可视化"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="fullscreen"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: var(--color-background);
`

const DataVizElement = styled('data-viz-app')`
  display: block;
  width: 100%;
  height: 100%;
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  color: var(--color-text);
  font-size: 16px;
`

export default DataVizPage
