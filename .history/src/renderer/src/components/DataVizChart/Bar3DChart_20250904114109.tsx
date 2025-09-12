import React, { useEffect, useRef, useState } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const Bar3DChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [webglSupported, setWebglSupported] = useState(true)

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
        const option = {
          tooltip: {},
          xAxis3D: { type: 'category' },
          yAxis3D: { type: 'category' },
          zAxis3D: { type: 'value' },
          grid3D: {
            boxWidth: 200,
            boxDepth: 80,
            viewControl: {},
            light: {
              main: { intensity: 1.2, shadow: true },
              ambient: { intensity: 0.3 }
            }
          },
          series: [
            {
              type: 'bar3D',
              data: jsonData.map((item) => ({ value: [item[0], item[1], item[2]] })),
              shading: 'lambert',
              label: { fontSize: 12, borderWidth: 0 },
              emphasis: { label: { fontSize: 14, color: '#900' }, itemStyle: { color: '#900' } }
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('Bar3DChart 加载失败:', error)
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
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          textAlign: 'center',
          color: '#666'
        }}>
        <h3 style={{ color: '#333', marginBottom: '16px' }}>3D 柱状图</h3>
        <p>WebGL 不支持，显示 2D 替代图表</p>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default Bar3DChart
