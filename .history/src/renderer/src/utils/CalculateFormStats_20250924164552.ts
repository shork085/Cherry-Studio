import { TableDataItem } from '@/components/DataVizChart/FormTableComponent'

import materialData from '../../../../../resources/data/materialData.json'

/**
 * 计算配方统计数据
 * @param formA 组分A原料数组
 * @param formB 组分B原料数组
 * @param stoichRatio 用户输入的化学计量比 (默认1)
 */
export function computeFormulaStats(formA: TableDataItem[], formB: TableDataItem[], stoichRatio: number = 1) {
  // ---- 1. 读取物性数据库 ----
  const db: Record<string, any> = materialData

  function getProps(code: string) {
    const rec = db[code]
    if (!rec) throw new Error(`原料 ${code} 缺少数据库定义`)
    return rec
  }

  // ---- 2. 计算单组分统计（类似Excel calculations） ----
  function computeSingle(form: TableDataItem[]) {
    let totalMass = 0
    let binderMass = 0,
      pigmentMass = 0,
      solventMass = 0,
      waterMass = 0
    let binderVol = 0,
      pigmentVol = 0,
      solventVol = 0,
      waterVol = 0
    let reactiveMass = 0,
      nonReactiveMass = 0
    let costSum = 0

    for (const item of form) {
      const props = getProps(item.material_code)
      const mass = item.test_quality ?? 0
      totalMass += mass

      // 分类
      if (props.class === 'binder') {
        binderMass += mass
        binderVol += mass / props.density
        if (props.reactive) {
          reactiveMass += mass
        } else {
          nonReactiveMass += mass
        }
      } else if (props.class === 'pigment') {
        pigmentMass += mass
        pigmentVol += mass / props.density
      } else if (props.class === 'solvent') {
        solventMass += mass
        solventVol += mass / props.density
      } else if (props.class === 'water') {
        waterMass += mass
        waterVol += mass / props.density
      }

      // 成本
      costSum += (mass / 1000) * (props.price ?? item.price ?? 0) // RMB/kg
    }

    const totalVol = binderVol + pigmentVol + solventVol + waterVol
    const density = totalMass / totalVol

    return {
      totalMass,
      totalVol,
      density,
      binder_wt: binderMass / totalMass,
      pigment_wt: pigmentMass / totalMass,
      solvent_wt: solventMass / totalMass,
      water_wt: waterMass / totalMass,
      binder_vol: binderVol / totalVol,
      pigment_vol: pigmentVol / totalVol,
      solvent_vol: solventVol / totalVol,
      water_vol: waterVol / totalVol,
      reactiveFraction: reactiveMass / totalMass,
      nonReactiveFraction: nonReactiveMass / totalMass,
      price: costSum / (totalMass / 1000) // RMB/kg
    }
  }

  const statA = computeSingle(formA)
  const statB = computeSingle(formB)

  // ---- 3. 混合物计算（带化学计量比） ----
  // base: A，hardener: B
  const massA = statA.totalMass
  const massB = statB.totalMass * stoichRatio

  const totalMass = massA + massB
  const volA = statA.totalVol
  const volB = statB.totalVol
  const totalVol = volA + volB

  const densityMix = totalMass / totalVol

  const massRatioA = massA / totalMass
  const massRatioB = massB / totalMass
  const volumeRatioA = volA / totalVol
  const volumeRatioB = volB / totalVol

  const priceMix = (statA.price * massA + statB.price * massB) / (totalMass / 1000)

  return {
    view: {
      density_a: statA.density,
      density_b: statB.density,
      density_mix: densityMix,
      mass_ratio_a: massRatioA,
      mass_ratio_b: massRatioB,
      volume_ratio_a: volumeRatioA,
      volume_ratio_b: volumeRatioB,
      price_a: statA.price,
      price_b: statB.price,
      price_mix: priceMix
    },
    reactive: {
      reactive_a: statA.reactiveFraction,
      reactive_b: statB.reactiveFraction,
      non_reactive_a: statA.nonReactiveFraction,
      non_reactive_b: statB.nonReactiveFraction
    }
  }
}
