import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { pl } from 'date-fns/locale'
import { eventsOnDay, type CalEvent } from './events'
import { eventClasses } from './styles'

const MAX_CHIPS = 2
const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

interface Props {
  anchor: Date
  events: CalEvent[]
  current: Date
  onPickDay: (d: Date) => void
}

export function monthRange(anchor: Date) {
  return {
    from: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1, locale: pl }),
    to: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1, locale: pl }),
  }
}

export default function MonthGrid({ anchor, events, current, onPickDay }: Props) {
  const { from, to } = monthRange(anchor)
  const days = eachDayOfInterval({ start: from, end: to })
  // W miesiącu pokazujemy tylko "ważne" wydarzenia - dawki są codziennie, więc tylko jako kropka przy brakach
  const important = events.filter((e) => e.kind !== 'doses')
  const missedDays = events.filter((e) => e.kind === 'doses' && e.status === 'missed')

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1.5 text-center text-[11px] uppercase text-muted">
            {w}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7">
        {days.map((d) => {
          const dayEvents = eventsOnDay(important, d)
          const today = isSameDay(d, current)
          const missed = eventsOnDay(missedDays, d).length > 0
          return (
            <button
              key={d.toISOString()}
              onClick={() => onPickDay(d)}
              className={`flex min-h-[4.5rem] min-w-0 flex-col items-stretch gap-0.5 border-b border-l p-0.5 text-left ${isSameMonth(d, anchor) ? '' : 'bg-primary-soft/20 text-muted/60'}`}
            >
              <span className="flex items-center justify-center gap-0.5">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${today ? 'bg-primary font-semibold text-white' : ''}`}>{format(d, 'd')}</span>
                {missed && <span className="h-1.5 w-1.5 rounded-full bg-danger" title="Pominięte dawki" />}
              </span>
              {dayEvents.slice(0, MAX_CHIPS).map((e) => (
                <span key={e.id} className={`truncate rounded border-l-2 px-0.5 text-[10px] leading-tight ${eventClasses(e)}`}>
                  {e.title}
                </span>
              ))}
              {dayEvents.length > MAX_CHIPS && <span className="px-0.5 text-[10px] text-muted">+{dayEvents.length - MAX_CHIPS} więcej</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
