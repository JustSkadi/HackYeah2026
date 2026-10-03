import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Phone, ShoppingCart, X } from 'lucide-react'
import { buyOnlineUrl } from '../../lib/config'
import { hhmm } from '../../lib/doses'
import type { CalEvent } from './events'
import { doseStatusLabel } from './styles'
import { usePhoneCall } from '../PhoneCall'

interface Props {
  event: CalEvent
  onClose: () => void
}

/** Szczegóły wydarzenia jako bottom sheet. */
export default function EventSheet({ event, onClose }: Props) {
  const call = usePhoneCall()
  const when = event.allDay
    ? format(event.start, 'EEEE, d MMMM', { locale: pl })
    : `${format(event.start, 'EEEE, d MMMM', { locale: pl })} · ${format(event.start, 'HH:mm')}`

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-24 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{event.title}</h2>
            <p className="text-sm text-muted first-letter:uppercase">{when}</p>
          </div>
          <button onClick={onClose} aria-label="Zamknij" className="rounded-full p-1 text-muted hover:bg-primary-soft/40">
            <X />
          </button>
        </div>

        {event.kind === 'doses' && (
          <ul className="mt-4 flex flex-col gap-2">
            {event.items.map((item) => (
              <li key={item.med.id} className="flex items-center gap-3">
                <span className="h-4 w-4 shrink-0 rounded-full border" style={{ background: item.med.color ?? '#fff' }} />
                <span className="flex-1">
                  <b>{item.med.name}</b> <span className="text-sm text-muted">{item.med.dose_label}</span>
                </span>
                <span className="text-sm text-muted">
                  {item.status === 'taken' && item.takenAt ? `Wzięte ${hhmm(item.takenAt)}` : doseStatusLabel[item.status]}
                </span>
              </li>
            ))}
          </ul>
        )}

        {event.kind === 'appointment' && (
          <div className="mt-4 flex flex-col gap-1 text-sm">
            {event.doctor?.specialty && <p>{event.doctor.specialty}</p>}
            {event.appointment.place && <p className="text-muted">{event.appointment.place}</p>}
            {event.appointment.note && <p className="mt-1 rounded-lg bg-primary-soft/20 p-2">{event.appointment.note}</p>}
            {event.doctor && (
              <button onClick={() => event.doctor && call({ name: event.doctor.name, number: event.doctor.phone })} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-semibold text-white">
                <Phone size={16} /> Zadzwoń do przychodni
              </button>
            )}
          </div>
        )}

        {(event.kind === 'refill' || event.kind === 'runout') && (
          <div className="mt-4 text-sm">
            <p>
              {event.kind === 'refill'
                ? event.overdue
                  ? 'Termin wykupu minął - lek kończy się w ciągu kilku dni.'
                  : 'Dobry moment na wykup kolejnego opakowania.'
                : 'Według planu dawkowania w tym dniu skończy się opakowanie.'}
            </p>
            <a
              href={buyOnlineUrl(event.med)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-warning py-2.5 font-semibold text-white"
            >
              <ShoppingCart size={16} /> Kup online
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
