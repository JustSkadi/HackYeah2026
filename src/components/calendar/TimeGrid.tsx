import { useEffect, useRef } from 'react'
import { format, isSameDay } from 'date-fns'
import { pl } from 'date-fns/locale'
import { AlertTriangle, CheckCircle2, Pill, Stethoscope } from 'lucide-react'
import { eventsOnDay, eventTime, layoutDay, type CalEvent } from './events'
import { eventClasses } from './styles'

const HOUR_PX = 52
const SCROLL_TO_HOUR = 7
const HOURS = Array.from({ length: 24 }, (_, h) => h)

interface Props {
  days: Date[]
  events: CalEvent[]
  current: Date
  onSelect: (e: CalEvent) => void
  onPickDay: (d: Date) => void
}

export default function TimeGrid({ days, events, current, onSelect, onPickDay }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const compact = days.length > 3

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: SCROLL_TO_HOUR * HOUR_PX - 12 })
  }, [days.length])

  const cols = { gridTemplateColumns: `2.75rem repeat(${days.length}, minmax(0, 1fr))` }
  const allDay = events.filter((e) => e.allDay)
  const timed = events.filter((e) => !e.allDay)
  const nowTop = (current.getHours() * 60 + current.getMinutes()) * (HOUR_PX / 60)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* nagłówki dni */}
      <div className="grid border-b bg-white" style={cols}>
        <div />
        {days.map((d) => {
          const today = isSameDay(d, current)
          return (
            <button key={d.toISOString()} onClick={() => onPickDay(d)} className="flex flex-col items-center py-1.5">
              <span className={`text-[11px] uppercase ${today ? 'font-semibold text-primary' : 'text-muted'}`}>{format(d, 'EEEEEE', { locale: pl })}</span>
              <span className={`grid h-8 w-8 place-items-center rounded-full text-lg ${today ? 'bg-primary font-semibold text-white' : ''}`}>{format(d, 'd')}</span>
            </button>
          )
        })}
      </div>

      {/* wiersz "cały dzień" */}
      {allDay.length > 0 && (
        <div className="grid border-b bg-white" style={cols}>
          <div className="pr-1 pt-1 text-right text-[10px] leading-tight text-muted">cały dzień</div>
          {days.map((d) => (
            <div key={d.toISOString()} className="flex min-w-0 flex-col gap-0.5 border-l p-0.5">
              {eventsOnDay(allDay, d).map((e) => (
                <button key={e.id} onClick={() => onSelect(e)} className={`truncate rounded border-l-4 px-1 py-0.5 text-left text-[11px] font-semibold ${eventClasses(e)}`}>
                  {e.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* siatka godzinowa */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="relative grid" style={{ ...cols, height: 24 * HOUR_PX }}>
          <div className="relative">
            {HOURS.map((h) =>
              h === 0 ? null : (
                <span key={h} className="absolute right-1.5 -translate-y-1/2 text-[11px] text-muted tabular-nums" style={{ top: h * HOUR_PX }}>
                  {String(h).padStart(2, '0')}:00
                </span>
              ),
            )}
          </div>

          {days.map((d) => {
            const today = isSameDay(d, current)
            return (
              <div key={d.toISOString()} className={`relative border-l ${today ? 'bg-primary-soft/30' : ''}`}>
                {HOURS.map((h) => (
                  <div key={h} className="absolute inset-x-0 border-t border-primary-soft/40" style={{ top: h * HOUR_PX }} />
                ))}

                {layoutDay(eventsOnDay(timed, d)).map(({ event, lane, lanes }) => {
                  const startMin = event.start.getHours() * 60 + event.start.getMinutes()
                  const durMin = (event.end.getTime() - event.start.getTime()) / 60_000
                  return (
                    <button
                      key={event.id}
                      onClick={() => onSelect(event)}
                      className={`absolute overflow-hidden rounded-md border-l-4 px-1 py-0.5 text-left shadow-sm ${eventClasses(event)}`}
                      style={{
                        top: startMin * (HOUR_PX / 60) + 1,
                        height: Math.max(durMin * (HOUR_PX / 60) - 2, compact ? 22 : 32),
                        left: `calc(${(lane / lanes) * 100}% + 2px)`,
                        width: `calc(${100 / lanes}% - 4px)`,
                      }}
                    >
                      <span className="flex items-center gap-1 text-[11px] font-semibold leading-tight">
                        <EventIcon event={event} />
                        <span className="truncate">{compact && event.kind === 'doses' ? event.items.length : event.title}</span>
                      </span>
                      {!compact && <span className="block truncate text-[10px] leading-tight opacity-80">{eventTime(event)}</span>}
                    </button>
                  )
                })}

                {today && (
                  <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: nowTop }}>
                    <div className="absolute -left-1 -top-[5px] h-2.5 w-2.5 rounded-full bg-danger" />
                    <div className="h-0.5 bg-danger" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EventIcon({ event }: { event: CalEvent }) {
  if (event.kind === 'appointment') return <Stethoscope size={12} className="shrink-0" />
  if (event.kind === 'doses' && event.status === 'taken') return <CheckCircle2 size={12} className="shrink-0" />
  if (event.kind === 'doses' && event.status === 'missed') return <AlertTriangle size={12} className="shrink-0" />
  return <Pill size={12} className="shrink-0" />
}
