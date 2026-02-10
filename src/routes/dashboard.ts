import { Hono } from 'hono'
import type { Env } from '../app'
import type { DbAdapter } from '../db/adapter'

export function dashboardRoutes() {
  const r = new Hono<Env>()

  r.get('/stats', async (c) => {
    const db = c.get('db')
    const [total] = await db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM memorials')
    const [birthdays] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM memorials WHERE memorial_type = 'birthday'")
    const [anniversaries] = await db.query<{ cnt: number }>("SELECT COUNT(*) as cnt FROM memorials WHERE memorial_type = 'anniversary'")
    const [groups] = await db.query<{ cnt: number }>("SELECT COUNT(DISTINCT group_name) as cnt FROM memorials WHERE group_name IS NOT NULL AND group_name != ''")

    return c.json({
      total_memorials: total?.cnt ?? 0,
      birthday_count: birthdays?.cnt ?? 0,
      anniversary_count: anniversaries?.cnt ?? 0,
      group_count: groups?.cnt ?? 0,
    })
  })

  r.get('/all-memorials', async (c) => {
    const db = c.get('db')
    const list = await db.query('SELECT id, name, memorial_type, date_mode, solar_date, lunar_month, lunar_day, lunar_leap, start_year, person, group_name FROM memorials ORDER BY created_at DESC')
    return c.json(list)
  })

  return r
}
