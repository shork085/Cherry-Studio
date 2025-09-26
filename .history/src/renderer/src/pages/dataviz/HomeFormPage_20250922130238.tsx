import React from 'react'
import styled from 'styled-components'

import FormTableComponent, { TableColumn, TableDataItem } from '../../components/DataVizChart/FormTableComponent'

interface Props {
  searchKeyword?: string
}
const HomeFormPage: React.FC<Props> = ({ searchKeyword = '' }) => {
  const [activeBtnName, setActiveBtnName] = React.useState('单组份')
  const [currentFormulaId, setCurrentFormulaId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const btnList = ['单组份', '环氧', '聚氨酯']
  const bottomBtnList = ['配方导入', '配方导出', '记录配方', '历史记录']

  // 原料
  const [formDataA, setFormDataA] = React.useState<any[]>([])
  const [formDataB, setFormDataB] = React.useState<any[]>([])

  // 配比
  const [formStat, setFormStat] = React.useState<any[]>([])

  // 固含
  const [formSolidA, setFormSolidA] = React.useState<any[]>([])
  const [formSolidB, setFormSolidB] = React.useState<any[]>([])
  const [formSolidMix, setFormSolidMix] = React.useState<any[]>([])

  // 表格列配置
  const tableColumns: TableColumn[] = [
    { key: 'material_code', label: '原料代码', editable: true },
    { key: 'material_desc', label: '原料描述', width: '260px' },
    { key: 'test_quality', label: '测试质量', editable: true },
    { key: 'quality_score', label: '质量分数%' },
    { key: 'mix', label: '混合后%' },
    { key: 'price', label: '参考价' }
  ]

  // 关键字过滤
  const filterByKeyword = (data: any[], keyword: string) => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return data as TableDataItem[]

    return (data as TableDataItem[]).filter(
      (item) =>
        `${item.material_code ?? ''}`.toLowerCase().includes(kw) ||
        `${item.material_desc ?? ''}`.toLowerCase().includes(kw)
    )
  }

  // 修改后的过滤逻辑
  const filteredFormDataA = React.useMemo(() => filterByKeyword(formDataA, searchKeyword), [formDataA, searchKeyword])
  const filteredFormDataB = React.useMemo(() => filterByKeyword(formDataB, searchKeyword), [formDataB, searchKeyword])

  // 表格数据配置（使用过滤后的数据）
  const tableData = [
    { title: '组分A', data: filteredFormDataA },
    { title: '组分B', data: filteredFormDataB }
  ]

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

  // 加载函数
  const loadFormulaData = async (formulaId: number) => {
    try {
      setIsLoading(true)
      const rows = await window.api.dataviz.getFormulaMaterials(formulaId)
      setFormDataA(rows.filter((row: any) => row.group_type === 'A'))
      setFormDataB(rows.filter((row: any) => row.group_type === 'B'))

      const stats = await window.api.dataviz.getFormulaStats(formulaId)
      setFormStat(stats)

      const solids = await window.api.dataviz.getFormulaSolids(formulaId)
      setFormSolidA(solids.filter((row: any) => row.solid_type === 'A'))
      setFormSolidB(solids.filter((row: any) => row.solid_type === 'B'))
      setFormSolidMix(solids.filter((row: any) => row.solid_type === 'MIX'))
    } catch (error) {
      console.error('配方加载失败', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理配方类型切换
  const handleFormulaChange = React.useCallback(async (typeName: string) => {
    setActiveBtnName(typeName)
    try {
      const formulaId = await window.api.dataviz.getFormulaIdByType(typeName)
      if (formulaId) {
        setCurrentFormulaId(formulaId)
        await loadFormulaData(formulaId)
      } else {
        console.log('未找到配方', typeName)
      }
    } catch (error) {
      console.error('配方加载失败', error)
    }
  }, [])

  // 更新单个原料记录
  const updateMaterialRecord = (id: number, updates: Partial<TableDataItem>) => {
    setFormDataA((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    setFormDataB((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  // 更新整个组分的数据
  const updateGroupData = (groupType: string, updatedData: any[]) => {
    if (groupType === 'A') {
      setFormDataA(updatedData)
    } else {
      setFormDataB(updatedData)
    }
  }

  // 处理测试质量更新
  const handleTestQualityChange = async (item: any, newValue: number) => {
    if (!currentFormulaId) return

    try {
      // setIsLoading(true)
      // if (!item.id) {
      //   throw new Error('原料信息不完整，无法更新')
      // }

      // 乐观更新UI
      updateMaterialRecord(item.id, { test_quality: newValue })
      // 获取当前版本号
      const currentVersion = await window.api.dataviz.getMaterialVersionByRowId(item.id)

      if (currentVersion === null) {
        throw new Error('无法获取原料版本信息')
      }
      // 更新测试质量
      await window.api.dataviz.updateMaterialTestQuality(item.id, newValue, currentVersion)

      const rows = await window.api.dataviz.getFormulaMaterials(currentFormulaId)
      const groupData = rows.filter((row: any) => row.group_type === item.group_type)

      // 重新加载配方数据以获取更新后的质量分数
      // await loadFormulaData(currentFormulaId)

      updateGroupData(item.group_type, groupData)
    } catch (error: any) {
      console.error('更新测试质量失败:', error)
      // 回滚UI更新
      updateMaterialRecord(item.id, { test_quality: item.test_quality })
      alert(error.message || '更新失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理原料代码更新
  const handleMaterialCodeChange = async (item: any, newCode: string) => {
    if (!currentFormulaId) return false
    try {
      // 不使用全局loading，避免遮挡输入
      if (!item.id) {
        console.warn('原料信息不完整，无法更新')
        return false
      }
      // 获取当前版本号
      const currentVersion = await window.api.dataviz.getMaterialVersionByRowId(item.id)

      if (currentVersion == null) {
        console.warn('无法获取原料版本信息')
        return false
      }

      // 调用更新原料代码的存储过程
      await window.api.dataviz.updateMaterialCode(item.id, newCode, currentVersion)

      // 刷新数据，确保描述与其它信息同步变更
      const rows = await window.api.dataviz.getFormulaMaterials(currentFormulaId)
      const groupData = rows.filter((row: any) => row.group_type === item.group_type)
      updateGroupData(item.group_type, groupData)

      return true
    } catch (error: any) {
      console.error('更新原料代码失败:', error)
      // 返回 false 让单元格内联错误提示接管
      return false
    }
  }

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

        await handleFormulaChange('单组份')
      } catch (error) {
        console.error('数据库操作失败:', error)
      }
    }
    loadData()
  }, [handleFormulaChange])

  return (
    <FormContainer>
      <ButtonContainer>
        {btnList.map((btn) => (
          <ButtonItem
            key={btn}
            $active={activeBtnName === btn}
            onClick={() => {
              setActiveBtnName(btn)
              handleFormulaChange(btn)
            }}>
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
        {isLoading && <LoadingOverlay>加载中...</LoadingOverlay>}
        <TablesContainer>
          {tableData.map((table) => (
            <FormTableComponent
              key={table.title}
              title={table.title}
              data={table.data}
              columns={tableColumns}
              onTestQualityChange={handleTestQualityChange}
              onMaterialCodeChange={handleMaterialCodeChange}
            />
          ))}
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
          <div className="BtnCont">
            <TopButton onClick={() => console.log('顶部按钮点击')}>
              顶部按钮
            </TopButton>
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
  border-top-left-radius: 10px;
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-size: 18px;
  color: #333;
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

const BottomForm = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 138px;
  display: flex;

  .BtnCont {
    width: 55px;
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
const TopButton = styled.button`
  width: 100%;
  height: 30px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #40a9ff;
  }

  &:active {
    background: #096dd9;
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
