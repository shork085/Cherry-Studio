import { computeFormStats } from '@renderer/utils/CalculateFormStats'
import React from 'react'
import styled from 'styled-components'

import materialDict from '../../../../../resources/data/materialData.json'
import FormTableComponent, { TableColumn, TableDataItem } from '../../components/DataVizChart/FormTableComponent'

// 使用打包期直接引入，避免 window.require 在渲染进程不可用导致字典为空

interface Props {
  searchKeyword?: string
  stoichRatio?: number
}
const HomeFormPage: React.FC<Props> = ({ searchKeyword = '', stoichRatio = 1 }) => {
  const [activeBtnName, setActiveBtnName] = React.useState('单组份')
  const [currentFormulaId, setCurrentFormulaId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSelectMenu, setShowSelectMenu] = React.useState(false)
  const [isMenuAnimating, setIsMenuAnimating] = React.useState(false)

  const [isRobotActive, setIsRobotActive] = React.useState(false)
  type RobotStatus = 'idle' | 'loading' | 'success' | 'active' | 'error'
  const [robotStatus, setRobotStatus] = React.useState<RobotStatus>('idle')
  const robotTimersRef = React.useRef<number[]>([])

  const clearRobotTimers = () => {
    robotTimersRef.current.forEach((t) => clearTimeout(t))
    robotTimersRef.current = []
  }

  React.useEffect(() => {
    return () => {
      clearRobotTimers()
    }
  }, [])

  const simulateRobotCompute = async () => {
    // 模拟计算耗时与结果，可替换为真实调用
    return new Promise<{ ok: boolean }>((resolve) => {
      const t = window.setTimeout(() => {
        // 80% 成功概率
        const ok = Math.random() < 0.8
        resolve({ ok })
      }, 3000)
      robotTimersRef.current.push(t)
    })
  }

  const handleRobotClick = async () => {
    // 若正在计算，忽略点击
    if (robotStatus === 'loading') return
    // 若处于激活状态则关闭
    if (robotStatus === 'active' || isRobotActive) {
      setIsRobotActive(false)
      setRobotStatus('idle')
      clearRobotTimers()
      return
    }

    // 开始计算
    setIsRobotActive(true)
    setRobotStatus('loading')
    try {
      const { ok } = await simulateRobotCompute()
      if (ok) {
        // 成功：短暂成功闪烁后进入常态激活
        setRobotStatus('success')
        const t1 = window.setTimeout(() => {
          setRobotStatus('active')
        }, 1000)
        robotTimersRef.current.push(t1)
      } else {
        // 失败：红色闪两下后回到未激活
        setRobotStatus('error')
        const t2 = window.setTimeout(() => {
          setIsRobotActive(false)
          setRobotStatus('idle')
        }, 800)
        robotTimersRef.current.push(t2)
      }
    } catch (e) {
      setRobotStatus('error')
      const t3 = window.setTimeout(() => {
        setIsRobotActive(false)
        setRobotStatus('idle')
      }, 800)
      robotTimersRef.current.push(t3)
    }
  }

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

  // 计算配方统计（优先计算，回退DB）
  const computedStats = React.useMemo(() => {
    try {
      const result = computeFormStats(
        (formDataA as any[]).map((r) => ({
          material_code: r.material_code ?? r.sap,
          quality_score: r.quality_score,
          material_desc: r.material_desc
        })),
        (formDataB as any[]).map((r) => ({
          material_code: r.material_code ?? r.sap,
          quality_score: r.quality_score,
          material_desc: r.material_desc
        })),
        materialDict as any,
        Number(stoichRatio) || 1
      )
      return result
    } catch {
      return undefined
    }
  }, [formDataA, formDataB, stoichRatio])

  // 底部表单数据配置
  const bottomFormConfig = [
    {
      title: '配方比重',
      items: [
        { label: '组分A的比重', value: computedStats?.view.density_a ?? formStat[0]?.density_a, unit: 'g/cm3' },
        { label: '组分B的比重', value: computedStats?.view.density_b ?? formStat[0]?.density_b, unit: 'g/cm3' },
        { label: '混合物的比重', value: computedStats?.view.density_mix ?? formStat[0]?.density_mix, unit: 'g/cm3' }
      ]
    },
    {
      title: '配比',
      isSmall: true,
      items: [
        {
          label: '组分A的质量比',
          value: computedStats?.view.mass_ratio_a ?? formStat[0]?.mass_ratio_a,
          unit: 'wt%'
        },
        {
          label: '组分B的质量比',
          value: computedStats?.view.mass_ratio_b ?? formStat[0]?.mass_ratio_b,
          unit: 'wt%'
        },
        {
          label: '组分A的体积比',
          value: computedStats?.view.volume_ratio_a ?? formStat[0]?.volume_ratio_a,
          unit: 'v%'
        },
        {
          label: '组分B的体积比',
          value: computedStats?.view.volume_ratio_b ?? formStat[0]?.volume_ratio_b,
          unit: 'v%'
        }
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
      title: '固含对比',
      isSolidTable: true,
      solidData: {
        headers: ['固含A', '固含B', '混合固含'],
        rows: [
          {
            label: '质量固含(wt%)',
            values: [
              computedStats?.solids.A.mass_fraction,
              computedStats?.solids.B.mass_fraction,
              computedStats?.solids.MIX.mass_fraction
            ],
            unit: 'wt%'
          },
          {
            label: '体积固含(v%)',
            values: [
              computedStats?.solids.A.volume_fraction,
              computedStats?.solids.B.volume_fraction,
              computedStats?.solids.MIX.volume_fraction
            ],
            unit: 'wt%'
          },
          {
            label: '体积比',
            values: [
              Number(computedStats?.phases.A.volumePct.pigment).toFixed(2),
              Number(computedStats?.phases.B.volumePct.pigment).toFixed(2),
              Number(computedStats?.phases.MIX.volumePct.pigment).toFixed(2)
            ],
            unit: 'v%'
          },
          {
            label: 'PVC',
            values: [computedStats?.solids.A.pvc, computedStats?.solids.B.pvc, computedStats?.solids.MIX.pvc],
            unit: 'v%'
          }
        ]
      }
    },
    {
      title: '反应/非反应',
      defaultSelected: false,
      isSolidTable: true,
      solidData: {
        headers: ['base', 'hardener', 'set'],
        rows: [
          {
            label: 'reactive',
            values: [
              computedStats?.reactivity.A.reactive_mass,
              computedStats?.reactivity.B.reactive_mass,
              computedStats?.reactivity.MIX.reactive_mass
            ]
          },
          {
            label: 'non reactive',
            values: [
              computedStats?.reactivity.A.nonreactive_mass,
              computedStats?.reactivity.B.nonreactive_mass,
              computedStats?.reactivity.MIX.nonreactive_mass
            ]
          },
          {
            label: 'total binder',
            values: [
              computedStats?.reactivity.A.binder_total,
              computedStats?.reactivity.B.binder_total,
              computedStats?.reactivity.MIX.binder_total
            ]
          }
        ]
      }
    },
    {
      title: 'ratio reactive / non reactive binder',
      defaultSelected: false,
      items: [
        { label: 'reactive', value: computedStats?.reactivity.MIX.reactive_pct },
        { label: 'non reactive', value: computedStats?.reactivity.MIX.nonreactive_pct }
      ]
    }
  ]

  // 悬浮菜单：多选项（与底部表单分组一致）
  const SELECTED_SECTIONS_STORAGE_KEY = 'dataviz:selectedSections'
  const [selectedSections, setSelectedSections] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    ;(bottomFormConfig || []).forEach((list) => {
      initial[list.title] = (list as any).defaultSelected ?? true
    })
    return initial
  })

  // 切换单个部分状态
  const toggleSection = (title: string) => {
    setSelectedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  // 从本地存储加载上次选择，并与当前分组合并（缺失默认 true）
  React.useEffect(() => {
    try {
      // 尝试从本地获取上次选择
      const raw = localStorage.getItem(SELECTED_SECTIONS_STORAGE_KEY)
      if (!raw) return
      // 将读取的字符串转换为js
      const parsed = JSON.parse(raw) as Record<string, boolean>
      if (!parsed || typeof parsed !== 'object') return

      const merged: Record<string, boolean> = {}
      // 合并，若本地存在此配置项，则使用本地配置，否则使用默认值 true
      bottomFormConfig.forEach((list) => {
        merged[list.title] = Object.prototype.hasOwnProperty.call(parsed, list.title)
          ? !!parsed[list.title]
          : ((list as any).defaultSelected ?? true)
      })
      setSelectedSections(merged)
    } catch {
      // 忽略解析错误
    }
  }, [])

  // 每次选择变化时保存到本地存储
  React.useEffect(() => {
    try {
      localStorage.setItem(SELECTED_SECTIONS_STORAGE_KEY, JSON.stringify(selectedSections))
    } catch {
      // 存储失败忽略
    }
  }, [selectedSections])

  // 全选/全不选
  const areAllSelected = React.useMemo(() => {
    return bottomFormConfig.every((list) => !!selectedSections[list.title])
  }, [bottomFormConfig, selectedSections])

  const setAllSelections = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    bottomFormConfig.forEach((list) => {
      next[list.title] = checked
    })
    setSelectedSections(next)
  }

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

  // 处理选择按钮的点击和鼠标事件
  const handleSelectBtnClick = () => {
    if (!showSelectMenu) {
      // 显示菜单
      setShowSelectMenu(true)
      // 使用 setTimeout 确保 DOM 更新后再触发动画
      setTimeout(() => {
        setIsMenuAnimating(true)
      }, 10)
    } else {
      // 隐藏菜单
      setIsMenuAnimating(false)
      setTimeout(() => {
        setShowSelectMenu(false)
      }, 200) // 等待动画完成
    }
  }

  const selectMenuRef = React.useRef<HTMLDivElement>(null)

  // 监听全局点击事件来关闭悬浮菜单
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (showSelectMenu && !selectMenuRef.current?.contains(e.target as Node)) {
        setIsMenuAnimating(false)
        setTimeout(() => {
          setShowSelectMenu(false)
        }, 200) // 等待动画完成
      }
    }

    document.addEventListener('mousedown', handleGlobalClick)

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick)
    }
  }, [showSelectMenu])

  // 数据加载
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
          {bottomFormConfig
            .filter((config) => !!selectedSections[config.title])
            .map((config) => (
              <BottomFormItem
                key={config.title}
                className={config.isSmall ? 'smallForm' : config.isSolidTable ? 'solidTable' : ''}>
                {!config.isSolidTable && <BottomFormTitle>{config.title}</BottomFormTitle>}
                {config.isSolidTable ? (
                  <SolidTableContainer>
                    <SolidTableHeader>
                      <div></div>
                      {config.solidData.headers.map((header, index) => (
                        <div key={index}>{header}</div>
                      ))}
                    </SolidTableHeader>
                    {config.solidData.rows.map((row, rowIndex) => (
                      <SolidTableRow key={rowIndex}>
                        <div title={row.label}>{row.label}</div>
                        {row.values.map((value, colIndex) => (
                          <div key={colIndex} title={String(value ?? '-')}>
                            {value ?? '-'}
                          </div>
                        ))}
                      </SolidTableRow>
                    ))}
                  </SolidTableContainer>
                ) : (
                  config.items?.map((item, itemIndex) => (
                    <FormInfo key={itemIndex} $small={config.isSmall}>
                      <div title={item.label}>{item.label}</div>
                      <p title={String(item.value ?? '-')}>{item.value ?? '-'}</p>
                      <p title={item.unit}>{item.unit}</p>
                    </FormInfo>
                  ))
                )}
              </BottomFormItem>
            ))}
          <div className="BtnCont">
            <IconWrapper
              title="使用大模型计算"
              onClick={handleRobotClick}
              $active={isRobotActive}
              $status={robotStatus}
              className={robotStatus === 'error' ? 'error' : robotStatus === 'success' ? 'success' : ''}>
              {robotStatus === 'loading' && <LoadingSpinnerIcon className="spinner" />}
              <RobotBtnIcon />
            </IconWrapper>
            <IconWrapper title="筛选" onClick={handleSelectBtnClick}>
              <SelectBtnIcon />
            </IconWrapper>
            <IconWrapper title="导出">
              <ExportIcon />
            </IconWrapper>
          </div>
        </BottomForm>

        {/* 悬浮选择菜单 */}
        {showSelectMenu && (
          <SelectMenuOverlay>
            <SelectMenu ref={selectMenuRef} $isAnimating={isMenuAnimating}>
              {bottomFormConfig.map((list) => (
                <SelectMenuCheckRow key={list.title}>
                  <input
                    type="checkbox"
                    checked={!!selectedSections[list.title]}
                    onChange={() => toggleSection(list.title)}
                  />
                  <span>{list.title}</span>
                </SelectMenuCheckRow>
              ))}
              <SelectMenuCheckRow className="span-all">
                <input type="checkbox" checked={areAllSelected} onChange={(e) => setAllSelections(e.target.checked)} />
                <span>全选</span>
              </SelectMenuCheckRow>
            </SelectMenu>
          </SelectMenuOverlay>
        )}
      </FormContent>
    </FormContainer>
  )
}

