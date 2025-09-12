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
          left: '5%',
          right: '3%',
          top: '15%',
          // bottom: '5%',
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

  return <div ref={containerRef} style={{ width: '90%', height: '90%' }} />
}

export default LineChart
