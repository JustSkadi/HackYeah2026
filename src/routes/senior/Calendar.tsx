// Kalendarz seniora: prosta lista na 7 dni (bez siatki godzinowej - czytelniej dla seniora).
import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CheckCircle2, Pill, ShoppingCart, Stethoscope } from 'lucide-react'
import { useData } from '../../lib/data'
import { buildEvents, eventsOnDay, type CalEvent } from '../../components/calendar/events'
import SeniorShell, { SeniorEmpty } from '../../components/senior/SeniorShell'

const DAYS = 7

function dayLabel(day: Date, today: Date) {
  if (isSameDay(day, today)) return 'Dziś'
  if (isSameDay(day, addDays(today, 1))) return 'Jutro'
  return format(day, 'EEEE, d MMMM', { locale: pl })
}

export default function SeniorCalendar() {
  const { snap, current } = useData()
  const today = startOfDay(current)
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i))
  // tylko to, co ważne dla seniora: leki, wizyty, wykup recepty
  const events = buildEvents(snap, current, days[0], days[DAYS - 1]).filter((e) => e.kind !== 'runout')

  return (
    <SeniorShell title="Mój kalendarz">
      {events.length === 0 && <SeniorEmpty text="W kalendarzu nic jeszcze nie ma." />}
      {days.map((day) => {
        const dayEvents = eventsOnDay(events, day).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime())
        if (dayEvents.length === 0) return null
        return (
          <section key={day.toISOString()} className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold first-letter:uppercase">{dayLabel(day, today)}</h2>
            {dayEvents.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </section>
        )
      })}
    </SeniorShell>
  )
}

function EventRow({ event: e }: { event: CalEvent }) {
  if (e.kind === 'appointment') {
    return (
      <div className="flex items-start gap-3 rounded-[10px] border-4 border-primary bg-primary-soft/40 p-4">
        <Stethoscope size={30} className="mt-1 shrink-0 text-primary" />
        <div>
          <p className="font-bold">
            {format(e.start, 'HH:mm')} · Wizyta
          </p>
          <p>{e.doctor?.name ?? ''}</p>
        </div>
      </div>
    )
  }
  if (e.kind === 'refill') {
    return (
      <div className="flex items-start gap-3 rounded-[10px] border-4 border-warning bg-warning-soft p-4 text-warning">
        <ShoppingCart size={30} className="mt-1 shrink-0" />
        <p className="font-bold">Kupić lek: {e.med.name}</p>
      </div>
    )
  }
  if (e.kind === 'doses') {
    const taken = e.status === 'taken'
    return (
      <div className={`flex items-start gap-3 rounded-[10px] border-4 p-4 ${taken ? 'border-success/40 bg-success-soft/50' : 'border-primary-soft'}`}>
        {taken ? <CheckCircle2 size={30} className="mt-1 shrink-0 text-success" /> : <Pill size={30} className="mt-1 shrink-0 text-primary" />}
        <div>
          <p className="font-bold">
            {format(e.start, 'HH:mm')} · Leki {taken && '- wzięte'}
          </p>
          <p className="text-lg">{e.items.map((i) => i.med.name).join(', ')}</p>
        </div>
      </div>
    )
  }
  return null
}
