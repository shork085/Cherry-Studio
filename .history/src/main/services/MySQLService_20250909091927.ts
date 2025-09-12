import mysql, { Pool } from 'mysql2/promise'

export class MySQLService {
  private static instance: MySQLService
  private pool: Pool | null = null

  constructor() {
    this.pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'root123',
      database: 'datatest',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }

  public static getInstance(): MySQLService {
    if (!MySQLService.instance) {
      MySQLService.instance = new MySQLService()
    }
    return MySQLService.instance
  }

  // 查询封装
  public async query(sql: string, params: any[] = []) {
    const [rows] = await this.pool.query(sql, params)
    return rows
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
}

export const mySQLService = MySQLService.getInstance()
