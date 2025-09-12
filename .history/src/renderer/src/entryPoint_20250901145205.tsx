import './assets/styles/index.scss'
import '@ant-design/v5-patch-for-react-19'

import { createRoot } from 'react-dom/client'

// 引入根组件
import App from './App'

const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(<App />)
