import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'motion/react'
import { IconX } from '@tabler/icons-react'
import { toast } from 'sonner'
import { memorialApi, type Memorial, type CreateMemorialRequest } from '../lib/memorial-api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Memorial | null
  onSaved: () => void
}

const TYPES = [
  { value: 'birthday', label: '生日' },
  { value: 'anniversary', label: '纪念日' },
  { value: 'custom', label: '自定义' },
]

const LUNAR_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const LUNAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)

export function MemorialDialog({ open, onOpenChange, item, onSaved }: Props) {
  const isEdit = !!item

  const [name, setName] = useState('')
  const [memorialType, setMemorialType] = useState('birthday')
  const [dateMode, setDateMode] = useState('solar')
  const [solarDate, setSolarDate] = useState('')
  const [lunarMonth, setLunarMonth] = useState(1)
  const [lunarDay, setLunarDay] = useState(1)
  const [lunarLeap, setLunarLeap] = useState(false)
  const [startYear, setStartYear] = useState('')
  const [person, setPerson] = useState('')
  const [groupName, setGroupName] = useState('')
  const [note, setNote] = useState('')
  const [recurring, setRecurring] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setMemorialType(item.memorial_type)
      setDateMode(item.date_mode)
      setSolarDate(item.solar_date || '')
      setLunarMonth(item.lunar_month || 1)
      setLunarDay(item.lunar_day || 1)
      setLunarLeap(item.lunar_leap)
      setStartYear(item.start_year?.toString() || '')
      setPerson(item.person || '')
      setGroupName(item.group_name || '')
      setNote(item.note || '')
      setRecurring(item.recurring)
    } else {
      setName('')
      setMemorialType('birthday')
      setDateMode('solar')
      setSolarDate('')
      setLunarMonth(1)
      setLunarDay(1)
      setLunarLeap(false)
      setStartYear('')
      setPerson('')
      setGroupName('')
      setNote('')
      setRecurring(true)
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const data: CreateMemorialRequest = {
      name,
      memorial_type: memorialType,
      date_mode: dateMode,
      solar_date: dateMode === 'solar' ? solarDate : null,
      lunar_month: dateMode === 'lunar' ? lunarMonth : null,
      lunar_day: dateMode === 'lunar' ? lunarDay : null,
      lunar_leap: dateMode === 'lunar' ? lunarLeap : false,
      start_year: startYear ? parseInt(startYear) : null,
      person: person || null,
      group_name: groupName || null,
      note: note || null,
      recurring,
    }

    try {
      if (isEdit) {
        await memorialApi.update(item.id, data)
        toast.success('更新成功')
      } else {
        await memorialApi.create(data)
        toast.success('创建成功')
      }
      onSaved()
    } catch (err: any) {
      toast.error(err.response?.data?.error || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-bold text-text">
                    {isEdit ? '编辑纪念日' : '添加纪念日'}
                  </Dialog.Title>
                  <Dialog.Close className="rounded-lg p-1 text-text-secondary hover:bg-gray-100">
                    <IconX size={20} />
                  </Dialog.Close>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 名称 */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text">名称 *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="如：妈妈生日"
                    />
                  </div>

                  {/* 类型 + 日期模式 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text">类型</label>
                      <select
                        value={memorialType}
                        onChange={(e) => setMemorialType(e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        {TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text">日期模式</label>
                      <select
                        value={dateMode}
                        onChange={(e) => setDateMode(e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="solar">阳历</option>
                        <option value="lunar">农历</option>
                      </select>
                    </div>
                  </div>

                  {/* 日期 */}
                  {dateMode === 'solar' ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text">阳历日期 *</label>
                      <input
                        type="text"
                        value={solarDate}
                        onChange={(e) => setSolarDate(e.target.value)}
                        placeholder="MM-DD，如 03-15"
                        required
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-text">农历月 *</label>
                        <select
                          value={lunarMonth}
                          onChange={(e) => setLunarMonth(Number(e.target.value))}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                        >
                          {LUNAR_MONTHS.map((m) => (
                            <option key={m} value={m}>{m}月</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-text">农历日 *</label>
                        <select
                          value={lunarDay}
                          onChange={(e) => setLunarDay(Number(e.target.value))}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                        >
                          {LUNAR_DAYS.map((d) => (
                            <option key={d} value={d}>{d}日</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 pb-2 text-sm text-text">
                          <input
                            type="checkbox"
                            checked={lunarLeap}
                            onChange={(e) => setLunarLeap(e.target.checked)}
                            className="accent-primary"
                          />
                          闰月
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 起始年份 + 关联人物 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text">起始年份</label>
                      <input
                        type="number"
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                        placeholder="如 1990"
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text">关联人物</label>
                      <input
                        type="text"
                        value={person}
                        onChange={(e) => setPerson(e.target.value)}
                        placeholder="如：妈妈"
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* 分组 */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text">分组</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="如：家人、朋友"
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {/* 备注 */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text">备注</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* 每年重复 */}
                  <label className="flex items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      className="accent-primary"
                    />
                    每年重复
                  </label>

                  {/* 提交 */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-gray-50">
                      取消
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                    >
                      {submitting ? '保存中...' : isEdit ? '更新' : '创建'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
