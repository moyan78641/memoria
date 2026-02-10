import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendarEvent,
} from '@tabler/icons-react'
import { getMonthGrid, getWeekGrid, type CalendarDay } from '../lib/calendar'
import { dashboardApi, type MemorialBrief } from '../lib/dashboard-api'
import { Solar } from 'lunar-javascript'
import { cn } from '../lib/utils'

type ViewMode = 'month' | 'week'

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六']

export function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [memorials, setMemorials] = useState<MemorialBrief[]>([])

  useEffect(() => {
    dashboardApi.allMemorials().then((r) => setMemorials(r.data)).catch(() => {})
  }, [])

  const grid = useMemo(() => {
    if (viewMode === 'month') {
      return getMonthGrid(year, month)
    }
    return getWeekGrid(year, month, today.getDate())
  }, [year, month, viewMode])

  // 获取农历月份显示
  const lunarMonthInfo = useMemo(() => {
    const solar = Solar.fromYmd(year, month, 1)
    const lunar = solar.getLunar()
    return `农历${lunar.getYear()}年${lunar.getMonthInChinese()}月`
  }, [year, month])

  // 匹配纪念日到日期
  const memorialMap = useMemo(() => {
    const map = new Map<string, MemorialBrief[]>()
    memorials.forEach((m) => {
      // 尝试匹配到本月的每一天
      grid.forEach((day) => {
        if (!day.isCurrentMonth) return
        let match = false
        if (m.date_mode === 'solar' && m.solar_date) {
          const [mm, dd] = m.solar_date.split('-').map(Number)
          if (mm === day.month && dd === day.day) match = true
        } else if (m.date_mode === 'lunar' && m.lunar_month && m.lunar_day) {
          try {
            const solar = Solar.fromYmd(day.year, day.month, day.day)
            const lunar = solar.getLunar()
            if (lunar.getMonth() === m.lunar_month && lunar.getDay() === m.lunar_day) {
              match = true
            }
          } catch { /* ignore */ }
        }
        if (match) {
          const key = `${day.year}-${day.month}-${day.day}`
          if (!map.has(key)) map.set(key, [])
          map.get(key)!.push(m)
        }
      })
    })
    return map
  }, [memorials, grid])

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12) }
    else setMonth(month - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1) }
    else setMonth(month + 1)
  }

  const goToday = () => {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth() + 1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-gray-100">
            <IconChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text">{year}年{month}月</h2>
            <p className="text-sm text-text-secondary">{lunarMonthInfo}</p>
          </div>
          <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-gray-100">
            <IconChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            今天
          </button>
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'rounded-l-lg px-3 py-1.5 text-sm',
                viewMode === 'month' ? 'bg-primary text-white' : 'hover:bg-gray-50'
              )}
            >
              月视图
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'rounded-r-lg px-3 py-1.5 text-sm',
                viewMode === 'week' ? 'bg-primary text-white' : 'hover:bg-gray-50'
              )}
            >
              周视图
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEK_HEADERS.map((w, i) => (
            <div
              key={w}
              className={cn(
                'py-2 text-center text-sm font-medium',
                i === 0 || i === 6 ? 'text-primary' : 'text-text-secondary'
              )}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Days */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}-${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'grid grid-cols-7',
              viewMode === 'month' ? 'grid-rows-6' : 'grid-rows-1'
            )}
          >
            {grid.map((day, i) => {
              const key = `${day.year}-${day.month}-${day.day}`
              const dayMemorials = memorialMap.get(key) || []
              const hasHoliday = day.holiday && !day.holiday.isWork
              const isWorkDay = day.holiday?.isWork

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'relative cursor-pointer border-b border-r border-border p-1.5 transition-colors hover:bg-gray-50',
                    viewMode === 'month' ? 'min-h-[90px]' : 'min-h-[140px]',
                    !day.isCurrentMonth && 'opacity-40',
                    day.isToday && 'bg-primary-light/20',
                    selectedDay?.year === day.year && selectedDay?.month === day.month && selectedDay?.day === day.day && 'ring-2 ring-primary ring-inset'
                  )}
                >
                  {/* 日期数字 */}
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm',
                        day.isToday && 'bg-primary text-white font-bold',
                        !day.isToday && day.isWeekend && 'text-primary',
                        !day.isToday && hasHoliday && 'text-primary',
                      )}
                    >
                      {day.day}
                    </span>
                    {/* 假日/调休标记 */}
                    {hasHoliday && (
                      <span className="text-[10px] font-medium text-primary">休</span>
                    )}
                    {isWorkDay && (
                      <span className="text-[10px] font-medium text-text-secondary">班</span>
                    )}
                  </div>

                  {/* 农历/节气/节日 */}
                  <p className={cn(
                    'mt-0.5 text-[11px] leading-tight',
                    day.jieqi ? 'text-green-600 font-medium' :
                    day.lunarFestivals.length > 0 ? 'text-primary font-medium' :
                    day.solarFestivals.length > 0 ? 'text-primary font-medium' :
                    'text-text-secondary'
                  )}>
                    {day.jieqi || day.lunarFestivals[0] || day.solarFestivals[0] || day.lunarDay}
                  </p>

                  {/* 纪念日标记 */}
                  {dayMemorials.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayMemorials.slice(0, 2).map((m) => (
                        <div
                          key={m.id}
                          className="truncate rounded bg-primary-light/50 px-1 text-[10px] text-primary"
                        >
                          {m.name}
                        </div>
                      ))}
                      {dayMemorials.length > 2 && (
                        <span className="text-[10px] text-text-secondary">
                          +{dayMemorials.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" /> 今天
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-primary-light/50" /> 纪念日
        </span>
        <span className="flex items-center gap-1">
          <span className="text-primary font-medium">休</span> 法定假日
        </span>
        <span className="flex items-center gap-1">
          <span className="text-text-secondary font-medium">班</span> 调休上班
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-600 font-medium">●</span> 节气
        </span>
      </div>

      {/* 选中日期详情 */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text">
                  {selectedDay.year}年{selectedDay.month}月{selectedDay.day}日
                </h3>
                <p className="text-sm text-text-secondary">
                  农历 {selectedDay.lunarMonth}月{selectedDay.lunarDay}
                  {selectedDay.jieqi && ` · ${selectedDay.jieqi}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-sm text-text-secondary hover:text-text"
              >
                关闭
              </button>
            </div>

            {/* 节日 */}
            {(selectedDay.solarFestivals.length > 0 || selectedDay.lunarFestivals.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[...selectedDay.solarFestivals, ...selectedDay.lunarFestivals].map((f) => (
                  <span key={f} className="rounded-full bg-primary-light/40 px-2 py-0.5 text-xs text-primary font-medium">
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* 假日 */}
            {selectedDay.holiday && (
              <p className="mt-2 text-sm">
                {selectedDay.holiday.isWork ? '🏢 调休上班' : '🎉 ' + selectedDay.holiday.name + '（放假）'}
              </p>
            )}

            {/* 当日纪念日 */}
            {(() => {
              const key = `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`
              const dayM = memorialMap.get(key) || []
              if (dayM.length === 0) return null
              return (
                <div className="mt-3">
                  <p className="text-sm font-medium text-text">📌 纪念日</p>
                  {dayM.map((m) => (
                    <div key={m.id} className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
                      <IconCalendarEvent size={14} className="text-primary" />
                      <span>{m.name}</span>
                      {m.person && <span className="text-xs">· {m.person}</span>}
                    </div>
                  ))}
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
