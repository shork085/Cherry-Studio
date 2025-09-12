import React from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import AdvancedPage from './AdvancedPage'
import ChartsPage from './ChartsPage'
import HomeFormPage from './HomeFormPage'

const DataVizPage: React.FC = () => {
  const location = useLocation()
  return (
    <Container>
      <Header>
        <Title>数据可视化</Title>
        <Tabs>
          <Tab to="home" $active={location.pathname.endsWith('/home')}>
            表单
          </Tab>
          <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
            可视化图表
          </Tab>
          <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
            高级3D
          </Tab>
        </Tabs>
      </Header>
      <Content>
        <Routes>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeFormPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="advanced" element={<AdvancedPage />} />
        </Routes>
      </Content>
    </Container>
  )
}

const HomeFormPage: React.FC = () => {
  const [activeBtnName, setActiveBtnName] = React.useState('单组份')

  const btnList = ['单组份', '环氧', '聚氨酯']
  const bottomBtnList = ['配方导入', '配方导出', '记录配方', '历史记录']

  const formDataA = [
    {
      name: '08-038',
      desc: '60%601环氧树脂液',
      testQuality: '15.00',
      qualityScore: '9.55',
      mixQuality: '9.19',
      price: '￥17.00'
    },
    {
      name: '06-054',
      desc: 'D650防沉剂',
      testQuality: '0.25',
      qualityScore: '0.16',
      mixQuality: '0.15',
      price: '￥48.67'
    },
    {
      name: '06-003',
      desc: 'HF-140膨润土',
      testQuality: '1.25',
      qualityScore: '0.80',
      mixQuality: '0.77',
      price: '￥19.65'
    },
    {
      name: '06-120',
      desc: '防腐基料',
      testQuality: '77.50',
      qualityScore: '49.36',
      mixQuality: '47.46',
      price: '￥24.14'
    },
    {
      name: '08-025',
      desc: '2号混合溶剂',
      testQuality: '3.00',
      qualityScore: '1.91',
      mixQuality: '1.84',
      price: '￥7.00'
    },
    {
      name: '04-001',
      desc: '石油混合二甲苯',
      testQuality: '45.00',
      qualityScore: '28.66',
      mixQuality: '27.56',
      price: '￥6.11'
    },
    {
      name: '04-006',
      desc: '正丁醇',
      testQuality: '15.00',
      qualityScore: '9.55',
      mixQuality: '9.19',
      price: '￥6.73'
    }
  ]

  const formDataB = [
    {
      name: '04-001',
      desc: '石油混合二甲苯',
      testQuality: '45.00',
      qualityScore: '28.66',
      mixQuality: '27.56',
      price: '￥6.11'
    },
    {
      name: '04-006',
      desc: '正丁醇',
      testQuality: '15.00',
      qualityScore: '9.55',
      mixQuality: '9.19',
      price: '￥6.73'
    },
    {
      name: '02-174',
      desc: 'WSCM-41115环氧固化剂',
      testQuality: '40.00',
      qualityScore: '40.00',
      mixQuality: '1.54',
      price: '￥27.17'
    }
  ]

  return (
    <FormContainer>
      <ButtonContainer>
        {btnList.map((btn) => (
          <ButtonItem key={btn} $active={activeBtnName === btn} onClick={() => setActiveBtnName(btn)}>
            {btn}
          </ButtonItem>
        ))}
        <BottomButtonContainer>
          {bottomBtnList.map((btn) => (
            <ButtonItem key={btn} $active={activeBtnName === btn} onClick={() => setActiveBtnName(btn)}>
              {btn}
            </ButtonItem>
          ))}
        </BottomButtonContainer>
      </ButtonContainer>

      <FormContent>
        <FormItem>
          <FormTitle>组分A</FormTitle>
          <FormTable>
            <thead>
              <tr>
                <th>原料代码</th>
                <th style={{ width: '300px' }}>原料描述</th>
                <th>测试质量</th>
                <th>质量分数%</th>
                <th>混合后%</th>
                <th>参考价</th>
              </tr>
            </thead>
            <tbody>
              {formDataA.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.desc}</td>
                  <td>{item.testQuality}</td>
                  <td>{item.qualityScore}</td>
                  <td>{item.mixQuality}</td>
                  <td>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </FormTable>
        </FormItem>

        <FormItem>
          <FormTitle>组分B</FormTitle>
          <FormTable>
            <thead>
              <tr>
                <th>原料代码</th>
                <th style={{ width: '300px' }}>原料描述</th>
                <th>测试质量</th>
                <th>质量分数%</th>
                <th>混合后%</th>
                <th>参考价</th>
              </tr>
            </thead>
            <tbody>
              {formDataB.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.desc}</td>
                  <td>{item.testQuality}</td>
                  <td>{item.qualityScore}</td>
                  <td>{item.mixQuality}</td>
                  <td>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </FormTable>
        </FormItem>

        <BottomForm>
          <BottomFormItem>
            <BottomFormTitle>配方比重</BottomFormTitle>
            <FormInfo>
              <div>组分A的比重</div>
              <p>1.56</p>
              <p>g/cm3</p>
            </FormInfo>
            <FormInfo>
              <div>组分B的比重</div>
              <p>1.56</p>
              <p>g/cm3</p>
            </FormInfo>
            <FormInfo>
              <div>混合物的比重</div>
              <p>1.56</p>
              <p>g/cm3</p>
            </FormInfo>
          </BottomFormItem>

          <BottomFormItem>
            <BottomFormTitle>配比</BottomFormTitle>
            <FormInfo $small>
              <div>组分A的质量比</div>
              <p>96.14</p>
              <p>wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div>组分B的质量比</div>
              <p>3.86</p>
              <p>wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div>组分A的体积比</div>
              <p>93.45</p>
              <p>v%</p>
            </FormInfo>
            <FormInfo $small>
              <div>组分B的体积比</div>
              <p>6.55</p>
              <p>v%</p>
            </FormInfo>
          </BottomFormItem>

          <BottomFormItem>
            <BottomFormTitle>配方价格</BottomFormTitle>
            <FormInfo>
              <div>组分A的价格</div>
              <p>16.3</p>
              <p>RMB/kg</p>
            </FormInfo>
            <FormInfo>
              <div>组分B的价格</div>
              <p>14.62</p>
              <p>RMB/kg</p>
            </FormInfo>
            <FormInfo>
              <div>配方的价格</div>
              <p>16.24</p>
              <p>RMB/kg</p>
            </FormInfo>
          </BottomFormItem>
        </BottomForm>
      </FormContent>
    </FormContainer>
  )
}

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

