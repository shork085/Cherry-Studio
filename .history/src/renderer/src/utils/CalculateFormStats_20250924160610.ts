/*
  计算底部表单（配方比重、配比、固含等）的通用函数
  数据依据：resources/data/materialData.json 与 “计算2.0.txt” 描述

  约定：
  - 每个组分（A/B）以 100 g 计（质量分数 quality_score 为百分数，Σ≈100）。
  - materialData.json 提供四相密度 density.{binder,pigment,solvent,water}、四相质量占比 phasePct、当量 eqWeight.{eew,ahew,...}
  - 若当量为 0 或 ≤0，按 0 处理（该项不产生当量贡献）。
  - 质量分数（quality_score）已由数据库计算，我们直接使用。
*/

export type PhaseKey = 'binder' | 'pigment' | 'solvent' | 'water'

export interface MaterialDictEntry {
  champ: string
  density: Record<PhaseKey, number> // 各相密度
  eqWeight: {
    ahew: number
    eew: number
    hew: number
    iew: number
  }
  name: string
  phasePct: Record<PhaseKey, number> // 各相质量百分比（加总≈100）
  sap: string
}

export interface FormulaRow {
  // 用于在字典中匹配的编码（优先 champ，其次 sap，若两者皆无可考虑 material_desc 的近似匹配，当前版本仅 champ/sap）
  material_code?: string | number | null
  quality_score: number // 在本组分内的质量分数（%）
}

export interface GroupPhaseMassPct {
  binder: number
  pigment: number
  solvent: number
  water: number
}

export interface GroupVolumes {
  binder: number
  pigment: number
  solvent: number
  water: number
  total: number
}

export interface GroupComputed {
  // STEP1 汇总：分相质量分数（%）
  massPct: GroupPhaseMassPct
  // STEP2 体积（以 100 g 组分计，单位：体积的相对量，mL 等效）
  volumes: GroupVolumes
  // 比重（g/cm3），依据 ρ = 100 / totalVol
  density: number
  // STEP3 当量汇总与等价质量（EEM）
  eqSum: number // A: Σ(weight%/EEW)，B: Σ(weight%/AHEW)
  eem: number | null // 100/eqSum（>0）
}

export interface MixedComputed {
  // STEP4/5 混合质量配比（A_wt%/B_wt%）
  A_wt_pct: number
  B_wt_pct: number
  // STEP7 各相体积（混合后）与总体积、混合比重
  volumes: GroupVolumes & { totalA: number; totalB: number }
  density_mix: number
  // STEP6 固含质量分数（仅 binder+pigment）
  solids_wt_pct: number
  // STEP8 体积配比（按总湿体积）
  A_vol_pct: number
  B_vol_pct: number
}

export interface ComputeResult {
  groupA: GroupComputed
  groupB: GroupComputed
  mixed: MixedComputed
  // 页面底部直接使用的字段汇总
  view: {
    density_a: number
    density_b: number
    density_mix: number
    mass_ratio_a: number
    mass_ratio_b: number
    volume_ratio_a: number
    volume_ratio_b: number
    // 质量固含/体积固含（A/B/MIX）可按需求继续扩展
    solids_wt_a?: number
    solids_wt_b?: number
    solids_wt_mix?: number
    solids_vol_a?: number
    solids_vol_b?: number
    solids_vol_mix?: number
  }
}

function safeDiv(numerator: number, denominator: number): number {
  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) return 0
  return numerator / denominator
}

function findMaterial(dict: MaterialDictEntry[], materialCode?: string | number | null): MaterialDictEntry | undefined {
  if (materialCode == null) return undefined
  const codeStr = String(materialCode).trim()
  if (!codeStr) return undefined
  return (
    dict.find((m) => m.champ && String(m.champ).trim() === codeStr) ||
    dict.find((m) => m.sap && String(m.sap).trim() === codeStr)
  )
}

