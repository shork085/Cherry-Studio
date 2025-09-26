/*
  计算函数实现（依据 z:\\home\\计算2.0.txt）
  设计目标：
  - 输入：
    - 组分A、B各自明细行（每100 g 基准，已给出质量分数 qualityScore%）
    - 物性字典（materialData.json）
    - 化学计量系数 r（用户输入）
    - B 端等当量字段选择（ahew/hew/iew，按体系选择）
  - 输出：
    - 组分内分相（binder/pigment/solvent/water）的质量百分比与体积分百分比
    - 组分A/B 密度
    - 当量汇总 eqA_sum / eqB_sum，及 H、A_wt%、B_wt%
    - 混合后体积分配与体积比 A_vol%、B_vol%
    - 混合密度与固含（质量固含、体积固含）
*/

export type PhaseKey = 'binder' | 'pigment' | 'solvent' | 'water'

export interface MaterialDictItem {
  champ?: string
  sap?: string
  name?: string
  phasePct: Record<PhaseKey, number> // 每个相的质量占比（%）
  density: Record<PhaseKey, number> // 每个相的密度
  eqWeight: {
    eew?: number // A 侧等当量（g/eq）
    ahew?: number // 胺氢等当量（B 侧常用）
    hew?: number // 羟值等当量（可选）
    iew?: number // 其它
  }
}

export interface GroupRow {
  // 数据库返回的单行原料。字段名根据现有表适配：
  material_code?: string // 原料代码（优先匹配 champ 或 sap）
  material_desc?: string
  quality_score?: number // 质量分数（%），在各自组分内，已由数据库计算
}

export interface ComputeOptions {
  // B 端等当量字段选择：'ahew' | 'hew' | 'iew'
  bEquivalentKey: keyof MaterialDictItem['eqWeight']
  // 水的密度（默认 1.0）
  waterDensity?: number
  // 自定义匹配函数：返回匹配到的物性条目索引
  resolver?: (row: GroupRow, dict: MaterialDictItem[]) => number | undefined
}

export interface GroupPhaseMassPct {
  binder: number
  pigment: number
  solvent: number
  water: number
}

export interface GroupPhaseVolumePct extends GroupPhaseMassPct {}

export interface GroupComputed {
  // 各相质量分（%）
  phaseMassPct: GroupPhaseMassPct
  // 各相体积分（%）
  phaseVolumePct: GroupPhaseVolumePct
  // 组分密度 ρ（g/cm3）
  density: number
  // 组分固含质量分（binder+pigment）
  solidsMassPct: number
}

export interface StoichComputed {
  eqA_sum: number
  eqB_sum: number
  EEM_A?: number
  EEM_B?: number
  H: number // 每 100 g A 所需的 B 克数
  A_wtPct: number
  B_wtPct: number
}

export interface MixComputed {
  // 以 A_wt% 和 B_wt% 与各自密度估算的混合体积分配
  A_volPct: number
  B_volPct: number
  // 混合密度（按总质量/总体积）
  density_mix: number
  // 混合体系质量固含（binder+pigment 的集合质量百分比）
  solids_wt_set: number
  // 混合体系体积固含（binder+pigment 的集合体积百分比）
  solids_vol_set: number
}

export interface FullComputedResult {
  groupA: GroupComputed
  groupB: GroupComputed
  stoich: StoichComputed
  mix: MixComputed
}

// 默认匹配：优先 champ==material_code，或 sap==material_code，或名称包含
export function defaultResolver(row: GroupRow, dict: MaterialDictItem[]): number | undefined {
  const code = (row.material_code || '').trim()
  const desc = (row.material_desc || '').trim()
  if (!code && !desc) return undefined
  const byChamp = dict.findIndex((m) => (m.champ || '').trim() === code)
  if (byChamp >= 0) return byChamp
  const bySap = dict.findIndex((m) => (m.sap || '').trim() === code)
  if (bySap >= 0) return bySap
  if (desc) {
    const byName = dict.findIndex((m) => (m.name || '').toLowerCase() === desc.toLowerCase())
    if (byName >= 0) return byName
  }
  return undefined
}

function clampPct(value: number): number {
  if (!isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + (isFinite(b) ? b : 0), 0)
}

function safe(val: number | undefined | null): number {
  return typeof val === 'number' && isFinite(val) ? val : 0
}

