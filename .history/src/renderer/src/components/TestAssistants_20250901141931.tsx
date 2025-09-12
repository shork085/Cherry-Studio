import React from 'react'

import { updateAssistantSettings } from '@/store/assistants'

import { useAppDispatch, useAppSelector } from './src/renderer/src/store'

export default function TestAssistants() {
  const dispatch = useAppDispatch()
  const defaultAssistant = useAppSelector((state) => state.assistants.defaultAssistant)

  const handleClick = () => {
    dispatch(
      updateAssistantSettings({
        assistantId: defaultAssistant.id,
        settings: { temperature: 0.9 } // 修改默认助手的温度
      })
    )
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem' }}>
      <p>当前默认助手：{defaultAssistant.name}</p>
      <p>温度：{defaultAssistant.settings?.temperature}</p>
      <button onClick={handleClick}>修改温度到 0.9</button>
    </div>
  )
}
