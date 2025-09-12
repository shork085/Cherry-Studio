import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const Bar3DChart: React.FC = () => {
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
        // eslint-disable-next-line no-console
        console.error('Bar3DChart 加载失败:', error)
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

export default Bar3DChart


