import React from 'react'
import styled from 'styled-components'

const HomeFormPage: React.FC = () => {
  const [activeBtnName, setActiveBtnName] = React.useState('单组份')

  const btnList = ['单组份', '环氧', '聚氨酯']
  const bottomBtnList = ['配方导入', '配方导出', '记录配方', '历史记录', '退出']

  // 原料
  const [formDataA, setFormDataA] = React.useState<any[]>([])
  const [formDataB, setFormDataB] = React.useState<any[]>([])

  // 配比
  const [formStat, setFormStat] = React.useState<any[]>([])

  // 固含
  const [formSolidA, setFormSolidA] = React.useState<any[]>([])
  const [formSolidB, setFormSolidB] = React.useState<any[]>([])
  const [formSolidMix, setFormSolidMix] = React.useState<any[]>([])

  // 底部表单数据配置
  const bottomFormConfig = [
    {
      title: '配方比重',
      items: [
        { label: '组分A的比重', value: formStat[0]?.density_a, unit: 'g/cm3' },
        { label: '组分B的比重', value: formStat[0]?.density_b, unit: 'g/cm3' },
        { label: '混合物的比重', value: formStat[0]?.density_mix, unit: 'g/cm3' }
      ]
    },
    {
      title: '配比',
      isSmall: true,
      items: [
        { label: '组分A的质量比', value: formStat[0]?.mass_ratio_a, unit: 'wt%' },
        { label: '组分B的质量比', value: formStat[0]?.mass_ratio_b, unit: 'wt%' },
        { label: '组分A的体积比', value: formStat[0]?.volume_ratio_a, unit: 'v%' },
        { label: '组分B的体积比', value: formStat[0]?.volume_ratio_b, unit: 'v%' }
      ]
    },
    {
      title: '配方价格',
      items: [
        { label: '组分A的价格', value: formStat[0]?.price_a, unit: 'RMB/kg' },
        { label: '组分B的价格', value: formStat[0]?.price_b, unit: 'RMB/kg' },
        { label: '配方的价格', value: formStat[0]?.price_mix, unit: 'RMB/kg' }
      ]
    },
    {
      title: '固含A',
      isSmall: true,
      items: [
        { label: '质量固含(wt%)', value: formSolidA[0]?.mass_fraction, unit: 'wt%' },
        { label: '体积固含(v%)', value: formSolidA[0]?.volume_fraction, unit: 'wt%' },
        { label: '组分A的体积比', value: formStat[0]?.volume_ratio_a, unit: 'v%' },
        { label: 'PVC', value: formSolidA[0]?.pvc, unit: 'v%' }
      ]
    },
    {
      title: '固含B',
      isSmall: true,
      items: [
        { label: '质量固含(wt%)', value: formSolidB[0]?.mass_fraction, unit: 'wt%' },
        { label: '体积固含(v%)', value: formSolidB[0]?.volume_fraction, unit: 'wt%' },
        { label: '组分A的体积比', value: formSolidB[0]?.volume_ratio_a, unit: 'v%' },
        { label: 'PVC', value: formSolidB[0]?.pvc, unit: 'v%' }
      ]
    },
    {
      title: '固含混合',
      isSmall: true,
      items: [
        { label: '质量固含(wt%)', value: formSolidMix[0]?.mass_fraction, unit: 'wt%' },
        { label: '体积固含(v%)', value: formSolidMix[0]?.volume_fraction, unit: 'wt%' },
        { label: '组分A的体积比', value: formSolidMix[0]?.volume_ratio_a, unit: 'v%' },
        { label: 'PVC', value: formSolidMix[0]?.pvc, unit: 'v%' }
      ]
    }
  ]

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // 初始化数据库连接
        await window.api.dataviz.initDb({
          host: 'localhost',
          user: 'root',
          password: 'root123',
          database: 'datatest',
          port: 3306,
          connectionLimit: 50
        })
        window.api.dataviz.getFormulaMaterials(1).then((rows: any[]) => {
          setFormDataA(rows.filter((r) => r.group_type === 'A'))
          setFormDataB(rows.filter((r) => r.group_type === 'B'))
        })
        window.api.dataviz.getFormulaStats(1).then((rows: any[]) => {
          setFormStat(rows)
        })
        window.api.dataviz.getFormulaSolids(1).then((rows: any[]) => {
          setFormSolidA(rows.filter((r) => r.solid_type === 'A'))
          setFormSolidB(rows.filter((r) => r.solid_type === 'B'))
          setFormSolidMix(rows.filter((r) => r.solid_type === 'MIX'))
        })
      } catch (error) {
        console.error('数据库操作失败:', error)
      }
    }
    loadData()
  }, [])

  return (
    <FormContainer>
      <ButtonContainer>
        {btnList.map((btn) => (
          <ButtonItem key={btn} $active={activeBtnName === btn} onClick={() => setActiveBtnName(btn)}>
            {btn}
          </ButtonItem>
        ))}
        <BottomButtonContainer>
          {bottomBtnList.map((btn) => (
            <ButtonItem key={btn} $active={activeBtnName === btn} onClick={() => setActiveBtnName(btn)}>
              {btn}
            </ButtonItem>
          ))}
        </BottomButtonContainer>
      </ButtonContainer>

      <FormContent>
        <TablesContainer>
          <FormItem>
            <FormTitle>组分A</FormTitle>
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
                  {formDataA.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material_code}</td>
                      <td>{item.material_desc}</td>
                      <td>{item.test_quality}</td>
                      <td>{item.quality_score}</td>
                      <td>{item.mix}</td>
                      <td>￥{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </FormTable>
            </TableWrapper>
          </FormItem>

          <FormItem>
            <FormTitle>组分B</FormTitle>
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
                  {formDataB.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material_code}</td>
                      <td>{item.material_desc}</td>
                      <td>{item.test_quality}</td>
                      <td>{item.quality_score}</td>
                      <td>{item.mix}</td>
                      <td>￥{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </FormTable>
            </TableWrapper>
          </FormItem>
        </TablesContainer>

        <BottomForm>
          {bottomFormConfig.map((config) => (
            <BottomFormItem key={config.title} className={config.isSmall ? 'smallForm' : ''}>
              <BottomFormTitle>{config.title}</BottomFormTitle>
              {config.items.map((item, itemIndex) => (
                <FormInfo key={itemIndex} $small={config.isSmall}>
                  <div title={item.label}>{item.label}</div>
                  <p title={String(item.value ?? '-')}>{item.value ?? '-'}</p>
                  <p title={item.unit}>{item.unit}</p>
                </FormInfo>
              ))}
            </BottomFormItem>
          ))}
          <div className="exportBtnCont">
            <IconWrapper>
              <ExportIcon />
            </IconWrapper>
          </div>
        </BottomForm>
      </FormContent>
    </FormContainer>
  )
}

const ExportIcon = () => (
  <svg viewBox="0 0 1024 1024" width="24" height="24">
    <path d="M889.6 104.7c-7.6 0-15.2 2.9-21 8.7L401.8 580.1c-11.6 11.6-11.6 30.4 0 42 5.8 5.8 13.4 8.7 21 8.7s15.2-2.9 21-8.7l466.7-466.7c11.6-11.6 11.6-30.4 0-42-5.7-5.8-13.3-8.7-20.9-8.7z"></path>
    <path d="M868.6 868.6H155.4V155.4h267.4c7.6 0 15.2-2.9 21-8.7 5.8-5.8 8.7-13.4 8.7-21s-2.9-15.2-8.7-21c-5.8-5.8-13.4-8.7-21-8.7H155.4C122.6 96 96 122.6 96 155.4v713.1c0 32.8 26.6 59.4 59.4 59.4h713.1c32.8 0 59.4-26.6 59.4-59.4V601.1c0-7.6-2.9-15.2-8.7-21-5.8-5.8-13.4-8.7-21-8.7s-15.2 2.9-21 8.7c-5.8 5.8-8.7 13.4-8.7 21v267.5zM868.6 96h-208c-7.6 0-15.2 2.9-21 8.7-5.8 5.8-8.7 13.4-8.7 21s2.9 15.2 8.7 21c5.8 5.8 13.4 8.7 21 8.7h208v208c0 7.6 2.9 15.2 8.7 21 5.8 5.8 13.4 8.7 21 8.7s15.2-2.9 21-8.7c5.8-5.8 8.7-13.4 8.7-21v-208c0-32.8-26.6-59.4-59.4-59.4z"></path>
  </svg>
)

// 样式组件
const FormContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`

const ButtonContainer = styled.div`
  width: 140px;
  height: 100%;
  box-sizing: border-box;
  padding: 24px 0;
  position: relative;
  background: white;
  border-right: 1px solid #cfcfcf;
`

const BottomButtonContainer = styled.div`
  position: absolute;
  bottom: 0;
  width: 140px;
`

const ButtonItem = styled.div<{ $active?: boolean }>`
  width: 110px;
  height: 40px;
  line-height: 35px;
  text-align: center;
  background: ${(p) => (p.$active ? '#81b337' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'inherit')};
  margin: 0 auto 20px;
  font-size: 16px;
  border-radius: 20px;
  border: 2px solid #d1d1d1;
  cursor: pointer;

  &:hover {
    background: #81b337;
    color: #fff;
  }

  &.smallForm {
    width: calc((50% - 40px) / 3);
  }
`

const FormContent = styled.div`
  width: calc(100% - 140px);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  font-size: 12px;
`

const TablesContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  background: white;
  margin-bottom: 138px; // 为底部表格留出空间
`

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
    }
  }
