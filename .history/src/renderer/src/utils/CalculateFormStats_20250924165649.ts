// 导入物性字典（打包期静态引入）
import materialDict from '../../../../resources/data/materialData.json'

// 基础数据结构（与页面层传入字段对齐）
interface SimpleRow {
	material_code?: string | number
	material_desc?: string
	quality_score?: number // 若为百分比，直接视为质量分数
	// test_quality?: number // 如后续需要用质量原值，可扩展
}

interface MaterialDictItem {
	champ: string
	density: { binder: number; pigment: number; solvent: number; water: number }
	eqWeight: { ahew: number; eew: number; hew: number; iew: number }
	name: string
	phasePct: { binder: number; pigment: number; solvent: number; water: number }
	sap: string
}

interface GroupItem {
	material_code: string
	material_desc?: string
	matched: boolean
	mass_fraction: number // 质量分数 wt%
	dict?: MaterialDictItem
}

interface ComputeResult {
	groups: {
		a: GroupItem[]
		b: GroupItem[]
	}
	view: {
		mass_ratio_a: number | undefined // 组分A质量比（wt%）
		mass_ratio_b: number | undefined // 组分B质量比（wt%）
		volume_ratio_a?: number // 预留
		volume_ratio_b?: number // 预留
		density_a?: number // 预留
		density_b?: number // 预留
		density_mix?: number // 预留
	}
}

function toStringCode(code: string | number | undefined): string {
	if (code == null) return ''
	return String(code).trim()
}

function safeNumber(n: unknown, def = 0): number {
	const v = Number(n)
	return Number.isFinite(v) ? v : def
}

function normalizeMassFractions(rows: SimpleRow[]): number[] {
	// 若传入 quality_score 为百分比，直接用；否则归一化
	const fractions = rows.map((r) => safeNumber(r.quality_score, NaN))
	const hasAllPercents = fractions.every((v) => Number.isFinite(v) && v >= 0)
	if (hasAllPercents) return fractions

	// 回退：若无百分比，做等比分配或返回0
	const count = rows.length
	if (count === 0) return []
	const even = 100 / count
	return rows.map(() => even)
}

function attachDict(rows: SimpleRow[], dict: MaterialDictItem[]): GroupItem[] {
	const bySap: Record<string, MaterialDictItem> = {}
	dict.forEach((d) => {
		if (d && d.sap != null) bySap[String(d.sap).trim()] = d
	})

	const massFractions = normalizeMassFractions(rows)

	return rows.map((r, idx) => {
		const code = toStringCode(r.material_code)
		const dictItem = code ? bySap[code] : undefined
		return {
			material_code: code,
			material_desc: r.material_desc,
			matched: !!dictItem,
			mass_fraction: Number(safeNumber(massFractions[idx], 0).toFixed(4)),
			dict: dictItem
		}
	})
}

export function computeFormStats(
	aRows: SimpleRow[],
	bRows: SimpleRow[],
	// 允许外部传，但内部也有默认导入
	_extMaterialDict?: MaterialDictItem[] | any,
	stoichRatio?: number
): ComputeResult {
	const dict = (Array.isArray(_extMaterialDict) && _extMaterialDict.length ? _extMaterialDict : (materialDict as any)) as MaterialDictItem[]

	const a = attachDict(aRows ?? [], dict)
	const b = attachDict(bRows ?? [], dict)

	// 质量比分别求和，若输入为百分比，则直接求和（通常 ~100）；否则按归一化规则处理
	const sumA = a.reduce((acc, it) => acc + it.mass_fraction, 0)
	const sumB = b.reduce((acc, it) => acc + it.mass_fraction, 0)
	const total = sumA + sumB

	const mass_ratio_a = total > 0 ? Number(((sumA / total) * 100).toFixed(4)) : undefined
	const mass_ratio_b = total > 0 ? Number(((sumB / total) * 100).toFixed(4)) : undefined

	// 体积与密度等后续基于更完整字段再精算，现返回占位以便前端回退到DB数据
	const view = {
		mass_ratio_a,
		mass_ratio_b,
		volume_ratio_a: undefined,
		volume_ratio_b: undefined,
		density_a: undefined,
		density_b: undefined,
		density_mix: undefined
	}

	return { groups: { a, b }, view }
}
