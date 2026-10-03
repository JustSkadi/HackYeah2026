import { addMinutes, format, parseISO } from 'date-fns'
import type { DoseEvent, Medication } from './types'

export type DoseStatus = 'taken' | 'upcoming' | 'due' | 'missed'

/** Planowane terminy dawek na dany dzień (czas lokalny przeglądarki). */
export function scheduledTimesForDay(med: Medication, day: Date): string[] {
  return med.times.map((t) => {
    const [h, m] = t.split(':').map(Number)
    const d = new Date(day)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  })
}

export function doseStatus(dose: DoseEvent, current: Date, graceMinutes: number): DoseStatus {
  if (dose.taken_at) return 'taken'
  const at = parseISO(dose.scheduled_at)
  if (current < at) return 'upcoming'
  if (current < addMinutes(at, graceMinutes)) return 'due'
  return 'missed'
}

/** Czy senior może już potwierdzić dawkę (do godziny przed terminem). */
export function canConfirm(dose: DoseEvent, current: Date): boolean {
  return !dose.taken_at && current >= addMinutes(parseISO(dose.scheduled_at), -60)
}

export function hhmm(iso: string): string {
  return format(parseISO(iso), 'HH:mm')
}
