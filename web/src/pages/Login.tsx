import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuth } from '../stores/auth'
import { authApi } from '../lib/api'

export function Login() {
  const [password, setPassword] = useState('')
  const [siteName, setSiteName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [initialized, setInitialized] = useState<boolean | null>(null)
  const [currentSiteName, setCurrentSiteName] = useState('MemorialHub')
  const { setToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    authApi.status().then((r) => {
      setInitialized(r.data.initialized)
      setCurrentSiteName(r.data.site_name || 'MemorialHub')
      document.title = r.data.site_name || 'MemorialHub'
    }).catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await authApi.login({ password })
      setToken(res.data.token)
      localStorage.setItem('site_name', currentSiteName)
      toast.success('登录成功')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('密码至少6位')
      return
    }
    setSubmitting(true)
    try {
      const name = siteName.trim() || 'MemorialHub'
      const res = await authApi.setup({ password, site_name: name })
      setToken(res.data.token)
      localStorage.setItem('site_name', name)
      toast.success('初始化成功，欢迎使用！')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || '初始化失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (initialized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const isSetup = !initialized

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-xl font-bold">
            {(isSetup ? siteName : currentSiteName).charAt(0).toUpperCase() || 'M'}
          </div>
          <h1 className="text-xl font-bold text-text">
            {isSetup ? '初始化你的纪念日应用' : `登录 ${currentSiteName}`}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isSetup ? '设置网站名称和访问密码' : '输入密码继续'}
          </p>
        </div>

        <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-4">
          {isSetup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-text">网站名称</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                placeholder="MemorialHub"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              {isSetup ? '设置密码' : '密码'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              placeholder="至少6位"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? '处理中...' : isSetup ? '完成初始化' : '登录'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
