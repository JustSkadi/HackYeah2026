import { Link } from 'react-router-dom'
import { Check, Phone } from 'lucide-react'
import { useData, type TodayDose } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { canConfirm, hhmm } from '../../lib/doses'
import { fmtDay, fmtTime } from '../../lib/format'

export default function SeniorToday() {
  const { todayDoses, current, snap } = useData()

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col bg-white pb-36 text-[22px]">
      <header className="bg-primary px-6 pb-6 pt-8 text-white">
        <p className="text-2xl first-letter:uppercase">{fmtDay(current)}</p>
        <p className="text-6xl font-bold tabular-nums">{fmtTime(current)}</p>
      </header>

      <section className="flex flex-col gap-4 p-5">
        <h1 className="text-3xl font-bold">Leki na dziś</h1>
        {todayDoses.length === 0 && (
          <p className="rounded-2xl bg-slate-100 p-6 text-center text-muted">
            {snap.medications.length === 0 ? 'Opiekun jeszcze nie dodał leków.' : 'Na dziś nie ma więcej leków.'}
          </p>
        )}
        {todayDoses.map((t) => (
          <DoseCard key={t.dose.id} item={t} current={current} />
        ))}
      </section>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-white/90 p-4 backdrop-blur">
        <Link
          to="/senior/pomoc"
          className="flex h-24 items-center justify-center gap-4 rounded-3xl bg-danger text-4xl font-bold text-white shadow-xl active:scale-[0.98]"
        >
          <Phone size={40} /> POMOC
        </Link>
      </div>
    </main>
  )
}

function DoseCard({ item, current }: { item: TodayDose; current: Date }) {
  const { dose, med, status } = item
  const styles = {
    taken: 'border-success bg-success-soft',
    due: 'border-primary bg-primary-soft animate-pulse',
    missed: 'border-warning bg-warning-soft',
    upcoming: 'border-slate-200 bg-white',
  }[status]
  const label = {
    taken: `Wzięte ✅ ${dose.taken_at ? hhmm(dose.taken_at) : ''}`,
    due: 'Weź teraz',
    missed: 'Spóźnione - weź teraz',
    upcoming: `O godzinie ${hhmm(dose.scheduled_at)}`,
  }[status]

  return (
    <article className={`rounded-3xl border-4 p-5 ${styles}`}>
      <div className="flex items-center gap-4">
        <span className="h-14 w-14 shrink-0 rounded-full border-2 border-slate-400" style={{ background: med.color ?? '#fff' }} aria-hidden />
        <div className="min-w-0">
          <p className="text-3xl font-bold leading-tight">{med.name}</p>
          <p className="text-muted">
            {med.dose_label} · {hhmm(dose.scheduled_at)}
          </p>
        </div>
      </div>
      <p className="mt-3 font-semibold">{label}</p>
      {canConfirm(dose, current) && (
        <button
          onClick={() => db.markTaken(dose.id, now().toISOString())}
          className="mt-4 flex h-20 w-full items-center justify-center gap-3 rounded-2xl bg-success text-3xl font-bold text-white active:scale-[0.98]"
        >
          <Check size={36} strokeWidth={3} /> Wziąłem
        </button>
      )}
    </article>
  )
}
