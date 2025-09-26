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
}

// FormTableComponent组件属性接口
export interface FormTableComponentProps {
  title: string
  data: TableDataItem[]
  columns: TableColumn[]
  onTestQualityChange?: (item: TableDataItem, newValue: number) => void
  isEditing?: boolean
}

// 渲染单元格内容的辅助函数
const renderCellContent = (
  item: TableDataItem,
  key: string,
  onTestQualityChange?: (item: TableDataItem, newValue: number) => void
) => {
  switch (key) {
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

const FormTableComponent: React.FC<FormTableComponentProps> = ({ title, data, columns, onTestQualityChange }) => {
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
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{renderCellContent(item, column.key, onTestQualityChange)}</td>
                ))}
              </tr>
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
    background: #f5f5f5;
    height: 20px;
    border: 1px solid #cfcfcf;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr {
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
    }
  }
`

export default FormTableComponent
