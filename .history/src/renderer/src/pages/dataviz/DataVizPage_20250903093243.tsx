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
