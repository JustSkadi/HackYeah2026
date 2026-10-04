import { describe, expect, it } from 'vitest'
import { forecastStock } from './stock'

const base = { package_size: 30, packages_bought: 1, units_per_dose: 1, times: ['08:00'], purchase_date: '2026-09-01' }

describe('forecastStock', () => {
  it('liczy ile powinno zostać i kiedy lek się skończy', () => {
    const f = forecastStock(base, new Date(2026, 8, 28), 7) // 27 dni po zakupie
    expect(f.expectedLeft).toBe(3)
    expect(f.daysLeft).toBe(3)
    expect(f.runoutDate).toEqual(new Date(2026, 9, 1))
    expect(f.needsRefill).toBe(true)
  })

  it('uwzględnia kilka dawek dziennie i kilka opakowań', () => {
    const f = forecastStock({ ...base, packages_bought: 2, times: ['08:00', '20:00'] }, new Date(2026, 8, 11), 7)
    expect(f.totalUnits).toBe(60)
    expect(f.dailyUnits).toBe(2)
    expect(f.expectedLeft).toBe(40)
    expect(f.daysLeft).toBe(20)
    expect(f.needsRefill).toBe(false)
  })

  it('nie schodzi poniżej zera', () => {
    const f = forecastStock(base, new Date(2026, 11, 1), 7)
    expect(f.expectedLeft).toBe(0)
    expect(f.daysLeft).toBe(0)
  })

  it('pół tabletki na dawkę', () => {
    const f = forecastStock({ ...base, units_per_dose: 0.5 }, new Date(2026, 8, 1), 7)
    expect(f.daysLeft).toBe(60)
  })
})
