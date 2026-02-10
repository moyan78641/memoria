import { Hono } from 'hono'
import type { Env } from '../app'
import * as q from '../db/queries'

export function reminderRoutes() {
  const r = new Hono<Env>()

  // 所有纪念日及其提醒
  r.get('/all', async (c) => {
    const db = c.get('db')
    return c.json(await q.listAllRemindersWithMemorials(db))
  })

  // 某个纪念日的提醒
  r.get('/:memorial_id', async (c) => {
    const db = c.get('db')
    const memorialId = Number(c.req.param('memorial_id'))
    return c.json(await q.listReminders(db, memorialId))
  })

  // 添加提醒
  r.post('/:memorial_id', async (c) => {
    const db = c.get('db')
    const memorialId = Number(c.req.param('memorial_id'))
    const body = await c.req.json()

    if (!['email', 'telegram'].includes(body.channel)) {
      return c.json({ error: '渠道无效，支持 email / telegram' }, 400)
    }

    const result = await q.createReminder(db, memorialId, {
      days_before: body.days_before ?? 0,
      channel: body.channel,
    })

    return c.json({ id: result.id, memorial_id: memorialId, days_before: body.days_before, channel: body.channel, enabled: true }, 201)
  })

  // 删除提醒
  r.delete('/rule/:id', async (c) => {
    const db = c.get('db')
    const id = Number(c.req.param('id'))
    const ok = await q.deleteReminder(db, id)
    if (!ok) return c.json({ error: '提醒规则不存在' }, 404)
    return c.json({ ok: true })
  })

  return r
}
