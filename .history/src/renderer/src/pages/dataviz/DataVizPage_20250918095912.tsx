import React from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
// 在JS中写样式
import styled from 'styled-components'
import { Input } from 'antd'
import { Search } from 'lucide-react'

import { Navbar, NavbarLeft, NavbarMain } from '@renderer/components/app/Navbar'
import { useNavbarPosition } from '@renderer/hooks/useSettings'
import { getTitleLabel } from '@renderer/i18n/label'

import AdvancedPage from './AdvancedPage'
import ChartsPage from './ChartsPage'
import HomeFormPage from './HomeFormPage'

// 主组件
const DataVizPage: React.FC = () => {
  const location = useLocation()
  const [search, setSearch] = React.useState('')
  const { isLeftNavbar } = useNavbarPosition()

  return (
    <Container>
      {isLeftNavbar && (
        <Navbar>
          <NavbarLeft>
            <Title>{getTitleLabel('dataviz')}</Title>
          </NavbarLeft>
          <NavbarMain>
            <Tabs>
              <Tab to="home" $active={location.pathname.endsWith('/home')}>
                表单
              </Tab>
              <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
                可视化图表
              </Tab>
              <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
                3D图表
              </Tab>
            </Tabs>
            {location.pathname.endsWith('/home') && (
              <HeaderRight>
                <Input
                  placeholder="搜索原料代码或描述..."
                  className="nodrag"
                  style={{
                    width: '90%',
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
            )}
          </NavbarMain>
        </Navbar>
      )}
      {!isLeftNavbar && (
        <Header>
          <Tabs>
            <Tab to="home" $active={location.pathname.endsWith('/home')}>
              表单
            </Tab>
            <Tab to="charts" $active={location.pathname.endsWith('/charts')}>
              可视化图表
            </Tab>
            <Tab to="advanced" $active={location.pathname.endsWith('/advanced')}>
              3D图表
            </Tab>
          </Tabs>
          {location.pathname.endsWith('/home') && (
            <HeaderRight>
              <Input
                placeholder="搜索原料代码或描述..."
                className="nodrag"
                style={{
                  width: '90%',
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
          )}
        </Header>
      )}
      <Content>
        <Routes>
          <Route path="" element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeFormPage searchKeyword={search} />} />
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

const HeaderRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
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

export default DataVizPage
