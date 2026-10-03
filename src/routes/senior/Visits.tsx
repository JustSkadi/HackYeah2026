import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Phone } from 'lucide-react'
import { useData } from '../../lib/data'
import SeniorShell, { SeniorEmpty } from '../../components/senior/SeniorShell'
import { usePhoneCall } from '../../components/PhoneCall'

export default function SeniorVisits() {
  const call = usePhoneCall()
  const { snap, current } = useData()
  const visits = snap.appointments.filter((a) => parseISO(a.starts_at) > current).sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  return (
    <SeniorShell title="Moje wizyty">
      {visits.length === 0 && <SeniorEmpty text="Nie ma zaplanowanych wizyt." />}
      {visits.map((a) => {
        const doctor = snap.doctors.find((d) => d.id === a.doctor_id)
        const at = parseISO(a.starts_at)
        return (
          <article key={a.id} className="rounded-[10px] border-4 border-primary-soft p-5">
            <p className="text-2xl font-bold first-letter:uppercase">{format(at, 'EEEE, d MMMM', { locale: pl })}</p>
            <p className="text-4xl font-bold text-primary tabular-nums">{format(at, 'HH:mm')}</p>
            <p className="mt-2 font-semibold">{doctor?.name ?? 'Wizyta'}</p>
            {doctor?.specialty && <p className="text-muted">{doctor.specialty}</p>}
            {a.place && <p className="mt-1 text-muted">{a.place}</p>}
            {a.note && <p className="mt-3 rounded-[10px] bg-primary-soft/40 p-3">{a.note}</p>}
            {doctor && (
              <button onClick={() => call({ name: doctor.name, number: doctor.phone })} className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 text-xl font-bold text-white">
                <Phone size={24} /> Zadzwoń
              </button>
            )}
          </article>
        )
      })}
    </SeniorShell>
  )
}
