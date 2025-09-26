import React from 'react'
import styled from 'styled-components'

import EditableNumber from '../EditableNumber'

// 表格列配置接口
export interface TableColumn {
  key: string
  label: string
  width?: string
  editable?: boolean
}

// 表格数据项接口
export interface TableDataItem {
  id: number
  formula_id: number
  group_type: string
  material_id: number
  material_code: string
  material_desc: string
  test_quality: number
  quality_score: number
  mix?: number | null
  price: number
  version?: number
}

// FormTableComponent组件属性接口
export interface FormTableComponentProps {
  title: string
  data: TableDataItem[]
  columns: TableColumn[]
  onTestQualityChange?: (item: TableDataItem, newValue: number) => void
  onMaterialCodeChange?: (item: TableDataItem, newCode: string) => void
  isEditing?: boolean
}

// 内联可编辑文本（用于原料代码）
const InlineEditableText: React.FC<{ value: string; onSave: (val: string) => Promise<boolean> | boolean }> = ({
  value,
  onSave
}) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  React.useEffect(() => {
    setEditValue(value)
    setError(null) //重置错误状态
  }, [value])

  const commit = async () => {
    const next = editValue.trim()
    if (!next || next === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const ok = await onSave(next)
      if (ok !== false) {
        setIsEditing(false)
      } else {
        setError('原料代码不存在')
        setIsEditing(true)
        inputRef.current?.focus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
      setIsEditing(true)
      inputRef.current?.focus()
    } finally {
      setIsSaving(false)
    }
  }

  const cancel = () => {
    setIsEditing(false)
    setEditValue(value)
    setError(null)
  }

  return isEditing ? (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value)
          setError(null) // 输入时清除错误
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') cancel()
        }}
        onBlur={() => {
          if (!error) commit()
        }}
        style={{
          width: '100%',
          border: error ? '1px solid red' : '1px solid #4a90e2',
          outline: 'none',
          textAlign: 'center',
          padding: '2px 4px',
          boxSizing: 'border-box'
        }}
        disabled={false}
      />
      {isSaving && <span style={{ position: 'absolute', right: 4, top: -18, color: '#999' }}>保存中...</span>}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#ffebee',
            color: '#d32f2f',
            fontSize: '12px',
            padding: '2px 4px',
            zIndex: 10
          }}>
          {error}
        </div>
      )}
    </div>
  ) : (
    <span
      style={{
        display: 'inline-block',
        width: '100%',
        cursor: 'pointer',
        padding: '2px 4px',
        border: '1px solid transparent'
      }}
      onClick={() => setIsEditing(true)}>
      {value}
    </span>
  )
}

// 渲染单元格内容的辅助函数
const renderCellContent = (
  item: TableDataItem,
  key: string,
  onTestQualityChange?: (item: TableDataItem, newValue: number) => void,
  onMaterialCodeChange?: (item: TableDataItem, newCode: string) => void
) => {
  switch (key) {
    case 'material_code':
      if (onMaterialCodeChange) {
        return (
          <InlineEditableText
            value={item.material_code}
            onSave={async (val) => {
              const res = await onMaterialCodeChange(item, val)
              return res as unknown as boolean
            }}
          />
        )
      }
      return item.material_code
    case 'test_quality':
      if (onTestQualityChange) {
        return (
          <EditableNumber
            value={item.test_quality}
            min={0}
            step={0.01}
            precision={2}
            onChange={(newValue) => {
              if (newValue !== null) {
                onTestQualityChange(item, newValue)
              }
            }}
            style={{ width: '100%', textAlign: 'center' }}
            align="center"
          />
        )
      }
      return Number(item.test_quality).toFixed(2)
    case 'quality_score':
      return Number(item.quality_score).toFixed(2)
    case 'mix': {
      const mixValue = item.mix
      return mixValue != null && !isNaN(Number(mixValue)) ? Number(mixValue).toFixed(2) : '-'
    }
    case 'price':
      return `￥${Number(item.price).toFixed(2)}`
    default:
      return item[key as keyof TableDataItem]
  }
}

// 创建记忆化的行组件
const TableRow = React.memo(
  ({
    item,
    columns,
    onTestQualityChange,
    onMaterialCodeChange
  }: {
    item: TableDataItem
    columns: TableColumn[]
    onTestQualityChange?: (item: TableDataItem, newValue: number) => void
    onMaterialCodeChange?: (item: TableDataItem, newCode: string) => void
  }) => {
    // 处理原料代码变更（添加错误处理）
    const handleMaterialCodeChange = async (item: TableDataItem, newCode: string) => {
      if (!onMaterialCodeChange) return false

      try {
        return await onMaterialCodeChange(item, newCode)
      } catch (error) {
        return false // 返回false表示更新失败
      }
    }

    return (
      <tr>
        {columns.map((column) => (
          <td key={column.key}>
            {renderCellContent(
              item,
              column.key,
              onTestQualityChange,
              column.key === 'material_code' ? (item, newCode) => handleMaterialCodeChange(item, newCode) : undefined
            )}
          </td>
        ))}
      </tr>
    )
  },
  (prevProps, nextProps) => {
    // 只有当item确实发生变化时才重新渲染
    return (
      prevProps.item === nextProps.item &&
      prevProps.columns === nextProps.columns &&
      prevProps.onTestQualityChange === nextProps.onTestQualityChange &&
      prevProps.onMaterialCodeChange === nextProps.onMaterialCodeChange
    )
  }
)

const FormTableComponent: React.FC<FormTableComponentProps> = ({
  title,
  data,
  columns,
  onTestQualityChange,
  onMaterialCodeChange
}) => {
  return (
    <FormItem>
      <FormTitle>{title}</FormTitle>
      <TableWrapper>
        <FormTable>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <TableRow
                key={item.id ?? index}
                item={item}
                columns={columns}
                onTestQualityChange={onTestQualityChange}
                onMaterialCodeChange={onMaterialCodeChange}
              />
            ))}
          </tbody>
        </FormTable>
      </TableWrapper>
    </FormItem>
  )
}

// 样式组件
const FormItem = styled.div`
  width: 50%;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const FormTitle = styled.div`
  height: 24px;
  text-align: center;
  line-height: 24px;
  background: #f5f5f5;
  border: 1px solid #cfcfcf;
  flex-shrink: 0; // 防止标题被压缩
`

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;
  border: 1px solid #cfcfcf;
  border-top: none;
`

const FormTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  position: relative;

  thead tr {
    transition: all 0.5s ease;
    background: #f5f5f5;
    height: 20px;
    border: 1px solid #cfcfcf;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
    /* 过渡 */
    transition: all 0.5s ease;

    border: 1px solid #adadad;
    height: 28px;

    td {
      text-align: center;

      /* 测试质量列的特殊样式 */
      &:nth-child(3) {
        cursor: text;
        position: relative;

        &:hover {
          background-color: #f0f8ff;
        }
      }

      /* 原料代码列的特殊样式（第一列） */
      &:nth-child(1) {
        cursor: text;
        &:hover {
          background-color: #f0f8ff;
        }
      }
    }
  }
`

// 使用 React.memo 包装整个组件
const MemoizedFormTableComponent = React.memo(FormTableComponent, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.title === nextProps.title &&
    prevProps.data === nextProps.data && // 引用相等性检查
    prevProps.columns === nextProps.columns &&
    prevProps.onTestQualityChange === nextProps.onTestQualityChange &&
    prevProps.onMaterialCodeChange === nextProps.onMaterialCodeChange
  )
})

export default MemoizedFormTableComponent
