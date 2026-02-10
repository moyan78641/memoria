import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  IconHeart,
  IconCake,
  IconCalendarEvent,
  IconCategory,
} from '@tabler/icons-react'
import { getTodayInfo, daysUntilNext, type TodayInfo } from '../lib/lunar'
import { dashboardApi, type DashboardStats, type MemorialBrief } from '../lib/dashboard-api'

const TYPE_LABELS: Record<string, string> = {
  birthday: '生日',
  anniversary: '纪念日',
  custom: '自定义',
}

export function Dashboard() {
  const [todayInfo, setTodayInfo] = useState<TodayInfo | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [memorials, setMemorials] = useState<MemorialBrief[]>([])

  useEffect(() => {
    setTodayInfo(getTodayInfo())
    dashboardApi.stats().then((r) => setStats(r.data)).catch(() => {})
    dashboardApi.allMemorials().then((r) => setMemorials(r.data)).catch(() => {})
  }, [])

  // 计算即将到来的纪念日并排序
  const upcoming = useMemo(() => {
    return memorials
      .map((m) => {
        const days = daysUntilNext(m.date_mode, m.solar_date, m.lunar_month, m.lunar_day, m.lunar_leap)
        return { ...m, daysLeft: days }
      })
      .filter((m) => m.daysLeft !== null && m.daysLeft >= 0)
      .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999))
      .slice(0, 8)
  }, [memorials])

  // 今天的纪念日
  const todayMemorials = upcoming.filter((m) => m.daysLeft === 0)

  return (
    <div className="space-y-6">
      {/* 今日信息卡片 */}
      {todayInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-primary to-accent p-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">今天</p>
              <h2 className="mt-1 text-2xl font-bold">{todayInfo.solar}</h2>
              <p className="mt-1 text-base opacity-90">{todayInfo.solarWeek}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">农历</p>
              <p className="mt-1 text-lg font-semibold">{todayInfo.lunar}</p>
              <p className="mt-1 text-sm opacity-80">{todayInfo.ganzhi}</p>
              <p className="text-sm opacity-80">{todayInfo.shengxiao}年</p>
            </div>
          </div>
          {(todayInfo.festivals.length > 0 || todayInfo.jieqi) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {todayInfo.jieqi && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {todayInfo.jieqi}
                </span>
              )}
              {todayInfo.festivals.map((f) => (
                <span key={f} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {f}
                </span>
              ))}
            </div>
          )}
          {todayMemorials.length > 0 && (
            <div className="mt-4 rounded-xl bg-white/15 p-3">
              <p className="text-sm font-medium">🎉 今天的纪念日</p>
              {todayMemorials.map((m) => (
                <p key={m.id} className="mt-1 text-sm">
                  {m.name} {m.person ? `· ${m.person}` : ''}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<IconHeart size={22} />}
            label="总记录"
            value={stats.total_memorials}
            color="bg-pink-100 text-pink-600"
            delay={0}
          />
          <StatCard
            icon={<IconCake size={22} />}
            label="生日"
            value={stats.birthday_count}
            color="bg-orange-100 text-orange-600"
            delay={0.05}
          />
          <StatCard
            icon={<IconCalendarEvent size={22} />}
            label="纪念日"
            value={stats.anniversary_count}
            color="bg-purple-100 text-purple-600"
            delay={0.1}
          />
          <StatCard
            icon={<IconCategory size={22} />}
            label="分组"
            value={stats.group_count}
            color="bg-blue-100 text-blue-600"
            delay={0.15}
          />
        </div>
      )}

      {/* 即将到来 */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-text">即将到来</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-text-secondary">暂无即将到来的纪念日</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((m, i) => (
              <CountdownCard key={m.id} item={m} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </motion.div>
  )
}

function CountdownCard({
  item,
  delay,
}: {
  item: MemorialBrief & { daysLeft: number | null }
  delay: number
}) {
  const isToday = item.daysLeft === 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`rounded-xl border p-4 ${
        isToday
          ? 'border-primary bg-primary-light/30'
          : 'border-border bg-surface'
      }`}
    >
      <div className="mb-2 flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${isToday ? 'text-primary' : 'text-primary'}`}>
          {isToday ? '今天' : item.daysLeft}
        </span>
        {!isToday && <span className="text-sm text-text-secondary">天后</span>}
      </div>
      <p className="font-medium text-text">{item.name}</p>
      {item.person && (
        <p className="mt-0.5 text-sm text-text-secondary">{item.person}</p>
      )}
      <span className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-text-secondary">
        {TYPE_LABELS[item.memorial_type] || item.memorial_type}
      </span>
    </motion.div>
  )
}
