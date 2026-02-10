import api from './api'

export interface Reminder {
  id: number
  memorial_id: number
  days_before: number
  channel: string
  enabled: boolean
}

export interface MemorialWithReminders {
  id: number
  name: string
  memorial_type: string
  date_mode: string
  solar_date: string | null
  lunar_month: number | null
  lunar_day: number | null
  person: string | null
  reminders: Reminder[]
}

export interface NotificationLog {
  id: number
  memorial_id: number
  channel: string
  status: string
  message: string | null
  sent_at: string
}

export interface NotifySettings {
  smtp_host: string | null
  smtp_port: number | null
  smtp_user: string | null
  has_smtp_pass: boolean
  notify_email: string | null
  telegram_bot_token: string | null
  telegram_chat_id: string | null
}

export const notificationApi = {
  // Reminders
  listReminders: (memorialId: number) =>
    api.get<Reminder[]>(`/notifications/reminders/${memorialId}`),
  listAllReminders: () =>
    api.get<MemorialWithReminders[]>('/notifications/reminders/all'),
  createReminder: (memorialId: number, data: { days_before: number; channel: string }) =>
    api.post<Reminder>(`/notifications/reminders/${memorialId}`, data),
  deleteReminder: (id: number) =>
    api.delete(`/notifications/reminders/rule/${id}`),

  // Logs
  listLogs: () => api.get<NotificationLog[]>('/notifications/logs'),

  // Settings
  getSettings: () => api.get<NotifySettings>('/notifications/settings'),
  saveSettings: (data: {
    smtp_host?: string | null
    smtp_port?: number | null
    smtp_user?: string | null
    smtp_pass?: string | null
    notify_email?: string | null
    telegram_bot_token?: string | null
    telegram_chat_id?: string | null
  }) => api.post('/notifications/settings', data),

  // Test
  testEmail: () => api.post('/notifications/test-email'),
  testTelegram: () => api.post('/notifications/test-telegram'),
}
