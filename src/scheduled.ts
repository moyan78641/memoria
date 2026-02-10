import type { DbAdapter } from './db/adapter'
import * as q from './db/queries'
import { sendEmail } from './notify/email'
import { sendTelegram } from './notify/telegram'

/** 定时推送：检查所有启用的提醒规则，匹配今天需要推送的 */
export async function handleScheduled(db: DbAdapter) {
  console.log('[cron] 开始检查推送任务...')

  // 北京时间今天
  const now = new Date()
  const bjOffset = 8 * 60 * 60 * 1000
  const bjDate = new Date(now.getTime() + bjOffset)
  const todayMonth = bjDate.getUTCMonth() + 1
  const todayDay = bjDate.getUTCDate()
  const todayYear = bjDate.getUTCFullYear()

  const reminders = await db.query<q.Reminder & { memorial_id: number }>(
    'SELECT * FROM reminders WHERE enabled = 1'
  )

  const settings = await q.getAllSettings(db)

  for (const rem of reminders) {
    const memorial = await q.getMemorial(db, rem.memorial_id)
    if (!memorial) continue

    const shouldNotify = checkShouldNotify(memorial, rem.days_before, todayYear, todayMonth, todayDay)
    if (!shouldNotify) continue

    const message = buildMessage(memorial, rem.days_before)
    const subject = `📅 纪念日提醒: ${memorial.name}`

    let status = 'success'
    let errMsg: string | undefined

    try {
      if (rem.channel === 'email') {
        const { smtp_host, smtp_port, smtp_user, smtp_pass, notify_email } = settings
        if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !notify_email) {
          status = 'failed'
          errMsg = '邮件配置不完整'
        } else {
          await sendEmail({ host: smtp_host, port: Number(smtp_port), user: smtp_user, pass: smtp_pass, to: notify_email, subject, body: message })
        }
      } else if (rem.channel === 'telegram') {
        const { telegram_bot_token, telegram_chat_id } = settings
        if (!telegram_bot_token || !telegram_chat_id) {
          status = 'failed'
          errMsg = 'Telegram 配置不完整'
        } else {
          await sendTelegram(telegram_bot_token, telegram_chat_id, message)
        }
      }
    } catch (e: any) {
      status = 'failed'
      errMsg = e.message
    }

    await q.insertLog(db, { memorial_id: memorial.id, channel: rem.channel, status, message: errMsg })
    console.log(`[cron] ${status}: ${memorial.name} via ${rem.channel}`)
  }

  console.log('[cron] 推送任务完成')
}

function checkShouldNotify(mem: q.Memorial, daysBefore: number, year: number, month: number, day: number): boolean {
  if (mem.date_mode === 'solar' && mem.solar_date) {
    const parts = mem.solar_date.split('-')
    if (parts.length === 2) {
      const mm = Number(parts[0])
      const dd = Number(parts[1])
      // 构造今年的纪念日
      const target = new Date(Date.UTC(year, mm - 1, dd))
      const today = new Date(Date.UTC(year, month - 1, day))
      const diff = Math.round((target.getTime() - today.getTime()) / (86400000))
      if (diff === daysBefore) return true
      // 如果今年已过，检查明年
      if (diff < 0) {
        const targetNext = new Date(Date.UTC(year + 1, mm - 1, dd))
        const diffNext = Math.round((targetNext.getTime() - today.getTime()) / (86400000))
        if (diffNext === daysBefore) return true
      }
    }
  }
  // 农历暂不支持，后续可集成
  return false
}

function buildMessage(mem: q.Memorial, daysBefore: number): string {
  const dateStr = mem.date_mode === 'solar'
    ? (mem.solar_date ?? '')
    : `农历${mem.lunar_month}月${mem.lunar_day}日`

  const personLine = mem.person ? `\n👤 关联人物：${mem.person}` : ''

  if (daysBefore === 0) {
    return `🎉 今天是「${mem.name}」！\n📅 日期：${dateStr}${personLine}`
  }
  return `📅 还有 ${daysBefore} 天就是「${mem.name}」了！\n📅 日期：${dateStr}${personLine}`
}
