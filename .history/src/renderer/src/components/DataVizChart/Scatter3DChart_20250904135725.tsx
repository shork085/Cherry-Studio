import React, { useEffect, useRef, useState } from 'react'

const Scatter3DChart: React.FC = () => {
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
        const { default: axios } = await import('axios')
        if (disposed) return

        const { data: res } = await axios.get('../../../../../resources/data/newData.json')
        instance = echarts.init(containerRef.current)
        console.log('3D散点图数据:', res)

        // 数据格式：第一行是表头，后面是数据行
        const option = {
          grid3D: {},
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value' },
          zAxis3D: { type: 'value' },
          dataset: {
            dimensions: res[0], // 使用第一行作为维度名
            source: res.slice(1) // 使用除第一行外的数据
          },
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
        setWebglSupported(false)
      }
    })()
    return () => {
      disposed = true
      if (instance) {
        const onResize = (instance as any)?._onResize
        if (onResize) window.removeEventListener('resize', onResize)
        instance.dispose()
      }
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
        <h3 style={{ color: '#333', marginBottom: '16px' }}>3D 散点图</h3>
        <p>WebGL 不支持</p>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default Scatter3DChart
