// 图表组件 - view1: 极坐标柱状图
import React, { useEffect, useRef, useState } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const PolarBarChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let instance: echarts.ECharts | null = null
    let resizeObserver: ResizeObserver | null = null
    let disposed = false

    const initChart = async () => {
      if (!containerRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        const echarts = await import('echarts')
        if (disposed) return

        instance = echarts.init(containerRef.current)

        // 处理数据 - 确保数据有效
        const data1 = jsonData.map((item: any) => item[2]).filter((val) => !isNaN(val))
        const data2 = jsonData.map((item: any) => item[1]).filter((val) => !isNaN(val))

        if (data1.length === 0 || data2.length === 0) {
          throw new Error('无效的数据格式或空数据')
        }

        const option: echarts.EChartsOption = {
          tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
              const data = Array.isArray(params) ? params[0] : params
              return `值: ${data.value}<br>索引: ${data.dataIndex}`
            }
          },
          angleAxis: [
            {
              type: 'category',
              polarIndex: 0,
              startAngle: 90,
              endAngle: 270,
              axisLabel: {
                show: true,
                fontSize: 10
              }
            },
            {
              type: 'category',
              polarIndex: 1,
              startAngle: -90,
              endAngle: 90,
              axisLabel: {
                show: true,
                fontSize: 10
              }
            }
          ],
          radiusAxis: [
            {
              polarIndex: 0,
              axisLabel: {
                show: true,
                fontSize: 10
              }
            },
            {
              polarIndex: 1,
              axisLabel: {
                show: true,
                fontSize: 10
              }
            }
          ],
          polar: [
            {
              center: ['50%', '52%'],
              radius: '80%'
            },
            {
              center: ['50%', '52%'],
              radius: '80%'
            }
          ],
          series: [
            {
              name: '数据系列1',
              type: 'bar',
              polarIndex: 0,
              data: data1,
              coordinateSystem: 'polar',
              itemStyle: {
                color: '#5470c6'
              },
              emphasis: {
                itemStyle: {
                  color: '#91cc75'
                }
              }
            },
            {
              name: '数据系列2',
              type: 'bar',
              polarIndex: 1,
              data: data2,
              coordinateSystem: 'polar',
              itemStyle: {
                color: '#ee6666'
              },
              emphasis: {
                itemStyle: {
                  color: '#fac858'
                }
              }
            }
          ],
          legend: {
            data: ['数据系列1', '数据系列2'],
            bottom: 10
          },
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicOut'
        }

        instance.setOption(option)
        setIsLoading(false)

        // 使用ResizeObserver监听容器大小变化
        resizeObserver = new ResizeObserver(() => {
          if (instance && !disposed) {
            instance.resize()
          }
        })

        resizeObserver.observe(containerRef.current)

        // 同时监听窗口大小变化
        const handleWindowResize = () => {
          if (instance && !disposed) {
            instance.resize()
          }
        }

        window.addEventListener('resize', handleWindowResize)

        // 清理函数
        return () => {
          window.removeEventListener('resize', handleWindowResize)
        }
      } catch (err) {
        console.error('极坐标图加载失败:', err)
        setError('图表加载失败: ' + (err instanceof Error ? err.message : '未知错误'))
        setIsLoading(false)
      }
    }

    initChart()

    return () => {
      disposed = true
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (instance) {
        instance.dispose()
      }
    }
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#f5f7fa',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.8)',
            zIndex: 10
          }}>
          <div className="spinner"></div>
          <span style={{ marginLeft: '10px' }}>图表加载中...</span>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.8)',
            color: '#f56c6c',
            zIndex: 10,
            textAlign: 'center',
            padding: '20px'
          }}>
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px'
        }}
      />
    </div>
  )
}

export default PolarBarChart
