import { addDays, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns'
import { CalendarClock, Pill, ShoppingCart } from 'lucide-react'
import { useData } from '../../lib/data'
import { config } from '../../lib/config'
import { forecastStock } from '../../lib/stock'
import { fmtDay, fmtTime } from '../../lib/format'

const DAYS_AHEAD = 14

interface CalEvent {
  at: Date
  kind: 'appointment' | 'refill' | 'runout'
  title: string
  detail?: string
}

export default function Calendar() {
  const { snap, current } = useData()
  const from = startOfDay(current)
  const to = addDays(from, DAYS_AHEAD)
  const dosesPerDay = snap.medications.reduce((n, m) => n + m.times.length, 0)

  const events: CalEvent[] = [
    ...snap.appointments.map((a) => ({
      at: parseISO(a.starts_at),
      kind: 'appointment' as const,
      title: `Wizyta: ${snap.doctors.find((d) => d.id === a.doctor_id)?.name ?? 'lekarz'}`,
      detail: [a.place, a.note].filter(Boolean).join(' · '),
    })),
    ...snap.medications.flatMap((m) => {
      const f = forecastStock(m, current, config.refillWarnDays)
      return [
        { at: f.refillBy, kind: 'refill' as const, title: `Wykup receptę: ${m.name}` },
        { at: f.runoutDate, kind: 'runout' as const, title: `Koniec opakowania: ${m.name}` },
      ]
    }),
  ]
    .map((e) => (isBefore(e.at, from) && e.kind === 'refill' ? { ...e, at: from, detail: 'Termin minął - wykup jak najszybciej' } : e))
    .filter((e) => !isBefore(e.at, from) && isBefore(e.at, to))
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(from, i))

  return (
    <div className="flex flex-col gap-3">
      {days.map((day) => {
        const dayEvents = events.filter((e) => isSameDay(e.at, day))
        if (dayEvents.length === 0 && !isSameDay(day, from)) return null
        return (
          <section key={day.toISOString()} className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold first-letter:uppercase">{fmtDay(day)}</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {dosesPerDay > 0 && (
                <li className="flex items-center gap-2 text-muted">
                  <Pill size={16} /> {dosesPerDay} dawek leków
                </li>
              )}
              {dayEvents.map((e, i) => (
                <li key={i} className="flex gap-2">
                  {e.kind === 'appointment' ? <CalendarClock size={16} className="mt-0.5 text-primary" /> : <ShoppingCart size={16} className="mt-0.5 text-warning" />}
                  <div>
                    <p className="font-semibold">
                      {e.kind === 'appointment' && `${fmtTime(e.at)} · `}
                      {e.title}
                    </p>
                    {e.detail && <p className="text-muted">{e.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
