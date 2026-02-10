import api from './api'

export interface DashboardStats {
  total_memorials: number
  birthday_count: number
  anniversary_count: number
  group_count: number
}

export interface MemorialBrief {
  id: number
  name: string
  memorial_type: string
  date_mode: string
  solar_date: string | null
  lunar_month: number | null
  lunar_day: number | null
  lunar_leap: boolean
  start_year: number | null
  person: string | null
  group_name: string | null
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  allMemorials: () => api.get<MemorialBrief[]>('/dashboard/all-memorials'),
}