// STEP1：组分内各相质量百分比
export function computeGroupPhaseMassPct(
  rows: GroupRow[],
  dict: MaterialDictItem[],
  resolver: ComputeOptions['resolver']
): GroupPhaseMassPct {
  const mass: Record<PhaseKey, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  for (const r of rows) {
    const idx = resolver ? resolver(r, dict) : defaultResolver(r, dict)
    if (idx === undefined || idx < 0) continue
    const m = dict[idx]
    const wt = safe(r.quality_score) // 该原料在组分中的质量百分比
    mass.binder += (wt * safe(m.phasePct.binder)) / 100
    mass.pigment += (wt * safe(m.phasePct.pigment)) / 100
    mass.solvent += (wt * safe(m.phasePct.solvent)) / 100
    mass.water += (wt * safe(m.phasePct.water)) / 100
  }
  const total = sum([mass.binder, mass.pigment, mass.solvent, mass.water]) || 1
  return {
    binder: clampPct((mass.binder * 100) / total),
    pigment: clampPct((mass.pigment * 100) / total),
    solvent: clampPct((mass.solvent * 100) / total),
    water: clampPct((mass.water * 100) / total)
  }
}

// STEP2：分相体积、组分总体积与密度，以及分相体积分（%）
export function computeGroupVolumeAndDensity(
  rows: GroupRow[],
  dict: MaterialDictItem[],
  resolver: ComputeOptions['resolver'],
  waterDensity = 1.0
): { density: number; phaseVolumePct: GroupPhaseVolumePct } {
  // 将 100 g 组分质量按各原料的四相质量拆分为体积，再求和
const vol: Record<PhaseKey, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  for (const r of rows) {
    const idx = resolver ? resolver(r, dict) : defaultResolver(r, dict)
    if (idx === undefined || idx < 0) continue
    const m = dict[idx]
    const wt = safe(r.quality_score) // 每 100 g 组分内的该原料质量
    const binder_m = (wt * safe(m.phasePct.binder)) / 100
    const pigment_m = (wt * safe(m.phasePct.pigment)) / 100
    const solvent_m = (wt * safe(m.phasePct.solvent)) / 100
    const water_m = (wt * safe(m.phasePct.water)) / 100
    const rho_b = safe(m.density.binder) || 1
    const rho_p = safe(m.density.pigment) || 1
    const rho_s = safe(m.density.solvent) || 1
    const rho_w = safe(m.density.water) || waterDensity || 1
    vol.binder += binder_m / rho_b
    vol.pigment += pigment_m / rho_p
    vol.solvent += solvent_m / rho_s
    vol.water += water_m / rho_w
  }
  const totalVol = sum([vol.binder, vol.pigment, vol.solvent, vol.water]) || 1
  const density = 100 / totalVol // ρ = m / V，m=100g
  const phaseVolumePct: GroupPhaseVolumePct = {
    binder: clampPct((vol.binder * 100) / totalVol),
    pigment: clampPct((vol.pigment * 100) / totalVol),
    solvent: clampPct((vol.solvent * 100) / totalVol),
    water: clampPct((vol.water * 100) / totalVol)
  }
  return { density, phaseVolumePct }
}

// STEP3：当量汇总（A 端用 EEW，B 端用可配置等当量）
export function computeStoichiometry(
  rowsA: GroupRow[],
  rowsB: GroupRow[],
  dict: MaterialDictItem[],
  resolver: ComputeOptions['resolver'],
  bEquivalentKey: keyof MaterialDictItem['eqWeight'],
  r: number
): StoichComputed {
  let eqA_sum = 0
  let eqB_sum = 0
  for (const rA of rowsA) {
    const idx = resolver ? resolver(rA, dict) : defaultResolver(rA, dict)
    if (idx !== undefined && idx >= 0) {
      const m = dict[idx]
      const eew = safe(m.eqWeight.eew)
      const wt = safe(rA.quality_score)
      if (eew > 0) eqA_sum += wt / eew
    }
  }
  for (const rB of rowsB) {
    const idx = resolver ? resolver(rB, dict) : defaultResolver(rB, dict)
    if (idx !== undefined && idx >= 0) {
      const m = dict[idx]
      const heq = safe(m.eqWeight[bEquivalentKey])
      const wt = safe(rB.quality_score)
      if (heq > 0) eqB_sum += wt / heq
    }
  }

  let EEM_A: number | undefined
  let EEM_B: number | undefined
  if (eqA_sum > 0) EEM_A = 100 / eqA_sum
  if (eqB_sum > 0) EEM_B = 100 / eqB_sum

  // STEP4：每 100 g A 需要的 B 克数
  const H = eqB_sum > 0 ? 100 * (eqA_sum / eqB_sum) * (isFinite(r) ? r : 1) : 0
  // STEP5：混合质量配比
  const A_wtPct = (100 * 100) / (100 + H)
  const B_wtPct = 100 - A_wtPct

  return { eqA_sum, eqB_sum, EEM_A, EEM_B, H, A_wtPct, B_wtPct }
}

