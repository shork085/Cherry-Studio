import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 构建自定义元素 bundle，供 Electron 内直接以 <data-viz-app> 使用
export default defineConfig({
  plugins: [vue({ customElement: true })],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist-ce',
    lib: {
      entry: 'src/ce-main.ts',
      name: 'DataVizCE',
      fileName: () => 'dataviz.ce.js',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
