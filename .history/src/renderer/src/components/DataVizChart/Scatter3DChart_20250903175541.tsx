import React, { useEffect, useRef } from 'react'

const Scatter3DChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      try {
        const echarts = await import('echarts')
        await import('echarts-gl')
        const { default: axios } = await import('axios')
        if (disposed) return

        const { data: source } = await axios.get('../../../../../resources/data/newData.json')
        instance = echarts.init(containerRef.current)
        const option = {
          grid3D: {},
          xAxis3D: { type: 'category' },
          yAxis3D: {},
          zAxis3D: {},
          dataset: { dimensions: ['x', 'y', 'z'], source },
          series: [
            {
              type: 'scatter3D',
              symbolSize: 10,
              encode: { x: 'x', y: 'y', z: 'z', tooltip: [0, 1, 2, 3, 4] }
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('Scatter3DChart 加载失败:', error)
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

export default Scatter3DChart
