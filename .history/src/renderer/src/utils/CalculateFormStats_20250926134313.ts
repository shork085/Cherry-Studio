export type Phase = 'binder' | 'pigment' | 'solvent' | 'water'

// 物料字典结构
export interface DictMaterial {
  sap?: string //编码
  champ?: string //代码
  name: string //名称
  phasePct: Record<Phase, number> //四相质量占比（%）
  density: Record<Phase, number | null>
  /*反应当量EEM base
   eew:环氧当量，A组分用
   ahew:胺当量，B组分用
   iew:异氰酸酯当量
   hew：羟基当量
  */
  eqWeight: { eew?: number | null; ahew?: number | null; iew?: number | null; hew?: number | null }
}

// 页面输入
export interface ComputeInputRow {
  material_code: string
  quality_score: number // 质量分数weight%_i
  material_desc?: string
}

export type SystemType = '单组份' | '环氧' | '聚氨酯'

// 返回值结构
export interface ComputeResult {
  view: {
    density_a: number | null //组分A的比重density comp. A
    density_b: number | null
    density_mix: number | null // 混合比重density set
    mass_ratio_a: number // 组分A的质量比（mixing ratio by weight）
    mass_ratio_b: number
    volume_ratio_a: number // 组分A的体积比（mixing ratio by volume）
    volume_ratio_b: number
  }
  // 固含，mass_fraction质量固含，volume_fraction体积固含，pvc含量
  solids: {
    A: { mass_fraction: number; volume_fraction: number; pvc: number | null }
    B: { mass_fraction: number; volume_fraction: number; pvc: number | null }
    MIX: { mass_fraction: number; volume_fraction: number; pvc: number | null }
  }
  // equivalent weight reactive material，体系与等当量信息。
  meta: {
    system: SystemType
    effEqA: { eew?: number | null; hew?: number | null }
    effEqB: { ahew?: number | null; iew?: number | null }
    errors: string[]
  }
  phases: {
    A: { volumePct: { binder: number; pigment: number; solvent: number; water: number } }
    B: { volumePct: { binder: number; pigment: number; solvent: number; water: number } }
    MIX: { volumePct: { binder: number; pigment: number; solvent: number; water: number } }
  }
  reactivity: {
    A: {
      reactive_binder_wt_set: number // binder的反应性
      non_reactive_binder_wt_set: number // 非反应性binder
    }
    B: {
      reactive_binder_wt_set: number // hardener的反应性
      non_reactive_binder_wt_set: number
    }
    MIX: {
      reactive_binder_wt_set: number
      non_reactive_binder_wt_set: number
      total_binder_wt_set: number
      reactive_pct_in_binder: number // reactive_set / total_binder_set × 100
      non_reactive_pct_in_binder: number //on_reactive_set / total_binder_set × 100
      ratio_reactive_to_nonreactive: number | null
    }
  }
}

