import { Card, message, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
`

const Header = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: #ffffff;
`

const Title = styled.h2`
  margin: 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
`

const IframeContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  z-index: 10;
`

const DataVizPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 构建iframe的URL
  const getIframeUrl = () => {
    // 开发环境使用本地服务器
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001'
    }
    // 生产环境使用打包后的静态文件
    return './dataviz/index.html'
  }

  // 处理iframe加载完成
  const handleIframeLoad = () => {
    setLoading(false)
    setError(null)
  }

  // 处理iframe加载错误
  const handleIframeError = () => {
    setLoading(false)
    setError('数据可视化页面加载失败')
    message.error('数据可视化页面加载失败，请检查服务是否正常运行')
  }

  // 监听来自iframe的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源
      if (event.origin !== window.location.origin && !event.origin.includes('localhost:3001')) {
        return
      }

      const { type, data } = event.data

      switch (type) {
        case 'DATAVIZ_READY':
          console.log('数据可视化页面已准备就绪')
          break
        case 'FORM_SUBMIT':
          // 处理表单提交
          console.log('收到表单数据:', data)
          // 这里可以调用Cherry Studio的服务来处理数据
          break
        case 'REQUEST_DATA':
          // 响应数据请求
          const responseData = {
            type: 'DATA_RESPONSE',
            data: {
              // 这里可以返回Cherry Studio的数据
              timestamp: Date.now()
            }
          }
          iframeRef.current?.contentWindow?.postMessage(responseData, '*')
          break
        default:
          console.log('收到未知消息类型:', type, data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 向iframe发送数据（预留接口）
  // const sendDataToIframe = (data: any) => {
  //   if (iframeRef.current?.contentWindow) {
  //     iframeRef.current.contentWindow.postMessage({
  //       type: 'CHERRY_DATA',
  //       data
  //     }, '*')
  //   }
  // }

  return (
    <Container>
      <Header>
        <Title>数据可视化分析</Title>
      </Header>

      <IframeContainer>
        {loading && (
          <LoadingOverlay>
            <Spin size="large" tip="正在加载数据可视化页面..." />
          </LoadingOverlay>
        )}

        {error && (
          <LoadingOverlay>
            <Card>
              <p>加载失败: {error}</p>
              <p>请确保数据可视化服务正在运行</p>
            </Card>
          </LoadingOverlay>
        )}

        <StyledIframe
          ref={iframeRef}
          src={getIframeUrl()}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="数据可视化"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </IframeContainer>
    </Container>
  )
}

export default DataVizPage
