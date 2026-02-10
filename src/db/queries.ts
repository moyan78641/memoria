import type { DbAdapter } from './adapter'

// === Memorial 类型 ===
export interface Memorial {
  id: number
  name: string
  memorial_type: string
  date_mode: string
  solar_date: string | null
  lunar_month: number | null
  lunar_day: number | null
  lunar_leap: number
  start_year: number | null
  person: string | null
  group_name: string | null
  note: string | null
  recurring: number
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: number
  memorial_id: number
  days_before: number
  channel: string
  enabled: number
  created_at: string
}

export interface NotificationLog {
  id: number
  memorial_id: number
  channel: string
  status: string
  message: string | null
  sent_at: string
}

// === Memorials ===
export async function listMemorials(db: DbAdapter, params?: { keyword?: string; memorial_type?: string; group?: string }) {
  let sql = 'SELECT * FROM memorials WHERE 1=1'
  const args: unknown[] = []

  if (params?.keyword) {
    sql += ' AND (name LIKE ? OR person LIKE ?)'
    args.push(`%${params.keyword}%`, `%${params.keyword}%`)
  }
  if (params?.memorial_type) {
    sql += ' AND memorial_type = ?'
    args.push(params.memorial_type)
  }
  if (params?.group) {
    sql += ' AND group_name = ?'
    args.push(params.group)
  }
  sql += ' ORDER BY created_at DESC'
  return db.query<Memorial>(sql, args)
}

export async function getMemorial(db: DbAdapter, id: number) {
  const rows = await db.query<Memorial>('SELECT * FROM memorials WHERE id = ?', [id])
  return rows[0] ?? null
}

export async function createMemorial(db: DbAdapter, data: Omit<Memorial, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString()
  const result = await db.execute(
    `INSERT INTO memorials (name, memorial_type, date_mode, solar_date, lunar_month, lunar_day, lunar_leap, start_year, person, group_name, note, recurring, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.memorial_type, data.date_mode, data.solar_date, data.lunar_month, data.lunar_day, data.lunar_leap, data.start_year, data.person, data.group_name, data.note, data.recurring, now, now]
  )
  return { id: result.lastRowId }
}

export async function updateMemorial(db: DbAdapter, id: number, data: Partial<Omit<Memorial, 'id' | 'created_at' | 'updated_at'>>) {
  const fields: string[] = []
  const args: unknown[] = []

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`)
      args.push(value)
    }
  }
  if (fields.length === 0) return

  fields.push('updated_at = ?')
  args.push(new Date().toISOString())
  args.push(id)

  await db.execute(`UPDATE memorials SET ${fields.join(', ')} WHERE id = ?`, args)
}

export async function deleteMemorial(db: DbAdapter, id: number) {
  await db.execute('DELETE FROM reminders WHERE memorial_id = ?', [id])
  const result = await db.execute('DELETE FROM memorials WHERE id = ?', [id])
  return result.changes > 0
}

export async function listGroups(db: DbAdapter) {
  const rows = await db.query<{ group_name: string }>('SELECT DISTINCT group_name FROM memorials WHERE group_name IS NOT NULL AND group_name != "" ORDER BY group_name')
  return rows.map((r) => r.group_name)
}

// === Reminders ===
export async function listReminders(db: DbAdapter, memorialId: number) {
  return db.query<Reminder>('SELECT * FROM reminders WHERE memorial_id = ? ORDER BY days_before', [memorialId])
}

export async function listAllRemindersWithMemorials(db: DbAdapter) {
  const memorials = await db.query<Memorial>('SELECT * FROM memorials ORDER BY name')
  const reminders = await db.query<Reminder>('SELECT * FROM reminders ORDER BY days_before')

  return memorials.map((m) => ({
    ...m,
    reminders: reminders.filter((r) => r.memorial_id === m.id),
  }))
}

export async function createReminder(db: DbAdapter, memorialId: number, data: { days_before: number; channel: string }) {
  const now = new Date().toISOString()
  const result = await db.execute(
    'INSERT INTO reminders (memorial_id, days_before, channel, enabled, created_at) VALUES (?, ?, ?, 1, ?)',
    [memorialId, data.days_before, data.channel, now]
  )
  return { id: result.lastRowId }
}

export async function deleteReminder(db: DbAdapter, id: number) {
  const result = await db.execute('DELETE FROM reminders WHERE id = ?', [id])
  return result.changes > 0
}

// === Notification Logs ===
export async function listLogs(db: DbAdapter, limit = 100) {
  return db.query<NotificationLog>('SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT ?', [limit])
}

export async function insertLog(db: DbAdapter, data: { memorial_id: number; channel: string; status: string; message?: string }) {
  await db.execute(
    'INSERT INTO notification_logs (memorial_id, channel, status, message, sent_at) VALUES (?, ?, ?, ?, ?)',
    [data.memorial_id, data.channel, data.status, data.message ?? null, new Date().toISOString()]
  )
}

// === Settings (KV 风格) ===
export async function getSetting(db: DbAdapter, key: string) {
  const rows = await db.query<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])
  return rows[0]?.value ?? null
}

export async function setSetting(db: DbAdapter, key: string, value: string) {
  await db.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value])
}

export async function getAllSettings(db: DbAdapter) {
  const rows = await db.query<{ key: string; value: string }>('SELECT key, value FROM settings')
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  return map
}