// 组分固含质量分（binder+pigment）
function computeSolidsMassPct(phaseMassPct: GroupPhaseMassPct): number {
  return clampPct(phaseMassPct.binder + phaseMassPct.pigment)
}

export function computeGroup(rows: GroupRow[], dict: MaterialDictItem[], options: ComputeOptions): GroupComputed {
  const { resolver = defaultResolver, waterDensity = 1.0 } = options
  const phaseMassPct = computeGroupPhaseMassPct(rows, dict, resolver)
  const { density, phaseVolumePct } = computeGroupVolumeAndDensity(rows, dict, resolver, waterDensity)
  const solidsMassPct = computeSolidsMassPct(phaseMassPct)
  return { phaseMassPct, phaseVolumePct, density, solidsMassPct }
}

// 混合体积分配与密度及固含（简化：用 A_wt%、B_wt% 与各自密度估算体积占比）
export function computeMix(groupA: GroupComputed, groupB: GroupComputed, stoich: StoichComputed): MixComputed {
  const massA = stoich.A_wtPct
  const massB = stoich.B_wtPct
  const volA = massA / (groupA.density || 1)
  const volB = massB / (groupB.density || 1)
  const totalVol = volA + volB || 1
  const A_volPct = clampPct((volA * 100) / totalVol)
  const B_volPct = 100 - A_volPct
  // 混合密度（按总质量：100，实际=100+H，但 A_wt%/B_wt% 已归一化为 100）
  const density_mix = 100 / totalVol
  // 质量固含集合（按 A/B 在整配方中的贡献）
  const solids_wt_set = clampPct(((groupA.solidsMassPct * massA + groupB.solidsMassPct * massB) / 100 / (massA + massB)) * 100)
  // 体积固含集合（按 A/B 各自固含体积分配；近似：用质量固含替代到体积层面会产生误差，这里简化为体积分=质量分在各自组分内与总体积占比乘积的线性组合）
  const solids_vol_set = clampPct(
    (groupA.phaseVolumePct.binder + groupA.phaseVolumePct.pigment) * (A_volPct / 100) +
      (groupB.phaseVolumePct.binder + groupB.phaseVolumePct.pigment) * (B_volPct / 100)
  )

  return { A_volPct, B_volPct, density_mix, solids_wt_set, solids_vol_set }
}

export function computeAll(
  rowsA: GroupRow[],
  rowsB: GroupRow[],
  dict: MaterialDictItem[],
  options: ComputeOptions,
  r: number
): FullComputedResult {
  const groupA = computeGroup(rowsA, dict, options)
  const groupB = computeGroup(rowsB, dict, options)
  const stoich = computeStoichiometry(
    rowsA,
    rowsB,
    dict,
    options.resolver || defaultResolver,
    options.bEquivalentKey,
    r
  )
  const mix = computeMix(groupA, groupB, stoich)
  return { groupA, groupB, stoich, mix }
}
// 导出便捷字段选择器（便于绑定 UI）
export function selectBottomFormValues(result: FullComputedResult) {
  return {
    density_a: result.groupA.density,
    density_b: result.groupB.density,
    density_mix: result.mix.density_mix,
    mass_ratio_a: result.stoich.A_wtPct,
    mass_ratio_b: result.stoich.B_wtPct,
    volume_ratio_a: result.mix.A_volPct,
    volume_ratio_b: result.mix.B_volPct,
    solids_wt_set: result.mix.solids_wt_set,
    solids_vol_set: result.mix.solids_vol_set
  }
}

