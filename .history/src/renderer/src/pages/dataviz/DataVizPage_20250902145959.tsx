import { useTheme } from '@renderer/context/ThemeProvider'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

const DataVizPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [src, setSrc] = useState('')

  const isDev = useMemo(() => import.meta.env.DEV, [])

  useEffect(() => {
    // 开发态：指向 Vite dev server
    if (isDev) {
      setSrc('http://localhost:5174/')
      return
    }

    // 生产态：指向 Electron 资源目录内复制的 dataviz 静态站点
    ;(async () => {
      const appInfo = await window.api.getAppInfo() // IpcChannel.App_Info
      const fileUrl = `file://${appInfo.resourcesPath}/dataviz/index.html`
      setSrc(fileUrl)
    })()
  }, [isDev])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIsLoading(false)
      iframe.contentWindow?.postMessage({ type: 'THEME_CHANGE', theme }, '*')
    }
    const handleError = () => setIsLoading(false)

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
    }
  }, [theme])

  return (
    <Container>
      {isLoading && <LoadingOverlay>加载数据可视化...</LoadingOverlay>}
      {src && (
        <StyledIframe
          ref={iframeRef}
          src={src}
          title="数据可视化"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="fullscreen"
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