// ---------- 计算混合体系 ----------
export function computeFormStats(
  rowsA: ComputeInputRow[],
  rowsB: ComputeInputRow[],
  materialDict: DictMaterial[],
  stoichRatio = 1, //未输入时化学计量比默认为1
  systemType?: SystemType // 体系类型；
): ComputeResult {
  // 字典索引，原料表对照物性表，物料快速查找
  const index = buildIndex(materialDict)

  // 分别计算A/B的组分统计
  const gmA = computeGroup(rowsA, index)
  const gmB = computeGroup(rowsB, index)

  /*识别体系（除非显式传入）
    若未显式指定体系，则判断：
    A有eew且B有ahew=>环氧
    A有hew且B有iew=>聚氨酯
    否则为单组份
  */
  const system: SystemType =
    systemType || (gmA.effEq.eew && gmB.effEq.ahew ? '环氧' : gmA.effEq.hew && gmB.effEq.iew ? '聚氨酯' : '单组份')

  // ----------- 计算组分A/B质量比(mixing ratio by weight) & 配比 --------------

  let wtA = 100
  let wtB = 0
  const errors: string[] = []

  if (system !== '单组份') {
    const EEM_A = system === '环氧' ? gmA.effEq.eew : gmA.effEq.hew
    const EEM_B = system === '环氧' ? gmB.effEq.ahew : gmB.effEq.iew
    if (!EEM_A || !EEM_B) {
      errors.push('缺少等当量（回退为单组份）')
    } else {
      // hardener/100g base
      // H = (100 / EEM_A) × EEM_B × r
      const H = (100 / EEM_A) * EEM_B * (Number(stoichRatio) || 1)
      wtA = (100 * 100) / (100 + H)
      wtB = (100 * H) / (100 + H)
    }
  }

  // ------------ 计算混合后性质 ------------

  const vA_abs = gmA.volPer100g * (wtA / 100) //total volume base in set
  const vB_abs = gmB.volPer100g * (wtB / 100) //total volume hardener in set
  const vSum = vA_abs + vB_abs

  // 计算配比表中组分A/B的体积比
  const volume_ratio_a = vSum > 0 ? (vA_abs / vSum) * 100 : 0 //volume % base in set
  const volume_ratio_b = vSum > 0 ? (vB_abs / vSum) * 100 : 0
  // 混合密度（配方总质量归一化为100g）
  const density_mix = vSum > 0 ? 100 / vSum : null

  //  ------------ 固含与PVC计算 ------------

  // 混合后的质量分配（wt%）weight % base
  const setMassPct = mixMassPct({ wA: wtA, wB: wtB }, gmA.massPctByPhase, gmB.massPctByPhase)

  // 固含混合的质量固含 binder_wt% + pigment_wt%
  const setMassSolidsPct = setMassPct.binder + setMassPct.pigment

  // 固含对比表中的体积比，也就是说涂料(volume pigments) vol% pigment comp/set
  const setVolumePct = mixVolumePct({ wA: wtA, wB: wtB }, gmA.volPer100gByPhase, gmB.volPer100gByPhase)

  // 固含对比表中的体积固含(volume solids) vol% pigment+binder comp/set
  const setVolSolidsPct = setVolumePct.binder + setVolumePct.pigment

  // PVC=vol%_solids/wt%_solids 涂料在固体中的占比
  const setPVC =
    setVolumePct.binder + setVolumePct.pigment > 0
      ? (setVolumePct.pigment / (setVolumePct.binder + setVolumePct.pigment)) * 100
      : null

  // 组分A/B的 weight% binder set
  const binder_wt_set_A = (gmA.massPctByPhase.binder || 0) * (wtA / 100)
  const binder_wt_set_B = (gmB.massPctByPhase.binder || 0) * (wtB / 100)
  // 依据体系选择“哪种 eq 表示反应性”
  type EqKey = 'eew' | 'hew' | 'ahew' | 'iew'
  const keyA: EqKey | null = system === '环氧' ? 'eew' : system === '聚氨酯' ? 'hew' : null
  const keyB: EqKey | null = system === '环氧' ? 'ahew' : system === '聚氨酯' ? 'iew' : null

  // 在这里reactiveBinderMassByEq是某组分中总的gew% binder
  const reactive_binder_wt_set_A = keyA ? (gmA.reactiveBinderMassByEq[keyA] || 0) * (wtA / 100) : 0
  const reactive_binder_wt_set_B = keyB ? (gmB.reactiveBinderMassByEq[keyB] || 0) * (wtB / 100) : 0

  // 非反应性 binder 质量
  const non_reactive_binder_wt_set_A = Math.max(binder_wt_set_A - reactive_binder_wt_set_A, 0)
  const non_reactive_binder_wt_set_B = Math.max(binder_wt_set_B - reactive_binder_wt_set_B, 0)

  // 汇总到 set
  const reactive_binder_wt_set = reactive_binder_wt_set_A + reactive_binder_wt_set_B
  const non_reactive_binder_wt_set = non_reactive_binder_wt_set_A + non_reactive_binder_wt_set_B
  const total_binder_wt_set = setMassPct.binder || 0

  const reactive_pct_in_binder = total_binder_wt_set > 0 ? (reactive_binder_wt_set / total_binder_wt_set) * 100 : 0
  const non_reactive_pct_in_binder =
    total_binder_wt_set > 0 ? (non_reactive_binder_wt_set / total_binder_wt_set) * 100 : 0
  // const ratio_reactive_to_nonreactive =
  //   non_reactive_binder_wt_set > 0 ? reactive_binder_wt_set / non_reactive_binder_wt_set : null

  return {
    view: {
      density_a: round(gmA.density, 4),
      density_b: round(gmB.density, 4),
      density_mix: round(density_mix, 4),
      mass_ratio_a: wtA,
      mass_ratio_b: wtB,
      volume_ratio_a: volume_ratio_a,
      volume_ratio_b: volume_ratio_b
    },
    solids: {
      A: {
        mass_fraction: gmA.massSolidsPct,
        volume_fraction: gmA.volSolidsPct,
        pvc: gmA.pvcPct != null ? round(gmA.pvcPct, 2) : null
      },
      B: {
        mass_fraction: gmB.massSolidsPct,
        volume_fraction: gmB.volSolidsPct,
        pvc: gmB.pvcPct != null ? round(gmB.pvcPct, 2) : null
      },
      MIX: {
        mass_fraction: setMassSolidsPct,
        volume_fraction: setVolSolidsPct,
        pvc: setPVC != null ? round(setPVC, 2) : null
      }
    },
    meta: {
      system,
      effEqA: { eew: gmA.effEq.eew, hew: gmA.effEq.hew },
      effEqB: { ahew: gmB.effEq.ahew, iew: gmB.effEq.iew },
      errors
    },
    phases: {
      A: { volumePct: gmA.volPctByPhase },
      B: { volumePct: gmB.volPctByPhase },
      MIX: { volumePct: setVolumePct }
    },
    reactivity: {
      A: {
        reactive_binder_wt_set: round(reactive_binder_wt_set_A, 2) || 0,
        non_reactive_binder_wt_set: round(non_reactive_binder_wt_set_A, 2) || 0
      },
      B: {
        reactive_binder_wt_set: round(reactive_binder_wt_set_B, 2) || 0,
        non_reactive_binder_wt_set: round(non_reactive_binder_wt_set_B, 2) || 0
      },
      MIX: {
        reactive_binder_wt_set: round(reactive_binder_wt_set, 2) || 0,
        non_reactive_binder_wt_set: round(non_reactive_binder_wt_set, 2) || 0,
        total_binder_wt_set: round(total_binder_wt_set, 2) || 0,
        reactive_pct_in_binder: round(reactive_pct_in_binder, 2) || 0,
        non_reactive_pct_in_binder: round(non_reactive_pct_in_binder, 2) || 0
        // ratio_reactive_to_nonreactive:
        //   ratio_reactive_to_nonreactive != null ? round(ratio_reactive_to_nonreactive, 2) : null
      }
    }
  }
}

