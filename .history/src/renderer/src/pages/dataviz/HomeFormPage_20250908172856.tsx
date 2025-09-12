import React from 'react'
import styled from 'styled-components'

const HomeFormPage: React.FC = () => {
  const [activeBtnName, setActiveBtnName] = React.useState('单组份')

  const btnList = ['单组份', '环氧', '聚氨酯']
  const bottomBtnList = ['配方导入', '配方导出', '记录配方', '历史记录']

  // const [formDataA, setFormDataA] = React.useState([
  //   {
  //     name: '08-038',
  //     desc: '60%601环氧树脂液',
  //     testQuality: '15.00',
  //     qualityScore: '9.55',
  //     mixQuality: '9.19',
  //     price: '￥17.00'
  //   },
  //   {
  //     name: '06-054',
  //     desc: 'D650防沉剂',
  //     testQuality: '0.25',
  //     qualityScore: '0.16',
  //     mixQuality: '0.15',
  //     price: '￥48.67'
  //   },
  //   {
  //     name: '06-003',
  //     desc: 'HF-140膨润土',
  //     testQuality: '1.25',
  //     qualityScore: '0.80',
  //     mixQuality: '0.77',
  //     price: '￥19.65'
  //   },
  //   {
  //     name: '06-120',
  //     desc: '防腐基料',
  //     testQuality: '77.50',
  //     qualityScore: '49.36',
  //     mixQuality: '47.46',
  //     price: '￥24.14'
  //   },
  //   {
  //     name: '08-025',
  //     desc: '2号混合溶剂',
  //     testQuality: '3.00',
  //     qualityScore: '1.91',
  //     mixQuality: '1.84',
  //     price: '￥7.00'
  //   },
  //   {
  //     name: '04-001',
  //     desc: '石油混合二甲苯',
  //     testQuality: '45.00',
  //     qualityScore: '28.66',
  //     mixQuality: '27.56',
  //     price: '￥6.11'
  //   },
  //   {
  //     name: '04-006',
  //     desc: '正丁醇',
  //     testQuality: '15.00',
  //     qualityScore: '9.55',
  //     mixQuality: '9.19',
  //     price: '￥6.73'
  //   },
  //   {
  //     name: '08-038',
  //     desc: '60%601环氧树脂液',
  //     testQuality: '15.00',
  //     qualityScore: '9.55',
  //     mixQuality: '9.19',
  //     price: '￥17.00'
  //   }
  // ])

  // const [formDataB, setFormDataB] = React.useState([
  //   {
  //     name: '04-001',
  //     desc: '石油混合二甲苯',
  //     testQuality: '45.00',
  //     qualityScore: '28.66',
  //     mixQuality: '27.56',
  //     price: '￥6.11'
  //   },
  //   {
  //     name: '04-006',
  //     desc: '正丁醇',
  //     testQuality: '15.00',
  //     qualityScore: '9.55',
  //     mixQuality: '9.19',
  //     price: '￥6.73'
  //   },
  //   {
  //     name: '02-174',
  //     desc: 'WSCM-41115环氧固化剂',
  //     testQuality: '40.00',
  //     qualityScore: '40.00',
  //     mixQuality: '1.54',
  //     price: '￥27.17'
  //   }
  // ])

  // 原料
  const [formDataA, setFormDataA] = React.useState<any[]>([])
  const [formDataB, setFormDataB] = React.useState<any[]>([])

  // 配比
  // const [fromDensity, setFromDensity] = React.useState<any[]>([])
  // const [formMassRatio, setFormMassRatio] = React.useState<any[]>([])
  // const [formPrice, setFormPrice] = React.useState<any[]>([])
  const [formStat, setFormStat] = React.useState<any[]>([])

  // 固含
  const [formSolidA, setFormSolidA] = React.useState<any[]>([])
  const [formSolidB, setFormSolidB] = React.useState<any[]>([])
  const [formSolidMix, setFormSolidMix] = React.useState<any[]>([])

  // React.useEffect(() => {
  //   const emptyRows = Array.from({ length: 50 }, () => ({
  //     name: '',
  //     desc: '',
  //     testQuality: '',
  //     qualityScore: '',
  //     mixQuality: '',
  //     price: ''
  //   }))

  //   // setFormDataA((prev) => [...prev, ...emptyRows])
  //   // setFormDataB((prev) => [...prev, ...emptyRows])
  // }, [])

  React.useEffect(() => {
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
          {/* 各种配比 */}
          <BottomFormItem>
            <BottomFormTitle>配方比重</BottomFormTitle>
            <FormInfo>
              <div title="组分A的比重">组分A的比重</div>
              <p title={String(formStat[0]?.density_a ?? '-')}>{formStat[0]?.density_a ?? '-'}</p>
              <p title="g/cm3">g/cm3</p>
            </FormInfo>
            <FormInfo>
              <div title="组分B的比重">组分B的比重</div>
              <p title={String(formStat[0]?.density_b ?? '-')}>{formStat[0]?.density_b ?? '-'}</p>
              <p title="g/cm3">g/cm3</p>
            </FormInfo>
            <FormInfo>
              <div title="混合物的比重">混合物的比重</div>
              <p title={String(formStat[0]?.density_mix ?? '-')}>{formStat[0]?.density_mix ?? '-'}</p>
              <p title="g/cm3">g/cm3</p>
            </FormInfo>
          </BottomFormItem>

          <BottomFormItem>
            <BottomFormTitle>配比</BottomFormTitle>
            <FormInfo $small>
              <div title="组分A的质量比">组分A的质量比</div>
              <p title={String(formStat[0]?.mass_ratio_a ?? '-')}>{formStat[0]?.mass_ratio_a ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="组分B的质量比">组分B的质量比</div>
              <p title={String(formStat[0]?.mass_ratio_b ?? '-')}>{formStat[0]?.mass_ratio_b ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="组分A的体积比">组分A的体积比</div>
              <p title={String(formStat[0]?.volume_ratio_a ?? '-')}>{formStat[0]?.volume_ratio_a ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="组分B的体积比">组分B的体积比</div>
              <p title={String(formStat[0]?.volume_ratio_b ?? '-')}>{formStat[0]?.volume_ratio_b ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
          </BottomFormItem>

          <BottomFormItem>
            <BottomFormTitle>配方价格</BottomFormTitle>
            <FormInfo>
              <div title="组分A的价格">组分A的价格</div>
              <p title={String(formStat[0]?.price_a ?? '-')}>{formStat[0]?.price_a ?? '-'}</p>
              <p title="RMB/kg">RMB/kg</p>
            </FormInfo>
            <FormInfo>
              <div title="组分B的价格">组分B的价格</div>
              <p title={String(formStat[0]?.price_b ?? '-')}>{formStat[0]?.price_b ?? '-'}</p>
              <p title="RMB/kg">RMB/kg</p>
            </FormInfo>
            <FormInfo>
              <div title="配方的价格">配方的价格</div>
              <p title={String(formStat[0]?.price_mix ?? '-')}>{formStat[0]?.price_mix ?? '-'}</p>
              <p title="RMB/kg">RMB/kg</p>
            </FormInfo>
          </BottomFormItem>

          {/* 各固含 */}
          <BottomFormItem className="smallForm">
            <BottomFormTitle>固含A</BottomFormTitle>
            <FormInfo $small>
              <div title="质量固含(wt%)">质量固含(wt%)</div>
              <p title={String(formSolidA[0]?.mass_fraction ?? '-')}>{formSolidA[0]?.mass_fraction ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="体积固含(v%)">体积固含(v%)</div>
              <p title={String(formSolidA[0]?.volume_fraction ?? '-')}>{formSolidA[0]?.volume_fraction ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="组分A的体积比">组分A的体积比</div>
              <p title={String(formStat[0]?.volume_ratio_a ?? '-')}>{formStat[0]?.volume_ratio_a ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="PVC">PVC</div>
              <p title={String(formSolidA[0]?.pvc ?? '-')}>{formSolidA[0]?.pvc ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
          </BottomFormItem>

          <BottomFormItem className="smallForm">
            <BottomFormTitle>固含B</BottomFormTitle>
            <FormInfo $small>
              <div title="质量固含(wt%)">质量固含(wt%)</div>
              <p title={String(formSolidB[0]?.mass_fraction ?? '-')}>{formSolidB[0]?.mass_fraction ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="体积固含(v%)">体积固含(v%)</div>
              <p title={String(formSolidB[0]?.volume_fraction ?? '-')}>{formSolidB[0]?.volume_fraction ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="组分A的体积比">组分A的体积比</div>
              <p title={String(formSolidB[0]?.volume_ratio_a ?? '-')}>{formSolidB[0]?.volume_ratio_a ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="PVC">PVC</div>
              <p title={String(formSolidB[0]?.pvc ?? '-')}>{formSolidB[0]?.pvc ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
          </BottomFormItem>

          <BottomFormItem className="smallForm">
            <BottomFormTitle>固含混合</BottomFormTitle>
            <FormInfo $small>
              <div title="质量固含(wt%)">质量固含(wt%)</div>
              <p title={String(formSolidMix[0]?.mass_fraction ?? '-')}>{formSolidMix[0]?.mass_fraction ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="体积固含(v%)">体积固含(v%)</div>
              <p title={String(formSolidMix[0]?.volume_fraction ?? '-')}>{formSolidMix[0]?.volume_fraction ?? '-'}</p>
              <p title="wt%">wt%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="组分A的体积比">组分A的体积比</div>
              <p title={String(formSolidMix[0]?.volume_ratio_a ?? '-')}>{formSolidMix[0]?.volume_ratio_a ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
            <FormInfo $small>
              <div title="PVC">PVC</div>
              <p title={String(formSolidMix[0]?.pvc ?? '-')}>{formSolidMix[0]?.pvc ?? '-'}</p>
              <p title="v%">v%</p>
            </FormInfo>
          </BottomFormItem>
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
