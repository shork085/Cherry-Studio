import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

// 示例数据
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

// 3D 柱状图组件
const EChartsBar3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [webglSupported, setWebglSupported] = React.useState(true)

  useEffect(() => {
    // 检查 WebGL 支持
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      setWebglSupported(false)
      return
    }

    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      try {
        const echarts = await import('echarts')
        await import('echarts-gl')
        if (disposed) return
        instance = echarts.init(containerRef.current)
        const option = buildBar3DOption()
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        // console.error('Failed to load 3D chart:', error)
        setWebglSupported(false)
      }
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  if (!webglSupported) {
    return (
      <WebglError>
        <h3>WebGL 不支持</h3>
        <p>您的浏览器不支持 WebGL，无法显示 3D 图表。</p>
        <p>请尝试：</p>
        <ul>
          <li>更新浏览器到最新版本</li>
          <li>启用硬件加速</li>
          <li>检查显卡驱动</li>
        </ul>
      </WebglError>
    )
  }

  return <ChartRoot ref={containerRef} />
}

// 3D 图表配置
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

// 主组件
const AdvancedPage: React.FC = () => {
  return (
    <AdvancedContainer>
      <EChartsBar3D />
    </AdvancedContainer>
  )
}

// 样式组件
const AdvancedContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`

const ChartRoot = styled.div`
  width: 100%;
  height: 100%;
`

const WebglError = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  text-align: center;
  color: var(--color-text-secondary);

  h3 {
    color: var(--color-text);
    margin-bottom: 16px;
  }

  p {
    margin: 8px 0;
  }

  ul {
    text-align: left;
    margin-top: 16px;
  }

  li {
    margin: 4px 0;
  }
`

export default AdvancedPage
