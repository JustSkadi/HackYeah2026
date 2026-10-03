import { useState } from 'react'
import { addDays, addMonths, format, startOfDay, startOfWeek } from 'date-fns'
import { pl } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../../lib/data'
import { buildEvents, type CalEvent } from '../../components/calendar/events'
import TimeGrid from '../../components/calendar/TimeGrid'
import MonthGrid, { monthRange } from '../../components/calendar/MonthGrid'
import EventSheet from '../../components/calendar/EventSheet'

type View = 'day' | '3day' | 'week' | 'month'

const VIEWS: { id: View; label: string }[] = [
  { id: 'day', label: 'Dzień' },
  { id: '3day', label: '3 dni' },
  { id: 'week', label: 'Tydzień' },
  { id: 'month', label: 'Miesiąc' },
]
const VIEW_KEY = 'mojsenior:calendar-view'

function loadView(): View {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    if (v && VIEWS.some((x) => x.id === v)) return v as View
  } catch {
    // brak localStorage - domyślny widok
  }
  return '3day'
}

function visibleDays(view: View, anchor: Date): Date[] {
  if (view === 'day') return [anchor]
  if (view === '3day') return [0, 1, 2].map((i) => addDays(anchor, i))
  const monday = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export default function Calendar() {
  const { snap, current } = useData()
  const [view, setView] = useState<View>(loadView)
  const [anchor, setAnchor] = useState(() => startOfDay(current))
  const [selected, setSelected] = useState<CalEvent | null>(null)

  const changeView = (v: View) => {
    setView(v)
    try {
      localStorage.setItem(VIEW_KEY, v)
    } catch {
      // ignorujemy
    }
  }

  const days = visibleDays(view, anchor)
  const range = view === 'month' ? monthRange(anchor) : { from: days[0], to: days[days.length - 1] }
  const events = buildEvents(snap, current, range.from, range.to)

  const step = (dir: 1 | -1) => {
    if (view === 'month') setAnchor((a) => addMonths(a, dir))
    else setAnchor((a) => addDays(a, dir * (view === 'day' ? 1 : view === '3day' ? 3 : 7)))
  }

  const pickDay = (d: Date) => {
    setAnchor(startOfDay(d))
    changeView('day')
  }

  const title = format(view === 'month' ? anchor : days[0], 'LLLL yyyy', { locale: pl })

  return (
    <div className="flex h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-[10px] border">
      <div className="flex flex-col gap-2 border-b bg-white px-3 py-2">
        <div className="flex items-center gap-1">
          <h1 className="flex-1 text-lg font-bold first-letter:uppercase">{title}</h1>
          <button onClick={() => setAnchor(startOfDay(current))} className="rounded-lg border px-3 py-1 text-sm font-semibold">
            Dziś
          </button>
          <button onClick={() => step(-1)} aria-label="Wstecz" className="rounded-full p-1.5 hover:bg-primary-soft/40">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => step(1)} aria-label="Dalej" className="rounded-full p-1.5 hover:bg-primary-soft/40">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-4 rounded-lg bg-primary-soft/40 p-0.5 text-sm">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              className={`rounded-md py-1 font-semibold ${view === v.id ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'month' ? (
        <MonthGrid anchor={anchor} events={events} current={current} onPickDay={pickDay} />
      ) : (
        <TimeGrid days={days} events={events} current={current} onSelect={setSelected} onPickDay={pickDay} />
      )}

      {selected && <EventSheet event={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