`

const BottomForm = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 138px;
  display: flex;

  .exportBtnCont {
    width: 40px;
    background: #fff;
    border: 1px solid #cfcfcf;
    font-size: 24px;
    text-align: center;
    padding-top: 90px;
    color: #828282;
  }
`

const BottomFormItem = styled.div`
  width: calc(50% / 3);
  height: 100%;
  border: 1px solid #cfcfcf;

  &.smallForm {
    width: calc((50% - 40px) / 3);
  }
`

const BottomFormTitle = styled.div`
  height: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
`

const FormInfo = styled.div<{ $small?: boolean }>`
  height: ${(p) => (p.$small ? 'calc(75% / 4)' : '25%')};
  display: flex;
  width: 100%;
  background: #fff;
  border-top: 1px solid #cfcfcf;

  div,
  p {
    flex: 1;
    min-width: 0; // 防止flex撑爆
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    text-align: center;

    overflow: hidden; // 超出隐藏
    text-overflow: ellipsis; // 超出显示...
    white-space: nowrap; // 不换行
  }

  div:first-child {
    flex: none;
    width: 50%;
  }

  p {
    width: 60px;
    display: flex;
    text-align: center;
    align-items: center;
    word-break: break-word;
    border-left: 1px solid #c5c5c5;
    padding-left: 6px;
  }
`
const IconWrapper = styled.div`
  cursor: pointer;
  color: #666;

  &:hover {
    color: #1890ff;
  }
`
export default HomeFormPage
