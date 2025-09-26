// src/renderer/services/computeFormulaStats.ts
import materialData from '../../../../resources/data/materialData.json'
import { TableDataItem } from '../components/DataVizChart/FormTableComponent'

// 原料数据库中的定义
interface MaterialProperty {
  material_code: string
  density: number // g/cm³
  solid_content: number // wt%
  binder_fraction: number // 成膜物质量分数
  reactive_fraction: number // 反应性基团分数
  equivalent: number // 化学当量
  pigment_fraction: number // 颜料体积分数
}

// 计算结果
export interface FormulaStats {
  density_a: number
  density_b: number
  density_mix: number
  mass_ratio_a: number
  mass_ratio_b: number
  volume_ratio_a: number
  volume_ratio_b: number
  reactive_percent: number
  pvc_percent: number
  solid_a: number
  solid_b: number
  solid_mix: number
  price_a: number
  price_b: number
  price_mix: number
}

const materialMap: Record<string, MaterialProperty> = {}
;(materialData as MaterialProperty[]).forEach((m) => {
  materialMap[m.material_code] = m
})

// 小工具函数：求和
function sumGroup(rows: TableDataItem[]) {
  let mass = 0
  let vol = 0
  let eq = 0
  let binderMass = 0
  let reactiveMass = 0
  let pigmentVol = 0
  let price = 0

  rows.forEach((row) => {
    const props = materialMap[row.material_code]
    if (!props) return
    const m = row.test_quality // 测试质量
    const density = props.density

    mass += m
    vol += m / density
    eq += props.equivalent > 0 ? m / props.equivalent : 0

    binderMass += m * props.binder_fraction
    reactiveMass += m * props.reactive_fraction
    pigmentVol += (m * props.pigment_fraction) / density

    price += m * row.price
  })

  return { mass, vol, eq, binderMass, reactiveMass, pigmentVol, price }
}

// 主函数
export function computeFormulaStats(
  formDataA: TableDataItem[],
  formDataB: TableDataItem[],
  stoichRatio: number
): FormulaStats {
  const A = sumGroup(formDataA)
  const B = sumGroup(formDataB)

  // STEP4: 化学计量比 -> 每 100g A 需要的 B
  const H = B.eq > 0 ? 100 * (A.eq / B.eq) * stoichRatio : 0
  const m_A = 100
  const m_B = H
  const M = m_A + m_B

  // 密度
  const densityA = A.mass / A.vol
  const densityB = B.mass / B.vol
  const densityMix = (A.mass + B.mass) / (A.vol + B.vol)

  // 配比
  const mass_ratio_a = (m_A / M) * 100
  const mass_ratio_b = (m_B / M) * 100
  const volume_ratio_a = (A.vol / (A.vol + B.vol)) * 100
  const volume_ratio_b = (B.vol / (A.vol + B.vol)) * 100

  // 固含
  const solidA = A.binderMass
  const solidB = B.binderMass
  const solidMix = A.binderMass + B.binderMass

  // 反应性比例
  const reactiveMass = A.reactiveMass + B.reactiveMass
  const reactive_percent = solidMix > 0 ? (reactiveMass / solidMix) * 100 : 0

  // PVC
  const pigmentVol = A.pigmentVol + B.pigmentVol
  const binderVol = A.binderMass / densityA + B.binderMass / densityB
  const pvc_percent = binderVol > 0 ? (pigmentVol / binderVol) * 100 : 0

  // 价格 (单位质量平均价)
  const price_a = A.mass > 0 ? A.price / A.mass : 0
  const price_b = B.mass > 0 ? B.price / B.mass : 0
  const price_mix = (A.price + B.price) / (A.mass + B.mass)

  return {
    density_a: Number(densityA.toFixed(3)),
    density_b: Number(densityB.toFixed(3)),
    density_mix: Number(densityMix.toFixed(3)),
    mass_ratio_a: Number(mass_ratio_a.toFixed(2)),
    mass_ratio_b: Number(mass_ratio_b.toFixed(2)),
    volume_ratio_a: Number(volume_ratio_a.toFixed(2)),
    volume_ratio_b: Number(volume_ratio_b.toFixed(2)),
    reactive_percent: Number(reactive_percent.toFixed(2)),
    pvc_percent: Number(pvc_percent.toFixed(2)),
    solid_a: Number(solidA.toFixed(2)),
    solid_b: Number(solidB.toFixed(2)),
    solid_mix: Number(solidMix.toFixed(2)),
    price_a: Number(price_a.toFixed(2)),
    price_b: Number(price_b.toFixed(2)),
    price_mix: Number(price_mix.toFixed(2))
  }
}
