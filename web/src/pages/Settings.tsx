import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { IconUser, IconLock, IconMapPin } from '@tabler/icons-react'
import { settingsApi, type Profile } from '../lib/settings-api'
import { useAuth } from '../stores/auth'
import { cn } from '../lib/utils'

export function Settings() {
  const { logout } = useAuth()
  const [, setProfile] = useState<Profile | null>(null)
  const [nickname, setNickname] = useState('')
  const [region, setRegion] = useState('north')
  const [savingProfile, setSavingProfile] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    settingsApi.getProfile().then((r) => {
      setProfile(r.data)
      setNickname(r.data.nickname)
      setRegion(r.data.region)
    }).catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await settingsApi.updateProfile({ nickname, region })
      toast.success('保存成功')
    } catch {
      toast.error('保存失败')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveRegion = async (r: string) => {
    setRegion(r)
    try {
      await settingsApi.updateProfile({ region: r })
      toast.success('地域偏好已更新')
    } catch { /* ignore */ }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('新密码至少6位')
      return
    }
    setSavingPassword(true)
    try {
      await settingsApi.changePassword({ old_password: oldPassword, new_password: newPassword })
      toast.success('密码修改成功')
      setOldPassword('')
      setNewPassword('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || '修改失败')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-text">系统设置</h1>

      {/* 个人信息 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-surface p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <IconUser size={20} className="text-primary" />
          <h2 className="font-medium text-text">个人信息</h2>
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-secondary">昵称</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {savingProfile ? '保存中...' : '保存'}
        </button>
      </motion.div>

      {/* 地域偏好 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-surface p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <IconMapPin size={20} className="text-primary" />
          <h2 className="font-medium text-text">地域偏好</h2>
        </div>
        <p className="mb-3 text-sm text-text-secondary">
          南北方在部分节日习俗上有差异，如小年日期等
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleSaveRegion('north')}
            className={cn(
              'flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
              region === 'north'
                ? 'border-primary bg-primary-light/30 text-primary'
                : 'border-border text-text-secondary hover:border-gray-300'
            )}
          >
            🧊 北方
          </button>
          <button
            onClick={() => handleSaveRegion('south')}
            className={cn(
              'flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
              region === 'south'
                ? 'border-primary bg-primary-light/30 text-primary'
                : 'border-border text-text-secondary hover:border-gray-300'
            )}
          >
            🌴 南方
          </button>
        </div>
      </motion.div>

      {/* 修改密码 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-surface p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <IconLock size={20} className="text-primary" />
          <h2 className="font-medium text-text">修改密码</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={savingPassword}
          className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {savingPassword ? '修改中...' : '修改密码'}
        </button>
      </motion.div>

      {/* 退出登录 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={logout}
          className="w-full rounded-lg border border-danger py-2.5 text-sm font-medium text-danger transition-colors hover:bg-red-50"
        >
          退出登录
        </button>
      </motion.div>
    </div>
  )
}
