import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import {
  IconMail,
  IconBrandTelegram,
  IconCheck,
  IconX,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import {
  notificationApi,
  type NotifySettings,
  type NotificationLog,
  type MemorialWithReminders,
} from '../lib/notification-api'
import { cn } from '../lib/utils'

export function Notifications() {
  const [tab, setTab] = useState<'reminders' | 'logs' | 'settings'>('reminders')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">推送通知</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        {[
          { key: 'reminders' as const, label: '提醒规则' },
          { key: 'logs' as const, label: '推送记录' },
          { key: 'settings' as const, label: '渠道配置' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reminders' && <RemindersTab />}
      {tab === 'logs' && <LogsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  )
}

// === Reminders Tab ===
function RemindersTab() {
  const [data, setData] = useState<MemorialWithReminders[]>([])
  const [loading, setLoading] = useState(true)
  const [addingFor, setAddingFor] = useState<number | null>(null)
  const [daysBefore, setDaysBefore] = useState(1)
  const [channel, setChannel] = useState('email')

  const fetchData = () => {
    notificationApi
      .listAllReminders()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const addReminder = async (memorialId: number) => {
    try {
      await notificationApi.createReminder(memorialId, { days_before: daysBefore, channel })
      toast.success('提醒规则已添加')
      setAddingFor(null)
      setDaysBefore(1)
      setChannel('email')
      fetchData()
    } catch {
      toast.error('添加失败')
    }
  }

  const deleteReminder = async (id: number) => {
    try {
      await notificationApi.deleteReminder(id)
      toast.success('已删除')
      fetchData()
    } catch {
      toast.error('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="py-10 text-center text-sm text-text-secondary">
          暂无纪念日，请先添加纪念日后再设置提醒规则
        </p>
      </motion.div>
    )
  }

  const formatDate = (m: MemorialWithReminders) => {
    if (m.date_mode === 'lunar' && m.lunar_month && m.lunar_day) {
      return `农历 ${m.lunar_month}月${m.lunar_day}日`
    }
    return m.solar_date || ''
  }

  const typeLabels: Record<string, string> = {
    birthday: '🎂 生日',
    anniversary: '💍 纪念日',
    memorial: '🕯️ 纪念',
    holiday: '🎉 节日',
    other: '📌 其他',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {data.map((m) => (
        <div key={m.id} className="rounded-xl border border-border bg-surface overflow-hidden">
          {/* 纪念日信息头 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gray-50/50">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base">{typeLabels[m.memorial_type]?.slice(0, 2) || '📌'}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {m.name}
                  {m.person && <span className="ml-1.5 text-text-secondary font-normal">({m.person})</span>}
                </p>
                <p className="text-xs text-text-secondary">{formatDate(m)}</p>
              </div>
            </div>
            <button
              onClick={() => setAddingFor(addingFor === m.id ? null : m.id)}
              className="flex items-center gap-1 rounded-lg border border-primary/30 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors shrink-0"
            >
              <IconPlus size={14} />
              添加提醒
            </button>
          </div>

          {/* 提醒规则列表 */}
          <div className="px-4 py-2">
            {m.reminders.length === 0 ? (
              <p className="py-2 text-xs text-text-secondary">未设置提醒</p>
            ) : (
              <div className="divide-y divide-border/30">
                {m.reminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5">
                      {r.channel === 'email' ? (
                        <IconMail size={16} className="text-blue-500" />
                      ) : (
                        <IconBrandTelegram size={16} className="text-sky-500" />
                      )}
                      <span className="text-sm text-text">
                        {r.days_before === 0 ? '当天推送' : `提前 ${r.days_before} 天`}
                        <span className="text-text-secondary"> · {r.channel === 'email' ? '邮件' : 'Telegram'}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="rounded p-1 text-danger/60 hover:text-danger hover:bg-red-50 transition-colors"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 内联添加表单 */}
          {addingFor === m.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-border/50 bg-gray-50/30 px-4 py-3"
            >
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-text-secondary">提前天数</label>
                  <input
                    type="number"
                    min={0}
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(Number(e.target.value))}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-text-secondary">渠道</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="email">邮件</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>
                <button
                  onClick={() => addReminder(m.id)}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  确定
                </button>
                <button
                  onClick={() => setAddingFor(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-100"
                >
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </motion.div>
  )
}

// === Logs Tab ===
function LogsTab() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi
      .listLogs()
      .then((r) => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {logs.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">暂无推送记录</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
            >
              {log.status === 'success' ? (
                <IconCheck size={18} className="text-success" />
              ) : (
                <IconX size={18} className="text-danger" />
              )}
              <div className="flex-1">
                <span className="text-sm text-text">
                  {log.channel === 'email' ? '📧 邮件' : '📱 Telegram'}
                </span>
                {log.message && (
                  <p className="mt-0.5 text-xs text-text-secondary">{log.message}</p>
                )}
              </div>
              <span className="text-xs text-text-secondary">
                {new Date(log.sent_at).toLocaleString('zh-CN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// === Settings Tab ===
function SettingsTab() {
  const [settings, setSettings] = useState<NotifySettings | null>(null)
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('465')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [tgToken, setTgToken] = useState('')
  const [tgChatId, setTgChatId] = useState('')
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingTg, setTestingTg] = useState(false)

  useEffect(() => {
    notificationApi.getSettings().then((r) => {
      const s = r.data
      setSettings(s)
      setSmtpHost(s.smtp_host || '')
      setSmtpPort(s.smtp_port?.toString() || '465')
      setSmtpUser(s.smtp_user || '')
      setNotifyEmail(s.notify_email || '')
      setTgToken(s.telegram_bot_token || '')
      setTgChatId(s.telegram_chat_id || '')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await notificationApi.saveSettings({
        smtp_host: smtpHost || null,
        smtp_port: smtpPort ? parseInt(smtpPort) : null,
        smtp_user: smtpUser || null,
        smtp_pass: smtpPass || null,
        notify_email: notifyEmail || null,
        telegram_bot_token: tgToken || null,
        telegram_chat_id: tgChatId || null,
      })
      toast.success('保存成功')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      await notificationApi.testEmail()
      toast.success('测试邮件已发送，请检查收件箱')
    } catch (err: any) {
      toast.error(err.response?.data?.error || '发送失败')
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestTelegram = async () => {
    setTestingTg(true)
    try {
      await notificationApi.testTelegram()
      toast.success('测试消息已发送，请检查 Telegram')
    } catch (err: any) {
      toast.error(err.response?.data?.error || '发送失败')
    } finally {
      setTestingTg(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Email */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconMail size={20} className="text-blue-500" />
            <h3 className="font-medium text-text">邮件推送</h3>
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testingEmail}
            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
          >
            {testingEmail ? '发送中...' : '📧 发送测试'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">SMTP 服务器</label>
            <input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">端口</label>
            <input
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="465"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">用户名</label>
            <input
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              密码 {settings?.has_smtp_pass && '(已设置)'}
            </label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="留空则不修改"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-text-secondary">接收通知的邮箱</label>
            <input
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="receive@email.com"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Telegram */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBrandTelegram size={20} className="text-sky-500" />
            <h3 className="font-medium text-text">Telegram 推送</h3>
          </div>
          <button
            onClick={handleTestTelegram}
            disabled={testingTg}
            className="rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-50 disabled:opacity-50"
          >
            {testingTg ? '发送中...' : '📱 发送测试'}
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Bot Token</label>
            <input
              value={tgToken}
              onChange={(e) => setTgToken(e.target.value)}
              placeholder="123456:ABC-DEF..."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Chat ID</label>
            <input
              value={tgChatId}
              onChange={(e) => setTgChatId(e.target.value)}
              placeholder="你的 Chat ID"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存配置'}
      </button>
    </motion.div>
  )
}
