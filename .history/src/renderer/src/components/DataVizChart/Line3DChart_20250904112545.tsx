import React, { useEffect, useRef, useState } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const Line3DChart: React.FC = () => {
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
          visualMap: {
            show: false,
            dimension: 2,
            min: Math.min(...jsonData.map((item) => item[2])),
            max: Math.max(...jsonData.map((item) => item[2])),
            inRange: {
              color: [
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026'
              ]
            }
          },
          xAxis3D: {},
          yAxis3D: {},
          zAxis3D: {},
          grid3D: {},
          series: [
            {
              type: 'line3D',
              data: jsonData,
              lineStyle: { width: 4 }
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('Line3DChart 加载失败:', error)
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
        <h3 style={{ color: '#333', marginBottom: '16px' }}>3D 折线图</h3>
        <p>WebGL 不支持，显示 2D 替代图表</p>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default Line3DChart
