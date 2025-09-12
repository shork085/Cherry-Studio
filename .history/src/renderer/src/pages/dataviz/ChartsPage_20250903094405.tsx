import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

// 示例数据
const sampleData: Array<[number, number, number]> = [
  [1, 615, 108.7],
  [2, 643, 104.03],
  [3, 643, 104.52],
  [4, 643, 114.27],
  [5, 643, 108.91],
  [6, 821, 131.78],
  [7, 821, 119.33],
  [8, 821, 113.26],
  [9, 821, 120.37],
  [10, 821, 117.27]
]

// 图表组件
const EChartsPolarBars: React.FC = () => {
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
        const option = buildPolarBarsOption()
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
        console.log('极坐标图加载成功')
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

  return <ChartRoot ref={containerRef} />
}

const EChartsScatter: React.FC = () => {
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
        const option = buildScatterOption()
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
        console.log('散点图加载成功')
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

  return <ChartRoot ref={containerRef} />
}

const EChartsLine: React.FC = () => {
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
        const option = buildLineOption()
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
        console.log('折线图加载成功')
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

const EChartsRegression: React.FC = () => {
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
        const option = buildRegressionOption()
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
        console.log('回归图加载成功')
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

  return <ChartRoot ref={containerRef} />
}

// 图表配置函数
const buildPolarBarsOption = () => {
  const data = sampleData
  return {
    tooltip: {},
    angleAxis: [
      {
        type: 'category',
        polarIndex: 0,
        startAngle: 90,
        endAngle: 270,
        data: data.map((d, i) => `数据${i + 1}`)
      },
      {
        type: 'category',
        polarIndex: 1,
        startAngle: -90,
        endAngle: 90,
        data: data.map((d, i) => `数据${i + 1}`)
      }
    ],
    radiusAxis: [{ polarIndex: 0 }, { polarIndex: 1 }],
    polar: [{}, {}],
    series: [
      {
        type: 'bar',
        polarIndex: 0,
        data: data.map((d) => d[2]),
        coordinateSystem: 'polar',
        name: '数值1'
      },
      {
        type: 'bar',
        polarIndex: 1,
        data: data.map((d) => d[1]),
        coordinateSystem: 'polar',
        name: '数值2'
      }
    ]
  }
}

const buildScatterOption = () => {
  const data = sampleData
  return {
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
    xAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: 'Female',
        type: 'scatter',
        emphasis: {
          focus: 'series'
        },
        data: data.map((item: any) => [item[1], item[2]]),
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
}

const buildLineOption = () => {
  const data = sampleData
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map((d, i) => `点${i + 1}`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '数值',
        type: 'line',
        smooth: true,
        data: data.map((d) => d[2])
      }
    ]
  }
}

const buildRegressionOption = () => {
  const data = sampleData
  return {
    title: {
      text: '散点回归图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'value',
      name: 'X轴',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Y轴',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '散点',
        type: 'scatter',
        data: data.map((item: any) => [item[1], item[2]]),
        symbolSize: 8
      },
      {
        name: '趋势线',
        type: 'line',
        smooth: true,
        symbolSize: 0,
        lineStyle: {
          color: '#ff6b6b',
          width: 2
        },
        data: data.map((item: any) => [item[1], item[2]])
      }
    ]
  }
}

// 主组件
const ChartsPage: React.FC = () => {
  return (
    <ChartsContainer>
      <ChartsGrid>
        <ChartItem>
          <EChartsPolarBars />
        </ChartItem>
        <ChartItem>
          <EChartsScatter />
        </ChartItem>
        <ChartItem>
          <EChartsLine />
        </ChartItem>
        <ChartItem>
          <EChartsRegression />
        </ChartItem>
      </ChartsGrid>
    </ChartsContainer>
  )
}

// 样式组件
const ChartsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`

const ChartsGrid = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
`

const ChartItem = styled.div`
  width: 50%;
  height: 50%;
  background: #fff;
  border: 1px solid #cfcfcf;
  box-sizing: border-box;
`

const ChartRoot = styled.div`
  width: 100%;
  height: 100%;
`

export default ChartsPage
