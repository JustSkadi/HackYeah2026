import { useState } from 'react'
import { Link } from 'react-router-dom'
import { parseISO } from 'date-fns'
import { AlertTriangle, CalendarClock, CheckCircle2, Download, Pill, ShoppingCart } from 'lucide-react'
import { useData } from '../../lib/data'
import { buyOnlineUrl, config } from '../../lib/config'
import { forecastStock } from '../../lib/stock'
import { hhmm } from '../../lib/doses'
import { firstName, fmtDate, fmtDateTime } from '../../lib/format'
import { QuickTiles, Section } from '../../components/ui'
import { usePhoneCall } from '../../components/PhoneCall'

const PREVIEW = 2

export default function Dashboard() {
  const call = usePhoneCall()
  const { snap, missed, current } = useData()
  const [allAlerts, setAllAlerts] = useState(false)
  const name = snap.senior ? firstName(snap.senior.name) : 'Senior'

  const forecasts = snap.medications
    .map((med) => ({ med, f: forecastStock(med, current, config.refillWarnDays) }))
    .sort((a, b) => a.f.daysLeft - b.f.daysLeft)
  const refills = forecasts.filter((x) => x.f.needsRefill)

  const appointments = snap.appointments
    .filter((a) => parseISO(a.starts_at) > current)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  // Powiadomienia: najpierw pominięte dawki, potem kończące się leki
  const alerts = [
    ...missed.map(({ dose, med }) => (
      <div key={dose.id} className="flex gap-3 rounded-[10px] border border-danger/20 bg-danger-soft p-4 text-danger">
        <AlertTriangle className="shrink-0" />
        <div>
          <p className="font-semibold">
            {name}: brak potwierdzenia leku {med.name} ({hhmm(dose.scheduled_at)})
          </p>
          <p className="text-sm">Minęło ponad {config.graceMinutes} min od godziny przyjęcia.</p>
        </div>
      </div>
    )),
    ...refills.map(({ med, f }) => {
      const doctor = snap.doctors.find((d) => d.id === med.prescribing_doctor_id)
      return (
        <div key={med.id} className="rounded-[10px] border border-warning/20 bg-warning-soft p-4 text-warning">
          <p className="flex items-center gap-2 font-semibold">
            <Pill size={18} className="shrink-0" />
            {f.daysLeft === 0 ? `Skończył się ${med.name}` : `Za ${f.daysLeft} dni kończy się ${med.name}`}
          </p>
          <p className="mt-1 text-sm">
            {f.refillBy < current ? 'Wykup receptę jak najszybciej.' : `Wykup receptę do ${fmtDate(f.refillBy)}.`} Lek wystarczy do {fmtDate(f.runoutDate)}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            <a href={buyOnlineUrl(med)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-warning px-3 py-2 text-white">
              <ShoppingCart size={16} /> Kup online
            </a>
            {doctor && (
              <button onClick={() => call({ name: doctor.name, number: doctor.phone })} className="rounded-lg border border-warning px-3 py-2">
                Zadzwoń: {doctor.name}
              </button>
            )}
          </div>
        </div>
      )
    }),
  ]

  return (
    <div className="flex flex-col gap-7">
      <QuickTiles />

      <Section
        title="Powiadomienia"
        more={alerts.length > PREVIEW ? { onClick: () => setAllAlerts((v) => !v), label: allAlerts ? 'Zwiń' : 'Zobacz wszystkie' } : undefined}
      >
        {snap.medications.length === 0 ? (
          <div className="card text-center">
            <p className="font-semibold">Brak leków seniora</p>
            <p className="mt-1 text-sm text-muted">Zaimportuj recepty z Internetowego Konta Pacjenta.</p>
            <Link to="/opiekun/leki" className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 font-semibold text-white">
              <Download size={18} /> Importuj z IKP
            </Link>
          </div>
        ) : alerts.length === 0 ? (
          <div className="card flex items-center gap-3 text-success">
            <CheckCircle2 /> Wszystko w porządku - brak nowych powiadomień.
          </div>
        ) : (
          (allAlerts ? alerts : alerts.slice(0, PREVIEW)).map((a) => a)
        )}
      </Section>

      {forecasts.length > 0 && (
        <Section title="Recepty" more={{ to: '/opiekun/leki' }}>
          <div className="card flex flex-col gap-3">
            {forecasts.slice(0, 3).map(({ med, f }) => (
              <div key={med.id} className="flex items-center gap-3 text-sm">
                <span className="h-3 w-3 shrink-0 rounded-full border" style={{ background: med.color ?? '#fff' }} />
                <span className="flex-1 truncate font-medium">{med.name}</span>
                <span className={f.needsRefill ? 'font-semibold text-warning' : 'text-muted'}>do {fmtDate(f.runoutDate)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Nadchodzące wizyty" more={{ to: '/opiekun/kalendarz' }}>
        {appointments.length === 0 && <p className="card text-sm text-muted">Brak zaplanowanych wizyt.</p>}
        {appointments.slice(0, PREVIEW).map((a) => {
          const doctor = snap.doctors.find((d) => d.id === a.doctor_id)
          return (
            <div key={a.id} className="card flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft/60 text-primary">
                <CalendarClock size={20} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{fmtDateTime(a.starts_at)}</p>
                <p className="text-sm">{doctor ? `${doctor.name}${doctor.specialty ? ` · ${doctor.specialty}` : ''}` : 'Wizyta'}</p>
                {a.place && <p className="truncate text-sm text-muted">{a.place}</p>}
              </div>
            </div>
          )
        })}
      </Section>
    </div>
  )
}
