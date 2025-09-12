import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const LineChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // const main = ref<any>(null);
    let chart: any
    const initChart = async () => {
      const echarts = await import('echarts')
      // echarts.init(main.value)
      chart = echarts.init(containerRef.current!)
      const option = {
        grid: {
          left: '3%',
          right: '3%',
          top: '6%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: { type: 'category' },
        yAxis: {},
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
      chart.setOption(option)
      window.addEventListener('resize', chart.resize)
    }
    initChart()
    // onUnmounted(() => {...})
    return () => {
      if (chart) chart.dispose()
      window.removeEventListener('resize', chart?.resize)
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default LineChart
