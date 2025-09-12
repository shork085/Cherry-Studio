import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RootState } from '../../store' // 根据你的项目结构调整路径
import { setUserName } from '../../store/settingsSlice' // 导入之前定义的 action

const UserNameEditor: React.FC = () => {
  // 从 Redux store 获取当前用户名
  const currentUserName = useSelector((state: RootState) => state.settings.userName)

  // 获取 dispatch 函数用于派发 action
  const dispatch = useDispatch()

  // 本地状态管理输入框的值
  const [inputValue, setInputValue] = useState(currentUserName)

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 派发 action 更新 Redux 状态
    dispatch(setUserName(inputValue))
    alert(`用户名已更新为: ${inputValue}`)
  }

  // 重置为当前 Redux 状态的值
  const handleReset = () => {
    setInputValue(currentUserName)
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
      <h3>更改用户名示例</h3>
      <p>
        当前用户名: <strong>{currentUserName}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            新用户名:
          </label>
          <input
            id="username"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            style={{
              padding: '8px',
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            更新用户名
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            重置
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserNameEditor
