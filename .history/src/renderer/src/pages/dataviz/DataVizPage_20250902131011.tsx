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

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [theme])

  return (
    <Container>
      {isLoading && <LoadingOverlay>加载数据可视化...</LoadingOverlay>}
      <StyledIframe
        ref={iframeRef}
        src="http://localhost:5173/"
        title="数据可视化"
        onLoad={() => setIsLoading(false)}
      />
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
