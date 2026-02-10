import api from './api'

export interface Memorial {
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
  note: string | null
  recurring: boolean
  created_at: string
  updated_at: string
}

export interface CreateMemorialRequest {
  name: string
  memorial_type: string
  date_mode: string
  solar_date?: string | null
  lunar_month?: number | null
  lunar_day?: number | null
  lunar_leap?: boolean
  start_year?: number | null
  person?: string | null
  group_name?: string | null
  note?: string | null
  recurring?: boolean
}

export const memorialApi = {
  list: (params?: { group?: string; memorial_type?: string; keyword?: string }) =>
    api.get<Memorial[]>('/memorials', { params }),
  get: (id: number) => api.get<Memorial>(`/memorials/${id}`),
  create: (data: CreateMemorialRequest) => api.post<Memorial>('/memorials', data),
  update: (id: number, data: CreateMemorialRequest) => api.put<Memorial>(`/memorials/${id}`, data),
  delete: (id: number) => api.delete(`/memorials/${id}`),
  groups: () => api.get<string[]>('/memorials/groups'),
}
