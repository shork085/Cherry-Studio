import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const Line3DChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
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

export default Line3DChart
