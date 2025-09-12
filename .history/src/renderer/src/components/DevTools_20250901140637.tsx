// 创建 src/renderer/src/components/DevTools.tsx
import React from 'react'

import UserNameEditor from './examples/UserNameEditor'

const DevTools: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1000 }}>
      <UserNameEditor />
    </div>
  )
}

export default DevTools

// 然后在 App.tsx 中导入并使用
import DevTools from './components/DevTools'

// 在渲染函数中添加
;<DevTools />