const AdvancedPage: React.FC = () => {
  return (
    <FlexFill>
      <EChartsBar3D />
    </FlexFill>
  )
}

import { useEffect, useRef } from 'react'

const EChartsPolarBars: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let instance: any
    let disposed = false
    ;(async () => {
      if (!containerRef.current) return
      const echarts = await import('echarts')
      if (disposed) return
      instance = echarts.init(containerRef.current)
      const option = buildPolarBarsOption()
      instance.setOption(option)
      const onResize = () => instance && instance.resize()
      window.addEventListener('resize', onResize)
      ;(instance as any)._onResize = onResize
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
      const echarts = await import('echarts')
      if (disposed) return
      instance = echarts.init(containerRef.current)
      const option = buildScatterOption()
      instance.setOption(option)
      const onResize = () => instance && instance.resize()
      window.addEventListener('resize', onResize)
      ;(instance as any)._onResize = onResize
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
      const echarts = await import('echarts')
      if (disposed) return
      instance = echarts.init(containerRef.current)
      const option = buildLineOption()
      instance.setOption(option)
      const onResize = () => instance && instance.resize()
      window.addEventListener('resize', onResize)
      ;(instance as any)._onResize = onResize
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
      const echarts = await import('echarts')
      if (disposed) return
      instance = echarts.init(containerRef.current)
      const option = buildRegressionOption()
      instance.setOption(option)
      const onResize = () => instance && instance.resize()
      window.addEventListener('resize', onResize)
      ;(instance as any)._onResize = onResize
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

const buildPolarBarsOption = () => {
  const data = sampleData
  return {
    tooltip: {},
    angleAxis: [
      { type: 'category', polarIndex: 0, startAngle: 90, endAngle: 270 },
      { type: 'category', polarIndex: 1, startAngle: -90, endAngle: 90 }
    ],
    radiusAxis: [{ polarIndex: 0 }, { polarIndex: 1 }],
    polar: [{}, {}],
    series: [
      { type: 'bar', polarIndex: 0, data: data.map((d) => d[2]), coordinateSystem: 'polar' },
      { type: 'bar', polarIndex: 1, data: data.map((d) => d[1]), coordinateSystem: 'polar' }
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
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value'
    },
    dataset: {
      dimensions: ['x', 'y', 'z'],
      source: data
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
}

const buildRegressionOption = () => {
  const data = sampleData
  return {
    title: {
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
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
        data: data.map((item: any) => [item[1], item[2]])
      },
      {
        name: 'line',
        type: 'line',
        smooth: true,
        symbolSize: 0.1,
        symbol: 'circle',
        label: { show: true, fontSize: 16 },
        labelLayout: { dx: -20 },
        data: data.map((item: any) => [item[1], item[2]])
      }
    ]
  }
}

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

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
`

const Title = styled.div`
  font-weight: 600;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
`

const Tab = styled(StyledLink)<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  background: ${(p) => (p.$active ? 'var(--color-primary-10)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-text)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--color-primary-20)' : 'var(--color-border)')};
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

const FlexFill = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

// const Placeholder = styled.div`
//   padding: 24px;
//   color: var(--color-text-secondary);
// `

// 表单页面样式
const FormContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`

const ButtonContainer = styled.div`
  width: 140px;
  height: 100%;
  box-sizing: border-box;
  padding: 24px 0;
  position: relative;
  border-right: 1px solid #cfcfcf;
`

const BottomButtonContainer = styled.div`
  position: absolute;
  bottom: 0;
  width: 140px;
`

const ButtonItem = styled.div<{ $active?: boolean }>`
  width: 110px;
  height: 40px;
  line-height: 35px;
  text-align: center;
  background: ${(p) => (p.$active ? '#81b337' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'inherit')};
  margin: 0 auto 20px;
  font-size: 16px;
  border-radius: 20px;
  border: 2px solid #d1d1d1;
  cursor: pointer;

  &:hover {
    background: #81b337;
    color: #fff;
  }
`

const FormContent = styled.div`
  width: calc(100% - 140px);
  display: flex;
  height: 100%;
  position: relative;
  font-size: 12px;
`

const FormItem = styled.div`
  width: 50%;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
`

const FormTitle = styled.div`
  height: 24px;
  text-align: center;
  line-height: 24px;
  background: #f5f5f5;
  border: 1px solid #cfcfcf;
`

const FormTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f5f5f5;
    height: 20px;
    border: 1px solid #cfcfcf;
  }

  td {
    border: 1px solid #adadad;
    height: 28px;
    text-align: center;
  }
`

const BottomForm = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 138px;
  display: flex;
`

const BottomFormItem = styled.div`
  width: calc(50% / 3);
  height: 100%;
  border: 1px solid #cfcfcf;
`

const BottomFormTitle = styled.div`
  height: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
`

const FormInfo = styled.div<{ $small?: boolean }>`
  height: ${(p) => (p.$small ? 'calc(75% / 4)' : '25%')};
  display: flex;
  width: 100%;
  background: #fff;
  border-top: 1px solid #cfcfcf;

  div {
    width: calc(100% - 120px);
    height: 100%;
    padding-left: 6px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }

  p {
    width: 60px;
    display: flex;
    align-items: center;
    border-left: 1px solid #c5c5c5;
    padding-left: 6px;
  }
`

const ChartRoot = styled.div`
  width: 100%;
  height: 100%;
`

// 图表页面样式
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

// 简化示例数据：来自原 Vue 的 formData，保留一部分
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

export default DataVizPage
