import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const WebSidebar: React.FC = () => {
  const menuItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/agents', label: '智能体', icon: '🤖' },
    { path: '/paintings', label: '绘画', icon: '🎨' },
    { path: '/translate', label: '翻译', icon: '🌐' },
    { path: '/files', label: '文件', icon: '📁' },
    { path: '/knowledge', label: '知识库', icon: '📚' },
    { path: '/apps', label: '小程序', icon: '📱' },
    { path: '/code', label: '代码工具', icon: '💻' },
    { path: '/dataviz', label: '数据可视化', icon: '📊' },
    { path: '/settings', label: '设置', icon: '⚙️' },
    { path: '/launchpad', label: '启动台', icon: '🚀' },
    { path: '/web-chat', label: 'Web 聊天', icon: '💬' }
  ]

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>🍒</LogoIcon>
        <LogoText>Cherry Studio</LogoText>
        <WebBadge>Web</WebBadge>
      </Logo>

      <Menu>
        {menuItems.map((item) => (
          <MenuItem key={item.path}>
            <StyledNavLink to={item.path}>
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuLabel>{item.label}</MenuLabel>
            </StyledNavLink>
          </MenuItem>
        ))}
      </Menu>
    </SidebarContainer>
  )
}

const SidebarContainer = styled.div`
  width: 240px;
  height: 100vh;
  background: var(--color-bg-container, #fff);
  border-right: 1px solid var(--color-border, #e8e8e8);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
`

const Logo = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  display: flex;
  align-items: center;
  gap: 12px;
`

const LogoIcon = styled.div`
  font-size: 24px;
`

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text, #333);
`

const WebBadge = styled.div`
  background: #1890ff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`

const Menu = styled.div`
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
`

const MenuItem = styled.div`
  margin: 4px 12px;
`

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text, #333);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-fill-secondary, #f5f5f5);
  }

  &.active {
    background: var(--color-primary-bg, #e6f7ff);
    color: var(--color-primary, #1890ff);
  }
`

const MenuIcon = styled.div`
  font-size: 16px;
  width: 20px;
  text-align: center;
`

const MenuLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
`

export default WebSidebar
