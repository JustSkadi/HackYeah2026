// Kalendarz seniora: lista na 7 dni (bez siatki godzinowej - czytelniej dla seniora).
// Każdy dzień to osobna karta z kolorowym nagłówkiem, wpisy z godziną po lewej i ikoną wg typu.
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
  return format(day, 'EEEE', { locale: pl })
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
        const isToday = isSameDay(day, today)
        const hasVisit = dayEvents.some((e) => e.kind === 'appointment')
        return (
          <section key={day.toISOString()} className="overflow-hidden rounded-[10px] border-2 border-primary-soft">
            <header className={`flex items-baseline justify-between gap-2 px-4 py-3 ${isToday ? 'bg-navy text-white' : 'bg-primary-soft/50 text-navy'}`}>
              <h2 className="text-2xl font-bold first-letter:uppercase">{dayLabel(day, today)}</h2>
              <span className={`text-lg ${isToday ? 'text-primary-soft' : 'text-muted'}`}>{format(day, 'd MMMM', { locale: pl })}</span>
            </header>
            {hasVisit && (
              <p className="flex items-center gap-2 bg-primary px-4 py-1.5 text-lg font-bold text-white">
                <Stethoscope size={20} /> Wizyta u lekarza
              </p>
            )}
            <ul className="divide-y divide-primary-soft/60">
              {dayEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </section>
        )
      })}
    </SeniorShell>
  )
}

function EventRow({ event: e }: { event: CalEvent }) {
  const time = e.allDay ? '' : format(e.start, 'HH:mm')

  if (e.kind === 'appointment') {
    return (
      <Row time={time} icon={<Stethoscope size={26} />} iconCls="bg-primary text-white" rowCls="bg-primary-soft/40">
        <p className="font-bold">Wizyta</p>
        <p className="text-lg">{e.doctor?.name ?? ''}</p>
        {e.doctor?.specialty && <p className="text-lg text-muted">{e.doctor.specialty}</p>}
      </Row>
    )
  }
  if (e.kind === 'refill') {
    return (
      <Row time="" icon={<ShoppingCart size={26} />} iconCls="bg-warning text-white" rowCls="bg-warning-soft">
        <p className="font-bold text-warning">Kupić lek</p>
        <p className="text-lg">{e.med.name}</p>
      </Row>
    )
  }
  if (e.kind === 'doses') {
    const taken = e.status === 'taken'
    return (
      <Row
        time={time}
        icon={taken ? <CheckCircle2 size={26} /> : <Pill size={26} />}
        iconCls={taken ? 'bg-success text-white' : 'bg-sky/20 text-primary'}
        rowCls={taken ? 'bg-success-soft/40' : 'bg-white'}
      >
        <p className="font-bold">{taken ? 'Leki - wzięte' : 'Leki'}</p>
        <ul className="mt-1 flex flex-col gap-1">
          {e.items.map((i) => (
            <li key={i.med.id} className="flex items-center gap-2 text-lg">
              <span className="h-4 w-4 shrink-0 rounded-full border border-navy/30" style={{ background: i.med.color ?? '#fff' }} />
              {i.med.name}
            </li>
          ))}
        </ul>
      </Row>
    )
  }
  return null
}

function Row({ time, icon, iconCls, rowCls, children }: { time: string; icon: React.ReactNode; iconCls: string; rowCls: string; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-3 px-4 py-3 ${rowCls}`}>
      <span className="w-16 shrink-0 pt-2 text-xl font-bold tabular-nums">{time}</span>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${iconCls}`}>{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}
