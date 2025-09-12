import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'

// import jsonData from '../../../../../resources/data/newData.json'

const Scatter3DChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const [data, setData] = useState<any[]>([]) // 用于存储数据
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // 获取数据
    axios
      .get('../../../../../resources/data/newData.json')
      .then((response) => {
        // 确保数据已加载
        setData(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading data:', error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // 检查 WebGL 支持
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      setWebglSupported(false)
      return
    }

    if (data.length === 0 || loading) return // 如果数据没有加载完成，或者为空，不渲染图表

    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      try {
        const echarts = await import('echarts')
        await import('echarts-gl')

        if (disposed) return

        // const { data: rawData } = await axios.get('../../../../../resources/data/newData.json')

        instance = echarts.init(containerRef.current)

        const option = {
          grid3D: {},
          xAxis3D: { type: 'category' },
          yAxis3D: {},
          zAxis3D: {},
          dataset: { dimensions: ['x', 'y', 'z'], source: data },
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
