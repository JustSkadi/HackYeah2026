import { Link } from 'react-router-dom'
import { parseISO } from 'date-fns'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Download, ShoppingCart } from 'lucide-react'
import { useData } from '../../lib/data'
import { config, PHARMACY_SEARCH_URL } from '../../lib/config'
import { forecastStock } from '../../lib/stock'
import { hhmm, type DoseStatus } from '../../lib/doses'
import { firstName, fmtDate, fmtDateTime } from '../../lib/format'

const statusUi: Record<DoseStatus, { label: string; cls: string; icon: typeof Clock }> = {
  taken: { label: 'Wzięte', cls: 'bg-success-soft text-success', icon: CheckCircle2 },
  due: { label: 'Teraz', cls: 'bg-primary-soft text-primary', icon: Clock },
  missed: { label: 'Brak potwierdzenia', cls: 'bg-danger-soft text-danger', icon: AlertTriangle },
  upcoming: { label: 'Zaplanowane', cls: 'bg-slate-100 text-muted', icon: Clock },
}

export default function Dashboard() {
  const { snap, todayDoses, missed, current } = useData()
  const name = snap.senior ? firstName(snap.senior.name) : 'Senior'

  if (snap.medications.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold">Brak leków seniora</p>
        <p className="mt-1 text-muted">Zaimportuj recepty z Internetowego Konta Pacjenta.</p>
        <Link to="/opiekun/leki" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white">
          <Download size={18} /> Importuj z IKP
        </Link>
      </div>
    )
  }

  const refills = snap.medications
    .map((med) => ({ med, f: forecastStock(med, current, config.refillWarnDays) }))
    .filter((x) => x.f.needsRefill)
    .sort((a, b) => a.f.daysLeft - b.f.daysLeft)

  const nextAppointment = snap.appointments
    .filter((a) => parseISO(a.starts_at) > current)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0]

  return (
    <div className="flex flex-col gap-4">
      {missed.map(({ dose, med }) => (
        <div key={dose.id} className="flex gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-danger">
          <AlertTriangle className="shrink-0" />
          <div>
            <p className="font-semibold">
              {name}: brak potwierdzenia leku {med.name} ({hhmm(dose.scheduled_at)})
            </p>
            <p className="text-sm">Minęło ponad {config.graceMinutes} min od godziny przyjęcia.</p>
          </div>
        </div>
      ))}

      {refills.map(({ med, f }) => {
        const doctor = snap.doctors.find((d) => d.id === med.prescribing_doctor_id)
        return (
          <div key={med.id} className="rounded-2xl border border-warning/30 bg-warning-soft p-4 text-warning">
            <p className="font-semibold">
              {f.daysLeft === 0 ? `Skończył się ${med.name}` : `Za ${f.daysLeft} dni kończy się ${med.name}`}
            </p>
            <p className="text-sm">
              {f.refillBy < current ? 'Wykup receptę jak najszybciej.' : `Wykup receptę do ${fmtDate(f.refillBy)}.`} Lek wystarczy do {fmtDate(f.runoutDate)}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
              <a href={med.buy_online_url ?? PHARMACY_SEARCH_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-warning px-3 py-2 text-white">
                <ShoppingCart size={16} /> Kup online
              </a>
              {doctor && (
                <a href={`tel:${doctor.phone}`} className="rounded-lg border border-warning px-3 py-2">
                  Zadzwoń: {doctor.name}
                </a>
              )}
            </div>
          </div>
        )
      })}

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">Dzisiaj</h2>
        <ol className="flex flex-col gap-2">
          {todayDoses.map(({ dose, med, status }) => {
            const ui = statusUi[status]
            return (
              <li key={dose.id} className="flex items-center gap-3">
                <span className="w-12 text-sm tabular-nums text-muted">{hhmm(dose.scheduled_at)}</span>
                <span className="h-3 w-3 shrink-0 rounded-full border" style={{ background: med.color ?? '#fff' }} />
                <span className="flex-1 truncate">{med.name}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ui.cls}`}>
                  <ui.icon size={14} /> {status === 'taken' && dose.taken_at ? `${ui.label} ${hhmm(dose.taken_at)}` : ui.label}
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      {nextAppointment && (
        <section className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <CalendarClock className="shrink-0 text-primary" />
          <div>
            <p className="font-bold">Najbliższa wizyta</p>
            <p>{fmtDateTime(nextAppointment.starts_at)}</p>
            <p className="text-sm text-muted">
              {snap.doctors.find((d) => d.id === nextAppointment.doctor_id)?.name} · {nextAppointment.place}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
