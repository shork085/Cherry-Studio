import { useTheme } from '@renderer/context/ThemeProvider'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const DataVizPage: React.FC = () => {
  const webviewRef = useRef<HTMLWebViewElement>(null)
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    const handleLoad = () => {
      setIsLoading(false)
      // 向Vue应用发送主题信息
      webview.send('theme-change', { theme })
    }

    const handleError = () => {
      setIsLoading(false)
      console.error('Failed to load Vue application')
    }

    webview.addEventListener('dom-ready', handleLoad)
    webview.addEventListener('did-fail-load', handleError)

    return () => {
      webview.removeEventListener('dom-ready', handleLoad)
      webview.removeEventListener('did-fail-load', handleError)
    }
  }, [theme])

  return (
    <Container>
      {isLoading && <LoadingOverlay>加载数据可视化...</LoadingOverlay>}
      <StyledWebview
        ref={webviewRef}
        src="http://localhost:5174/"
        title="数据可视化"
        allowpopups
        webpreferences="allowRunningInsecureContent,experimentalFeatures"
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

const StyledWebview = styled.webview`
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