const ExportIcon = () => (
  <svg viewBox="0 0 1024 1024" width="26" height="26">
    <path d="M889.6 104.7c-7.6 0-15.2 2.9-21 8.7L401.8 580.1c-11.6 11.6-11.6 30.4 0 42 5.8 5.8 13.4 8.7 21 8.7s15.2-2.9 21-8.7l466.7-466.7c11.6-11.6 11.6-30.4 0-42-5.7-5.8-13.3-8.7-20.9-8.7z"></path>
    <path d="M868.6 868.6H155.4V155.4h267.4c7.6 0 15.2-2.9 21-8.7 5.8-5.8 8.7-13.4 8.7-21s-2.9-15.2-8.7-21c-5.8-5.8-13.4-8.7-21-8.7H155.4C122.6 96 96 122.6 96 155.4v713.1c0 32.8 26.6 59.4 59.4 59.4h713.1c32.8 0 59.4-26.6 59.4-59.4V601.1c0-7.6-2.9-15.2-8.7-21-5.8-5.8-13.4-8.7-21-8.7s-15.2 2.9-21 8.7c-5.8 5.8-8.7 13.4-8.7 21v267.5zM868.6 96h-208c-7.6 0-15.2 2.9-21 8.7-5.8 5.8-8.7 13.4-8.7 21s2.9 15.2 8.7 21c5.8 5.8 13.4 8.7 21 8.7h208v208c0 7.6 2.9 15.2 8.7 21 5.8 5.8 13.4 8.7 21 8.7s15.2-2.9 21-8.7c5.8-5.8 8.7-13.4 8.7-21v-208c0-32.8-26.6-59.4-59.4-59.4z"></path>
  </svg>
)