// ---------- 单个组分计算 ----------

function computeGroup(rows: ComputeInputRow[], index: ReturnType<typeof buildIndex>) {
  const phases: Phase[] = ['binder', 'pigment', 'solvent', 'water']
  // 把 quality_score质量分数求和，总质量≈100
  const totalGew = clampPositive(rows.reduce((s, r) => s + (Number(r.quality_score) || 0), 0))

  // 四相的gew%
  const reactiveBinderMassByEq = { eew: 0, hew: 0, ahew: 0, iew: 0 }

  if (totalGew <= 0) return emptyGroup()

  // 四个相的质量、体积
  const massByPhase: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  const volByPhase: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }

  // 等当量并联合并：H = 100 / sum(wi_norm/eq_i)
  let epoxyEqPer100g = 0
  let amineEqPer100g = 0
  let isoEqPer100g = 0
  let ohEqPer100g = 0

  for (const r of rows) {
    const m = index.get(r.material_code)
    const wi_norm = ((Number(r.quality_score) || 0) / totalGew) * 100 // 归一到“每100g组分”

    if (!m || wi_norm <= 0) continue

    // 计算各相的质量：质量分数*相占比
    for (const p of phases) {
      const pct = (m.phasePct?.[p] || 0) / 100
      const pmass = wi_norm * pct // gew% xxx = wt% comp * %xxx
      massByPhase[p] += pmass

      // 计算体积
      const d = sanitizeDensity(m.density?.[p], pct) // 密度
      if (pmass > 0 && d) volByPhase[p] += pmass / d

      // 对 binder 的反应性质量分类
      if (p === 'binder' && pmass > 0) {
        const eew = normalizeEq(m.eqWeight?.eew)
        const hew = normalizeEq(m.eqWeight?.hew)
        const ahew = normalizeEq(m.eqWeight?.ahew)
        const iew = normalizeEq(m.eqWeight?.iew)
        if (eew) reactiveBinderMassByEq.eew += pmass
        if (hew) reactiveBinderMassByEq.hew += pmass
        if (ahew) reactiveBinderMassByEq.ahew += pmass
        if (iew) reactiveBinderMassByEq.iew += pmass
      }
    }
    // 等当量（取绝对值、忽略0/空）
    const eew = normalizeEq(m.eqWeight?.eew)
    const ahew = normalizeEq(m.eqWeight?.ahew)
    const iew = normalizeEq(m.eqWeight?.iew)
    const hew = normalizeEq(m.eqWeight?.hew)

    // 计算等当量：weight%_i / EEW_i
    if (eew) epoxyEqPer100g += wi_norm / eew
    if (ahew) amineEqPer100g += wi_norm / ahew
    if (iew) isoEqPer100g += wi_norm / iew
    if (hew) ohEqPer100g += wi_norm / hew
  }

  const totalVol = sumVals(volByPhase)
  const density = totalVol > 0 ? 100 / totalVol : null // density comp
  const massPctByPhase = toPct(massByPhase, 100) // 各相的质量占比
  const volPctByPhase = totalVol > 0 ? toPct(volByPhase, totalVol) : zeroPct()

  // 各相“每100g组分”的体积（用于混合体积分配）
  const volPer100gByPhase = { ...volByPhase }
  const volPer100g = sumVals(volPer100gByPhase)

  // 固含与PVC
  const massSolidsPct = massPctByPhase.binder + massPctByPhase.pigment //质量固含
  const volSolidsPct = volPctByPhase.binder + volPctByPhase.pigment //体积固含
  const pvcPct =
    volByPhase.binder + volByPhase.pigment > 0
      ? (volByPhase.pigment / (volByPhase.binder + volByPhase.pigment)) * 100
      : null

  return {
    massPctByPhase,
    volPctByPhase,
    volPer100gByPhase,
    volPer100g,
    density,
    massSolidsPct,
    volSolidsPct,
    pvcPct,
    effEq: {
      eew: epoxyEqPer100g > 0 ? 100 / epoxyEqPer100g : null,
      ahew: amineEqPer100g > 0 ? 100 / amineEqPer100g : null,
      iew: isoEqPer100g > 0 ? 100 / isoEqPer100g : null,
      hew: ohEqPer100g > 0 ? 100 / ohEqPer100g : null
    },
    reactiveBinderMassByEq
  }
}

