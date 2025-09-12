import { createPool, Pool, RowDataPacket } from 'mysql2/promise'

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

  static getInstance(): MySQLService {
    if (!MySQLService.instance) {
      MySQLService.instance = new MySQLService()
    }
    return MySQLService.instance
  }

  async init(config: { host: string; user: string; password: string; database: string; port?: number }) {
    if (this.pool) return
    this.pool = createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port ?? 3306,
      connectionLimit: 5,
      decimalNumbers: true
    })
  }

  private ensurePool() {
    if (!this.pool) throw new Error('MySQLService not initialized')
  }

  async getFormData(): Promise<{ A: FormRow[]; B: FormRow[] }> {
    this.ensurePool()
    const conn = await this.pool!.getConnection()
    try {
      const [rowsA] = await conn.query<RowDataPacket[]>(
        'SELECT name, `desc`, testQuality, qualityScore, mixQuality, price FROM form_a ORDER BY id ASC LIMIT 500'
      )
      const [rowsB] = await conn.query<RowDataPacket[]>(
        'SELECT name, `desc`, testQuality, qualityScore, mixQuality, price FROM form_b ORDER BY id ASC LIMIT 500'
      )

      const map = (r: RowDataPacket[]): FormRow[] =>
        r.map((x) => ({
          name: String(x.name ?? ''),
          desc: String(x.desc ?? ''),
          testQuality: String(x.testQuality ?? ''),
          qualityScore: String(x.qualityScore ?? ''),
          mixQuality: String(x.mixQuality ?? ''),
          price: String(x.price ?? '')
        }))

      return { A: map(rowsA), B: map(rowsB) }
    } finally {
      conn.release()
    }
  }
}

export const mySQLService = MySQLService.getInstance()