function accumulatePhaseMassPct(rows: FormulaRow[], dict: MaterialDictEntry[]): GroupPhaseMassPct {
  // binder_wt%_i = weight%_i × binder%_i / 100
  let binder = 0
  let pigment = 0
  let solvent = 0
  let water = 0

  for (const row of rows) {
    const wtPct = Number(row.quality_score) || 0
    const m = findMaterial(dict, row.material_code)
    const phase = m?.phasePct
    if (!phase) continue
    binder += wtPct * (Number(phase.binder) || 0) * 0.01
    pigment += wtPct * (Number(phase.pigment) || 0) * 0.01
    solvent += wtPct * (Number(phase.solvent) || 0) * 0.01
    water += wtPct * (Number(phase.water) || 0) * 0.01
  }

  return { binder, pigment, solvent, water }
}

function accumulateVolumes(rows: FormulaRow[], dict: MaterialDictEntry[], massPct: GroupPhaseMassPct): GroupVolumes {
  // v = m / ρ，四相分别汇总
  // 体积用近似“相对体积”（单位任意，只要一致即可）
  // 密度按各原料相对应密度，无法细分到原料粒度时，用相加权近似（此处采用直接基于相总质量与平均密度的近似）。

  // 计算各相的等效平均密度（用质量加权平均）。
  const acc = {
    binder: { mass: 0, vol: 0 },
    pigment: { mass: 0, vol: 0 },
    solvent: { mass: 0, vol: 0 },
    water: { mass: 0, vol: 0 }
  }

  for (const row of rows) {
    const wtPct = Number(row.quality_score) || 0
    const m = findMaterial(dict, row.material_code)
    if (!m) continue
    const phase = m.phasePct
    const dens = m.density
    // 各相质量（按每100 g 组分计）
    const mb = wtPct * (Number(phase.binder) || 0) * 0.01
    const mp = wtPct * (Number(phase.pigment) || 0) * 0.01
    const ms = wtPct * (Number(phase.solvent) || 0) * 0.01
    const mw = wtPct * (Number(phase.water) || 0) * 0.01
    // 体积 = m/ρ
    if (mb > 0) acc.binder.vol += safeDiv(mb, Number(dens.binder) || 0)
    if (mp > 0) acc.pigment.vol += safeDiv(mp, Number(dens.pigment) || 0)
    if (ms > 0) acc.solvent.vol += safeDiv(ms, Number(dens.solvent) || 0)
    if (mw > 0) acc.water.vol += safeDiv(mw, Number(dens.water) || 0)
    acc.binder.mass += mb
    acc.pigment.mass += mp
    acc.solvent.mass += ms
    acc.water.mass += mw
  }

  const binderVol = acc.binder.vol
  const pigmentVol = acc.pigment.vol
  const solventVol = acc.solvent.vol
  const waterVol = acc.water.vol
  const total = binderVol + pigmentVol + solventVol + waterVol
  return { binder: binderVol, pigment: pigmentVol, solvent: solventVol, water: waterVol, total }
}

function computeEqSum(rows: FormulaRow[], dict: MaterialDictEntry[], mode: 'A' | 'B'): number {
  // A端：eqA_sum = Σ(weight%_i / EEW_i)
  // B端：eqB_sum = Σ(weight%_i / AHEW_i)
  let sum = 0
  for (const row of rows) {
    const wtPct = Number(row.quality_score) || 0
    const m = findMaterial(dict, row.material_code)
    if (!m) continue
    const denom = mode === 'A' ? Number(m.eqWeight.eew) : Number(m.eqWeight.ahew)
    if (denom > 0) sum += safeDiv(wtPct, denom)
  }
  return sum
}

