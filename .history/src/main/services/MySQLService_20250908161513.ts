import mysql, { Pool } from 'mysql2/promise'

export class MySQLService {
  private static instance: MySQLService
  private pool: Pool

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

  public async getFormulas() {
    return this.query('SELECT * FROM formulas')
  }

  public async getFormData(formulaId: number) {
    return this.query('SELECT * FROM formula_materials WHERE formula_id=?', [formulaId])
  }
}

export const mySQLService = MySQLService.getInstance()