const SelectBtnIcon = () => (
  <svg viewBox="0 0 1024 1024" width="30" height="30">
    <path d="M917.333333 298.666667H362.666667c-10.666667 0-21.333333-8.533333-21.333334-21.333334v-42.666666c0-10.666667 8.533333-21.333333 21.333334-21.333334h554.666666c10.666667 0 21.333333 8.533333 21.333334 21.333334v42.666666c0 12.8-8.533333 21.333333-21.333334 21.333334zM917.333333 554.666667H362.666667c-10.666667 0-21.333333-8.533333-21.333334-21.333334v-42.666666c0-10.666667 8.533333-21.333333 21.333334-21.333334h554.666666c10.666667 0 21.333333 8.533333 21.333334 21.333334v42.666666c0 12.8-8.533333 21.333333-21.333334 21.333334zM917.333333 810.666667H362.666667c-10.666667 0-21.333333-8.533333-21.333334-21.333334v-42.666666c0-10.666667 8.533333-21.333333 21.333334-21.333334h554.666666c10.666667 0 21.333333 8.533333 21.333334 21.333334v42.666666c0 12.8-8.533333 21.333333-21.333334 21.333334zM213.333333 426.666667H128c-23.466667 0-42.666667 19.2-42.666667 42.666666v85.333334c0 23.466667 19.2 42.666667 42.666667 42.666666h85.333333c23.466667 0 42.666667-19.2 42.666667-42.666666v-85.333334c0-23.466667-19.2-42.666667-42.666667-42.666666z m0 128H128v-85.333334h85.333333v85.333334zM213.333333 682.666667H128c-23.466667 0-42.666667 19.2-42.666667 42.666666v85.333334c0 23.466667 19.2 42.666667 42.666667 42.666666h85.333333c23.466667 0 42.666667-19.2 42.666667-42.666666v-85.333334c0-23.466667-19.2-42.666667-42.666667-42.666666z m0 128H128v-85.333334h85.333333v85.333334zM157.866667 334.933333l-66.133334-55.466666c-4.266667-4.266667-4.266667-10.666667-2.133333-14.933334l17.066667-17.066666c4.266667-4.266667 10.666667-4.266667 14.933333-2.133334l42.666667 36.266667 98.133333-104.533333c4.266667-4.266667 10.666667-4.266667 14.933333 0l14.933334 14.933333c4.266667 4.266667 4.266667 10.666667 0 14.933333l-119.466667 128c-2.133333 4.266667-8.533333 4.266667-14.933333 0z"></path>
  </svg>
)