export function computeFormStats(
  formDataA: FormulaRow[],
  formDataB: FormulaRow[],
  materialDict: MaterialDictEntry[],
  stoichRatio: number // r：化学计量比
): ComputeResult {
  // A 端
  const massPctA = accumulatePhaseMassPct(formDataA, materialDict)
  const volumesA = accumulateVolumes(formDataA, materialDict, massPctA)
  const densityA = volumesA.total > 0 ? 100 / volumesA.total : 0
  const eqA = computeEqSum(formDataA, materialDict, 'A')
  const eemA = eqA > 0 ? 100 / eqA : null

  const groupA: GroupComputed = {
    massPct: massPctA,
    volumes: volumesA,
    density: densityA,
    eqSum: eqA,
    eem: eemA
  }

  // B 端
  const massPctB = accumulatePhaseMassPct(formDataB, materialDict)
  const volumesB = accumulateVolumes(formDataB, materialDict, massPctB)
  const densityB = volumesB.total > 0 ? 100 / volumesB.total : 0
  const eqB = computeEqSum(formDataB, materialDict, 'B')
  const eemB = eqB > 0 ? 100 / eqB : null

  const groupB: GroupComputed = {
    massPct: massPctB,
    volumes: volumesB,
    density: densityB,
    eqSum: eqB,
    eem: eemB
  }

  // STEP4：B克数/100g A（H）与 STEP5：混合质量配比
  const r = isFinite(stoichRatio) && stoichRatio > 0 ? stoichRatio : 1
  const H = eqB > 0 ? 100 * (safeDiv(eqA, eqB)) * r : 0
  const A_wt_pct = H > 0 ? (100 * 100) / (100 + H) : 100 // 如果无B当量，则全为A
  const B_wt_pct = H > 0 ? (100 * H) / (100 + H) : 0

  // STEP6：混合物四相质量分数（在整配方中）
  // A部分贡献 = A端相质量% × (A_wt_pct/100)
  const binder_wt_set_A = groupA.massPct.binder * (A_wt_pct / 100)
  const pigment_wt_set_A = groupA.massPct.pigment * (A_wt_pct / 100)
  const solvent_wt_set_A = groupA.massPct.solvent * (A_wt_pct / 100)
  const water_wt_set_A = groupA.massPct.water * (A_wt_pct / 100)

  // B部分贡献
  const binder_wt_set_B = groupB.massPct.binder * (B_wt_pct / 100)
  const pigment_wt_set_B = groupB.massPct.pigment * (B_wt_pct / 100)
  const solvent_wt_set_B = groupB.massPct.solvent * (B_wt_pct / 100)
  const water_wt_set_B = groupB.massPct.water * (B_wt_pct / 100)

  const solids_wt_set =
    binder_wt_set_A + pigment_wt_set_A +
    binder_wt_set_B + pigment_wt_set_B

  // STEP7：混合体积（用对应密度转换）
  // 为保持简洁，我们采用组分层面的体积按质量缩放：
  // totalVol_set_A ≈ volumesA.total × (A_wt_pct/100)
  // 更细可拆分到相级密度再算体积，这里已经在组分阶段做过体积换算，缩放足够近似
  const totalVol_set_A = groupA.volumes.total * (A_wt_pct / 100)
  const totalVol_set_B = groupB.volumes.total * (B_wt_pct / 100)
  const totalVol_mix = totalVol_set_A + totalVol_set_B
  const density_mix = totalVol_mix > 0 ? 100 / totalVol_mix : 0

  // STEP8：体积配比
  const A_vol_pct = totalVol_mix > 0 ? (totalVol_set_A * 100) / totalVol_mix : 0
  const B_vol_pct = totalVol_mix > 0 ? (totalVol_set_B * 100) / totalVol_mix : 0

  const mixed: MixedComputed = {
    A_wt_pct,
    B_wt_pct,
    volumes: {
      binder: 0, // 如需要可细分体积到各相；当前未使用，先置0
      pigment: 0,
      solvent: 0,
      water: 0,
      total: totalVol_mix,
      totalA: totalVol_set_A,
      totalB: totalVol_set_B
    },
    density_mix,
    solids_wt_pct: solids_wt_set,
    A_vol_pct,
    B_vol_pct
  }

  return {
    groupA,
    groupB,
    mixed,
    view: {
      density_a: groupA.density,
      density_b: groupB.density,
      density_mix: mixed.density_mix,
      mass_ratio_a: A_wt_pct, // 对应页面“组分A的质量比”
      mass_ratio_b: B_wt_pct,
      volume_ratio_a: A_vol_pct, // 对应页面“组分A的体积比”
      volume_ratio_b: B_vol_pct
    }
  }
}

export default {
  computeFormStats
}


