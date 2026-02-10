/** 统一数据库接口，屏蔽 D1 / Turso 差异 */
export interface DbAdapter {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<{ changes: number; lastRowId: number }>
  batch(statements: { sql: string; params?: unknown[] }[]): Promise<void>
}

/** 包装 Cloudflare D1 */
export function wrapD1(d1: D1Database): DbAdapter {
  return {
    async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const stmt = d1.prepare(sql).bind(...params)
      const result = await stmt.all<T>()
      return result.results ?? []
    },
    async execute(sql: string, params: unknown[] = []) {
      const stmt = d1.prepare(sql).bind(...params)
      const result = await stmt.run()
      return {
        changes: result.meta?.changes ?? 0,
        lastRowId: result.meta?.last_row_id ?? 0,
      }
    },
    async batch(statements) {
      const stmts = statements.map((s) => d1.prepare(s.sql).bind(...(s.params ?? [])))
      await d1.batch(stmts)
    },
  }
}

/** 包装 Turso (libsql) — Vercel 部署时使用 */
export function wrapTurso(client: {
  execute(opts: { sql: string; args?: unknown[] }): Promise<{ rows: any[]; rowsAffected: number; lastInsertRowid: bigint }>
  batch(stmts: { sql: string; args?: unknown[] }[]): Promise<any[]>
}): DbAdapter {
  return {
    async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const result = await client.execute({ sql, args: params })
      return result.rows as T[]
    },
    async execute(sql: string, params: unknown[] = []) {
      const result = await client.execute({ sql, args: params })
      return {
        changes: result.rowsAffected ?? 0,
        lastRowId: Number(result.lastInsertRowid ?? 0),
      }
    },
    async batch(statements) {
      await client.batch(statements.map((s) => ({ sql: s.sql, args: s.params ?? [] })))
    },
  }
}
