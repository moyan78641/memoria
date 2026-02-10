import api from './api'

export interface Profile {
  nickname: string
  region: string
}

export const settingsApi = {
  getProfile: () => api.get<Profile>('/settings/profile'),
  updateProfile: (data: { nickname?: string; region?: string }) =>
    api.post<Profile>('/settings/profile', data),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),
}
