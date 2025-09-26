import mysql, { OkPacket, Pool, RowDataPacket } from 'mysql2/promise'

// 定义扩展RowDataPacket的接口
interface FormulaIdRow extends RowDataPacket {
  id: number
}

// 定义原料版本信息接口
interface MaterialVersionRow extends RowDataPacket {
  version: number
}

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

  // 更新操作封装
  public async update(sql: string, params: any[] = []): Promise<OkPacket> {
    await this.ensurePool()
    const [result] = await this.pool!.query(sql, params)
    return result as OkPacket
  }

  // 查询所有配方
  public async getFormulas() {
    return this.query('SELECT * FROM formulas')
  }

  // 查询某个配方的原料详情
  public async getFormulaMaterials(formulaId: number) {
    const sql = `
     SELECT
      fm.id,
      fm.formula_id,
      fm.group_type,
      fm.material_id,
      fm.version,
      m.material_code,
      m.material_desc,
      fm.test_quality,
      m.price,
      fm.quality_score
    FROM formula_materials fm
    JOIN materials m ON fm.material_id = m.id
    WHERE fm.formula_id = ?
    `
    return this.query(sql, [formulaId])
  }

  // 获得某配方id
  public async getFormulaIdByType(formulaName: string): Promise<number | null> {
    try {
      // 使用扩展了RowDataPacket的接口
      const rows = await this.query<FormulaIdRow>('SELECT id FROM formulas WHERE type = ? LIMIT 1', [formulaName])

      return rows.length > 0 ? rows[0].id : null
    } catch (error) {
      console.error('获取配方ID失败:', error)
      return null
    }
  }

  // 查询某个配方的统计数据
  public async getFormulaStats(formulaId: number) {
    return this.query('SELECT * FROM formula_stats WHERE formula_id=?', [formulaId])
  }

  // 查询某配方的固含量
  public async getFormulaSolids(formulaId: number) {
    return this.query('SELECT * FROM formula_solids WHERE formula_id=?', [formulaId])
  }

  // 获取原料当前版本号
  public async getMaterialVersion(formulaId: number, materialId: number, groupType: string): Promise<number | null> {
    try {
      const rows = await this.query<MaterialVersionRow>(
        'SELECT version FROM formula_materials WHERE formula_id=? AND material_id=? AND group_type=?',
        [formulaId, materialId, groupType]
      )
      return rows.length > 0 ? rows[0].version : null
    } catch (error) {
      console.error('获取原料当前版本号失败:', error)
      return null
    }
  }

  // 更新原料测试质量
  public async updateMaterialTestQuality(
    formulaId: number,
    materialId: number,
    groupType: string,
    newTestQuality: number,
    currentVersion: number
  ): Promise<boolean> {
    try {
      // 调用存储过程
      await this.update('CALL UpdateMaterialTestQuality(?, ?, ?, ?, ?)', [
        formulaId,
        materialId,
        groupType,
        newTestQuality,
        currentVersion
      ])
      return true
    } catch (err: any) {
      if (err.code === '45000') {
        // 版本冲突
        throw new Error('数据正在被其它用户修改，请刷新后重试')
      }

      console.error('更新原料测试质量失败:', err)
      throw err
    }
  }

  // 更新原料代码
  public async updateMaterialCode(
    formulaId: number,
    oldMaterialCode: string,
    newMaterialCode: string,
    groupType: string,
    currentVersion: number
  ): Promise<boolean> {
    try {
      await this.update('CALL UpdateMaterialCode(?, ?, ?, ?, ?)', [
        formulaId,
        oldMaterialCode,
        newMaterialCode,
        groupType,
        currentVersion
      ])
      return true
    } catch (err: any) {
      if (err.code === '45000') {
        throw new Error('数据正在被其它用户修改或原料不存在，请刷新后重试')
      }

      console.error('更新原料代码失败:', err)
      throw err
    }
  }
}

export const mySQLService = MySQLService.getInstance()
