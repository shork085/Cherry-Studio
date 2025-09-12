import React, { useState } from 'react'
import styled from 'styled-components'

import LineChart from '../../components/DataVizChart/LineChart'
import PolarBarChart from '../../components/DataVizChart/PolarBarChart'
import RegressionChart from '../../components/DataVizChart/RegressionChart'
import ScatterChart from '../../components/DataVizChart/ScatterChart'

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
  overflow: hidden; /* 取消滚动，由图表自适应窗口 */
`

const ViewItem = styled.div`
  width: 50%;
  height: 40%; /* 等比分配容器高度，随窗口变化自适应 */
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

export default ChartsPage
