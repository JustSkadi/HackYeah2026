import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import type { Medication } from './types'

export interface StockForecast {
  totalUnits: number
  dailyUnits: number
  expectedLeft: number // ile POWINNO zostać wg planu dawkowania
  daysLeft: number
  runoutDate: Date
  refillBy: Date
  needsRefill: boolean
}

type StockInput = Pick<Medication, 'package_size' | 'packages_bought' | 'units_per_dose' | 'times' | 'purchase_date'>

export function forecastStock(med: StockInput, today: Date, refillWarnDays: number): StockForecast {
  const totalUnits = med.package_size * med.packages_bought
  const dailyUnits = med.units_per_dose * med.times.length
  const purchase = startOfDay(parseISO(med.purchase_date))
  const daysElapsed = Math.max(0, differenceInCalendarDays(startOfDay(today), purchase))

  if (dailyUnits <= 0) {
    const far = addDays(purchase, 365 * 10)
    return { totalUnits, dailyUnits, expectedLeft: totalUnits, daysLeft: Infinity, runoutDate: far, refillBy: far, needsRefill: false }
  }

  const expectedLeft = Math.max(0, totalUnits - dailyUnits * daysElapsed)
  const daysLeft = Math.floor(expectedLeft / dailyUnits)
  const runoutDate = addDays(purchase, Math.floor(totalUnits / dailyUnits))
  const refillBy = addDays(runoutDate, -refillWarnDays)

  return { totalUnits, dailyUnits, expectedLeft, daysLeft, runoutDate, refillBy, needsRefill: daysLeft <= refillWarnDays }
}
