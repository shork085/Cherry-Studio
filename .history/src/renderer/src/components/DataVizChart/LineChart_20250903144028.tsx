import React, { useEffect, useRef } from 'react'

import { jsonData } from '../../../../../resources/data/formData'

const LineChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let chart: any
    const initChart = async () => {
      const echarts = await import('echarts')
      chart = echarts.init(containerRef.current!)
      chart.setOption({
        xAxis: { type: 'category' },
        yAxis: {},
        dataset: { source: jsonData },
        series: { type: 'line' }
      })
      window.addEventListener('resize', chart.resize)
    }
    initChart()
    return () => {
      if (chart) chart.dispose()
      window.removeEventListener('resize', chart?.resize)
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default LineChart
