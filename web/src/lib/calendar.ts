import { Solar, HolidayUtil } from 'lunar-javascript'

export interface CalendarDay {
  year: number
  month: number
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  lunarDay: string
  lunarMonth: string
  jieqi: string | null
  solarFestivals: string[]
  lunarFestivals: string[]
  holiday: { name: string; isWork: boolean } | null
}

/**
 * 生成某月的日历网格（含前后补齐）
 */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth() + 1
  const todayD = today.getDate()

  // 本月第一天是星期几（0=周日）
  const firstDay = new Date(year, month - 1, 1).getDay()
  // 本月天数
  const daysInMonth = new Date(year, month, 0).getDate()
  // 上月天数
  const prevMonthDays = new Date(year, month - 1, 0).getDate()

  const grid: CalendarDay[] = []

  // 上月补齐
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const m = month === 1 ? 12 : month - 1
    const y = month === 1 ? year - 1 : year
    grid.push(buildDay(y, m, d, false, todayY, todayM, todayD))
  }

  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(buildDay(year, month, d, true, todayY, todayM, todayD))
  }

  // 下月补齐到 42 格（6行）
  const remaining = 42 - grid.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 12 ? 1 : month + 1
    const y = month === 12 ? year + 1 : year
    grid.push(buildDay(y, m, d, false, todayY, todayM, todayD))
  }

  return grid
}

function buildDay(
  year: number,
  month: number,
  day: number,
  isCurrentMonth: boolean,
  todayY: number,
  todayM: number,
  todayD: number,
): CalendarDay {
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()
  const weekDay = solar.getWeek()
  const jieqi = lunar.getJieQi()

  const solarFestivals: string[] = []
  solar.getFestivals().forEach((f: string) => solarFestivals.push(f))

  const lunarFestivals: string[] = []
  lunar.getFestivals().forEach((f: string) => lunarFestivals.push(f))

  let holiday: { name: string; isWork: boolean } | null = null
  const h = HolidayUtil.getHoliday(year, month, day)
  if (h) {
    holiday = { name: h.getName(), isWork: h.isWork() }
  }

  return {
    year,
    month,
    day,
    isCurrentMonth,
    isToday: year === todayY && month === todayM && day === todayD,
    isWeekend: weekDay === 0 || weekDay === 6,
    lunarDay: lunar.getDayInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    jieqi: jieqi || null,
    solarFestivals,
    lunarFestivals,
    holiday,
  }
}

/**
 * 获取某周的日历数据
 */
export function getWeekGrid(year: number, month: number, day: number): CalendarDay[] {
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth() + 1
  const todayD = today.getDate()

  const date = new Date(year, month - 1, day)
  const weekDay = date.getDay()
  // 回到本周日
  date.setDate(date.getDate() - weekDay)

  const grid: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()
    grid.push(buildDay(y, m, d, m === month, todayY, todayM, todayD))
    date.setDate(date.getDate() + 1)
  }

  return grid
}
