import React from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const DataVizPage: React.FC = () => {
  const location = useLocation()
  return (
    <Container>
      <Header>
        <Title>数据可视化</Title>
        <Tabs>
          <Tab to="home" $active={location.pathname.endsWith('/home')}>
            表单
          </Tab>
          <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
            可视化图表
          </Tab>
          <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
            高级3D
          </Tab>
        </Tabs>
      </Header>
      <Content>
        <Routes>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeFormPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="advanced" element={<AdvancedPage />} />
        </Routes>
      </Content>
    </Container>
  )
}

const HomeFormPage: React.FC = () => {
  return <Placeholder>这里是表单页面。</Placeholder>
}

const ChartsPage: React.FC = () => {
  return (
    <FlexFill>
      <EChartsPolarBars />
    </FlexFill>
  )
}

const AdvancedPage: React.FC = () => {
  return (
    <FlexFill>
      <EChartsBar3D />
    </FlexFill>
  )
}

import { useEffect, useRef } from 'react'

const EChartsPolarBars: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      const echarts = await import('echarts')
      if (disposed) return
      instance = echarts.init(containerRef.current)
      const option = buildPolarBarsOption()
      instance.setOption(option)
      const onResize = () => instance && instance.resize()
      window.addEventListener('resize', onResize)
      ;(instance as any)._onResize = onResize
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  return <ChartRoot ref={containerRef} />
}

const buildPolarBarsOption = () => {
  const data = sampleData
  return {
    tooltip: {},
    angleAxis: [
      { type: 'category', polarIndex: 0, startAngle: 90, endAngle: 270 },
      { type: 'category', polarIndex: 1, startAngle: -90, endAngle: 90 }
    ],
    radiusAxis: [{ polarIndex: 0 }, { polarIndex: 1 }],
    polar: [{}, {}],
    series: [
      { type: 'bar', polarIndex: 0, data: data.map((d) => d[2]), coordinateSystem: 'polar' },
      { type: 'bar', polarIndex: 1, data: data.map((d) => d[1]), coordinateSystem: 'polar' }
    ]
  }
}

const EChartsBar3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      const echarts = await import('echarts')
      await import('echarts-gl')
      if (disposed) return
      instance = echarts.init(containerRef.current)
      const option = buildBar3DOption()
      instance.setOption(option)
      const onResize = () => instance && instance.resize()
      window.addEventListener('resize', onResize)
      ;(instance as any)._onResize = onResize
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  return <ChartRoot ref={containerRef} />
}

const buildBar3DOption = () => {
  const data = sampleData.map((item) => ({ value: [item[0], item[1], item[2]] }))
  return {
    tooltip: {},
    xAxis3D: { type: 'category' },
    yAxis3D: { type: 'category' },
    zAxis3D: { type: 'value' },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      viewControl: {},
      light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } }
    },
    series: [
      {
        type: 'bar3D',
        data,
        shading: 'lambert',
        label: { fontSize: 12, borderWidth: 0 },
        emphasis: { label: { fontSize: 14, color: '#900' }, itemStyle: { color: '#900' } }
      }
    ]
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
`

const Title = styled.div`
  font-weight: 600;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
`

const Tab = styled(StyledLink)<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  background: ${(p) => (p.$active ? 'var(--color-primary-10)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-text)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--color-primary-20)' : 'var(--color-border)')};
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

const FlexFill = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

const Placeholder = styled.div`
  padding: 24px;
  color: var(--color-text-secondary);
`

const ChartRoot = styled.div`
  width: 100%;
  height: 100%;
`

// 简化示例数据：来自原 Vue 的 formData，保留一部分
const sampleData: Array<[number, number, number]> = [
  [1, 615, 108.7],
  [2, 643, 104.03],
  [3, 643, 104.52],
  [4, 643, 114.27],
  [5, 643, 108.91],
  [6, 821, 131.78],
  [7, 821, 119.33],
  [8, 821, 113.26],
  [9, 821, 120.37],
  [10, 821, 117.27]
]

export default DataVizPage
