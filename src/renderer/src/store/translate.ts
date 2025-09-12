// 翻译小模块

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// 定义数据结构，规定translatedContent为保存翻译后的内容类型为字符串
export interface TranslateState {
  translatedContent: string
}
// 初始状态为空
const initialState: TranslateState = {
  translatedContent: ''
}

const translateSlice = createSlice({
  name: 'translate',
  initialState,
  reducers: {
    // 设置翻译后的内容，接受一个字符串（翻译结果），更新到state中
    setTranslatedContent: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        translatedContent: action.payload
      }
    }
  }
})

export const { setTranslatedContent } = translateSlice.actions

export default translateSlice.reducer
