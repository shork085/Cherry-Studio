export type Phase = 'binder' | 'pigment' | 'solvent' | 'water'

export interface DictMaterial {
  sap?: string
  champ?: string
  name: string
  phasePct: Record<Phase, number>
  density: Record<Phase, number | null>
  eqWeight: { eew?: number | null; ahew?: number | null; iew?: number | null; hew?: number | null }
}

export interface ComputeInputRow {
  material_code: string
  quality_score: number // 组内质量百分比（gew%）
  material_desc?: string
}

export type SystemType = '单组份' | '环氧' | '聚氨酯'

export interface ComputeResult {
  view: {
    density_a: number | null
    density_b: number | null
    density_mix: number | null
    mass_ratio_a: number
    mass_ratio_b: number
    volume_ratio_a: number
    volume_ratio_b: number
  }
  solids: {
    A: { mass_fraction: number; volume_fraction: number; pvc: number | null }
    B: { mass_fraction: number; volume_fraction: number; pvc: number | null }
    MIX: { mass_fraction: number; volume_fraction: number; pvc: number | null }
  }
  meta: {
    system: SystemType
    effEqA: { eew?: number | null; hew?: number | null }
    effEqB: { ahew?: number | null; iew?: number | null }
    errors: string[]
  }
}

export function computeFormStats(
  rowsA: ComputeInputRow[],
  rowsB: ComputeInputRow[],
  materialDict: DictMaterial[],
  stoichRatio = 1,
  systemType?: SystemType // 可选：显式指定体系；未给则自动检测
): ComputeResult {
  const index = buildIndex(materialDict)

  const gmA = computeGroup(rowsA, index)
  const gmB = computeGroup(rowsB, index)

  // 自动识别体系（除非显式传入）
  const system: SystemType =
    systemType || (gmA.effEq.eew && gmB.effEq.ahew ? '环氧' : gmA.effEq.hew && gmB.effEq.iew ? '聚氨酯' : '单组份')

  // 计量
  let wA = 100
  let wB = 0
  const errors: string[] = []

  if (system !== '单组份') {
    const baseEff = system === '环氧' ? gmA.effEq.eew : gmA.effEq.hew
    const hardEff = system === '环氧' ? gmB.effEq.ahew : gmB.effEq.iew
    if (!baseEff || !hardEff) {
      errors.push('缺少等当量（回退为单组份）')
    } else {
      // E = (100 / baseEff) * hardEff * ratio
      const E = (100 / baseEff) * hardEff * (Number(stoichRatio) || 1)
      wA = (100 * 100) / (100 + E)
      wB = (100 * E) / (100 + E)
    }
  }

  // 体积比例与混合密度（用各组分“每100g体积”缩放）
  const vA_abs = gmA.volPer100g * (wA / 100)
  const vB_abs = gmB.volPer100g * (wB / 100)
  const vSum = vA_abs + vB_abs
  const volume_ratio_a = vSum > 0 ? (vA_abs / vSum) * 100 : 0
  const volume_ratio_b = vSum > 0 ? (vB_abs / vSum) * 100 : 0
  const density_mix = vSum > 0 ? 100 / vSum : null

  // 混合后的质量分配（wt%）
  const setMassPct = mixMassPct({ wA, wB }, gmA.massPctByPhase, gmB.massPctByPhase)
  const setMassSolidsPct = setMassPct.binder + setMassPct.pigment

  // 混合后的体积分配（v%）
  const setVolumePct = mixVolumePct({ wA, wB }, gmA.volPer100gByPhase, gmB.volPer100gByPhase)
  const setVolSolidsPct = setVolumePct.binder + setVolumePct.pigment
  const setPVC =
    setVolumePct.binder + setVolumePct.pigment > 0
      ? (setVolumePct.pigment / (setVolumePct.binder + setVolumePct.pigment)) * 100
      : null

  return {
    view: {
      density_a: round(gmA.density, 4),
      density_b: round(gmB.density, 4),
      density_mix: round(density_mix, 4),
      mass_ratio_a: round(wA, 2),
      mass_ratio_b: round(wB, 2),
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
    }
  }
}

// ---------- 组分计算（对应步骤2~5） ----------
function computeGroup(rows: ComputeInputRow[], index: ReturnType<typeof buildIndex>) {
  const phases: Phase[] = ['binder', 'pigment', 'solvent', 'water']
  // 把 quality_score 当成“该组分的质量百分比”，总和≈100
  const totalGew = clampPositive(rows.reduce((s, r) => s + (Number(r.quality_score) || 0), 0))
  if (totalGew <= 0) return emptyGroup()

  const massByPhase: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }
  const volByPhase: Record<Phase, number> = { binder: 0, pigment: 0, solvent: 0, water: 0 }

  // 等当量并联合并：Eff = 100 / sum(wi_norm/eq_i)
  let epoxyEqPer100g = 0
  let amineEqPer100g = 0
  let isoEqPer100g = 0
  let ohEqPer100g = 0

  for (const r of rows) {
    const m = index.get(r.material_code)
    const wi_norm = ((Number(r.quality_score) || 0) / totalGew) * 100 // 归一到“每100g组分”
    if (!m || wi_norm <= 0) continue
    // 相质量/体积
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
  // 保留给定密度（你的JSON用1作占位），但在计算体积时会根据相占比判断是否使用
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