const RobotBtnIcon = () => (
  <svg viewBox="0 0 1024 1024" width="28" height="28">
    <path d="M576 85.333333c0 18.944-8.234667 35.968-21.333333 47.701334V213.333333h213.333333a128 128 0 0 1 128 128v426.666667a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128V341.333333a128 128 0 0 1 128-128h213.333333V133.034667A64 64 0 1 1 576 85.333333zM256 298.666667a42.666667 42.666667 0 0 0-42.666667 42.666666v426.666667a42.666667 42.666667 0 0 0 42.666667 42.666667h512a42.666667 42.666667 0 0 0 42.666667-42.666667V341.333333a42.666667 42.666667 0 0 0-42.666667-42.666666H256z m-170.666667 128H0v256h85.333333v-256z m853.333334 0h85.333333v256h-85.333333v-256zM384 618.666667a64 64 0 1 0 0-128 64 64 0 0 0 0 128z m256 0a64 64 0 1 0 0-128 64 64 0 0 0 0 128z"></path>
  </svg>
)

const LoadingSpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 50 50" width="26" height="26" style={{ position: 'absolute' }}>
    <circle cx="25" cy="25" r="20" stroke="#bfbfbf" strokeWidth="4" fill="none" opacity="0.35" />
    <path d="M45 25a20 20 0 0 1-20 20" stroke="#8c8c8c" strokeWidth="4" fill="none" strokeLinecap="round" />
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
  padding-right: 60px;

  .BtnCont {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 60px;
    background: #fff;
    border: 1px solid #cfcfcf;
    font-size: 24px;
    text-align: center;
    color: #828282;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 0;
  }
