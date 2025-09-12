import mysql, { Pool, RowDataPacket } from 'mysql2/promise'

export class MySQLService {
  private static instance: MySQLService
  private pool: Pool | null = null

  // 获取唯一实例
  public static getInstance(): MySQLService {
    if (!MySQLService.instance) {
      MySQLService.instance = new MySQLService()
    }
    return MySQLService.instance
  }

  // 初始化数据库连接（延迟初始化+外部传参）
  public async init(config: {
    host: string
    user: string
    password: string
    database: string
    port?: number
    connectionLimit?: number
  }) {
    // 避免重复初始化
    if (this.pool) return
    this.pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port ?? 3306,
      connectionLimit: config.connectionLimit ?? 50,
      waitForConnections: true,
      queueLimit: 0,
      decimalNumbers: true
    })
  }

  // 确保连接池存在
  private async ensurePool() {
    if (!this.pool) {
      throw new Error('Database pool not initialized')
    }
  }

  // 查询封装(泛型参数T用于指定返回类型)
  public async query<T extends RowDataPacket = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.ensurePool()
    const [rows] = await this.pool!.query(sql, params)
    return rows as T[]
  }

  // 查询所有配方
  public async getFormulas() {
    return this.query('SELECT * FROM formulas')
  }

  // 查询某个配方的原料详情
  public async getFormulaMaterials(formulaId: number) {
    return this.query('SELECT * FROM formula_materials WHERE formula_id=?', [formulaId])
  }

  // 查询某个配方的统计数据
  public async getFormulaStats(formulaId: number) {
    return this.query('SELECT * FROM formula_stats WHERE formula_id=?', [formulaId])
  }

  // 查询某配方的固含量
  public async getFormulaSolids(formulaId: number) {
    return this.query('SELECT * FROM formula_solids WHERE formula_id=?', [formulaId])
  }

  public async calculateQualityScore(formulaId: number) {
    const sql = `
      SELECT
        fm.id,
        fm.formula_id,
        fm.group_type,
        fm.material_code,
        fm.material_desc,
        fm.test_quality,
        fm.price,
        fm.mix,
        ROUND(fm.test_quality / t.total_quality * 100, 2) AS quality_score
      FROM formula_materials fm
      JOIN (
        SELECT formula_id, group_type, SUM(test_quality) AS total_quality
        FROM formula_materials
        GROUP BY formula_id, group_type
      ) t
        ON fm.formula_id = t.formula_id AND fm.group_type = t.group_type
      WHERE fm.formula_id = ?
    `
    return this.query(sql, [formulaId])
  }
}

export const mySQLService = MySQLService.getInstance()
