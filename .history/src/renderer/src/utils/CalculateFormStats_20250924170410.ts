import materialDictLocal from '../../../../resources/data/materialData.json'

export interface InputMaterialItem {
  material_code?: string
  material_desc?: string
  quality_score?: number
}

export interface DictMaterialItem {
  champ?: string
  sap?: string
  name: string
  density?: { binder?: number; pigment?: number; solvent?: number; water?: number }
  eqWeight?: { ahew?: number; eew?: number; hew?: number; iew?: number }
  phasePct?: { binder?: number; pigment?: number; solvent?: number; water?: number }
}

export interface ComputedFormStats {
  // 经过字典匹配后的明细，保留质量分数
  groupA: Array<InputMaterialItem & { dict?: DictMaterialItem; mass_fraction?: number }>
  groupB: Array<InputMaterialItem & { dict?: DictMaterialItem; mass_fraction?: number }>
  // 可选的汇总视图字段
  view: {
    density_a?: number
    density_b?: number
    density_mix?: number
    mass_ratio_a?: number
    mass_ratio_b?: number
    volume_ratio_a?: number
    volume_ratio_b?: number
  }
}

function normalizeString(value?: string): string {
  return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ')
}

function buildDictIndexes(dict: DictMaterialItem[]) {
  const bySap = new Map<string, DictMaterialItem>()
  const byChamp = new Map<string, DictMaterialItem>()
  const byName = new Map<string, DictMaterialItem>()

  dict.forEach((item) => {
    if (item?.sap) bySap.set(normalizeString(item.sap), item)
    if (item?.champ) byChamp.set(normalizeString(item.champ), item)
    if (item?.name) byName.set(normalizeString(item.name), item)
  })

  return { bySap, byChamp, byName }
}

function matchDictItem(
  row: InputMaterialItem,
  indexes: ReturnType<typeof buildDictIndexes>
): DictMaterialItem | undefined {
  const code = normalizeString(row.material_code)
  const name = normalizeString(row.material_desc)

  // 1) 先尝试用代码与字典中的 sap 或 champ 匹配
  if (code) {
    const bySap = indexes.bySap.get(code)
    if (bySap) return bySap
    const byChamp = indexes.byChamp.get(code)
    if (byChamp) return byChamp
  }

  // 2) 回退：用名称精确匹配字典的 name
  if (name) {
    const byName = indexes.byName.get(name)
    if (byName) return byName
  }

  // 3) 进一步回退：名称包含/被包含（简单模糊）
  if (name) {
    for (const [dictName, item] of indexes.byName.entries()) {
      if (dictName.includes(name) || name.includes(dictName)) return item
    }
  }

  return undefined
}

// 规范化质量分数：将 undefined/null/NaN 当作 0，并限制在 [0, 100]
function safeFraction(x: unknown): number {
  const v = Number(x)
  if (!isFinite(v) || isNaN(v)) return 0
  if (v < 0) return 0
  if (v > 100) return 100
  return v
}

// 导出主函数：与 HomeFormPage 中的签名保持兼容
export function computeFormStats(
  groupAInput: InputMaterialItem[] = [],
  groupBInput: InputMaterialItem[] = [],
  materialDictArg?: DictMaterialItem[] | any,
  stoichRatio: number = 1
): ComputedFormStats {
  // 防止未使用告警
  void stoichRatio

  // 使用本地引入的 materialDictLocal，若调用方传入字典则优先使用传入的
  const dict: DictMaterialItem[] =
    Array.isArray(materialDictArg) && materialDictArg.length > 0
      ? materialDictArg
      : (materialDictLocal as unknown as DictMaterialItem[])
  const indexes = buildDictIndexes(dict)

  // 计算 A/B 组中每条原料的匹配与质量分数
  const groupA = (groupAInput || []).map((row) => {
    const dictMatched = matchDictItem(row, indexes)
    return {
      ...row,
      dict: dictMatched,
      mass_fraction: safeFraction(row.quality_score)
    }
  })

  const groupB = (groupBInput || []).map((row) => {
    const dictMatched = matchDictItem(row, indexes)
    return {
      ...row,
      dict: dictMatched,
      mass_fraction: safeFraction(row.quality_score)
    }
  })

  // 汇总视图：此处仅占位，页面已有数据库回退，避免破坏现有逻辑
  // 如需在前端直接计算，可在此处基于字典与质量分数补全密度/配比等逻辑
  const view = {
    density_a: undefined,
    density_b: undefined,
    density_mix: undefined,
    mass_ratio_a: undefined,
    mass_ratio_b: undefined,
    volume_ratio_a: undefined,
    volume_ratio_b: undefined
  } as ComputedFormStats['view']

  return { groupA, groupB, view }
}

export default computeFormStats
