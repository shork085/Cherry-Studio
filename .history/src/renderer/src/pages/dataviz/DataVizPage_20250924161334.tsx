import { Navbar, NavbarLeft } from '@renderer/components/app/Navbar'
import { useNavbarPosition } from '@renderer/hooks/useSettings'
import { getTitleLabel } from '@renderer/i18n/label'
import { Input } from 'antd'
import { Search } from 'lucide-react'
import React from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
// 在JS中写样式
import styled from 'styled-components'

import AdvancedPage from './AdvancedPage'
import ChartsPage from './ChartsPage'
import HomeFormPage from './HomeFormPage'

// 主组件
const DataVizPage: React.FC = () => {
  const location = useLocation()
  const [search, setSearch] = React.useState('')
  const [ratioInput, setRatioInput] = React.useState('1')
  const { isLeftNavbar } = useNavbarPosition()

  const isHome = location.pathname.endsWith('/home')
  const isCharts = location.pathname.endsWith('/charts')
  const isAdvanced = location.pathname.endsWith('/advanced')

  // 共享控件（避免重复）
  const tabsEl = (
    <Tabs>
      <Tab to="home" $active={isHome}>
        表单
      </Tab>
      <Tab to="charts" $active={isCharts}>
        可视化图表
      </Tab>
      <Tab to="advanced" $active={isAdvanced}>
        3D图表
      </Tab>
    </Tabs>
  )

  const centerInputEl = isHome ? (
    <CenterBox>
      <RatioInput
        placeholder="输入配比..."
        className="nodrag"
        style={{
          width: isLeftNavbar ? '50%' : '20%',
          height: 28,
          borderRadius: 15,
          background: '#fffbe6',
          left: isLeftNavbar ? -80 : 0
        }}
        size="small"
        value={ratioInput}
        onChange={(e) => setRatioInput(e.target.value)}
      />
    </CenterBox>
  ) : null

  const searchInputEl = isHome ? (
    <HeaderRight>
      <Input
        placeholder="原料代码或描述..."
        className="nodrag"
        style={{
          width: isLeftNavbar ? '65%' : '90%',
          height: 28,
          borderRadius: 15,
          background: '#fff'
        }}
        size="small"
        suffix={<Search size={18} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </HeaderRight>
  ) : null

  return (
    <Container>
      {/* 导航栏在左侧时 */}
      {isLeftNavbar && (
        <Navbar>
          <NavbarLeft>
            <LeftTopBar>
              <Title>{getTitleLabel('dataviz')}</Title>
              {tabsEl}
              {searchInputEl}
              {centerInputEl}
            </LeftTopBar>
          </NavbarLeft>
        </Navbar>
      )}

      {/* 导航栏在顶部 */}
      {!isLeftNavbar && (
        <Header>
          {tabsEl}
          {centerInputEl}
          {searchInputEl}
        </Header>
      )}

      <Content>
        <Routes>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeFormPage searchKeyword={search} stoichRatio={parseFloat(ratioInput) || 1} />} />
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
  [navbar-position='left'] & {
    max-width: calc(100vw - var(--sidebar-width));
  }
  [navbar-position='top'] & {
    max-width: 100vw;
  }
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
  color: var(--color-text-1);
`

// reserved for future use

const LeftTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: none;
  width: 100%;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  -webkit-app-region: none;
`

const RatioInput = styled(Input)`
  background: rgb(253, 250, 234) !important; // 柔和高亮背景
  border-color: rgb(255, 218, 117) !important; // 高亮边框颜色
  box-shadow: 0 0 0 2px rgba(255, 214, 102, 0.18);
  color: #333;
  // font-weight: 600;

  &::placeholder {
    color: #a87b00;
    opacity: 0.85;
  }

  &:focus,
  &.ant-input:focus,
  &.ant-input-focused {
    border-color: rgb(255, 158, 47) !important;
    box-shadow: 0 0 0 2px rgba(255, 138, 0, 0.16) !important;
  }
  &:hover {
    border-color: #ffb155;
  }
  // 允许输入框可交互，不参与窗口拖拽
  -webkit-app-region: no-drag;
  pointer-events: auto;
`

const CenterBox = styled.div`
  display: flex;
  justify-content: flex-start;
  // 拖拽区域：让输入框右侧空白可拖动窗口
  -webkit-app-region: drag;
  // 占据可用空间，以便输入框右侧形成可拖拽空白
  flex: 1;
  // 避免该容器拦截事件，确保输入框可点击
  pointer-events: none;

  // 容器内子元素可正常交互
  & > * {
    pointer-events: auto;
  }
`

const HeaderRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  -webkit-app-region: none;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
`

const Tab = styled(StyledLink)<{ $active?: boolean }>`
  padding: 4px 12px;
  border-radius: 8px;
  height: 30px;
  background: ${(p) => (p.$active ? 'var(--color-primary-10)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-text)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--color-primary-20)' : 'var(--color-border)')};
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`

export default DataVizPage