function emptyGroup() {
  return {
    massPctByPhase: zeroPct(),
    volPctByPhase: zeroPct(),
    volPer100gByPhase: { binder: 0, pigment: 0, solvent: 0, water: 0 },
    volPer100g: 0,
    density: null,
    massSolidsPct: 0,
    volSolidsPct: 0,
    pvcPct: null,
    reactiveMassByEq: { eew: 0, ahew: 0, iew: 0, hew: 0 },
    reactiveVolByEq: { eew: 0, ahew: 0, iew: 0, hew: 0 },
    effEq: { eew: null, ahew: null, iew: null, hew: null },
    reactiveBinderMassByEq: { eew: 0, hew: 0, ahew: 0, iew: 0 }
  }
}

// ---------- 字典索引与工具 ----------
function buildIndex(dict: DictMaterial[]) {
  const bySap = new Map<string, DictMaterial>()
  const byChamp = new Map<string, DictMaterial>()
  for (const raw of dict || []) {
    const m = sanitizeMaterial(raw)
    if (m.sap) bySap.set(m.sap, m)
    if (m.champ) byChamp.set(m.champ, m)
  }
  return {
    get(code: string): DictMaterial | undefined {
      return bySap.get(code) || byChamp.get(code)
    }
  }
}

function sanitizeMaterial(m: DictMaterial): DictMaterial {
  // 等当量负值取绝对；0视为未知
  const eq = {
    eew: normalizeEq(m.eqWeight?.eew),
    ahew: normalizeEq(m.eqWeight?.ahew),
    iew: normalizeEq(m.eqWeight?.iew),
    hew: normalizeEq(m.eqWeight?.hew)
  }
  // 保留给定密度（JSON用1作占位），但在计算体积时会根据相占比判断是否使用
  return { ...m, eqWeight: eq }
}

