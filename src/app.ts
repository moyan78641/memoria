import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { DbAdapter } from './db/adapter'
import { authRoutes } from './routes/auth'
import { memorialRoutes } from './routes/memorials'
import { notificationRoutes } from './routes/notifications'
import { settingsRoutes } from './routes/settings'
import { dashboardRoutes } from './routes/dashboard'
import { statisticsRoutes } from './routes/statistics'
import * as q from './db/queries'

export type Env = {
  Variables: {
    db: DbAdapter
  }
}

export function createApp(getDb: (c: any) => DbAdapter) {
  const app = new Hono<Env>()

  app.use('*', cors())

  // 注入 DB 到所有 /api 请求
  app.use('/api/*', async (c, next) => {
    c.set('db', getDb(c))
    await next()
  })

  app.get('/api/health', (c) => c.json({ ok: true }))

  // Auth 路由（不需要 token）
  app.route('/api/auth', authRoutes())

  // 鉴权中间件：auth 和 health 之外的 API 需要 token
  app.use('/api/*', async (c, next) => {
    const path = new URL(c.req.url).pathname
    if (path.startsWith('/api/auth') || path === '/api/health') {
      await next()
      return
    }

    const auth = c.req.header('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return c.json({ error: '未登录' }, 401)
    }
    const token = auth.slice(7)
    const db = c.get('db')
    const storedToken = await q.getSetting(db, 'session_token')
    if (!storedToken || token !== storedToken) {
      return c.json({ error: '登录已过期' }, 401)
    }
    await next()
  })

  app.route('/api/memorials', memorialRoutes())
  app.route('/api/notifications', notificationRoutes())
  app.route('/api/dashboard', dashboardRoutes())
  app.route('/api/settings', settingsRoutes())
  app.route('/api/statistics', statisticsRoutes())

  return app
}
