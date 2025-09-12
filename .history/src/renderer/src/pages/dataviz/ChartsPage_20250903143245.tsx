import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import LineChart from '../../components/DataVizChart/LineChart'
import RegressionChart from '../../components/DataVizChart/RegressionChartnChart'

// 图表组件 - view3: 散点图
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
            left: '3%',
            right: '7%',
            bottom: '7%',
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
            data: ['Female', 'Male'],
            left: 'center',
            bottom: 10
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

  return <ChartRoot ref={containerRef} />
}

// 图表组件 - view1: 极坐标柱状图
const PolarBarChart: React.FC = () => {
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
          tooltip: {},
          angleAxis: [
            {
              type: 'category',
              polarIndex: 0,
              startAngle: 90,
              endAngle: 270
            },
            {
              type: 'category',
              polarIndex: 1,
              startAngle: -90,
              endAngle: 90
            }
          ],
          radiusAxis: [{ polarIndex: 0 }, { polarIndex: 1 }],
          polar: [{}, {}],
          series: [
            {
              type: 'bar',
              polarIndex: 0,
              data: jsonData.map((item: any) => {
                return item[2]
              }),
              coordinateSystem: 'polar'
            },
            {
              type: 'bar',
              polarIndex: 1,
              data: jsonData.map((item: any) => {
                return item[1]
              }),
              coordinateSystem: 'polar'
            }
          ]
        }
        instance.setOption(option)
        const onResize = () => instance && instance.resize()
        window.addEventListener('resize', onResize)
        ;(instance as any)._onResize = onResize
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

// 主组件
const ChartsPage: React.FC = () => {
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
          <LineChart />
        </ViewItem>
        <ViewItem>
          <RegressionChart />
        </ViewItem>
        <ViewItem>
          <ScatterChart />
        </ViewItem>
        <ViewItem>
          <PolarBarChart />
        </ViewItem>
      </ViewContainer>
    </Container>
  )
}

// 样式组件
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
  height: 100%;
  display: flex;
  flex-wrap: wrap;
`

const ViewItem = styled.div`
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

export default ChartsPage
