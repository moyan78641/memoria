import { Hono } from 'hono'
import type { Env } from '../app'
import * as q from '../db/queries'
import { reminderRoutes } from './reminders'
import { sendEmail } from '../notify/email'
import { sendTelegram } from '../notify/telegram'

export function notificationRoutes() {
  const r = new Hono<Env>()

  // 挂载提醒子路由
  r.route('/reminders', reminderRoutes())

  // 推送记录
  r.get('/logs', async (c) => {
    const db = c.get('db')
    return c.json(await q.listLogs(db))
  })

  // 推送设置（读取）
  r.get('/settings', async (c) => {
    const db = c.get('db')
    const all = await q.getAllSettings(db)
    return c.json({
      smtp_host: all['smtp_host'] ?? null,
      smtp_port: all['smtp_port'] ? Number(all['smtp_port']) : null,
      smtp_user: all['smtp_user'] ?? null,
      has_smtp_pass: !!all['smtp_pass'],
      notify_email: all['notify_email'] ?? null,
      telegram_bot_token: all['telegram_bot_token'] ?? null,
      telegram_chat_id: all['telegram_chat_id'] ?? null,
    })
  })

  // 推送设置（保存）
  r.post('/settings', async (c) => {
    const db = c.get('db')
    const body = await c.req.json()
    const keys = ['smtp_host', 'smtp_port', 'smtp_user', 'notify_email', 'telegram_bot_token', 'telegram_chat_id']
    for (const key of keys) {
      if (body[key] !== undefined && body[key] !== null) {
        await q.setSetting(db, key, String(body[key]))
      }
    }
    // smtp_pass 单独处理，空字符串不覆盖
    if (body.smtp_pass) {
      await q.setSetting(db, 'smtp_pass', body.smtp_pass)
    }
    return c.json({ ok: true })
  })

  // 测试邮件
  r.post('/test-email', async (c) => {
    const db = c.get('db')
    const all = await q.getAllSettings(db)
    const { smtp_host, smtp_port, smtp_user, smtp_pass, notify_email } = all
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !notify_email) {
      return c.json({ error: '邮件配置不完整' }, 400)
    }
    try {
      await sendEmail({
        host: smtp_host, port: Number(smtp_port), user: smtp_user, pass: smtp_pass, to: notify_email,
        subject: 'MemorialHub 测试邮件',
        body: '🎉 恭喜！邮件推送配置成功。\n\n这是一封来自 MemorialHub 的测试邮件。',
      })
      return c.json({ ok: true, message: '测试邮件已发送' })
    } catch (e: any) {
      return c.json({ error: `发送失败: ${e.message}` }, 400)
    }
  })

  // 测试 Telegram
  r.post('/test-telegram', async (c) => {
    const db = c.get('db')
    const all = await q.getAllSettings(db)
    const { telegram_bot_token, telegram_chat_id } = all
    if (!telegram_bot_token || !telegram_chat_id) {
      return c.json({ error: 'Telegram 配置不完整' }, 400)
    }
    try {
      await sendTelegram(telegram_bot_token, telegram_chat_id, '🎉 <b>MemorialHub 测试消息</b>\n\nTelegram 推送配置成功！')
      return c.json({ ok: true, message: '测试消息已发送' })
    } catch (e: any) {
      return c.json({ error: `发送失败: ${e.message}` }, 400)
    }
  })

  return r
}
