import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Bar3DChart from '../../components/DataVizChart/Bar3DChart'
import Line3DChart from '../../components/DataVizChart/Line3DChart'
import Scatter3DChart from '../../components/DataVizChart/Scatter3DChart'
import Surface3DChart from '../../components/DataVizChart/Surface3DChart'

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

// 3D 柱状图组件
const EChartsBar3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [webglSupported, setWebglSupported] = React.useState(true)

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
        if (disposed) return
        instance = echarts.init(containerRef.current)
        const option = buildBar3DOption()
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
      } catch (error) {
        // console.error('Failed to load 3D chart:', error)
        setWebglSupported(false)
      }
    })()
    return () => {
      disposed = true
      const onResize = (instance as any)?._onResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (instance) instance.dispose()
    }
  }, [])

  if (!webglSupported) {
    return (
      <WebglError>
        <h3>WebGL 不支持</h3>
        <p>您的浏览器不支持 WebGL，无法显示 3D 图表。</p>
        <p>请尝试：</p>
        <ul>
          <li>更新浏览器到最新版本</li>
          <li>启用硬件加速</li>
          <li>检查显卡驱动</li>
        </ul>
      </WebglError>
    )
  }

  return <ChartRoot ref={containerRef} />
}

// 3D 图表配置
const buildBar3DOption = () => {
  const data = sampleData.map((item) => ({ value: [item[0], item[1], item[2]] }))
  return {
    tooltip: {},
    xAxis3D: { type: 'category' },
    yAxis3D: { type: 'category' },
    zAxis3D: { type: 'value' },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      viewControl: {},
      light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } }
    },
    series: [
      {
        type: 'bar3D',
        data,
        shading: 'lambert',
        label: { fontSize: 12, borderWidth: 0 },
        emphasis: { label: { fontSize: 14, color: '#900' }, itemStyle: { color: '#900' } }
      }
    ]
  }
}

// 主组件
const AdvancedPage: React.FC = () => {
  const [dataFrom, setDataFrom] = useState('')
  const [selectValueX, setSelectValueX] = useState('')
  const [selectValueY, setSelectValueY] = useState('')
  const [selectValueType, setSelectValueType] = useState('')
  const [selectValueView, setSelectValueView] = useState('')

  return (
    <Container>
      <SelectPanel>
        <Title>数据源</Title>
        <FileContainer>
          <Select placeholder="选择数据来源" value={dataFrom} onChange={(value) => setDataFrom(value)}>
            {[1, 2, 3].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
          <IconWrapper>
            <FileAddIcon />
          </IconWrapper>
          <IconWrapper>
            <DownloadIcon />
          </IconWrapper>
        </FileContainer>
        <SelectItem>
          <Select placeholder="X选择" value={selectValueX} onChange={(value) => setSelectValueX(value)}>
            {[1, 2, 3].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </SelectItem>
        <SelectItem>
          <Select placeholder="Y选择" value={selectValueY} onChange={(value) => setSelectValueY(value)}>
            {[1, 2, 3].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </SelectItem>
        <SelectItem>
          <Select placeholder="图表类型选择" value={selectValueType} onChange={(value) => setSelectValueType(value)}>
            {[1, 2, 3].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </SelectItem>
        <SelectItem>
          <Select placeholder="展示区域" value={selectValueView} onChange={(value) => setSelectValueView(value)}>
            {[1, 2, 3].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </SelectItem>
      </SelectPanel>
      <ViewContainer>
        <ViewItem>
          {/* view7 -> Scatter3D */}
          {<Scatter3DChart />}
        </ViewItem>
        <ViewItem>
          {/* view5 -> Surface3D */}
          {<Surface3DChart />}
        </ViewItem>
        <ViewItem>
          {/* view6 -> Bar3D */}
          {<Bar3DChart />}
        </ViewItem>
        <ViewItem>
          {/* view8 -> Line3D */}
          {<Line3DChart />}
        </ViewItem>
      </ViewContainer>
    </Container>
  )
}

// 样式组件
const AdvancedContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`

const ChartRoot = styled.div`
  width: 100%;
  height: 100%;
`

const WebglError = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  text-align: center;
  color: var(--color-text-secondary);

  h3 {
    color: var(--color-text);
    margin-bottom: 16px;
  }

  p {
    margin: 8px 0;
  }

  ul {
    text-align: left;
    margin-top: 16px;
  }

  li {
    margin: 4px 0;
  }
`

const Container = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
`

const SelectPanel = styled.div`
  width: 280px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #cfcfcf;
  padding: 12px;
  box-sizing: border-box;
`

const Title = styled.p`
  font-size: 16px;
  text-align: center;
  font-weight: bold;
  margin: 0 0 12px 0;
`

const FileContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
  margin: 12px 0;

  .ant-select {
    width: 200px;
  }
`

const IconWrapper = styled.div`
  cursor: pointer;
  color: #666;

  &:hover {
    color: #1890ff;
  }
`

const SelectItem = styled.div`
  margin: 12px 0;
`

const ViewContainer = styled.div`
  width: calc(100% - 280px);
  height: 90%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden; /* 取消滚动，由图表自适应窗口 */
`

const ViewItem = styled.div`
  width: 50%;
  height: 50%; /* 等比分配容器高度，随窗口变化自适应 */
  background: #fff;
  border: 1px solid #cfcfcf;
  box-sizing: border-box;
`
// 图标组件
const FileAddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
    <path d="M12 12v3h3v2h-3v3h-2v-3H7v-2h3v-3z" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
)

// 简化的Select组件
const Select = ({ children, placeholder, value, onChange }: any) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      fontSize: '14px'
    }}>
    <option value="" disabled>
      {placeholder}
    </option>
    {children}
  </select>
)

Select.Option = ({ children, value }: any) => <option value={value}>{children}</option>

export default AdvancedPage
