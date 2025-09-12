import { useTheme } from '@renderer/context/ThemeProvider'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const DataVizPage: React.FC = () => {
  const { theme } = useTheme()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 动态加载 Vue 运行时与自定义元素脚本（仅加载一次）
    const inject = async () => {
      if (loaded) return
      const addScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.type = 'module'
          s.src = src
          s.onload = () => resolve()
          s.onerror = () => reject(new Error(`Failed to load ${src}`))
          document.head.appendChild(s)
        })

      // 本地静态资源路径（已拷贝到 resources/js/dataviz）
      const base = `${location.origin}/resources/js/dataviz`

      // 顺序：先 vue 运行时，再自定义元素
      await addScript(`${base}/vue.esm-browser.prod.js`)
      await addScript(`${base}/dataviz.ce.js`)

      setLoaded(true)
    }

    inject()
  }, [loaded])

  useEffect(() => {
    // 主题同步：向自定义元素派发事件
    const el = document.querySelector('data-viz-app') as HTMLElement | null
    if (!el) return
    const evt = new CustomEvent('theme-change', { detail: { theme } })
    el.dispatchEvent(evt)
  }, [theme])

  return (
    <Container>
      {!loaded && <LoadingOverlay>加载数据可视化...</LoadingOverlay>}
      {/* Vue 自定义元素 */}
      <div style={{ flex: 1, display: loaded ? 'block' : 'none' }}>
        <data-viz-app style={{ display: 'block', width: '100%', height: '100%' }}></data-viz-app>
      </div>
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
