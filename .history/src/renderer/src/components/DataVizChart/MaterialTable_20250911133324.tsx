import React from 'react'

// 抽出来的通用表格组件
type MaterialTableProps = {
  title: string
  data: any[]
}

const MaterialTable: React.FC<MaterialTableProps> = ({ title, data }) => (
  <FormItem>
    <FormTitle>{title}</FormTitle>
    <TableWrapper>
      <FormTable>
        <thead>
          <tr>
            <th>原料代码</th>
            <th style={{ width: '260px' }}>原料描述</th>
            <th>测试质量</th>
            <th>质量分数%</th>
            <th>混合后%</th>
            <th>参考价</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.material_code}</td>
              <td>{item.material_desc}</td>
              <td>{Number(item.test_quality).toFixed(2)}</td>
              <td>{Number(item.quality_score).toFixed(2)}</td>
              <td>{item.mix != null && !isNaN(Number(item.mix)) ? Number(item.mix).toFixed(2) : '-'}</td>
              <td>￥{Number(item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </FormTable>
    </TableWrapper>
  </FormItem>
)
