import { parseISO } from 'date-fns'
import { CalendarClock, Phone } from 'lucide-react'
import { useData } from '../../lib/data'
import { fmtDateTime } from '../../lib/format'
import { PageTitle } from '../../components/ui'
import { usePhoneCall } from '../../components/PhoneCall'

/** Pełna lista nadchodzących wizyt (z Pulpitu: "Nadchodzące wizyty" → Zobacz wszystkie). */
export default function Visits() {
  const call = usePhoneCall()
  const { snap, current } = useData()
  const visits = snap.appointments.filter((a) => parseISO(a.starts_at) > current).sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Nadchodzące wizyty" subtitle={`${visits.length} zaplanowanych`} />
      {visits.length === 0 && <p className="card text-center text-muted">Brak zaplanowanych wizyt.</p>}
      {visits.map((a) => {
        const doctor = snap.doctors.find((d) => d.id === a.doctor_id)
        return (
          <article key={a.id} className="card flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft/60 text-primary">
              <CalendarClock size={20} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{fmtDateTime(a.starts_at)}</p>
              <p className="text-sm">{doctor ? `${doctor.name}${doctor.specialty ? ` · ${doctor.specialty}` : ''}` : 'Wizyta'}</p>
              {a.place && <p className="text-sm text-muted">{a.place}</p>}
              {a.note && <p className="mt-2 rounded-lg bg-primary-soft/30 p-2 text-sm">{a.note}</p>}
              {doctor && (
                <button
                  onClick={() => call({ name: doctor.name, number: doctor.phone })}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] border border-primary px-3 py-1.5 text-sm font-semibold text-primary"
                >
                  <Phone size={15} /> Zadzwoń do przychodni
                </button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
