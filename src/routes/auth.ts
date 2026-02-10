import { Hono } from 'hono'
import type { Env } from '../app'
import * as q from '../db/queries'

export function authRoutes() {
  const r = new Hono<Env>()

  // 检查是否已初始化
  r.get('/status', async (c) => {
    const db = c.get('db')
    const pass = await q.getSetting(db, 'password_hash')
    const siteName = await q.getSetting(db, 'site_name')
    return c.json({ initialized: !!pass, site_name: siteName || 'MemorialHub' })
  })

  // 初始化（设置密码，只能调一次）
  r.post('/setup', async (c) => {
    const db = c.get('db')
    const existing = await q.getSetting(db, 'password_hash')
    if (existing) {
      return c.json({ error: '已经初始化过了' }, 400)
    }

    const body = await c.req.json()
    const password = body.password as string
    const siteName = (body.site_name as string) || 'MemorialHub'
    if (!password || password.length < 6) {
      return c.json({ error: '密码至少6位' }, 400)
    }

    // Edge 环境用 Web Crypto API 做简单 hash
    const hash = await hashPassword(password)
    await q.setSetting(db, 'password_hash', hash)
    await q.setSetting(db, 'site_name', siteName)

    const token = await generateToken()
    await q.setSetting(db, 'session_token', token)

    return c.json({ token })
  })

  // 登录
  r.post('/login', async (c) => {
    const db = c.get('db')
    const storedHash = await q.getSetting(db, 'password_hash')
    if (!storedHash) {
      return c.json({ error: '请先初始化' }, 400)
    }

    const body = await c.req.json()
    const password = body.password as string

    const hash = await hashPassword(password)
    if (hash !== storedHash) {
      return c.json({ error: '密码错误' }, 401)
    }

    const token = await generateToken()
    await q.setSetting(db, 'session_token', token)

    return c.json({ token })
  })

  // 修改密码
  r.post('/change-password', async (c) => {
    const db = c.get('db')
    const body = await c.req.json()
    const { old_password, new_password } = body

    const storedHash = await q.getSetting(db, 'password_hash')
    if (!storedHash) return c.json({ error: '未初始化' }, 400)

    const oldHash = await hashPassword(old_password)
    if (oldHash !== storedHash) {
      return c.json({ error: '旧密码错误' }, 401)
    }

    if (!new_password || new_password.length < 6) {
      return c.json({ error: '新密码至少6位' }, 400)
    }

    const newHash = await hashPassword(new_password)
    await q.setSetting(db, 'password_hash', newHash)

    // 生成新 token，旧的失效
    const token = await generateToken()
    await q.setSetting(db, 'session_token', token)

    return c.json({ ok: true, token })
  })

  return r
}

/** 用 Web Crypto API 做 SHA-256 hash */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + '_memorial_hub_salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 生成随机 token */
async function generateToken(): Promise<string> {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}
