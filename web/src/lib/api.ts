import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// 请求拦截器：带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 跳转登录
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth API（单租户：只有一个用户）
export interface AuthResponse {
  token: string
}

export const authApi = {
  // 初始化（注册，只能调一次）
  setup: (data: { password: string; site_name?: string }) =>
    api.post<AuthResponse>('/auth/setup', data),
  login: (data: { password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  // 检查是否已初始化
  status: () => api.get<{ initialized: boolean; site_name: string }>('/auth/status'),
}
