declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar
    static fromYmd(year: number, month: number, day: number): Solar
    getYear(): number
    getMonth(): number
    getDay(): number
    getWeek(): number
    getLunar(): Lunar
    getFestivals(): string[]
    subtract(other: Solar): number
  }

  export class Lunar {
    static fromDate(date: Date): Lunar
    static fromYmd(year: number, month: number, day: number): Lunar
    getYear(): number
    getMonth(): number
    getDay(): number
    getMonthInChinese(): string
    getDayInChinese(): string
    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getYearShengXiao(): string
    getJieQi(): string
    getFestivals(): string[]
    getDayYi(): string[]
    getDayJi(): string[]
    getSolar(): Solar
  }

  export class HolidayUtil {
    static getHoliday(year: number, month: number, day: number): Holiday | null
  }

  export class Holiday {
    getName(): string
    isWork(): boolean
  }
}
