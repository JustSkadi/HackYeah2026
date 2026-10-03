// Budowanie wydarzeń kalendarza opiekuna z danych seniora.
import { addMinutes, eachDayOfInterval, format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns'
import type { Snapshot } from '../../lib/db'
import { config } from '../../lib/config'
import { forecastStock } from '../../lib/stock'
import { doseStatus, isDoseApplicable, scheduledTimesForDay, type DoseStatus } from '../../lib/doses'
import type { Appointment, Doctor, Medication } from '../../lib/types'

const DOSE_BLOCK_MIN = 30
const APPOINTMENT_MIN = 60

export interface DoseItem {
  med: Medication
  status: DoseStatus | 'planned'
  takenAt: string | null
}

export type CalEvent =
  | { id: string; kind: 'doses'; start: Date; end: Date; allDay: false; title: string; items: DoseItem[]; status: DoseStatus | 'planned' }
  | { id: string; kind: 'appointment'; start: Date; end: Date; allDay: false; title: string; appointment: Appointment; doctor?: Doctor }
  | { id: string; kind: 'refill' | 'runout'; start: Date; end: Date; allDay: true; title: string; med: Medication; overdue?: boolean }

/** Najgorszy status w grupie dawek decyduje o kolorze bloku. */
function groupStatus(items: DoseItem[]): DoseItem['status'] {
  const order: DoseItem['status'][] = ['missed', 'due', 'upcoming', 'planned', 'taken']
  return order.find((s) => items.some((i) => i.status === s)) ?? 'planned'
}

export function buildEvents(snap: Snapshot, current: Date, from: Date, to: Date): CalEvent[] {
  const events: CalEvent[] = []
  const today = startOfDay(current)

  // Dawki: grupowane po godzinie, żeby 3 leki o 8:00 były jednym blokiem
  for (const day of eachDayOfInterval({ start: from, end: to })) {
    const byTime = new Map<string, DoseItem[]>()
    for (const med of snap.medications) {
      if (isBefore(day, startOfDay(parseISO(med.purchase_date)))) continue
      for (const iso of scheduledTimesForDay(med, day)) {
        const dose = snap.doses.find((d) => d.medication_id === med.id && parseISO(d.scheduled_at).getTime() === parseISO(iso).getTime())
        if (!dose && !isDoseApplicable(med, iso, current)) continue
        // brak rekordu = brak danych (np. dni sprzed importu) albo przyszłość
        const status: DoseItem['status'] = dose ? doseStatus(dose, current, config.graceMinutes) : 'planned'
        const list = byTime.get(iso) ?? []
        list.push({ med, status, takenAt: dose?.taken_at ?? null })
        byTime.set(iso, list)
      }
    }
    for (const [iso, items] of byTime) {
      const start = parseISO(iso)
      events.push({
        id: `doses-${iso}`,
        kind: 'doses',
        start,
        end: addMinutes(start, DOSE_BLOCK_MIN),
        allDay: false,
        title: items.length === 1 ? items[0].med.name : `${items.length} leki`,
        items,
        status: groupStatus(items),
      })
    }
  }

  for (const a of snap.appointments) {
    const start = parseISO(a.starts_at)
    const doctor = snap.doctors.find((d) => d.id === a.doctor_id)
    events.push({
      id: `appt-${a.id}`,
      kind: 'appointment',
      start,
      end: addMinutes(start, APPOINTMENT_MIN),
      allDay: false,
      title: doctor ? `Wizyta: ${doctor.name}` : 'Wizyta',
      appointment: a,
      doctor,
    })
  }

  for (const med of snap.medications) {
    const f = forecastStock(med, current, config.refillWarnDays)
    const overdue = isBefore(f.refillBy, today)
    const refillDay = overdue ? today : startOfDay(f.refillBy)
    events.push({ id: `refill-${med.id}`, kind: 'refill', start: refillDay, end: refillDay, allDay: true, title: `Wykup: ${med.name}`, med, overdue })
    events.push({ id: `runout-${med.id}`, kind: 'runout', start: startOfDay(f.runoutDate), end: startOfDay(f.runoutDate), allDay: true, title: `Koniec: ${med.name}`, med })
  }

  return events.filter((e) => !isBefore(e.start, startOfDay(from)) && !isBefore(startOfDay(to), startOfDay(e.start)))
}

export const eventsOnDay = (events: CalEvent[], day: Date) => events.filter((e) => isSameDay(e.start, day))

export interface Positioned {
  event: CalEvent
  lane: number
  lanes: number
}

/** Układ nachodzących na siebie wydarzeń w kolumnach (jak w Google Calendar). */
export function layoutDay(events: CalEvent[]): Positioned[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime())
  const result: Positioned[] = []
  let cluster: Positioned[] = []
  let clusterEnd = 0
  let laneEnds: number[] = []

  const flush = () => {
    cluster.forEach((p) => (p.lanes = laneEnds.length))
    result.push(...cluster)
    cluster = []
    laneEnds = []
  }

  for (const event of sorted) {
    if (cluster.length && event.start.getTime() >= clusterEnd) flush()
    let lane = laneEnds.findIndex((end) => end <= event.start.getTime())
    if (lane === -1) lane = laneEnds.push(0) - 1
    laneEnds[lane] = event.end.getTime()
    clusterEnd = Math.max(clusterEnd, event.end.getTime())
    cluster.push({ event, lane, lanes: 1 })
  }
  flush()
  return result
}

export const eventTime = (e: CalEvent) => format(e.start, 'HH:mm')
