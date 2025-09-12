import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../resources/data/formData'

// 图表组件 - view4: 折线图
const LineChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      try {
        const echarts = await import('echarts')
        if (disposed) return
        instance = echarts.init(containerRef.current)
        const option = {
          xAxis: {
            type: 'category'
          },
          yAxis: {
            type: 'value'
          },
          dataset: {
            dimensions: ['x', 'y', 'z'],
            source: jsonData
          },
          series: [
            {
              type: 'line',
              smooth: true,
              encode: {
                x: 'y',
                y: 'z'
              }
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('折线图加载失败:', error)
      }
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