function normalizeEq(v?: number | null) {
  if (v == null || v === 0) return null
  return Math.abs(v)
}

function sanitizeDensity(d: number | null | undefined, phasePct: number) {
  // 相占比为0则不使用密度；密度<=0视为未知
  if ((phasePct || 0) <= 0) return null
  if (d == null || d <= 0) return null
  return d
}

function toPct(byPhase: Record<Phase, number>, total: number): Record<Phase, number> {
  if (!total || total <= 0) return zeroPct()
  return {
    binder: (byPhase.binder / total) * 100,
    pigment: (byPhase.pigment / total) * 100,
    solvent: (byPhase.solvent / total) * 100,
    water: (byPhase.water / total) * 100
  }
}

function zeroPct(): Record<Phase, number> {
  return { binder: 0, pigment: 0, solvent: 0, water: 0 }
}

function sumVals(obj: Record<Phase, number>) {
  return (obj.binder || 0) + (obj.pigment || 0) + (obj.solvent || 0) + (obj.water || 0)
}

function round(v: number | null | undefined, n = 2) {
  if (v == null || isNaN(v as any)) return null
  const f = Math.pow(10, n)
  return Math.round((v as number) * f) / f
}

function clampPositive(v: number) {
  return v > 0 ? v : 0
}

// 混合质量分配（wt%），各相在混合中的质量百分比
function mixMassPct(
  w: { wA: number; wB: number },
  massPctA: Record<Phase, number>,
  massPctB: Record<Phase, number>
): Record<Phase, number> {
  const r: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  ;(['binder', 'pigment', 'solvent', 'water'] as Phase[]).forEach((p) => {
    r[p] = (w.wA * (massPctA[p] || 0) + w.wB * (massPctB[p] || 0)) / 100
  })
  return r
}

// 混合体积分配（v%），各相在混合中的体积百分比
function mixVolumePct(
  w: { wA: number; wB: number },
  volPer100gA_byPhase: Record<Phase, number>,
  volPer100gB_byPhase: Record<Phase, number>
): Record<Phase, number> {
  const abs: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  ;(['binder', 'pigment', 'solvent', 'water'] as Phase[]).forEach((p) => {
    // 计算各相在混合中的绝对体积
    abs[p] = (volPer100gA_byPhase[p] || 0) * (w.wA / 100) + (volPer100gB_byPhase[p] || 0) * (w.wB / 100)
  })
  const sum = abs.binder + abs.pigment + abs.solvent + abs.water
  if (sum <= 0) return zeroPct()
  return {
    binder: (abs.binder / sum) * 100,
    pigment: (abs.pigment / sum) * 100,
    solvent: (abs.solvent / sum) * 100,
    water: (abs.water / sum) * 100
  }
}
