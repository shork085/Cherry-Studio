import { mysql } from 'mysql2/promise'

export class MySQLService {
  private pool

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

  async getFormData(formulaId: number) {
    const [rows] = await this.pool.query(
      'SELECT * FROM formula_materials WHERE group_type = ' + 'A' + ' and formula_id=?'
    )
    return rows
  }
}

export const mySQLService = MySQLService.getInstance()
