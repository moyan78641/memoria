import api from './api'

export interface StatsOverview {
  total: number
  solar_count: number
  lunar_count: number
  recurring_count: number
  group_count: number
}

export interface TypeStat {
  memorial_type: string
  count: number
}

export interface MonthStat {
  month: number
  count: number
}

export interface NotifyStat {
  total_sent: number
  success_count: number
  failed_count: number
  email_count: number
  telegram_count: number
}

export const statisticsApi = {
  overview: () => api.get<StatsOverview>('/statistics/overview'),
  byType: () => api.get<TypeStat[]>('/statistics/by-type'),
  byMonth: () => api.get<MonthStat[]>('/statistics/by-month'),
  notifyStats: () => api.get<NotifyStat>('/statistics/notify-stats'),
}
