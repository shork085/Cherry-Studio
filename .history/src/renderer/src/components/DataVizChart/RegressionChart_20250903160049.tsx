// 图表组件 - view2: 回归散点图
import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const RegressionChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      try {
        const echarts = await import('echarts')
        const ecStat = await import('echarts-stat')
        if (disposed) return

        // 注册 ecStat 转换
        echarts.registerTransform(ecStat.transform.regression)

        instance = echarts.init(containerRef.current)
        const option = {
          dataset: [
            {
              source: jsonData.map((item: any) => {
                return [item[1], item[2]]
              })
            },
            {
              transform: {
                type: 'ecStat:regression',
                config: {
                  method: 'exponential'
                }
              }
            }
          ],
          title: {
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            confine: true, // 防止 tooltip 溢出窗口
            axisPointer: {
              type: 'cross'
            },
            formatter: (params: any) => {
              // params 可能是数组（多系列）
              const list = Array.isArray(params) ? params : [params]
              // 只展示唯一值，限制最多 6 条，超出用 ... 表示
              const values = list
                .map((p: any) => p.value)
                .filter((v: any) => Array.isArray(v))
                .map((v: any) => `${v[0]} , ${v[1]}`)
              const uniqueValues = Array.from(new Set(values))
              const limited = uniqueValues.slice(0, 6)
              const more = uniqueValues.length > 6 ? '... ' : ''
              return `${list[0]?.seriesName ?? ''}<br/>` + limited.join('<br/>') + (more ? '<br/>' + more : '')
            }
          },
          xAxis: {
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          yAxis: {
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          series: [
            {
              name: 'scatter',
              type: 'scatter',
              datasetIndex: 0
            },
            {
              type: 'line',
              smooth: true,
              datasetIndex: 1,
              symbolSize: 0.1,
              symbol: 'circle',
              label: { show: true, fontSize: 16 },
              labelLayout: { dx: -20 },
              encode: { label: 2, tooltip: 1 }
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('回归图加载失败:', error)
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
export default RegressionChart
