import { useEffect, useRef } from 'react'
import { App as VueApp, createApp } from 'vue'

interface VueContainerProps {
  component: any
  props?: Record<string, any>
  onMounted?: (vueApp: VueApp) => void
}

/**
 * Vue组件包装器，用于在React应用中渲染Vue组件
 */
const VueContainer: React.FC<VueContainerProps> = ({ component, props = {}, onMounted }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vueAppRef = useRef<VueApp | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建Vue应用实例
    const vueApp = createApp(component, props)

    // 挂载Vue应用
    vueApp.mount(containerRef.current)
    vueAppRef.current = vueApp

    // 调用挂载回调
    if (onMounted) {
      onMounted(vueApp)
    }

    // 清理函数
    return () => {
      if (vueAppRef.current) {
        vueAppRef.current.unmount()
        vueAppRef.current = null
      }
    }
  }, [component, props, onMounted])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default VueContainer
