// 图表组件 - view3: 散点图
import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const ScatterChart: React.FC = () => {
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
          grid: {
            left: '6%',
            right: '4%',
            top: '12%',
            bottom: '10%',
            containLabel: true
          },
          tooltip: {
            showDelay: 0,
            formatter: function (params: any) {
              if (params.value.length > 1) {
                return params.seriesName + ' :<br/>' + params.value[0] + 'cm ' + params.value[1] + 'kg '
              } else {
                return params.seriesName + ' :<br/>' + params.name + ' : ' + params.value + 'kg '
              }
            },
            axisPointer: {
              show: true,
              type: 'cross',
              lineStyle: {
                type: 'dashed',
                width: 1
              }
            }
          },
          toolbox: {
            feature: {
              dataZoom: {},
              brush: {
                type: ['rect', 'polygon', 'clear']
              }
            }
          },
          brush: {},
          legend: {
            data: ['Female'],
            left: 'center',
            top: 2,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: { fontSize: 11 }
          },
          xAxis: [
            {
              type: 'value',
              scale: true,
              axisLabel: {
                formatter: '{value}'
              },
              splitLine: {
                show: false
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              scale: true,
              axisLabel: {
                formatter: '{value}'
              },
              splitLine: {
                show: false
              }
            }
          ],
          series: [
            {
              name: 'Female',
              type: 'scatter',
              emphasis: {
                focus: 'series'
              },
              data: jsonData.map((item: any) => {
                return [item[1], item[2]]
              }),
              markArea: {
                silent: true,
                itemStyle: {
                  color: 'transparent',
                  borderWidth: 1,
                  borderType: 'dashed'
                },
                data: [
                  [
                    {
                      name: '',
                      xAxis: 'min',
                      yAxis: 'min'
                    },
                    {
                      xAxis: 'max',
                      yAxis: 'max'
                    }
                  ]
                ]
              },
              markPoint: {
                data: [
                  { type: 'max', name: 'Max' },
                  { type: 'min', name: 'Min' }
                ]
              },
              markLine: {
                lineStyle: {
                  type: 'solid'
                },
                data: [{ type: 'average', name: 'AVG' }, { xAxis: 160 }]
              }
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        console.error('散点图加载失败:', error)
      }
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '80%' }} />
}

export default ScatterChart
