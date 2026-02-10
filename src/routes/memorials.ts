import { Hono } from 'hono'
import type { Env } from '../app'
import * as q from '../db/queries'

export function memorialRoutes() {
  const r = new Hono<Env>()

  // 列表
  r.get('/', async (c) => {
    const db = c.get('db')
    const keyword = c.req.query('keyword')
    const memorial_type = c.req.query('memorial_type')
    const group = c.req.query('group')
    const list = await q.listMemorials(db, { keyword, memorial_type, group })
    return c.json(list)
  })

  // 分组列表
  r.get('/groups', async (c) => {
    const db = c.get('db')
    return c.json(await q.listGroups(db))
  })

  // 详情
  r.get('/:id', async (c) => {
    const db = c.get('db')
    const id = Number(c.req.param('id'))
    const item = await q.getMemorial(db, id)
    if (!item) return c.json({ error: '纪念日不存在' }, 404)
    return c.json(item)
  })

  // 创建
  r.post('/', async (c) => {
    const db = c.get('db')
    const body = await c.req.json()
    const result = await q.createMemorial(db, {
      name: body.name,
      memorial_type: body.memorial_type || 'custom',
      date_mode: body.date_mode || 'solar',
      solar_date: body.solar_date ?? null,
      lunar_month: body.lunar_month ?? null,
      lunar_day: body.lunar_day ?? null,
      lunar_leap: body.lunar_leap ? 1 : 0,
      start_year: body.start_year ?? null,
      person: body.person ?? null,
      group_name: body.group_name ?? null,
      note: body.note ?? null,
      recurring: body.recurring !== false ? 1 : 0,
    })
    const created = await q.getMemorial(db, result.id)
    return c.json(created, 201)
  })

  // 更新
  r.put('/:id', async (c) => {
    const db = c.get('db')
    const id = Number(c.req.param('id'))
    const body = await c.req.json()

    const existing = await q.getMemorial(db, id)
    if (!existing) return c.json({ error: '纪念日不存在' }, 404)

    await q.updateMemorial(db, id, {
      name: body.name,
      memorial_type: body.memorial_type,
      date_mode: body.date_mode,
      solar_date: body.solar_date ?? null,
      lunar_month: body.lunar_month ?? null,
      lunar_day: body.lunar_day ?? null,
      lunar_leap: body.lunar_leap ? 1 : 0,
      start_year: body.start_year ?? null,
      person: body.person ?? null,
      group_name: body.group_name ?? null,
      note: body.note ?? null,
      recurring: body.recurring !== false ? 1 : 0,
    })

    const updated = await q.getMemorial(db, id)
    return c.json(updated)
  })

  // 删除
  r.delete('/:id', async (c) => {
    const db = c.get('db')
    const id = Number(c.req.param('id'))
    const ok = await q.deleteMemorial(db, id)
    if (!ok) return c.json({ error: '纪念日不存在' }, 404)
    return c.json({ ok: true })
  })

  return r
}
