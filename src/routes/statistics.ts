import { Hono } from 'hono'
import type { Env } from '../app'

export function statisticsRoutes() {
  const r = new Hono<Env>()

  r.get('/overview', async (c) => {
    const db = c.get('db')
    const [total] = await db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM memorials')
    const [solar] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM memorials WHERE date_mode = 'solar'")
    const [lunar] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM memorials WHERE date_mode = 'lunar'")
    const [recurring] = await db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM memorials WHERE recurring = 1')
    const [groups] = await db.query<{ cnt: number }>("SELECT COUNT(DISTINCT group_name) as cnt FROM memorials WHERE group_name IS NOT NULL AND group_name != ''")

    return c.json({
      total: total?.cnt ?? 0,
      solar_count: solar?.cnt ?? 0,
      lunar_count: lunar?.cnt ?? 0,
      recurring_count: recurring?.cnt ?? 0,
      group_count: groups?.cnt ?? 0,
    })
  })

  r.get('/by-type', async (c) => {
    const db = c.get('db')
    const rows = await db.query<{ memorial_type: string; count: number }>(
      'SELECT memorial_type, COUNT(*) as count FROM memorials GROUP BY memorial_type'
    )
    return c.json(rows)
  })

  r.get('/by-month', async (c) => {
    const db = c.get('db')
    // 按阳历月份统计
    const rows = await db.query<{ month: number; count: number }>(
      "SELECT CAST(SUBSTR(solar_date, 1, 2) AS INTEGER) as month, COUNT(*) as count FROM memorials WHERE date_mode = 'solar' AND solar_date IS NOT NULL GROUP BY month ORDER BY month"
    )
    // 补齐 12 个月
    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: rows.find((r) => r.month === i + 1)?.count ?? 0,
    }))
    return c.json(result)
  })

  r.get('/notify-stats', async (c) => {
    const db = c.get('db')
    const [total] = await db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM notification_logs')
    const [success] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM notification_logs WHERE status = 'success'")
    const [failed] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM notification_logs WHERE status = 'failed'")
    const [email] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM notification_logs WHERE channel = 'email'")
    const [telegram] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM notification_logs WHERE channel = 'telegram'")

    return c.json({
      total_sent: total?.cnt ?? 0,
      success_count: success?.cnt ?? 0,
      failed_count: failed?.cnt ?? 0,
      email_count: email?.cnt ?? 0,
      telegram_count: telegram?.cnt ?? 0,
    })
  })

  return r
}
