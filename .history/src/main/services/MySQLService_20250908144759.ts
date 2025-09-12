import { createPool, Pool } from 'mysql2/promise'

export type MySQLConfig = {
  host: string
  port?: number
  user: string
  password: string
  database: string
  ssl?: any
}

export type FormRow = {
  name: string
  desc: string
  testQuality: string
  qualityScore: string
  mixQuality: string
  price: string
}

export class MySQLService {
  private static instance: MySQLService
  private pool: Pool | null = null
  private config: MySQLConfig | null = null

  static getInstance(): MySQLService {
    if (!MySQLService.instance) {
      MySQLService.instance = new MySQLService()
    }
    return MySQLService.instance
  }

  async setConfig(config: MySQLConfig) {
    this.config = config
    if (this.pool) {
      await this.pool.end().catch(() => {})
      this.pool = null
    }
    this.pool = createPool({
      host: config.host,
      port: config.port ?? 3306,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: config.ssl
    })
  }

  private assertReady() {
    if (!this.pool) throw new Error('MySQL pool not initialized. Call setConfig first.')
  }

  async fetchFormData(tableA: string, tableB: string): Promise<{ a: FormRow[]; b: FormRow[] }> {
    this.assertReady()
    const conn = await this.pool!.getConnection()
    try {
      const [rowsA] = await conn.query(`SELECT name, desc, testQuality, qualityScore, mixQuality, price FROM \`${tableA}\``)
      const [rowsB] = await conn.query(`SELECT name, desc, testQuality, qualityScore, mixQuality, price FROM \`${tableB}\``)
      return { a: rowsA as any, b: rowsB as any }
    } finally {
      conn.release()
    }
  }
}

export default MySQLService.getInstance()


