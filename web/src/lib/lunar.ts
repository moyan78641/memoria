import { Solar, Lunar, HolidayUtil } from 'lunar-javascript'

export interface TodayInfo {
  solar: string        // 2026年2月10日
  solarWeek: string    // 星期二
  lunar: string        // 腊月廿三
  lunarFull: string    // 乙巳年 腊月廿三
  ganzhi: string       // 乙巳年 戊寅月 丙午日
  shengxiao: string    // 蛇
  jieqi: string | null // 当日节气
  festivals: string[]  // 节日列表
  yi: string[]         // 宜
  ji: string[]         // 忌
}

const WEEK_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export function getTodayInfo(date?: Date): TodayInfo {
  const d = date || new Date()
  const solar = Solar.fromDate(d)
  const lunar = solar.getLunar()

  // 节日
  const festivals: string[] = []
  solar.getFestivals().forEach((f: string) => festivals.push(f))
  lunar.getFestivals().forEach((f: string) => festivals.push(f))

  // 节气
  const jieqi = lunar.getJieQi()

  return {
    solar: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
    solarWeek: WEEK_NAMES[solar.getWeek()],
    lunar: lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    lunarFull: lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    ganzhi: lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInGanZhi() + '月 ' + lunar.getDayInGanZhi() + '日',
    shengxiao: lunar.getYearShengXiao(),
    jieqi: jieqi || null,
    festivals,
    yi: lunar.getDayYi() || [],
    ji: lunar.getDayJi() || [],
  }
}

/**
 * 计算某个纪念日距今天还有多少天
 * 返回负数表示已过
 */
export function daysUntilNext(
  dateMode: string,
  solarDate: string | null,
  lunarMonth: number | null,
  lunarDay: number | null,
  lunarLeap: boolean,
): number | null {
  const today = Solar.fromDate(new Date())
  const thisYear = today.getYear()

  try {
    let targetSolar: typeof today

    if (dateMode === 'solar' && solarDate) {
      const [mm, dd] = solarDate.split('-').map(Number)
      // 今年的日期
      targetSolar = Solar.fromYmd(thisYear, mm, dd)
      if (targetSolar.subtract(today) < 0) {
        // 已过，算明年
        targetSolar = Solar.fromYmd(thisYear + 1, mm, dd)
      }
    } else if (dateMode === 'lunar' && lunarMonth && lunarDay) {
      // 农历转阳历
      const lunarThis = Lunar.fromYmd(
        Lunar.fromDate(new Date()).getYear(),
        lunarLeap ? -lunarMonth : lunarMonth,
        lunarDay
      )
      targetSolar = lunarThis.getSolar()
      if (targetSolar.subtract(today) < 0) {
        const lunarNext = Lunar.fromYmd(
          Lunar.fromDate(new Date()).getYear() + 1,
          lunarLeap ? -lunarMonth : lunarMonth,
          lunarDay
        )
        targetSolar = lunarNext.getSolar()
      }
    } else {
      return null
    }

    return targetSolar.subtract(today)
  } catch {
    return null
  }
}

/**
 * 获取法定假日信息
 */
export function getHolidays(year: number, month: number) {
  const holidays: Array<{ day: number; name: string; isWork: boolean }> = []
  const solar = Solar.fromYmd(year, month, 1)
  const daysInMonth = solar.getMonth() === 12
    ? Solar.fromYmd(year + 1, 1, 1).subtract(solar)
    : Solar.fromYmd(year, month + 1, 1).subtract(solar)

  for (let d = 1; d <= daysInMonth; d++) {
    const h = HolidayUtil.getHoliday(year, month, d)
    if (h) {
      holidays.push({
        day: d,
        name: h.getName(),
        isWork: h.isWork(),
      })
    }
  }
  return holidays
}
