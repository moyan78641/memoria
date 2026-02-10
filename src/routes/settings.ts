import { Hono } from 'hono'
import type { Env } from '../app'
import * as q from '../db/queries'

export function settingsRoutes() {
  const r = new Hono<Env>()

  // 获取个人设置
  r.get('/profile', async (c) => {
    const db = c.get('db')
    const region = await q.getSetting(db, 'region')
    const nickname = await q.getSetting(db, 'nickname')
    return c.json({
      nickname: nickname ?? 'MemorialHub 用户',
      region: region ?? 'north',
    })
  })

  // 更新个人设置
  r.post('/profile', async (c) => {
    const db = c.get('db')
    const body = await c.req.json()
    if (body.nickname) await q.setSetting(db, 'nickname', body.nickname)
    if (body.region) await q.setSetting(db, 'region', body.region)
    return c.json({ ok: true })
  })

  return r
}