`

const BottomFormItem = styled.div`
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  border: 1px solid #cfcfcf;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.solidTable {
    flex: 2 1 0;
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
  height: ${(p) => (p.$small ? 'calc(75% / 4)' : 'calc(75% / 3)')};
  display: flex;
  width: 100%;
  background: #fff;
  border-top: 1px solid #cfcfcf;
  flex-shrink: 0; // 防止被压缩

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
const IconWrapper = styled.div<{ $active?: boolean; $status?: 'idle' | 'loading' | 'success' | 'active' | 'error' }>`
  cursor: pointer;
  color: ${(p) => (p.$status === 'error' ? '#ff4d4f' : p.$active ? '#52c41a' : '#666')};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  transition: color 0.2s ease-in-out;

  svg {
    fill: currentColor;
    transition: fill 0.2s ease-in-out;
  }
  svg path {
    fill: currentColor;
    transition: fill 0.2s ease-in-out;
  }

  &:hover {
    color: ${(p) => (p.$status === 'error' ? '#ff4d4f' : p.$active ? '#52c41a' : '#1890ff')};
  }

  .spinner {
    animation: rotate 1s linear infinite;
  }

  &.success {
    animation: successFlash 0.7s ease-in-out;
  }

  &.error {
    animation: errorFlash 0.8s ease-in-out 0s 1;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes successFlash {
    0% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.6);
    }
    100% {
      filter: brightness(1);
    }
  }

  @keyframes errorFlash {
    0%,
    100% {
      filter: brightness(1);
    }
    25% {
      filter: brightness(2);
    }
    50% {
      filter: brightness(1);
    }
    75% {
      filter: brightness(2);
    }
  }
`

// 悬浮菜单样式
const SelectMenuOverlay = styled.div`
  position: absolute;
  right: 0;
  bottom: 150px;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 20px;
  padding-right: 20px;
`

const SelectMenu = styled.div<{ $isAnimating: boolean }>`
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 260px;
  z-index: 1001;
  opacity: ${(props) => (props.$isAnimating ? '1' : '0')};
  transition: all 0.2s ease-in-out;
  display: grid;
  grid-template-columns: 1fr 1fr;
`

// 复选行
const SelectMenuCheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  input[type='checkbox'] {
    width: 14px;
    height: 14px;
  }

  span {
    font-size: 14px;
    color: #333;
  }

  &.span-all {
    grid-column: 1 / -1;
    border-top: 1px solid #f0f0f0;
  }
`

// 固含对比表格样式
const SolidTableContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
`

const SolidTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  height: 20%;
  background: #f5f5f5;
  border-bottom: 1px solid #cfcfcf;

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    text-align: center;
    font-weight: 600;
    border-right: 1px solid #cfcfcf;

    &:last-child {
      border-right: none;
    }
  }
`

const SolidTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  height: 20%;
  border-bottom: 1px solid #cfcfcf;

  &:last-child {
    border-bottom: none;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    text-align: center;
    border-right: 1px solid #cfcfcf;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:last-child {
      border-right: none;
    }

    &:first-child {
      font-weight: 500;
      background: #fafafa;
    }
  }
`

export default HomeFormPage
