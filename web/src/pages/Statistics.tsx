import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  IconCalendar,
  IconSun,
  IconMoon,
  IconRepeat,
  IconCategory,
} from '@tabler/icons-react'
import {
  statisticsApi,
  type StatsOverview,
  type TypeStat,
  type MonthStat,
  type NotifyStat,
} from '../lib/statistics-api'

const TYPE_LABELS: Record<string, string> = {
  birthday: '生日',
  anniversary: '纪念日',
  custom: '自定义',
}

const PIE_COLORS = ['#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ff9800']

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

export function Statistics() {
  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [typeStats, setTypeStats] = useState<TypeStat[]>([])
  const [monthStats, setMonthStats] = useState<MonthStat[]>([])
  const [notifyStats, setNotifyStats] = useState<NotifyStat | null>(null)

  useEffect(() => {
    statisticsApi.overview().then((r) => setOverview(r.data)).catch(() => {})
    statisticsApi.byType().then((r) => setTypeStats(r.data)).catch(() => {})
    statisticsApi.byMonth().then((r) => setMonthStats(r.data)).catch(() => {})
    statisticsApi.notifyStats().then((r) => setNotifyStats(r.data)).catch(() => {})
  }, [])

  const pieData = typeStats.map((t) => ({
    name: TYPE_LABELS[t.memorial_type] || t.memorial_type,
    value: t.count,
  }))

  const barData = monthStats.map((m) => ({
    name: MONTH_NAMES[m.month - 1] || `${m.month}月`,
    count: m.count,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">数据统计</h1>

      {/* 概览卡片 */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <OverviewCard icon={<IconCalendar size={20} />} label="总记录" value={overview.total} color="bg-pink-100 text-pink-600" delay={0} />
          <OverviewCard icon={<IconSun size={20} />} label="阳历" value={overview.solar_count} color="bg-orange-100 text-orange-600" delay={0.05} />
          <OverviewCard icon={<IconMoon size={20} />} label="农历" value={overview.lunar_count} color="bg-indigo-100 text-indigo-600" delay={0.1} />
          <OverviewCard icon={<IconRepeat size={20} />} label="每年重复" value={overview.recurring_count} color="bg-green-100 text-green-600" delay={0.15} />
          <OverviewCard icon={<IconCategory size={20} />} label="分组" value={overview.group_count} color="bg-blue-100 text-blue-600" delay={0.2} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 按类型分布 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h3 className="mb-4 font-medium text-text">按类型分布</h3>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-secondary">暂无数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* 按月份分布 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h3 className="mb-4 font-medium text-text">按月份分布</h3>
          {barData.every((d) => d.count === 0) ? (
            <p className="py-10 text-center text-sm text-text-secondary">暂无数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#e91e63" radius={[4, 4, 0, 0]} name="数量" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* 推送统计 */}
      {notifyStats && notifyStats.total_sent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h3 className="mb-4 font-medium text-text">推送统计</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{notifyStats.total_sent}</p>
              <p className="text-xs text-text-secondary">总推送</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{notifyStats.success_count}</p>
              <p className="text-xs text-text-secondary">成功</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{notifyStats.failed_count}</p>
              <p className="text-xs text-text-secondary">失败</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{notifyStats.email_count}</p>
              <p className="text-xs text-text-secondary">邮件</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-500">{notifyStats.telegram_count}</p>
              <p className="text-xs text-text-secondary">Telegram</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function OverviewCard({
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
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </motion.div>
  )
}
