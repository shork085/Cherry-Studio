import React, { useEffect, useRef, useState } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const Surface3DChart: React.FC = () => {
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
        const yMin = Math.min(...jsonData.map((item) => item[1]))
        const yMax = Math.max(...jsonData.map((item) => item[1]))
        const option = {
          tooltip: {},
          backgroundColor: '#fff',
          visualMap: {
            show: false,
            dimension: 2,
            min: -1.2,
            max: 1.2,
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
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value', min: 600 },
          zAxis3D: { type: 'value' },
          grid3D: {
            viewControl: {}
          },
          series: [
            {
              type: 'surface',
              wireframe: { show: true },
              equation: {
                x: { step: 0.05, min: -3, max: 3 },
                y: { step: 20, min: yMin, max: yMax },
                z: function (x: number, y: number) {
                  return (Math.sin(x * x + y * y) * x) / 3.14
                }
              }
            }
          ]
        } as any
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('Surface3DChart 加载失败:', error)
      }
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default Surface3DChart
