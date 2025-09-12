// 图表组件 - view1: 极坐标柱状图
import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const PolarBarChart: React.FC = () => {
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
          tooltip: {},
          angleAxis: [
            {
              type: 'category',
              polarIndex: 0,
              startAngle: 90,
              endAngle: 270
            },
            {
              type: 'category',
              polarIndex: 1,
              startAngle: -90,
              endAngle: 90
            }
          ],
          radiusAxis: [{ polarIndex: 0 }, { polarIndex: 1 }],
          polar: [
            { center: ['50%', '50%'], radius: '75%' },
            { center: ['50%', '50%'], radius: '75%' }
          ],
          series: [
            {
              type: 'bar',
              polarIndex: 0,
              data: jsonData.map((item: any) => {
                return item[2]
              }),
              coordinateSystem: 'polar'
            },
            {
              type: 'bar',
              polarIndex: 1,
              data: jsonData.map((item: any) => {
                return item[1]
              }),
              coordinateSystem: 'polar'
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('极坐标图加载失败:', error)
      }
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', padding: '6px' }} />
}

export default PolarBarChart
