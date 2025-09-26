export type Phase = 'binder' | 'pigment' | 'solvent' | 'water'

// 物料字典结构
export interface DictMaterial {
  sap?: string //编码
  champ?: string //代码
  name: string //名称
  phasePct: Record<Phase, number> //四相质量占比（%）
  density: Record<Phase, number | null>
  /*等当量EEM base
   eew:环氧当量
   ahew:胺当量
   iew:异氰酸酯当量
   hew：羟基当量
  */
  eqWeight: { eew?: number | null; ahew?: number | null; iew?: number | null; hew?: number | null }
}

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
  binderView: {
    reactive_base: number
    reactive_hardener: number
    reactive_set: number
    non_react_base: number
    non_react_hardener: number
    non_react_set: number
    total_binder: number
  }
}

export function computeFormStats(
  rowsA: ComputeInputRow[],
  rowsB: ComputeInputRow[],
  materialDict: DictMaterial[],
  stoichRatio = 1, //未输入时化学计量比默认为1
  systemType?: SystemType // 可选：显式指定体系；未给则自动检测
): ComputeResult {
  // 字典索引，原料表对照物性表
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

  // 初始化组分A/B质量比(mixing ratio by weight)
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

  // 体积比例与混合密度
  // 计算配比表中组分A/B的体积比
  const vA_abs = gmA.volPer100g * (wtA / 100)
  const vB_abs = gmB.volPer100g * (wtB / 100)
  const vSum = vA_abs + vB_abs
  const volume_ratio_a = vSum > 0 ? (vA_abs / vSum) * 100 : 0
  const volume_ratio_b = vSum > 0 ? (vB_abs / vSum) * 100 : 0
  const density_mix = vSum > 0 ? 100 / vSum : null

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

  // —— 计算混合物的 NV 绝对体积（binder + pigment）作为分母 ——
  const absA = {
    binder: (gmA.volPer100gByPhase.binder || 0) * (wA / 100),
    pigment: (gmA.volPer100gByPhase.pigment || 0) * (wA / 100)
  }
  const absB = {
    binder: (gmB.volPer100gByPhase.binder || 0) * (wB / 100),
    pigment: (gmB.volPer100gByPhase.pigment || 0) * (wB / 100)
  }
  const nvVolMix = absA.binder + absA.pigment + absB.binder + absB.pigment

  // —— 选取各侧“活性成膜物”的 per-100g 体积（按体系）并换算到整配方绝对体积 ——
  let reactVolA_per100 = 0
  let reactVolB_per100 = 0
  if (system === '环氧') {
    reactVolA_per100 = gmA.reactiveVolByEq.eew || 0 // A 侧有 EEW 的成膜物
    reactVolB_per100 = gmB.reactiveVolByEq.ahew || 0 // B 侧有 AHEW 的成膜物
  } else if (system === '聚氨酯') {
    reactVolA_per100 = gmA.reactiveVolByEq.hew || 0 // A 侧有 HEW 的成膜物（多元醇）
    reactVolB_per100 = gmB.reactiveVolByEq.iew || 0 // B 侧有 IEW 的成膜物（异氰酸酯）
  } else {
    // 单组份：不计入活性
    reactVolA_per100 = 0
    reactVolB_per100 = 0
  }
  const reactVolA_abs = reactVolA_per100 * (wA / 100)
  const reactVolB_abs = reactVolB_per100 * (wB / 100)

  // —— 非活性 = 成膜物总量 - 活性 ——（数值下限 0，避免极小负数）
  const nonReactVolA_abs = Math.max(absA.binder - reactVolA_abs, 0)
  const nonReactVolB_abs = Math.max(absB.binder - reactVolB_abs, 0)

  // —— 换算为 v%（以 NV 总体积为分母）——
  const reactive_base = nvVolMix > 0 ? (reactVolA_abs / nvVolMix) * 100 : 0
  const reactive_hardener = nvVolMix > 0 ? (reactVolB_abs / nvVolMix) * 100 : 0
  const reactive_set = reactive_base + reactive_hardener

  const non_react_base = nvVolMix > 0 ? (nonReactVolA_abs / nvVolMix) * 100 : 0
  const non_react_hardener = nvVolMix > 0 ? (nonReactVolB_abs / nvVolMix) * 100 : 0
  const non_react_set = non_react_base + non_react_hardener

  const total_binder = nvVolMix > 0 ? ((absA.binder + absB.binder) / nvVolMix) * 100 : 0

  return {
    view: {
      density_a: round(gmA.density, 4),
      density_b: round(gmB.density, 4),
      density_mix: round(density_mix, 4),
      mass_ratio_a: round(wtA, 2),
      mass_ratio_b: round(wtB, 2),
      volume_ratio_a: round(volume_ratio_a, 2),
      volume_ratio_b: round(volume_ratio_b, 2)
    },
    solids: {
      A: {
        mass_fraction: round(gmA.massSolidsPct, 2),
        volume_fraction: round(gmA.volSolidsPct, 2),
        pvc: gmA.pvcPct != null ? round(gmA.pvcPct, 2) : null
      },
      B: {
        mass_fraction: round(gmB.massSolidsPct, 2),
        volume_fraction: round(gmB.volSolidsPct, 2),
        pvc: gmB.pvcPct != null ? round(gmB.pvcPct, 2) : null
      },
      MIX: {
        mass_fraction: round(setMassSolidsPct, 2),
        volume_fraction: round(setVolSolidsPct, 2),
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
    binderView: {
      reactive_base: round(reactive_base, 2),
      reactive_hardener: reactive_hardener,
      reactive_set: round(reactive_set, 2),
      non_react_base: round(non_react_base, 2),
      non_react_hardener: round(non_react_hardener, 2),
      non_react_set: round(non_react_set, 2),
      total_binder: round(total_binder, 2)
    }
  }
}

// ---------- 组分计算 ----------
function computeGroup(rows: ComputeInputRow[], index: ReturnType<typeof buildIndex>) {
  const phases: Phase[] = ['binder', 'pigment', 'solvent', 'water']
  // 把 quality_score质量分数求和，总和≈100
  const totalGew = clampPositive(rows.reduce((s, r) => s + (Number(r.quality_score) || 0), 0))

  const reactiveMassByEq = { eew: 0, ahew: 0, iew: 0, hew: 0 }
  const reactiveVolByEq = { eew: 0, ahew: 0, iew: 0, hew: 0 }

  if (totalGew <= 0) return emptyGroup()

  // 四个相的质量、体积百分比
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

    // 质量/体积
    for (const p of phases) {
      const pct = (m.phasePct?.[p] || 0) / 100
      const pmass = wi_norm * pct
      massByPhase[p] += pmass
      const d = sanitizeDensity(m.density?.[p], pct)
      if (pmass > 0 && d) volByPhase[p] += pmass / d
    }
    // 等当量（取绝对值、忽略0/空）
    const eew = normalizeEq(m.eqWeight?.eew)
    const ahew = normalizeEq(m.eqWeight?.ahew)
    const iew = normalizeEq(m.eqWeight?.iew)
    const hew = normalizeEq(m.eqWeight?.hew)

    if (eew) epoxyEqPer100g += wi_norm / eew
    if (ahew) amineEqPer100g += wi_norm / ahew
    if (iew) isoEqPer100g += wi_norm / iew
    if (hew) ohEqPer100g += wi_norm / hew

    // —— binder 分箱到不同等当量类型（用于后续活性/非活性判定）——
    const binderPct = (m.phasePct?.binder || 0) / 100
    const binderMass = wi_norm * binderPct
    if (binderMass > 0) {
      const dBinder = sanitizeDensity(m.density?.binder, binderPct)
      const binderVol = dBinder ? binderMass / dBinder : 0

      const hasEEW = normalizeEq(m.eqWeight?.eew)
      const hasAHEW = normalizeEq(m.eqWeight?.ahew)
      const hasIEW = normalizeEq(m.eqWeight?.iew)
      const hasHEW = normalizeEq(m.eqWeight?.hew)

      if (hasEEW) {
        reactiveMassByEq.eew += binderMass
        if (binderVol) reactiveVolByEq.eew += binderVol
      }
      if (hasAHEW) {
        reactiveMassByEq.ahew += binderMass
        if (binderVol) reactiveVolByEq.ahew += binderVol
      }
      if (hasIEW) {
        reactiveMassByEq.iew += binderMass
        if (binderVol) reactiveVolByEq.iew += binderVol
      }
      if (hasHEW) {
        reactiveMassByEq.hew += binderMass
        if (binderVol) reactiveVolByEq.hew += binderVol
      }
    }
  }

  const totalVol = sumVals(volByPhase)
  const density = totalVol > 0 ? 100 / totalVol : null
  const massPctByPhase = toPct(massByPhase, 100) // 已经按100g归一
  const volPctByPhase = totalVol > 0 ? toPct(volByPhase, totalVol) : zeroPct()

  // 各相“每100g组分”的体积（用于混合体积分配）
  const volPer100gByPhase = { ...volByPhase } // 因为已用 wi_norm（每100g），这里就是 per100g 的绝对相体积
  const volPer100g = sumVals(volPer100gByPhase)

  // 固含与PVC
  const massSolidsPct = massPctByPhase.binder + massPctByPhase.pigment
  const volSolidsPct = volPctByPhase.binder + volPctByPhase.pigment
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
    reactiveMassByEq,
    reactiveVolByEq,
    effEq: {
      eew: epoxyEqPer100g > 0 ? 100 / epoxyEqPer100g : null,
      ahew: amineEqPer100g > 0 ? 100 / amineEqPer100g : null,
      iew: isoEqPer100g > 0 ? 100 / isoEqPer100g : null,
      hew: ohEqPer100g > 0 ? 100 / ohEqPer100g : null
    }
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
    effEq: { eew: null, ahew: null, iew: null, hew: null }
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

// 混合质量分配（wt%）
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

// 混合体积分配（v%）：先算绝对体积再归一
function mixVolumePct(
  w: { wA: number; wB: number },
  volPer100gA_byPhase: Record<Phase, number>,
  volPer100gB_byPhase: Record<Phase, number>
): Record<Phase, number> {
  const abs: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  ;(['binder', 'pigment', 'solvent', 'water'] as Phase[]).forEach((p) => {
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
